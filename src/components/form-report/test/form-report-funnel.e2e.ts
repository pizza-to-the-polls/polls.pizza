import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

const UPLOAD_ID = 13315;
const UPLOAD_FILE_NAME = "orphaned-upload-13315.jpeg";
const UPLOAD_FILE_PATH = `uploads/${UPLOAD_FILE_NAME}`;

const mockResponse = (payload: unknown) => ({ status: 200, body: JSON.stringify(payload) });

// Same shape as the existing form-report.e2e.ts fixtures.
const freshUploadResponse = () => ({
  id: UPLOAD_ID,
  filePath: UPLOAD_FILE_PATH,
  isDuplicate: false,
  presigned: {
    url: "https://s3.example.com/put",
    fields: { "key": UPLOAD_FILE_PATH, "x-amz-algorithm": "AWS4-HMAC-SHA256" },
  },
});

const duplicateUploadResponse = () => ({
  id: UPLOAD_ID,
  filePath: UPLOAD_FILE_PATH,
  isDuplicate: true,
});

const reportResponse = () => ({ hasTruck: false, willReceive: true, alreadyOrdered: false });

// Record gtag calls in-page so we can assert the funnel events after the fact.
// The script must be placed BEFORE the <form-report> tag so the mock exists
// when componentWillLoad fires the load-time events.
const gtagRecorderScript = `
  <script>
    window.__gtagCalls = [];
    window.gtag = function() {
      window.__gtagCalls.push(Array.from(arguments));
    };
  </script>
`;

