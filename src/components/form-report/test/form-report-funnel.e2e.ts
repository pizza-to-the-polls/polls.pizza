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

// Fake the Bugsnag client so notifyUploadError's headline + metadata can be
// asserted (the component only notifies when __pizza_bugsnag_started is set).
const bugsnagRecorderScript = `
  <script>
    window.__bugsnagNotifyCalls = [];
    window.__pizza_bugsnag_started = true;
    window.__pizza_bugsnag_client = {
      notify: function(error, opts) {
        window.__bugsnagNotifyCalls.push({ message: error.message, opts: opts });
      }
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
    expect(photoUploaded?.params).toEqual({ duplicate: false, verifiedAfterFailure: false });
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
    expect(photoUploaded[0].params).toEqual({ duplicate: false, verifiedAfterFailure: false });
    expect(photoUploaded[1].params).toEqual({ duplicate: true, verifiedAfterFailure: false });
  });

  it("completes the attach via verification after an S3 network failure — no error, canonical uploadId, funnel flags", async () => {
    // #160: a network-failed S3 POST verified landed (the follow-up /upload
    // answers isDuplicate with the canonical row) must complete the attach
    // with NO user-visible error; the funnel flags keep the recovered path
    // distinguishable from a clean upload, and submit carries the canonical
    // upload id from the verification response.
    const page = await newE2EPage();
    await page.setContent(
      gtagRecorderScript +
        mockFetchScript({
          // First /upload: fresh (presigned issued). Second /upload: the
          // verification call after both S3 attempts reject.
          "/upload": [mockResponse(freshUploadResponse()), mockResponse(duplicateUploadResponse())],
          "s3.example.com/put": { networkError: true },
          "/report": mockResponse(reportResponse()),
        }) +
        `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    await waitForUpload(page, 2);
    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    // No user-visible upload error: the attach completed via verification.
    const errorTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red"))
        .map(p => p.textContent)
        .join("\n"),
    );
    expect(errorTexts).not.toContain("Network hiccup");
    expect(errorTexts).not.toContain("didn't upload");

    // Funnel: one photo_uploaded with the recovered path flagged.
    const events = await getGtagEvents(page);
    const photoUploaded = events.filter(e => e.name === "report_photo_uploaded");
    expect(photoUploaded.length).toBe(1);
    expect(photoUploaded[0].params).toEqual({ duplicate: true, verifiedAfterFailure: true });

    // Submit carries the canonical upload id + permalink from the
    // verification response, not the blob preview URL.
    const reportBody = await page.evaluate(() => {
      const calls = ((window as any).__fetchCalls || []) as { url: string; opts?: { body?: string } }[];
      const reportCall = calls.find(c => String(c.url).endsWith("/report"));
      return reportCall?.opts?.body ? JSON.parse(reportCall.opts.body) : null;
    });
    expect(reportBody.uploadId).toBe(UPLOAD_ID);
    expect(reportBody.url.endsWith(`/uploads/${UPLOAD_FILE_NAME}`)).toBe(true);
  });

  it("emits report_photo_upload_failed with reason: network when the S3 POST and the verification both fail at the network layer", async () => {
    const page = await newE2EPage();
    await page.setContent(
      gtagRecorderScript +
        mockFetchScript({
          // First /upload: fresh (presigned issued). Second /upload: the
          // verification call after both S3 attempts reject — it ALSO fails
          // at the network layer, so whether the bytes landed is unverifiable.
          "/upload": [mockResponse(freshUploadResponse()), { networkError: 1 }],
          "s3.example.com/put": { networkError: true },
        }) +
        `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    await waitForUpload(page, 2);

    // The honest fallback copy for an unverifiable network failure.
    const errorTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red"))
        .map(p => p.textContent)
        .join("\n"),
    );
    expect(errorTexts).toContain("Network hiccup");

    const events = await getGtagEvents(page);
    const failedEvents = events.filter(e => e.name === "report_photo_upload_failed");
    expect(failedEvents.length).toBe(1);
    // PII-free params only: fixed-enum string, number, boolean. The raw S3
    // TypeError never reaches the catch — baseFetch re-throws the failed
    // verification as an ApiError with errors.network — so the network
    // classifier (not a bare instanceof TypeError) decides the reason.
    expect(failedEvents[0].params).toEqual({ reason: "network", status: 0, duplicate: false });
    expect(events.filter(e => e.name === "report_photo_uploaded").length).toBe(0);
  });

  it("emits report_photo_upload_failed with reason: api_error and the HTTP status on a blocked-IP 403 from S3", async () => {
    const page = await newE2EPage();
    await page.setContent(
      gtagRecorderScript +
        bugsnagRecorderScript +
        mockFetchScript({
          "/upload": mockResponse(freshUploadResponse()),
          // S3 answers 403 (blocked IP) — a definite failure, no retry.
          "s3.example.com/put": { status: 403, body: "{}" },
        }) +
        `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    await waitForUpload(page);

    const events = await getGtagEvents(page);
    const failedEvents = events.filter(e => e.name === "report_photo_upload_failed");
    expect(failedEvents.length).toBe(1);
    // ApiError-shaped objects carry the HTTP status into the GA params.
    expect(failedEvents[0].params).toEqual({ reason: "api_error", status: 403, duplicate: false });
    expect(events.filter(e => e.name === "report_photo_uploaded").length).toBe(0);

    // Bugsnag headline carries the status + server text instead of the old
    // "[object Object]" (ApiError-shaped objects have no .message).
    const notifyCalls = await page.evaluate(() => ((window as any).__bugsnagNotifyCalls || []) as { message: string; opts: any }[]);
    expect(notifyCalls.length).toBe(1);
    expect(notifyCalls[0].message).toBe("Photo upload failed: HTTP 403 — Whoops! That did not work - try again!");
    // The structured metadata block is unchanged and PII-free.
    expect(notifyCalls[0].opts.context).toBe("/report");
    expect(notifyCalls[0].opts.metadata.upload.s3Status).toBe(403);
    expect(notifyCalls[0].opts.metadata.upload.duplicate).toBe(false);
    expect(notifyCalls[0].opts.metadata.upload.verifiedAfterFailure).toBe(false);
    expect(notifyCalls[0].opts.metadata.upload.uploadId).toBe(UPLOAD_ID);
    expect(notifyCalls[0].opts.metadata.upload.file).toEqual({ type: "image/jpeg", size: 1024 });

    // The user-visible copy is the server's message, not a generic string.
    const errorTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red"))
        .map(p => p.textContent)
        .join("\n"),
    );
    expect(errorTexts).toContain("Whoops! That did not work - try again!");
  });

  it("emits report_photo_upload_failed with reason: no_location when a photo is picked before a location is selected", async () => {
    const page = await newE2EPage();
    // No formatted-address prop: the location step stays visible and
    // #formatted_address is empty, so the handler bails before any request.
    await page.setContent(gtagRecorderScript + mockFetchScript({}) + `<form-report></form-report>`);
    await page.waitForChanges();

    await pickPhoto(page);

    // The no-location branch is fully synchronous; wait for the event to land
    // in the recorder rather than on network activity (there is none).
    const start = Date.now();
    for (;;) {
      const fired = await page.evaluate(() => (((window as any).__gtagCalls || []) as unknown[][]).some(call => call[1] === "report_photo_upload_failed"));
      if (fired) break;
      if (Date.now() - start > 5000) throw new Error("no_location failure event did not fire in time");
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 50)));
    }
    await page.waitForChanges();

    const events = await getGtagEvents(page);
    const failedEvents = events.filter(e => e.name === "report_photo_upload_failed");
    expect(failedEvents.length).toBe(1);
    expect(failedEvents[0].params).toEqual({ reason: "no_location" });
    expect(events.filter(e => e.name === "report_photo_uploaded").length).toBe(0);

    // The branch fires before any network request is sent.
    const fetchCallCount = await page.evaluate(() => ((window as any).__fetchCalls || []).length);
    expect(fetchCallCount).toBe(0);
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
