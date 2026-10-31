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

const setupPage = async (reportStatus?: number) => {
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
      "/partner/report": reportStatus ? { status: reportStatus, body: JSON.stringify({ errors: ["Not authorized"] }) } : mockResponse(partnerReportResponse()),
    }) + `<form-partner-report token="${TOKEN}"></form-partner-report>`,
  );
  await page.waitForChanges();
  return page;
};

// The location search step: ui-location-search fires locationSelected on a
// place pick; drive it directly from the DOM (sets the hidden
// formatted_address input like a real selection would).
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

const fillAndSubmit = (page: any, contactPhone?: string) =>
  page.evaluate((phone?: string) => {
    (document.getElementById("waitTime-one-to-two") as HTMLInputElement).checked = true;
    if (phone) {
      const el = document.getElementById("contactPhone") as HTMLInputElement;
      el.value = phone;
    }
    const form = document.getElementById("form-partner-report")!;
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  }, contactPhone);

const confirmationText = (page: any) => page.evaluate(() => (document.querySelector(".notification.is-success") as HTMLElement)?.innerText || "");

describe("<form-partner-report>", () => {
  it("renders every field on one page at load, with partner framing", async () => {
    const page = await setupPage();

    const state = await page.evaluate(() => ({
      locationSearch: !!document.querySelector("ui-location-search"),
      waitTime: !!document.getElementById("waitTime-one-to-two"),
      photo: !!document.getElementById("photo"),
      contactName: !!document.getElementById("contactFirstName"),
      contactPhone: !!document.getElementById("contactPhone"),
      submit: !!document.querySelector("#form-partner-report button[type='submit']"),
      successHidden: !document.querySelector(".notification.is-success"),
      intro: (document.querySelector("#form-partner-report .help") as HTMLElement)?.innerText || "",
      addressEmphasis: !!(document.getElementById("form-partner-report") as HTMLElement)?.innerText.includes("exactly right"),
    }));
    expect(state.locationSearch).toBe(true);
    expect(state.waitTime).toBe(true);
    expect(state.photo).toBe(true);
    expect(state.contactName).toBe(true);
    expect(state.contactPhone).toBe(true);
    expect(state.submit).toBe(true);
    expect(state.successHidden).toBe(true);
    expect(state.intro).toContain("straight to dispatch");
    expect(state.addressEmphasis).toBe(true);
  });

  it("emphasizes the address must be exact when submitting without one", async () => {
    const page = await setupPage();

    await page.evaluate(() => {
      const form = document.getElementById("form-partner-report")!;
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await page.waitForChanges();

    const error = await page.evaluate(() => {
      const errors = Array.from(document.querySelectorAll(".help.has-text-red")) as HTMLElement[];
      return errors.find(e => e.offsetParent !== null)?.innerText || "";
    });
    expect(error).toContain("has to be right");
  });

  it("submits to /partner/report with the session token and minimal fields", async () => {
    const page = await setupPage();

    await pickLocation(page);
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

  it("confirmation emphasizes received / will-text / next report, then clears the form", async () => {
    const page = await setupPage();

    await pickLocation(page);
    await page.waitForChanges();
    await fillAndSubmit(page, "555-234-2345");
    await page.waitForChanges();

    const text = await confirmationText(page);
    expect(text).toContain("report received");
    expect(text).toContain("123 Main St, Portland, OR");
    expect(text).toContain("555-234-2345");
    expect(text).toContain("We'll text");
    expect(text).toContain("next report");

    const state = await page.evaluate(() => ({
      addressCleared: !((document.getElementById("formatted_address") as HTMLInputElement)?.value || ""),
      waitTimeCleared: !(document.getElementById("waitTime-one-to-two") as HTMLInputElement)?.checked,
      searchCleared: !((document.getElementById("autocomplete-input-partner-report") as HTMLInputElement)?.value || ""),
    }));
    expect(state.addressCleared).toBe(true);
    expect(state.waitTimeCleared).toBe(true);
    expect(state.searchCleared).toBe(true);
  });

  it("confirmation skips the text promise when no on-the-ground number was given", async () => {
    const page = await setupPage();

    await pickLocation(page);
    await page.waitForChanges();
    await fillAndSubmit(page);
    await page.waitForChanges();

    const text = await confirmationText(page);
    expect(text).toContain("report received");
    expect(text).not.toContain("We'll text");
    expect(text.toLowerCase()).toContain("no one on the ground was listed");
  });

  it("emits sessionExpired on a 401 and clears nothing itself", async () => {
    const page = await setupPage(401);

    const expired = await page.spyOnEvent("sessionExpired");

    await pickLocation(page);
    await page.waitForChanges();
    await fillAndSubmit(page);
    await page.waitForChanges();

    expect(expired).toHaveReceivedEventTimes(1);
  });
});