const setupPage = async () => {
  const page = await newE2EPage();
  await page.setContent(
    gtagRecorderScript +
      mockFetchScript({
        "/upload": mockResponse(freshUploadResponse()),
        "/report": mockResponse(reportResponse()),
      }) +
      `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
  );
  await page.waitForChanges();
  return page;
};

const getGtagEvents = (page: any) =>
  page.evaluate(() =>
    ((window as any).__gtagCalls || [])
      // Only "event" calls — the recorder captures everything gtag receives.
      .filter((call: unknown[]) => call[0] === "event")
      .map((call: unknown[]) => ({ name: call[1], params: call[2] })),
  ) as Promise<{ name: string; params?: Record<string, string | number | boolean> }[]>;

const getEventNames = async (page: any) => (await getGtagEvents(page)).map(e => e.name);

// Pick a photo by building a real File in-browser and dispatching the native
// change event (same technique as form-report.e2e.ts).
const pickPhoto = (page: any, name = UPLOAD_FILE_NAME) =>
  page.evaluate((fileName: string) => {
    const input = document.getElementById("photo") as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File([new Uint8Array(1024)], fileName, { type: "image/jpeg" }));
    Object.assign(input, { files: dt.files });
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, name);

const removePhoto = (page: any) =>
  page.evaluate(() => {
    (document.querySelector(".photo-preview-container .delete") as HTMLElement).click();
  });

const waitForUpload = async (page: any, minUploadCalls = 1) => {
  const start = Date.now();
  for (;;) {
    const ready = await page.evaluate((minCalls: number) => {
      const button = document.querySelector("#form-step-2 button[type='submit']") as HTMLButtonElement;
      const calls = ((window as any).__fetchCalls || []) as { url: string }[];
      const uploadCalls = calls.filter(c => String(c.url).endsWith("/upload"));
      return !!button && !button.disabled && uploadCalls.length >= minCalls;
    }, minUploadCalls);
    if (ready) break;
    if (Date.now() - start > 10000) throw new Error("photo upload did not finish in time");
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 100)));
  }
  await page.waitForChanges();
};

const fillFormAndSubmit = async (page: any) => {
  await page.evaluate(() => {
    const click = (id: string) => (document.getElementById(id) as HTMLElement).click();
    const set = (id: string, value: string) => {
      const el = document.getElementById(id) as HTMLInputElement;
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    click("waitTime-less-than");
    click("contactRole-voter");
    set("contactFirstName", "Jane");
    set("contactLastName", "Doe");
    set("contactPhone", "5551234567");
    click("accept-distributor-disclaimer");
  });
  await page.waitForChanges();

  const submitButton = await page.find("#form-step-2 button[type='submit']");
  await submitButton.click();
};

const waitForSubmit = async (page: any) => {
  const start = Date.now();
  for (;;) {
    const done = await page.evaluate(() => {
      const calls = ((window as any).__fetchCalls || []) as { url: string }[];
      return calls.some(c => String(c.url).endsWith("/report"));
    });
    if (done) break;
    if (Date.now() - start > 10000) throw new Error("report POST did not happen in time");
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 100)));
  }
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 200)));
  await page.waitForChanges();
};

describe("form-report funnel events", () => {
  it("emits form_start and location_selected on load when formattedAddress is provided", async () => {
    const page = await setupPage();

    const names = await getEventNames(page);
    expect(names).toContain("report_form_start");
    expect(names).toContain("report_location_selected");
  });

  it("emits the full happy-path funnel in order: start, location, photo_uploaded, submit_attempted, submitted", async () => {
    const page = await setupPage();

    await pickPhoto(page);
    await waitForUpload(page);
    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    const names = await getEventNames(page);
    // form_start and location_selected already fired at load. Scope the
    // assertion to the report funnel itself: after report_submitted the
    // confirmation screen mounts a nested <form-donate>, whose own funnel
    // (donation_form_start) legitimately fires afterwards.
    const reportFunnel = ["report_form_start", "report_location_selected", "report_photo_uploaded", "report_submit_attempted", "report_submitted"];
    expect(names.slice(0, reportFunnel.length)).toEqual(reportFunnel);
    expect(names).toContain("donation_form_start"); // nested form-donate in the confirmation

    const events = await getGtagEvents(page);
    const photoUploaded = events.find(e => e.name === "report_photo_uploaded");
    expect(photoUploaded?.params).toEqual({ duplicate: false });
  });

  it("emits photo_uploaded with duplicate: true on a re-picked photo", async () => {
    const page = await setupPage();

    await pickPhoto(page);
    await waitForUpload(page);

    await removePhoto(page);
    await page.waitForChanges();

    // Swap the mock to the duplicate path for the second /upload call.
    await page.evaluate((payload: unknown) => {
      (window as any).__mockResponses["/upload"] = { status: 200, body: JSON.stringify(payload) };
    }, duplicateUploadResponse());
    await pickPhoto(page);
    await waitForUpload(page, 2);

    const events = await getGtagEvents(page);
    const photoUploaded = events.filter(e => e.name === "report_photo_uploaded");
    expect(photoUploaded.length).toBe(2);
    expect(photoUploaded[0].params).toEqual({ duplicate: false });
    expect(photoUploaded[1].params).toEqual({ duplicate: true });
  });

  it("emits submit_attempted and validation_error (field names only) on an empty submit", async () => {
    const page = await setupPage();

    const submitButton = await page.find("#form-step-2 button[type='submit']");
    await submitButton.click();
    await page.waitForChanges();

    const names = await getEventNames(page);
    // No photo, no successful submit — but the funnel recorded the drop-off.
    expect(names).toContain("report_submit_attempted");
    expect(names).not.toContain("report_submitted");
    expect(names).not.toContain("report_submit_failed");

    const events = await getGtagEvents(page);
    const validationError = events.find(e => e.name === "report_validation_error");
    expect(validationError).toBeDefined();
    // Only field names — never user-typed values.
    expect(typeof validationError?.params?.fields).toBe("string");
    expect((validationError?.params?.fields as string).split(",")).toContain("waitTime");
    expect((validationError?.params?.fields as string).split(",")).toContain("contactRole");
  });

  it("emits submit_failed when the report POST rejects", async () => {
    const page = await newE2EPage();
    await page.setContent(
      gtagRecorderScript +
        mockFetchScript({
          "/upload": mockResponse(freshUploadResponse()),
          // Server rejects the report outright.
          "/report": { status: 500, body: "{}" },
        }) +
        `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    await waitForUpload(page);
    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    const names = await getEventNames(page);
    expect(names).toContain("report_submit_attempted");
    expect(names).toContain("report_submit_failed");
    expect(names).not.toContain("report_submitted");

    // The server-error confirmation panel renders.
    const serverError = await page.find("#server-error");
    expect(serverError).not.toBeNull();
  });

  it("emits no events when gtag is absent (adblock / prerender safety)", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/upload": mockResponse(freshUploadResponse()),
        "/report": mockResponse(reportResponse()),
      }) + `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    await waitForUpload(page);
    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    // Nothing threw — the funnel helpers no-op'd and the report went through.
    const confirmation = await page.find("#distributor-confirmation");
    expect(confirmation).not.toBeNull();
  });
});
