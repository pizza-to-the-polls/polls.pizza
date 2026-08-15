import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("app-root component-load guard", () => {
  /**
   * Helper: mount <app-root> with the load guard active and auto-reload
   * disabled so reload decisions are logged but never navigated.
   */
  const mountApp = async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/health": {
          body: JSON.stringify({ ok: true }),
        },
      }) + "<app-root></app-root>",
    );
    await page.waitForChanges();

    // Disable auto-reload so we can observe reload decisions without
    // actually navigating away from the test page.
    await page.evaluate(() => {
      (window as any).__pizza_disable_auto_reload = true;
    });

    return page;
  };

  // -------------------------------------------------------------------
  // 1. Synthetic s.isProxied TypeError via window error event
  // -------------------------------------------------------------------
  it("handles s.isProxied TypeError via window error event", async () => {
    const page = await mountApp();

    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("TypeError: undefined is not an object (evaluating 's.isProxied')"),
          filename: "https://polls.pizza/build/p-188cd4da.entry.js",
          lineno: 1,
          message: "TypeError: undefined is not an object (evaluating 's.isProxied')",
        }),
      );
    });

    await page.waitForChanges();

    const log = await page.evaluate(() => (window as any).__pizza_component_load_log);
    expect(log).toBeDefined();
    expect(log.length).toBeGreaterThanOrEqual(1);

    const entry = log[0];
    expect(entry.chunkId).toBe("p-188cd4da.entry.js");
    expect(entry.fallback).toBe("banner");
    expect(entry.route).toBe("/");

    // The banner should be visible
    const banner = await page.find("#pizza-chunk-banner-p-188cd4da\\.entry\\.js");
    expect(banner).not.toBeNull();

    // App root should still be present — no crash
    const appRoot = await page.find("app-root");
    expect(appRoot).not.toBeNull();
  });

  // -------------------------------------------------------------------
  // 2. Synthetic chunk-import rejection via unhandledrejection
  // -------------------------------------------------------------------
  it("handles chunk-import failure via unhandledrejection", async () => {
    const page = await mountApp();

    await page.evaluate(() => {
      const reason = new TypeError("Failed to fetch dynamically imported module: https://polls.pizza/build/p-abc123.entry.js");
      window.dispatchEvent(
        new PromiseRejectionEvent("unhandledrejection", {
          promise: Promise.reject(reason),
          reason,
        }),
      );
    });

    await page.waitForChanges();

    const log = await page.evaluate(() => (window as any).__pizza_component_load_log);
    expect(log).toBeDefined();
    expect(log.length).toBeGreaterThanOrEqual(1);

    const entry = log[0];
    expect(entry.chunkId).toBe("p-abc123.entry.js");
    expect(entry.fallback).toBe("banner");

    const banner = await page.find("#pizza-chunk-banner-p-abc123\\.entry\\.js");
    expect(banner).not.toBeNull();
  });

  // -------------------------------------------------------------------
  // 3. Non-chunk errors pass through untouched
  // -------------------------------------------------------------------
  it("does not interfere with unrelated errors", async () => {
    const page = await mountApp();

    // Dispatch an error that is NOT chunk-related
    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("Something else broke"),
          filename: "https://polls.pizza/build/app.esm.js",
          lineno: 42,
          message: "Something else broke",
        }),
      );
    });

    await page.waitForChanges();

    const log = await page.evaluate(() => (window as any).__pizza_component_load_log);
    // The guard should not have logged anything for an unrelated error.
    expect(log.length).toBe(0);
  });

  // -------------------------------------------------------------------
  // 4. Deduplication — second failure for same chunk is suppressed
  // -------------------------------------------------------------------
  it("deduplicates failures per chunk id", async () => {
    const page = await mountApp();

    const dispatch = (chunk: string) => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("TypeError: undefined is not an object (evaluating 's.isProxied')"),
          filename: `https://polls.pizza/build/${chunk}`,
          message: "TypeError: undefined is not an object (evaluating 's.isProxied')",
        }),
      );
    };

    await page.evaluate(dispatch, "p-dup1.entry.js");
    await page.waitForChanges();

    await page.evaluate(dispatch, "p-dup1.entry.js");
    await page.waitForChanges();

    await page.evaluate(dispatch, "p-dup2.entry.js");
    await page.waitForChanges();

    const log = await page.evaluate(() => (window as any).__pizza_component_load_log);
    expect(log.length).toBe(2);
    expect(log[0].chunkId).toBe("p-dup1.entry.js");
    expect(log[1].chunkId).toBe("p-dup2.entry.js");
  });

  // -------------------------------------------------------------------
  // 5. ES5 / dynamicImportShim path (no .entry suffix in URL)
  // -------------------------------------------------------------------
  it("handles chunk URL without .entry suffix (ES5/dynamicImportShim)", async () => {
    const page = await mountApp();

    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("TypeError: undefined is not an object (evaluating 's.isProxied')"),
          filename: "https://polls.pizza/build/p-188cd4da.js",
          message: "TypeError: undefined is not an object (evaluating 's.isProxied')",
        }),
      );
    });

    await page.waitForChanges();

    const log = await page.evaluate(() => (window as any).__pizza_component_load_log);
    expect(log.length).toBeGreaterThanOrEqual(1);
    expect(log[0].chunkId).toBe("p-188cd4da.js");

    const banner = await page.find("#pizza-chunk-banner-p-188cd4da\\.js");
    expect(banner).not.toBeNull();
  });

  // -------------------------------------------------------------------
  // 6. Reload decision is computed (but not executed due to disable flag)
  // -------------------------------------------------------------------
  it("computes reload fallback for early failures", async () => {
    const page = await mountApp();

    // Override performance.now to simulate a failure within the initial 10 s window
    await page.evaluate(() => {
      const realNow = performance.now.bind(performance);
      performance.now = () => 5_000; // 5 s — within 10 s window
    });

    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("TypeError: undefined is not an object (evaluating 's.isProxied')"),
          filename: "https://polls.pizza/build/p-early.entry.js",
          message: "TypeError: undefined is not an object (evaluating 's.isProxied')",
        }),
      );
    });

    await page.waitForChanges();

    const log = await page.evaluate(() => (window as any).__pizza_component_load_log);
    expect(log.length).toBeGreaterThanOrEqual(1);
    // The decision should be "reload" because we are within the initial window
    expect(log[0].fallback).toBe("reload");

    // Because auto-reload is disabled, the page should NOT have reloaded
    // (we're still here and can read the log).
  });

  // -------------------------------------------------------------------
  // 7. Real chunk-load failure via request interception (end-to-end)
  // -------------------------------------------------------------------
  it("survives real chunk-load failure without crashing", async () => {
    const page = await newE2EPage();

    // Allow non-chunk requests; abort every .entry.js and build/p-*
    // request so the native dynamic import() rejects when Stencil
    // attempts to lazy-load a component, reproducing the production
    // failure mode.  Note: app-root is typically in the main bundle so
    // it should still upgrade even when all chunks are blocked.
    (page as any).setRequestInterception(true);
    (page as any).on("request", (req: any) => {
      const url: string = req.url();
      if (/\.entry\.js/.test(url) || /\/build\/p-[a-f0-9]+\.js/.test(url)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setContent(
      mockFetchScript({
        "/health": {
          body: JSON.stringify({ ok: true }),
        },
      }) + "<app-root></app-root>",
    );

    // Disable auto-reload so we stay on the page
    await page.evaluate(() => {
      (window as any).__pizza_disable_auto_reload = true;
    });

    // Allow time for Stencil to bootstrap and attempt chunk loads
    await page.waitForTimeout(3000);
    await page.waitForChanges();

    // App-root should still be present — no unhandled crash
    const appRoot = await page.find("app-root");
    expect(appRoot).not.toBeNull();

    // Guard should be installed (regardless of whether any chunks failed)
    const guardInstalled = await page.evaluate(() => !!(window as any).__pizza_guard_installed);
    expect(guardInstalled).toBe(true);

    // Verify the log exists (it may be empty if no lazy chunks were
    // needed during initial render, which is fine — the guard is still
    // active for later route navigation)
    const log = await page.evaluate(() => (window as any).__pizza_component_load_log);
    expect(log).toBeDefined();

    // Verify log entries have required fields if any failures occurred
    for (const entry of log) {
      expect(entry.chunkId).toBeTruthy();
      expect(typeof entry.chunkId).toBe("string");
      expect(entry.message).toBeTruthy();
      expect(["reload", "banner"]).toContain(entry.fallback);
    }

    // Clean up interception
    (page as any).setRequestInterception(false);
  });
});
