import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

const UPLOAD_ID = 913297;
const UPLOAD_FILE_NAME = "partner-nc-0f19aabb.jpeg";
const UPLOAD_FILE_PATH = `uploads/${UPLOAD_FILE_NAME}`;

const mockResponse = (payload: unknown) => ({ status: 200, body: JSON.stringify(payload) });

const partnerReportResponse = () => ({
  address: "123 Main St, Portland, OR",
  hasTruck: false,
  willReceive: false,
  alreadyOrdered: false,
});

const TOKEN = "fake-partner-session-token";

const setupPage = async () => {
  const page = await newE2EPage();
  await page.setContent(
    mockFetchScript({
      "/upload": mockResponse({
        id: UPLOAD_ID,
        filePath: UPLOAD_FILE_PATH,
        isDuplicate: false,
        presigned: {
          url: "https://s3.example.com/put",
          fields: { "key": UPLOAD_FILE_PATH, "x-amz-algorithm": "AWS4-HMAC-SHA256" },
        },
      }),
      "/partner/report": mockResponse(partnerReportResponse()),
    }) + `<form-partner-report token="${TOKEN}"></form-partner-report>`,
  );
  await page.waitForChanges();
  return page;
};

// The location search step: ui-location-search fires locationSelected on a
// place pick; drive it directly from the DOM like other form tests do for
// the hidden formatted_address input.
const pickLocation = (page: any) =>
  page.evaluate(() => {
    const input = document.getElementById("formatted_address") as HTMLInputElement;
    input.value = "123 Main St, Portland, OR";
    const search = document.querySelector("ui-location-search") as HTMLElement;
    search.dispatchEvent(
      new CustomEvent("locationSelected", {
        bubbles: true,
        detail: { formattedAddress: "123 Main St, Portland, OR", locationName: "123 Main St" },
      }),
    );
  });

const fillAndSubmit = (page: any) =>
  page.evaluate(() => {
    (document.getElementById("waitTime-one-to-two") as HTMLInputElement).checked = true;
    const form = document.getElementById("form-partner-report")!;
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });

describe("<form-partner-report>", () => {
  it("requires a location before showing step two", async () => {
    const page = await setupPage();

    const stepTwoVisible = await page.evaluate(() => {
      const stepTwo = document.getElementById("form-step-2")!;
      const button = document.querySelector("#form-step-1 button") as HTMLButtonElement;
      return { stepTwo: !stepTwo.hidden, disabled: button.disabled };
    });
    expect(stepTwoVisible.stepTwo).toBe(false);
    expect(stepTwoVisible.disabled).toBe(true);
  });

  it("submits to /partner/report with the session token and minimal fields", async () => {
    const page = await setupPage();

    await pickLocation(page);
    await page.waitForChanges();

    // Step 1 → step 2
    await page.evaluate(() => {
      (document.querySelector("#form-step-1 button") as HTMLElement).click();
    });
    await page.waitForChanges();

    await fillAndSubmit(page);
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls as { url: string; opts?: any }[]);
    const reportCall = calls.find(c => String(c.url).endsWith("/partner/report"));
    expect(reportCall).toBeDefined();
    // Session token rides along as a Bearer header — never a long-lived key
    expect(reportCall!.opts?.headers?.Authorization).toEqual(`Bearer ${TOKEN}`);
    // Minimal partner payload: no url/contact keys at all
    const body = JSON.parse(reportCall!.opts?.body);
    expect(body.address).toEqual("123 Main St, Portland, OR");
    expect(body.waitTime).toEqual("1-2 hours");
    expect(body.url).toBeUndefined();
    expect(body.contact).toBeUndefined();
  });

  it("shows success and resets for the next report after submitting", async () => {
    const page = await setupPage();

    await pickLocation(page);
    await page.waitForChanges();
    await page.evaluate(() => {
      (document.querySelector("#form-step-1 button") as HTMLElement).click();
    });
    await page.waitForChanges();

    await fillAndSubmit(page);
    await page.waitForChanges();

    const state = await page.evaluate(() => ({
      success: !!document.querySelector(".notification.is-success"),
      backAtStepOne: (document.getElementById("form-step-1") as HTMLElement).hidden === false,
    }));
    expect(state.success).toBe(true);
    expect(state.backAtStepOne).toBe(true);
  });

  it("emits sessionExpired on a 401 and clears nothing itself", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/partner/report": { status: 401, body: JSON.stringify({ errors: ["Not authorized"] }) },
      }) + `<form-partner-report token="${TOKEN}"></form-partner-report>`,
    );
    await page.waitForChanges();

    const expired = await page.spyOnEvent("sessionExpired");

    await pickLocation(page);
    await page.waitForChanges();
    await page.evaluate(() => {
      (document.querySelector("#form-step-1 button") as HTMLElement).click();
    });
    await page.waitForChanges();
    await fillAndSubmit(page);
    await page.waitForChanges();

    expect(expired).toHaveReceivedEventTimes(1);
  });
});
