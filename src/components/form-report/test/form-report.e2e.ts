import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

const UPLOAD_ID = 13297;
const UPLOAD_FILE_NAME = "pittsboro-nc-bef9d045.jpeg";
const UPLOAD_FILE_PATH = `uploads/${UPLOAD_FILE_NAME}`;

// mockFetchScript takes { status?, body } where body is a JSON string.
const mockResponse = (payload: unknown) => ({ status: 200, body: JSON.stringify(payload) });

// Fresh-upload response: presigned POST data present (matches UploadPostResults).
const freshUploadResponse = () => ({
  id: UPLOAD_ID,
  filePath: UPLOAD_FILE_PATH,
  isDuplicate: false,
  presigned: {
    url: "https://s3.example.com/put",
    fields: { "key": UPLOAD_FILE_PATH, "x-amz-algorithm": "AWS4-HMAC-SHA256" },
  },
});

// Duplicate response: same canonical id, no presigned (backend saw this hash
// before and skips the S3 POST entirely).
const duplicateUploadResponse = () => ({
  id: UPLOAD_ID,
  filePath: UPLOAD_FILE_PATH,
  isDuplicate: true,
});

// BUG-032 re-presign verify response (BUG-039): the hash matched an existing
// upload row whose raw S3 object was MISSING (the bytes never landed), so the
// backend reset the row and re-presigned the SAME key — same id + filePath,
// fresh presigned POST. The distinct URL + "reissued" policy field prove the
// client used the verify response's payload, not a stale copy of the original
// presign (mockFetchScript matches by URL suffix, so a distinct URL also lets
// the test keep the initial presigned entry failing while the re-presign
// entry succeeds).
const rePresignedUploadResponse = () => ({
  id: UPLOAD_ID,
  filePath: UPLOAD_FILE_PATH,
  isDuplicate: false,
  presigned: {
    url: "https://s3.example.com/reput",
    fields: { "key": UPLOAD_FILE_PATH, "x-amz-algorithm": "AWS4-HMAC-SHA256", "policy": "reissued" },
  },
});

// Honest fallback: verification found the row but offered no re-presign
// (older backend / non-recoverable shape) — the client must still throw
// UploadDidNotLandError.
const noPresignedUploadResponse = () => ({
  id: UPLOAD_ID,
  filePath: UPLOAD_FILE_PATH,
  isDuplicate: false,
});

// Report response: no truck on site, report will receive pizza (so the
// #distributor-confirmation panel renders after submit).
const reportResponse = () => ({ hasTruck: false, willReceive: true, alreadyOrdered: false });

// Georgia (SB 22) report response: recorded but auto-skipped (pizzabase
// #392) — the #georgia-confirmation panel should render instead.
const georgiaReportResponse = () => ({
  hasTruck: false,
  willReceive: false,
  alreadyOrdered: false,
  autoSkipped: true,
  skipReason: "georgia",
});

// Auto-skip (pizzabase #391): pizza already ordered for this location within
// the last hour — the #recent-order-confirmation panel should render.
const recentOrderReportResponse = () => ({
  hasTruck: false,
  willReceive: false,
  alreadyOrdered: false,
  autoSkipped: true,
  skipReason: "recent_order",
});

// Auto-skip (pizzabase #391): the reported line is under an hour — the
// #line-under-an-hour-confirmation panel should render with the re-report ask.
const lineUnderAnHourReportResponse = () => ({
  hasTruck: false,
  willReceive: false,
  alreadyOrdered: false,
  autoSkipped: true,
  skipReason: "line_under_an_hour",
});

