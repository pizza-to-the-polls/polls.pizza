import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

const mockResponse = (payload: unknown) => ({ status: 200, body: JSON.stringify(payload) });

// Record gtag calls in-page BEFORE the <form-donate> tag so the mock exists
// when componentWillLoad fires the load-time event.
const gtagRecorderScript = `
  <script>
    window.__gtagCalls = [];
    window.gtag = function() {
      window.__gtagCalls.push(Array.from(arguments));
    };
  </script>
`;

const setupPage = async (responses: Record<string, { status?: number; body: string }> = {}) => {
  const page = await newE2EPage();
  await page.setContent(gtagRecorderScript + mockFetchScript(responses) + `<form-donate></form-donate>`);
  await page.waitForChanges();
  return page;
};

const getGtagEvents = (page: any) =>
  page.evaluate(() =>
    ((window as any).__gtagCalls || []).filter((call: unknown[]) => call[0] === "event").map((call: unknown[]) => ({ name: call[1], params: call[2] })),
  ) as Promise<{ name: string; params?: Record<string, string | number | boolean> }[]>;

const getEventNames = async (page: any) => (await getGtagEvents(page)).map(e => e.name);

// Select an amount by clicking the radio (display: none — DOM click required)
// then firing a change event so Stencil's form onChange picks it up.
const selectPresetAmount = async (page: any, idx: number) => {
  await page.evaluate((idx: number) => {
    const radio = document.getElementById(`radio-${idx}`) as HTMLInputElement;
    radio.click();
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  }, idx);
  await page.waitForChanges();
};

// Set the "Other" custom amount via the text input's input event.
const setCustomAmount = async (page: any, value: string) => {
  await page.evaluate((value: string) => {
    const activateCustom = document.getElementById("custom-amount-radio");
    activateCustom?.click();
    const custom = document.getElementById("custom-amount") as HTMLInputElement;
    custom.value = value;
    custom.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
  await page.waitForChanges();
};

const clickDonate = async (page: any) => {
  // The Donate <button> renders no type attribute — select it directly.
  // (It is the only <button> inside #donate-form; the PayPal fallback is an <a>.)
  const button = await page.find("#donate-form button");
  await button.click();
  await page.waitForChanges();
};

// Wait for a fetch call whose URL ends with the given suffix.
const waitForFetchCall = async (page: any, urlSuffix: string) => {
  const start = Date.now();
  for (;;) {
    const done = await page.evaluate((suffix: string) => {
      const calls = ((window as any).__fetchCalls || []) as { url: string }[];
      return calls.some(c => String(c.url).endsWith(suffix));
    }, urlSuffix);
    if (done) break;
    if (Date.now() - start > 10000) throw new Error(`fetch call ${urlSuffix} did not happen in time`);
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 100)));
  }
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 200)));
  await page.waitForChanges();
};

describe("form-donate funnel events", () => {
  it("emits donation_form_start when the form loads", async () => {
    const page = await setupPage();

    const names = await getEventNames(page);
    expect(names).toEqual(["donation_form_start"]);
  });

  it("emits submit_attempted and checkout_started on the happy path", async () => {
    const page = await setupPage({
      "/donations": mockResponse({ success: true, checkoutSessionId: "cs_test_123" }),
    });

    await selectPresetAmount(page, 1);
    await clickDonate(page);
    await waitForFetchCall(page, "/donations");

    const names = await getEventNames(page);
    expect(names).toEqual(["donation_form_start", "donation_submit_attempted", "donation_checkout_started"]);
    expect(names).not.toContain("donation_amount_invalid");
    expect(names).not.toContain("donation_checkout_failed");
  });

  it("emits donation_amount_invalid for an amount under $0.50", async () => {
    const page = await setupPage();

    await setCustomAmount(page, "0.25");
    await clickDonate(page);

    const names = await getEventNames(page);
    expect(names).toEqual(["donation_form_start", "donation_submit_attempted", "donation_amount_invalid"]);
    // No checkout session was requested.
    expect(names).not.toContain("donation_checkout_started");
    expect(names).not.toContain("donation_checkout_failed");
  });

  it("emits donation_checkout_failed when the donation POST rejects", async () => {
    const page = await setupPage({
      "/donations": { status: 500, body: "{}" },
    });

    await selectPresetAmount(page, 1);
    await clickDonate(page);
    await waitForFetchCall(page, "/donations");

    const names = await getEventNames(page);
    expect(names).toEqual(["donation_form_start", "donation_submit_attempted", "donation_checkout_failed"]);
    expect(names).not.toContain("donation_checkout_started");

    // The user-visible error message renders.
    const errorEl = await page.find("#donation-error");
    expect(errorEl).not.toBeNull();
  });

  it("emits no events when gtag is absent (adblock / prerender safety)", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/donations": mockResponse({ success: true, checkoutSessionId: "cs_test_123" }),
      }) + `<form-donate></form-donate>`,
    );
    await page.waitForChanges();

    await selectPresetAmount(page, 1);
    await clickDonate(page);
    await waitForFetchCall(page, "/donations");

    // Nothing threw and the checkout session was still created — the
    // analytics helper silently no-op'd.
    const donationCalls = await page.evaluate(() => (((window as any).__fetchCalls || []) as { url: string }[]).filter(c => String(c.url).endsWith("/donations")).length);
    expect(donationCalls).toBe(1);
  });
});
