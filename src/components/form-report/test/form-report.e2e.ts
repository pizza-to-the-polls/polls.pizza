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

// Report response: no truck on site, report will receive pizza (so the
// #distributor-confirmation panel renders after submit).
const reportResponse = () => ({ hasTruck: false, willReceive: true, alreadyOrdered: false });

const setupPage = async () => {
  const page = await newE2EPage();
  await page.setContent(
    mockFetchScript({
      "/upload": mockResponse(freshUploadResponse()),
      "/report": mockResponse(reportResponse()),
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
        // Both /upload calls answer fresh (not a duplicate): the row exists
        // but the bytes did not land.
        "/upload": mockResponse(freshUploadResponse()),
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