const setupPage = async (report: unknown = reportResponse()) => {
  const page = await newE2EPage();
  await page.setContent(
    mockFetchScript({
      "/upload": mockResponse(freshUploadResponse()),
      "/report": mockResponse(report),
    }) + `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
  );
  await page.waitForChanges();
  return page;
};

type RecordedCall = { url: string; body: string | null };

// Pick a photo by building a real File in-browser and dispatching the native
// change event — the bytes round-trip through shaFile (crypto.subtle) exactly
// like a user-picked file. Same bytes on every pick => same hash, so the mock
// can answer the duplicate response on a re-pick.
const pickPhoto = (page: any, name = UPLOAD_FILE_NAME) =>
  page.evaluate((fileName: string) => {
    const input = document.getElementById("photo") as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File([new Uint8Array(1024)], fileName, { type: "image/jpeg" }));
    // files is a readonly IDL attribute in some TS lib versions; assign at runtime.
    Object.assign(input, { files: dt.files });
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, name);

// Pick a photo whose bytes the browser refuses to serve (BUG-036): patch
// Blob.prototype.arrayBuffer to reject ONCE with a real DOMException, build a
// real File from real bytes, and dispatch the change event. The change
// handler reads the bytes synchronously within dispatchEvent (uploadPhoto's
// first await), so the prototype can be restored in the same evaluate — the
// stub can't leak into the re-pick below even if an assertion fails later.
const pickUnreadablePhoto = (page: any, name = UPLOAD_FILE_NAME, domName = "NotReadableError") =>
  page.evaluate(
    (params: { fileName: string; domName: string }) => {
      const original = Blob.prototype.arrayBuffer;
      let rejected = false;
      Blob.prototype.arrayBuffer = function (this: Blob) {
        if (!rejected) {
          rejected = true;
          return Promise.reject(
            new DOMException(
              "The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.",
              params.domName,
            ),
          );
        }
        return original.call(this);
      };
      try {
        const input = document.getElementById("photo") as HTMLInputElement;
        const dt = new DataTransfer();
        dt.items.add(new File([new Uint8Array(1024)], params.fileName, { type: "image/jpeg" }));
        Object.assign(input, { files: dt.files });
        input.dispatchEvent(new Event("change", { bubbles: true }));
      } finally {
        Blob.prototype.arrayBuffer = original;
      }
    },
    { fileName: name, domName },
  );

// Wait for a photo error message to become visible. Poll the step-2 error
// paragraphs (the submit button is enabled at initial render, so the message
// is the reliable completion signal). Same 10s polling pattern as
// waitForUpload.
const waitForPhotoError = async (page: any, needle: string) => {
  const start = Date.now();
  for (;;) {
    const found = await page.evaluate((needle: string) => {
      const paragraphs = Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red")) as HTMLParagraphElement[];
      return paragraphs.some(p => !p.hidden && (p.textContent || "").includes(needle));
    }, needle);
    if (found) break;
    if (Date.now() - start > 10000) throw new Error(`photo error message "${needle}" did not appear in time`);
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 100)));
  }
  await page.waitForChanges();
};

// Shared body of the BUG-036 read-failure scenario, parameterized over the
// DOMException name (Chrome/Android/Windows: NotReadableError; legacy iOS:
// SecurityError).
const readFailureScenario = async (domName: string) => {
  const page = await setupPage();

  await pickUnreadablePhoto(page, UPLOAD_FILE_NAME, domName);
  await waitForPhotoError(page, "couldn't read that photo");

  // The actionable re-pick copy — not the generic "Whoops!" message.
  const errorTexts = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red"))
      .filter(p => !(p as HTMLElement).hidden)
      .map(p => p.textContent)
      .join("\n"),
  );
  expect(errorTexts).toContain("We couldn't read that photo");
  expect(errorTexts).toContain("iCloud or Google Photos");
  expect(errorTexts).toContain("save it to your device first, then pick it again");
  expect(errorTexts).not.toContain("We could not upload that photo");

  // The dead handle was released: removePhoto() reset the input so a re-pick
  // forces the OS to re-acquire the file.
  const inputState = await page.evaluate(() => {
    const input = document.getElementById("photo") as HTMLInputElement;
    return { value: input.value, files: input.files ? input.files.length : 0 };
  });
  expect(inputState.value).toBe("");
  expect(inputState.files).toBe(0);

  // The failure is client-local: no request ever left the page (matches the
  // live Bugsnag metadata uploadId: null, s3Status: null).
  const fetchCallCount = await page.evaluate(() => ((window as any).__fetchCalls || []).length);
  expect(fetchCallCount).toBe(0);

  // After the reset, re-picking the same file name with readable bytes
  // succeeds and the form remains submittable end-to-end.
  await pickPhoto(page);
  await waitForUpload(page);
  await fillFormAndSubmit(page);
  await waitForSubmit(page);

  const confirmation = await page.find("#distributor-confirmation");
  expect(confirmation).not.toBeNull();
};

// The .delete button is an absolutely-positioned div without intrinsic size,
// so Puppeteer's real-mouse click can't find a clickable point — use a DOM
// click instead (still fires Stencil's onClick handler).
const removePhoto = (page: any) =>
  page.evaluate(() => {
    (document.querySelector(".photo-preview-container .delete") as HTMLElement).click();
  });

// Wait for photo processing to finish: the submit button is re-enabled and at
// least `minUploadCalls` /upload calls have been recorded by the mock.
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
    // Puppeteer 21+ removed page.waitForTimeout; wait inside the page instead.
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 100)));
  }
  await page.waitForChanges();
};

// Fill the required fields, accept the disclaimer, and submit.
// userClickedGuidelinesLink initializes to true and resetForm() (the only code
// that flips it) is never invoked, so only the disclaimer checkbox is required
// — the guidelines anchor (target="_blank") must NOT be clicked.
//
// All form input happens via in-page DOM events: the radio inputs are
// `display: none` (styled via labels), so Puppeteer's real-mouse click would
// refuse to click them — DOM .click() works and still fires Stencil's
// onChange/onInput handlers.
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

// Wait for the report POST to settle (mock response handled, state updated).
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
  // Give the post-response state updates time to flush, then re-render.
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 200)));
  await page.waitForChanges();
};

const getFetchCalls = (page: any) =>
  page.evaluate(() =>
    (((window as any).__fetchCalls || []) as { url: unknown; opts?: { body?: unknown } }[]).map(c => ({
      url: String(c.url),
      // opts.body can be FormData (S3 POST); keep only JSON-string bodies.
      body: typeof c.opts?.body === "string" ? c.opts.body : null,
    })),
  ) as Promise<RecordedCall[]>;

describe("form-report", () => {
  it("shows the actionable re-pick message and stays submittable when the photo read fails with NotReadableError (BUG-036)", async () => {
    await readFailureScenario("NotReadableError");
  });

  it("shows the actionable re-pick message and stays submittable when the photo read fails with SecurityError (BUG-036 legacy iOS)", async () => {
    await readFailureScenario("SecurityError");
  });

  it("reads the picked file exactly once and reuses the bytes for the hash and the S3 body", async () => {
    // Regression lock for BUG-036: the picked File handle is read exactly
    // once, at pick time. The hash and the presigned S3 body must both
    // consume that in-memory buffer — any second read of the (possibly
    // stale) handle rejects with NotReadableError and fails the upload.
    const page = await setupPage();

    await page.evaluate(() => {
      const original = Blob.prototype.arrayBuffer;
      const w = window as any;
      w.__arrayBufferReads = 0;
      w.__originalArrayBuffer = original;
      Blob.prototype.arrayBuffer = function (this: Blob) {
        w.__arrayBufferReads++;
        if (w.__arrayBufferReads === 1) {
          return original.call(this);
        }
        return Promise.reject(
          new DOMException(
            "The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.",
            "NotReadableError",
          ),
        );
      };
    });

    await pickPhoto(page);
    // If any code re-read the handle, this would time out: the second read
    // rejects and the upload fails with the read-failure error.
    await waitForUpload(page);

    const reads = await page.evaluate(() => (window as any).__arrayBufferReads);
    expect(reads).toBe(1);

    // The /upload body's fileHash equals the SHA-256 of the fixture bytes —
    // hashed from the same in-memory buffer the pick produced.
    const expectedHash = await page.evaluate(async () => {
      const hashBuffer = await crypto.subtle.digest("SHA-256", new Uint8Array(1024));
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => ("00" + b.toString(16)).slice(-2))
        .join("");
    });
    const calls = await getFetchCalls(page);
    const uploadCalls = calls.filter(c => c.url.endsWith("/upload"));
    expect(uploadCalls.length).toBe(1);
    const uploadBody = JSON.parse(uploadCalls[0].body as string);
    expect(uploadBody.fileHash).toBe(expectedHash);

    // The presigned S3 POST carried a File rebuilt from the buffer — same
    // name, type and size as the picked file, without re-reading the handle.
    const s3File = await page.evaluate(() => {
      const calls = ((window as any).__fetchCalls || []) as { url: string; opts?: { body?: unknown } }[];
      const s3Call = calls.find(c => String(c.url).includes("s3.example.com"));
      const body = s3Call?.opts?.body as FormData | undefined;
      const file = body ? (body.get("file") as File | null) : null;
      return file ? { name: file.name, size: file.size, type: file.type } : null;
    });
    expect(s3File).toEqual({ name: UPLOAD_FILE_NAME, size: 1024, type: "image/jpeg" });

    // Restore the prototype (each test gets a fresh page, but be tidy).
    await page.evaluate(() => {
      Blob.prototype.arrayBuffer = (window as any).__originalArrayBuffer;
    });
  });

  it("renders step 1 initially", async () => {
    const page = await newE2EPage();
    await page.setContent("<form-report></form-report>");

    const step1 = await page.find("#form-step-1");
    expect(step1).not.toBeNull();
    expect(await step1.isVisible()).toBe(true);
  });

  it("shows step 2 when formattedAddress is provided", async () => {
    const page = await newE2EPage();
    await page.setContent('<form-report formatted-address="123 Main St, Portland, OR"></form-report>');
    await page.waitForChanges();

    const step2 = await page.find("#form-step-2");
    expect(step2).not.toBeNull();
    expect(await step2.isVisible()).toBe(true);
  });

  it("shows validation errors on empty submit in step 2", async () => {
    const page = await newE2EPage();
    await page.setContent('<form-report formatted-address="123 Main St"></form-report>');
    await page.waitForChanges();

    const submitBtn = await page.find("#form-step-2 button[type='submit']");
    expect(submitBtn).not.toBeNull();
    await submitBtn.click();
    await page.waitForChanges();

    const visibleErrors = [];
    const errors = await page.findAll("#form-step-2 p.help.has-text-red");
    for (const el of errors) {
      if (await el.isVisible()) {
        visibleErrors.push(await el.getProperty("textContent"));
      }
    }
    expect(visibleErrors.length).toBeGreaterThan(0);
    const errorTexts = visibleErrors.join(" ");
    expect(errorTexts.toLowerCase()).toContain("wait time");
  });

  it("sends uploadId and the canonical permalink in the /report body after a fresh upload", async () => {
    const page = await setupPage();

    await pickPhoto(page);
    await waitForUpload(page);
    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    const calls = await getFetchCalls(page);
    const uploadCalls = calls.filter(c => c.url.endsWith("/upload"));
    const reportCalls = calls.filter(c => c.url.endsWith("/report"));
    const s3Calls = calls.filter(c => c.url.includes("s3.example.com"));

    // Exactly one upload POST and one presigned S3 POST for a fresh upload.
    expect(uploadCalls.length).toBe(1);
    expect(s3Calls.length).toBe(1);

    // The report body carries the upload id from /upload and the canonical
    // permalink (basename of filePath), not the blob: preview URL.
    expect(reportCalls.length).toBe(1);
    expect(reportCalls[0].body).not.toBeNull();
    const reportBody = JSON.parse(reportCalls[0].body as string);
    expect(reportBody.uploadId).toBe(UPLOAD_ID);
    expect(reportBody.url.endsWith(`/uploads/${UPLOAD_FILE_NAME}`)).toBe(true);

    const confirmation = await page.find("#distributor-confirmation");
    expect(confirmation).not.toBeNull();
  });

  it("shows the Georgia SB 22 explanation when the report is auto-skipped as georgia", async () => {
    const page = await setupPage(georgiaReportResponse());

    await pickPhoto(page);
    await waitForUpload(page);
    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    // The Georgia panel renders with the SB 22 explanation...
    const georgia = await page.find("#georgia-confirmation");
    expect(georgia).not.toBeNull();
    expect(await georgia.isVisible()).toBe(true);
    const georgiaText = (await georgia.getProperty("textContent")).toLowerCase();
    expect(georgiaText).toContain("senate bill 22");
    expect(georgiaText).toContain("can't send pizza");

    // ...and none of the triage panels or other skip panels do (auto-skip
    // overrides hasTruck / willReceive / duplicate alike).
    for (const id of [
      "#distributor-confirmation",
      "#food-truck-at-location-confirmation",
      "#duplicate-report-confirmation",
      "#watchdog-confirmation",
      "#recent-order-confirmation",
      "#line-under-an-hour-confirmation",
    ]) {
      expect(await page.find(id)).toBeNull();
    }
  });

  it("shows the pizza-on-the-way explanation when the report is auto-skipped as recent_order", async () => {
    const page = await setupPage(recentOrderReportResponse());

    await pickPhoto(page);
    await waitForUpload(page);
    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    // The recent-order panel renders with the already-ordered explanation...
    const recentOrder = await page.find("#recent-order-confirmation");
    expect(recentOrder).not.toBeNull();
    expect(await recentOrder.isVisible()).toBe(true);
    const recentOrderText = (await recentOrder.getProperty("textContent")).toLowerCase();
    expect(recentOrderText).toContain("already on the way");
    expect(recentOrderText).toContain("within the last hour");

    // ...and none of the triage panels or other skip panels do.
    for (const id of [
      "#distributor-confirmation",
      "#food-truck-at-location-confirmation",
      "#duplicate-report-confirmation",
      "#watchdog-confirmation",
      "#georgia-confirmation",
      "#line-under-an-hour-confirmation",
    ]) {
      expect(await page.find(id)).toBeNull();
    }
  });

  it("shows the re-report ask when the report is auto-skipped as line_under_an_hour", async () => {
    const page = await setupPage(lineUnderAnHourReportResponse());

    await pickPhoto(page);
    await waitForUpload(page);
    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    // The under-an-hour panel renders with the submit-again explanation...
    const underAnHour = await page.find("#line-under-an-hour-confirmation");
    expect(underAnHour).not.toBeNull();
    expect(await underAnHour.isVisible()).toBe(true);
    const underAnHourText = (await underAnHour.getProperty("textContent")).toLowerCase();
    expect(underAnHourText).toContain("over an hour");
    expect(underAnHourText).toContain("submit a new report");

    // ...and none of the triage panels or other skip panels do.
    for (const id of [
      "#distributor-confirmation",
      "#food-truck-at-location-confirmation",
      "#duplicate-report-confirmation",
      "#watchdog-confirmation",
      "#georgia-confirmation",
      "#recent-order-confirmation",
    ]) {
      expect(await page.find(id)).toBeNull();
    }
  });

  it("absorbs a transient S3 network error via the single retry", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/upload": mockResponse(freshUploadResponse()),
        "/report": mockResponse(reportResponse()),
        // First S3 POST rejects with a network TypeError; the retry succeeds.
        // (The retry cap is ONE — see the network-failure verification tests
        // below for the exhausted path.)
        "s3.example.com/put": { status: 200, body: "{}", networkError: 1 },
      }) + `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    await waitForUpload(page);
    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    const calls = await getFetchCalls(page);
    const uploadCalls = calls.filter(c => c.url.endsWith("/upload"));
    const reportCalls = calls.filter(c => c.url.endsWith("/report"));
    const s3Calls = calls.filter(c => c.url.includes("s3.example.com"));

    // Two S3 POST attempts total: one network rejection + one success.
    expect(s3Calls.length).toBe(2);

    // A transient blip is absorbed by the retry — no verification call:
    // exactly one /upload POST.
    expect(uploadCalls.length).toBe(1);

    // A transient blip must not surface a user-visible error: the backoff
    // absorbed it and the report completed normally.
    const visibleErrors = [];
    const errors = await page.findAll("#form-step-2 p.help.has-text-red");
    for (const el of errors) {
      if (await el.isVisible()) {
        visibleErrors.push(await el.getProperty("textContent"));
      }
    }
    expect(visibleErrors).toEqual([]);

    // The report body carries the canonical uploadId + permalink basename.
    expect(reportCalls.length).toBe(1);
    expect(reportCalls[0].body).not.toBeNull();
    const reportBody = JSON.parse(reportCalls[0].body as string);
    expect(reportBody.uploadId).toBe(UPLOAD_ID);
    expect(reportBody.url.endsWith(`/uploads/${UPLOAD_FILE_NAME}`)).toBe(true);

    const confirmation = await page.find("#distributor-confirmation");
    expect(confirmation).not.toBeNull();
  });

  it("shows the honest network-hiccup message when retries are exhausted and verification itself fails", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        // First /upload: fresh (presigned issued). Second /upload: the
        // verification call after both S3 attempts reject — it ALSO fails at
        // the network layer, so whether the bytes landed is unverifiable.
        "/upload": [mockResponse(freshUploadResponse()), { networkError: 1 }],
        "/report": mockResponse(reportResponse()),
        // Every S3 POST rejects with a network TypeError: 2 attempts total
        // (the initial POST + the single retry).
        "s3.example.com/put": { status: 200, body: "{}", networkError: true },
      }) + `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    await waitForUpload(page, 2);

    const calls = await getFetchCalls(page);
    const uploadCalls = calls.filter(c => c.url.endsWith("/upload"));
    const s3Calls = calls.filter(c => c.url.includes("s3.example.com"));
    // One retry cap: initial POST + single retry, then the verification
    // /upload call (which rejects at the network layer too).
    expect(s3Calls.length).toBe(2);
    expect(uploadCalls.length).toBe(2);

    // The honest fallback message — not the generic "could not upload" copy.
    const errors = await page.findAll("#form-step-2 p.help.has-text-red");
    const visibleErrorTexts = [];
    for (const el of errors) {
      if (await el.isVisible()) {
        visibleErrorTexts.push(await el.getProperty("textContent"));
      }
    }
    const joined = visibleErrorTexts.join(" ");
    expect(joined).toContain("Network hiccup");
    expect(joined).toContain("your photo may have already reached us");
    expect(joined).not.toContain("We could not upload that photo");

    // Preview cleared and the form re-enabled for a re-pick.
    // (.photo-preview-container's `display: inline-block` SCSS rule overrides
    // the `hidden` attribute's UA display:none, so the container itself always
    // reports visible — assert on the inner preview element instead.)
    const photoPreview = await page.find("#photo-preview");
    expect(await photoPreview.isVisible()).toBe(false);
    const submitBtn = await page.find("#form-step-2 button[type='submit']");
    expect(await submitBtn.getProperty("disabled")).toBe(false);
  });

  it("reuses the duplicate upload id on a re-picked photo and skips the second S3 POST", async () => {
    const page = await setupPage();

    // First pick goes through the fresh path: /upload + presigned S3 POST.
    await pickPhoto(page);
    await waitForUpload(page);

    // Deleting the photo nulls uploadId and photoUrl.
    await removePhoto(page);
    await page.waitForChanges();

    // Re-picking the same bytes now hits the duplicate path: the backend
    // returns the canonical id with no presigned payload. mockFetchScript's
    // window.__mockResponses is a mutable map keyed by URL suffix, so the
    // duplicate answer can be swapped in per-call without touching the helper.
    await page.evaluate((payload: unknown) => {
      (window as any).__mockResponses["/upload"] = { status: 200, body: JSON.stringify(payload) };
    }, duplicateUploadResponse());
    await pickPhoto(page);
    await waitForUpload(page, 2);

    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    const calls = await getFetchCalls(page);
    const uploadCalls = calls.filter(c => c.url.endsWith("/upload"));
    const reportCalls = calls.filter(c => c.url.endsWith("/report"));
    const s3Calls = calls.filter(c => c.url.includes("s3.example.com"));

    // Two /upload calls (fresh + duplicate), but only ONE presigned S3 POST.
    expect(uploadCalls.length).toBe(2);
    expect(s3Calls.length).toBe(1);

    // uploadId survives the delete/re-pick round-trip: the /report body must
    // still carry the duplicate upload's canonical id.
    expect(reportCalls.length).toBe(1);
    expect(reportCalls[0].body).not.toBeNull();
    const reportBody = JSON.parse(reportCalls[0].body as string);
    expect(reportBody.uploadId).toBe(UPLOAD_ID);
    expect(reportBody.url.endsWith(`/uploads/${UPLOAD_FILE_NAME}`)).toBe(true);
  });

  it("verifies after an S3 network failure and adopts the canonical upload with no visible error", async () => {
    // Regression test for the 2026-10-25 feed-reports incident (upload
    // #13320) and the 2026-10-28 five-feed-pictures case: /upload succeeds,
    // the browser POSTs the file to the presigned S3 URL, the file lands in
    // the bucket, but the response never makes it back and fetch rejects
    // with a network TypeError. The verification /upload call answers
    // isDuplicate (same fileHash, canonical id, no presigned payload) — the
    // attach must complete with NO user-visible error and the report must
    // carry the canonical uploadId and permalink.
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        // First /upload: fresh (presigned issued). Second /upload: the
        // verification call after both S3 attempts reject — same fileHash,
        // the backend answers isDuplicate with the canonical row.
        "/upload": [mockResponse(freshUploadResponse()), mockResponse(duplicateUploadResponse())],
        // s3.example.com/put suffix-matches the presigned POST URL; every
        // S3 POST rejects at the network layer.
        "s3.example.com/put": { networkError: true },
        "/report": mockResponse(reportResponse()),
      }) + `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    await waitForUpload(page, 2);

    // One retry cap: initial POST + single retry, then the verification
    // /upload call — two S3 POSTs, two /upload POSTs total.
    const calls = await getFetchCalls(page);
    const uploadCalls = calls.filter(c => c.url.endsWith("/upload"));
    const s3Calls = calls.filter(c => c.url.includes("s3.example.com"));
    expect(s3Calls.length).toBe(2);
    expect(uploadCalls.length).toBe(2);

    // No upload error surfaced: the verification adopted the canonical row
    // and the attach completed. (Step 2 has several p.help.has-text-red
    // elements; collect them all and assert the upload copy is absent.)
    const errorTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red"))
        .map(p => p.textContent)
        .join("\n"),
    );
    expect(errorTexts).not.toContain("Network hiccup");
    expect(errorTexts).not.toContain("didn't upload");

    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    // The verified-adopt path produces a fully linked report: canonical
    // upload id + permalink basename in the /report body.
    const calls2 = await getFetchCalls(page);
    const reportCalls = calls2.filter(c => c.url.endsWith("/report"));
    expect(reportCalls.length).toBe(1);
    expect(reportCalls[0].body).not.toBeNull();
    const reportBody = JSON.parse(reportCalls[0].body as string);
    expect(reportBody.uploadId).toBe(UPLOAD_ID);
    expect(reportBody.url.endsWith(`/uploads/${UPLOAD_FILE_NAME}`)).toBe(true);
  });

  it("states a definite failure when verification shows nothing landed", async () => {
    // Both S3 attempts reject at the network layer AND the verification
    // /upload call answers isDuplicate: false — the bytes never reached the
    // bucket. The error copy must say so plainly (no "may have reached us"),
    // and the form must be ready for a re-pick.
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        // First /upload: fresh (presigned issued). Second /upload: the
        // verification call answers isDuplicate: false with NO presigned
        // fields — the bytes never landed and the backend offered no BUG-032
        // re-presign, so the client must throw UploadDidNotLandError.
        "/upload": [mockResponse(freshUploadResponse()), mockResponse(noPresignedUploadResponse())],
        "s3.example.com/put": { networkError: true },
        "/report": mockResponse(reportResponse()),
      }) + `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    await waitForUpload(page, 2);

    const calls = await getFetchCalls(page);
    const uploadCalls = calls.filter(c => c.url.endsWith("/upload"));
    const s3Calls = calls.filter(c => c.url.includes("s3.example.com"));
    const reportCalls = calls.filter(c => c.url.endsWith("/report"));
    expect(s3Calls.length).toBe(2);
    expect(uploadCalls.length).toBe(2);
    // No report was submitted — the attach failed.
    expect(reportCalls.length).toBe(0);

    // The definite-failure copy — not the unverifiable "may have reached
    // us" hint, and not the generic could-not-upload message.
    const errorTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red"))
        .map(p => p.textContent)
        .join("\n"),
    );
    expect(errorTexts).toContain("that photo didn't upload. Please try again.");
    expect(errorTexts).not.toContain("may have already reached us");
    expect(errorTexts).not.toContain("We could not upload that photo");

    // removePhoto() cleared the preview and the finally block re-enabled
    // the submit button for a re-pick.
    const previewBg = await page.evaluate(() => {
      const preview = document.getElementById("photo-preview");
      return preview ? preview.style.backgroundImage : null;
    });
    expect(previewBg).toBeFalsy();
    const buttonDisabled = await page.evaluate(() => {
      const btn = document.querySelector("#form-step-2 button[type='submit']") as HTMLButtonElement;
      return btn ? btn.disabled : null;
    });
    expect(buttonDisabled).toBe(false);
  });

  it("re-POSTs the in-memory bytes to the BUG-032 re-presigned URL and completes the attach (BUG-039)", async () => {
    // BUG-039: after both S3 attempts fail at the network layer, the
    // verification /upload can answer isDuplicate: false PLUS a fresh
    // presigned POST for the same key (pizzabase BUG-032: the row exists but
    // its raw S3 object is missing, so the backend re-presigns it). The
    // client must re-POST the already-read bytes against that offer and
    // complete the attach — not throw UploadDidNotLandError.
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        // First /upload: fresh (presigned issued). Second /upload: the
        // verification call after both S3 attempts reject — BUG-032 shape:
        // not a duplicate, but a re-presigned POST for the same key.
        "/upload": [mockResponse(freshUploadResponse()), mockResponse(rePresignedUploadResponse())],
        // The initial presigned POST always fails at the network layer...
        "s3.example.com/put": { networkError: true },
        // ...but the re-presigned POST succeeds on the first attempt.
        "s3.example.com/reput": { status: 200, body: "{}" },
        "/report": mockResponse(reportResponse()),
      }) + `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    // BUG-036 on the recovery path: fail any SECOND read of the picked
    // handle — the re-POST body must come from the in-memory bytes.
    await page.evaluate(() => {
      const original = Blob.prototype.arrayBuffer;
      const w = window as any;
      w.__arrayBufferReads = 0;
      w.__originalArrayBuffer = original;
      Blob.prototype.arrayBuffer = function (this: Blob) {
        w.__arrayBufferReads++;
        if (w.__arrayBufferReads === 1) {
          return original.call(this);
        }
        return Promise.reject(
          new DOMException(
            "The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.",
            "NotReadableError",
          ),
        );
      };
    });

    await pickPhoto(page);
    // Upload sequence: /upload (fresh) → 2× failed S3 POST → /upload
    // (verify, re-presign) → 1× successful re-POST. Two /upload calls total.
    await waitForUpload(page, 2);

    await page.evaluate(() => {
      Blob.prototype.arrayBuffer = (window as any).__originalArrayBuffer;
    });

    const calls = await getFetchCalls(page);
    // Exactly 2 /upload calls (initial + verify) — no extra verification.
    expect(calls.filter(c => c.url.endsWith("/upload")).length).toBe(2);
    // The initial presigned POST stayed bounded at 2 attempts.
    expect(calls.filter(c => c.url.includes("s3.example.com/put")).length).toBe(2);
    // The re-presigned POST succeeded on the first attempt.
    expect(calls.filter(c => c.url.includes("s3.example.com/reput")).length).toBe(1);

    // The picked File handle was read exactly once — the re-POST body was
    // rebuilt from the in-memory bytes, never from a second handle read.
    const reads = await page.evaluate(() => (window as any).__arrayBufferReads);
    expect(reads).toBe(1);

    // The re-POST carried the verify response's fields (the "reissued"
    // policy marker proves the client used verify.presigned, not the stale
    // original presign) and a File rebuilt from the original bytes.
    const rePost = await page.evaluate(() => {
      const calls = ((window as any).__fetchCalls || []) as { url: string; opts?: { body?: unknown } }[];
      const reput = calls.find(c => String(c.url).includes("s3.example.com/reput"));
      const body = reput?.opts?.body as FormData | undefined;
      const file = body ? (body.get("file") as File | null) : null;
      return {
        policy: body ? body.get("policy") : null,
        key: body ? body.get("key") : null,
        file: file ? { name: file.name, size: file.size, type: file.type } : null,
      };
    });
    expect(rePost).toEqual({
      policy: "reissued",
      key: UPLOAD_FILE_PATH,
      file: { name: UPLOAD_FILE_NAME, size: 1024, type: "image/jpeg" },
    });

    // No user-visible upload error: the recovery completed the attach.
    const errorTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red"))
        .map(p => p.textContent)
        .join("\n"),
    );
    expect(errorTexts).not.toContain("Network hiccup");
    expect(errorTexts).not.toContain("didn't upload");

    // The unsaved-upload guard armed: the re-POSTed bytes are in the bucket
    // with no report attached yet, so leaving now would strand them.
    const guardCanceled = await page.evaluate(() => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(guardCanceled).toBe(true);

    // The report carries the verify row's id + permalink basename.
    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    const reportCalls = (await getFetchCalls(page)).filter(c => c.url.endsWith("/report"));
    expect(reportCalls.length).toBe(1);
    expect(reportCalls[0].body).not.toBeNull();
    const reportBody = JSON.parse(reportCalls[0].body as string);
    expect(reportBody.uploadId).toBe(UPLOAD_ID);
    expect(reportBody.url.endsWith(`/uploads/${UPLOAD_FILE_NAME}`)).toBe(true);
  });

  it("states a definite failure when the re-presigned attempts are also exhausted (BUG-039)", async () => {
    // The verify response offers the BUG-032 re-presign, but both re-POST
    // attempts fail at the network layer too — the honest UploadDidNotLand
    // copy and the removePhoto() cleanup must apply exactly as today.
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/upload": [mockResponse(freshUploadResponse()), mockResponse(rePresignedUploadResponse())],
        "s3.example.com/put": { networkError: true },
        "s3.example.com/reput": { networkError: true },
        "/report": mockResponse(reportResponse()),
      }) + `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    // Two /upload calls: initial + verify (the re-POST is not an /upload).
    await waitForUpload(page, 2);

    const calls = await getFetchCalls(page);
    expect(calls.filter(c => c.url.endsWith("/upload")).length).toBe(2);
    // Both S3 POSTs ran their bounded 2 attempts.
    expect(calls.filter(c => c.url.includes("s3.example.com/put")).length).toBe(2);
    expect(calls.filter(c => c.url.includes("s3.example.com/reput")).length).toBe(2);
    // No report was submitted — the attach failed.
    expect(calls.filter(c => c.url.endsWith("/report")).length).toBe(0);

    // The definite-failure copy — not the "may have reached us" hint.
    const errorTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red"))
        .map(p => p.textContent)
        .join("\n"),
    );
    expect(errorTexts).toContain("that photo didn't upload. Please try again.");
    expect(errorTexts).not.toContain("may have already reached us");

    // removePhoto() cleared the preview and the finally block re-enabled
    // the submit button for a re-pick.
    const previewBg = await page.evaluate(() => {
      const preview = document.getElementById("photo-preview");
      return preview ? preview.style.backgroundImage : null;
    });
    expect(previewBg).toBeFalsy();
    const buttonDisabled = await page.evaluate(() => {
      const btn = document.querySelector("#form-step-2 button[type='submit']") as HTMLButtonElement;
      return btn ? btn.disabled : null;
    });
    expect(buttonDisabled).toBe(false);
  });

  it("shows the server's address message and reopens the location picker when /upload returns 422 errors.address (BUG-038)", async () => {
    // BUG-038: a locality-only / partial-match Places pick is rejected by
    // the backend at upload time (HTTP 422 errors.address). The user must
    // see the server's user-facing copy in the photo error slot — not the
    // generic "We could not upload that photo" — and the location picker
    // must reopen so they can re-pick a more precise place immediately.
    const addressMessage = "Whoops! We couldn't verify that address. Try searching again for a valid location.";
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/upload": { status: 422, body: JSON.stringify({ errors: { address: addressMessage } }) },
        "/report": mockResponse(reportResponse()),
      }) + `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    await pickPhoto(page);
    await waitForPhotoError(page, "We couldn't verify that address");

    // (a) The photo error slot shows the server's address message verbatim,
    //     not the generic "We could not upload that photo" copy.
    const errorTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red"))
        .filter(p => !(p as HTMLElement).hidden)
        .map(p => p.textContent)
        .join("\n"),
    );
    expect(errorTexts).toContain("We couldn't verify that address");
    expect(errorTexts).toContain("Try searching again for a valid location");
    expect(errorTexts).not.toContain("We could not upload that photo");

    // (b) The location picker reopened (same pattern as the submit-time
    //     errors.address branch): step 1 visible, step 2 hidden.
    const step1 = await page.find("#form-step-1");
    expect(step1).not.toBeNull();
    expect(await step1.isVisible()).toBe(true);
    const step2 = await page.find("#form-step-2");
    expect(step2).not.toBeNull();
    expect(await step2.isVisible()).toBe(false);

    // removePhoto() ran before the branch: media state is cleared (no
    // stranded preview, no uploadId) so a re-pick + re-pick-address flow
    // starts clean and the previously hard-blocked submit is unlocked.
    const previewBg = await page.evaluate(() => {
      const preview = document.getElementById("photo-preview");
      return preview ? preview.style.backgroundImage : null;
    });
    expect(previewBg).toBeFalsy();

    // The failure was an /upload 422; no /report was ever attempted.
    const calls = await getFetchCalls(page);
    expect(calls.filter(c => c.url.endsWith("/upload")).length).toBe(1);
    expect(calls.filter(c => c.url.endsWith("/report")).length).toBe(0);
  });

  // Dispatch a synthetic beforeunload on window and report whether the
  // component's guard canceled it (the real browser dialog is driven by
  // preventDefault + returnValue, per the hotnready demo pattern).
  const beforeUnloadCanceled = (page: any) =>
    page.evaluate(() => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    });

  // Install a fake stencil-router history on the component and record
  // block()/unblock traffic, so the SPA guard wiring (route-link pushes and
  // back/forward pops confirm while an upload is unsaved) can be asserted
  // without mounting the real router.
  const installFakeRouterHistory = (page: any) =>
    page.$eval("form-report", (el: any) => {
      const w = window as any;
      w.__blockPrompts = [];
      w.__unblockCalls = 0;
      el.history = {
        block: (prompt: unknown) => {
          w.__blockPrompts.push(prompt);
          return () => {
            w.__unblockCalls++;
          };
        },
      };
    });

  it("arms the beforeunload guard while an uploaded photo is unsaved, disarms on remove and submit", async () => {
    const page = await setupPage();

    // No upload yet — leaving freely, no guard.
    expect(await beforeUnloadCanceled(page)).toBe(false);

    // Fresh upload completes (bytes in the bucket) — guard armed.
    await pickPhoto(page);
    await waitForUpload(page);
    expect(await beforeUnloadCanceled(page)).toBe(true);

    // Removing the photo deliberately discards it — guard disarmed.
    await removePhoto(page);
    await page.waitForChanges();
    expect(await beforeUnloadCanceled(page)).toBe(false);

    // Re-picking the same bytes hits the duplicate path — still an
    // uploaded photo awaiting a report, so the guard re-arms (this is
    // the upload #13320 retry-after-failure recovery shape).
    await page.evaluate((payload: unknown) => {
      (window as any).__mockResponses["/upload"] = { status: 200, body: JSON.stringify(payload) };
    }, duplicateUploadResponse());
    await pickPhoto(page);
    await waitForUpload(page, 2);
    expect(await beforeUnloadCanceled(page)).toBe(true);

    // Submit succeeds — the upload is linked to a report; leaving is safe.
    await fillFormAndSubmit(page);
    await waitForSubmit(page);
    expect(await beforeUnloadCanceled(page)).toBe(false);
  });

  it("guards SPA route navigation while an uploaded photo is unsaved (stencil-router transition prompt)", async () => {
    const page = await setupPage();
    await installFakeRouterHistory(page);

    // No upload yet — no transition prompt registered.
    expect(await page.evaluate(() => ((window as any).__blockPrompts || []).length)).toBe(0);

    // Fresh upload arms the SPA guard: one block() prompt registered.
    await pickPhoto(page);
    await waitForUpload(page);
    expect(await page.evaluate(() => ((window as any).__blockPrompts || []).length)).toBe(1);

    // The prompt behaves as a router blocking hook: declining the confirm
    // returns false, which confirmTransitionTo treats as "cancel the
    // transition" — this is what protects route-link clicks and
    // back/forward while the photo is unsaved.
    await page.evaluate(() => {
      (window as any).__confirmResults = [];
      window.confirm = (message?: string) => {
        (window as any).__confirmResults.push(message);
        return false;
      };
    });
    const promptResult = await page.evaluate(() => {
      const prompt = (window as any).__blockPrompts[0];
      return typeof prompt === "function" ? prompt({ pathname: "/" }, "PUSH") : prompt;
    });
    expect(promptResult).toBe(false);
    const confirmMessage = await page.evaluate(() => (window as any).__confirmResults[0]);
    expect(confirmMessage).toContain("photo");

    // Confirming returns "" (proceed) — the router treats any string as go.
    await page.evaluate(() => {
      (window as any).__confirmResults = [];
      window.confirm = (message?: string) => {
        (window as any).__confirmResults.push(message);
        return true;
      };
    });
    const promptResultConfirm = await page.evaluate(() =>
      typeof (window as any).__blockPrompts[0] === "function" ? (window as any).__blockPrompts[0]({ pathname: "/" }, "PUSH") : (window as any).__blockPrompts[0],
    );
    expect(promptResultConfirm).toBe("");

    // Removing the photo disarms — the prompt is unblocked.
    await removePhoto(page);
    await page.waitForChanges();
    expect(await page.evaluate(() => (window as any).__unblockCalls)).toBe(1);

    // Re-picking the same bytes (duplicate path) re-arms — a second prompt.
    await page.evaluate((payload: unknown) => {
      (window as any).__mockResponses["/upload"] = { status: 200, body: JSON.stringify(payload) };
    }, duplicateUploadResponse());
    await pickPhoto(page);
    await waitForUpload(page, 2);
    expect(await page.evaluate(() => ((window as any).__blockPrompts || []).length)).toBe(2);

    // Submit succeeds — both guards disarmed.
    await fillFormAndSubmit(page);
    await waitForSubmit(page);
    expect(await page.evaluate(() => (window as any).__unblockCalls)).toBe(2);
  });
});
