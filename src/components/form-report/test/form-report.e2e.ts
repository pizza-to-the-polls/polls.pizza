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

  it("recovers from S3 upload failure: network rejection clears state, re-pick duplicate links uploadId", async () => {
    // Regression test for the 2026-10-25 feed-reports incident (upload
    // #13320): /upload succeeds, the browser POSTs the file to the presigned
    // S3 URL, the file lands in the bucket, but the response never makes it
    // back and fetch rejects with a network TypeError. removePhoto() runs in
    // the catch (nulling uploadId and clearing the preview), the volunteer
    // re-picks the same photo, hits the duplicate path, and submits — the
    // report must still carry the canonical uploadId and permalink.
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/upload": mockResponse(freshUploadResponse()),
        // s3.example.com/put suffix-matches the presigned POST URL.
        "s3.example.com/put": { networkError: true },
        "/report": mockResponse(reportResponse()),
      }) + `<form-report formatted-address="123 Main St, Portland, OR"></form-report>`,
    );
    await page.waitForChanges();

    // Pick a photo: /upload succeeds (fresh response with presigned data),
    // but the S3 POST rejects with a network TypeError.
    await pickPhoto(page);
    await waitForUpload(page);

    // The generic fallback error is shown (a TypeError has no errors.fileName).
    // Step 2 has several p.help.has-text-red elements (waitTime, contactRole,
    // photo, ...), so collect them all and assert the photo message appears.
    const errorTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#form-step-2 p.help.has-text-red"))
        .map(p => p.textContent)
        .join("\n"),
    );
    expect(errorTexts).toContain("Whoops! We could not upload that photo");

    // removePhoto() cleared the preview's background image.
    const previewBg = await page.evaluate(() => {
      const preview = document.getElementById("photo-preview");
      return preview ? preview.style.backgroundImage : null;
    });
    expect(previewBg).toBeFalsy();

    // The finally block re-enabled the submit button.
    const buttonDisabled = await page.evaluate(() => {
      const btn = document.querySelector("#form-step-2 button[type='submit']") as HTMLButtonElement;
      return btn ? btn.disabled : null;
    });
    expect(buttonDisabled).toBe(false);

    // Exactly one S3 POST was recorded (the failed one).
    const calls1 = await getFetchCalls(page);
    const s3Calls1 = calls1.filter(c => c.url.includes("s3.example.com"));
    expect(s3Calls1.length).toBe(1);

    // Swap the /upload mock to the duplicate response — the re-pick of the
    // same bytes produces the same hash, so the backend answers isDuplicate
    // with the canonical id and no presigned payload.
    await page.evaluate((payload: unknown) => {
      (window as any).__mockResponses["/upload"] = { status: 200, body: JSON.stringify(payload) };
    }, duplicateUploadResponse());
    await pickPhoto(page);
    await waitForUpload(page, 2);

    // No second S3 POST: the duplicate path skips the presigned upload.
    const calls2 = await getFetchCalls(page);
    const s3Calls2 = calls2.filter(c => c.url.includes("s3.example.com"));
    const uploadCalls2 = calls2.filter(c => c.url.endsWith("/upload"));
    expect(s3Calls2.length).toBe(1);
    expect(uploadCalls2.length).toBe(2);

    await fillFormAndSubmit(page);
    await waitForSubmit(page);

    // The retry-after-failure round-trip produces a fully linked report.
    const calls3 = await getFetchCalls(page);
    const reportCalls = calls3.filter(c => c.url.endsWith("/report"));
    expect(reportCalls.length).toBe(1);
    expect(reportCalls[0].body).not.toBeNull();
    const reportBody = JSON.parse(reportCalls[0].body as string);
    expect(reportBody.uploadId).toBe(UPLOAD_ID);
    expect(reportBody.url.endsWith(`/uploads/${UPLOAD_FILE_NAME}`)).toBe(true);
  });
});
