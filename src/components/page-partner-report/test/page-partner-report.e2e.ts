import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

const mockResponse = (payload: unknown) => ({ status: 200, body: JSON.stringify(payload) });

// history prop injection pattern (see page-donate e2e): stencil e2e can't
// pass nested object props reliably, so define it on window and assign
// after setContent.
const setupPage = async (token?: string) => {
  const page = await newE2EPage();
  await page.setContent(
    mockFetchScript({
      "/partner/session": mockResponse({ success: true }),
    }) +
      `<script>
        // Tests share one browser origin — clear any token a previous test
        // persisted before this page's component hydrates.
        window.localStorage.clear();
        window.__history = {
          location: { query: ${token ? `{ token: "${token}" }` : "{}"} }
        };
      </script>` +
      `<page-partner-report></page-partner-report>`,
  );
  await page.evaluate(() => {
    const el = document.querySelector("page-partner-report") as any;
    el.history = (window as any).__history;
  });
  await page.waitForChanges();
  return page;
};

describe("<page-partner-report>", () => {
  it("shows the email sign-in step when no token is present", async () => {
    const page = await setupPage();

    const state = await page.evaluate(() => ({
      signIn: !!document.getElementById("partner-sign-in"),
      form: !!document.querySelector("form-partner-report"),
    }));
    expect(state.signIn).toBe(true);
    expect(state.form).toBe(false);
  });

  it("shows the report form when a magic-link token is in the URL", async () => {
    const page = await setupPage("fake-magic-link-token");

    const state = await page.evaluate(() => ({
      signIn: !!document.getElementById("partner-sign-in"),
      form: !!document.querySelector("form-partner-report"),
    }));
    expect(state.signIn).toBe(false);
    expect(state.form).toBe(true);
  });

  it("persists the URL token to localStorage for the next visit", async () => {
    const page = await setupPage("fake-magic-link-token");

    const stored = await page.evaluate(() => window.localStorage.getItem("ptp-partner-token"));
    expect(stored).toEqual("fake-magic-link-token");
  });

  it("decodes percent-encoded tokens the way email clients mangle links", async () => {
    // Emailed links are encodeURIComponent'd server-side (`|` → `%7C`);
    // some clients re-encode or pass them through undecoded. The page must
    // normalize before storing/using.
    const page = await setupPage("fake%7Cpayload%7Csig");

    const state = await page.evaluate(() => ({
      form: !!document.querySelector("form-partner-report"),
      signIn: !!document.getElementById("partner-sign-in"),
      stored: window.localStorage.getItem("ptp-partner-token"),
    }));
    expect(state.form).toBe(true);
    expect(state.signIn).toBe(false);
    expect(state.stored).toEqual("fake|payload|sig");
  });

  it("requests a sign-in link via POST /partner/session on email submit", async () => {
    const page = await setupPage();

    await page.evaluate(() => {
      const input = document.getElementById("partner-email") as HTMLInputElement;
      input.value = "nina@polls.pizza";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForChanges();

    await page.evaluate(() => {
      (document.querySelector("#partner-sign-in-form button") as HTMLElement).click();
    });
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls as { url: string; opts?: any }[]);
    const sessionCall = calls.find(c => String(c.url).endsWith("/partner/session"));
    expect(sessionCall).toBeDefined();
    expect(JSON.parse(sessionCall!.opts?.body)).toEqual({ email: "nina@polls.pizza" });

    const sentVisible = await page.evaluate(() => !!document.getElementById("partner-link-sent"));
    expect(sentVisible).toBe(true);
  });
});
