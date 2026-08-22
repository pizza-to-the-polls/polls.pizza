import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

/**
 * sessionStorage key used by the component load guard to throttle
 * auto-reloads (see src/util/componentLoadGuard.ts).
 */
const RETRY_KEY = "pizza:chunk-retry";

describe("app-root component-load guard", () => {
  /**
   * Helper: mount <app-root> with the load guard active and auto-reload
   * disabled so reload decisions are logged but never navigated.
   *
   * When `recentRetry` is true, seeds the guard's sessionStorage retry key
   * with a fresh timestamp so `decideFallback` resolves to "banner" instead
   * of "reload" (the initial 10 s window would otherwise always choose
   * "reload").
   */
  const mountApp = async (opts: { recentRetry?: boolean } = {}) => {
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

    if (opts.recentRetry) {
      // A recent retry timestamp suppresses the "reload" fallback and makes
      // the guard choose the banner instead.
      await page.evaluate((key: string) => {
        sessionStorage.setItem(key, String(Date.now()));
      }, RETRY_KEY);
    }

    return page;
  };

  // -------------------------------------------------------------------
  // 1. Synthetic s.isProxied TypeError via window error event
  // -------------------------------------------------------------------
  it("handles s.isProxied TypeError via window error event", async () => {
    const page = await mountApp({ recentRetry: true });

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
    const page = await mountApp({ recentRetry: true });

    await page.evaluate(() => {
      const reason = new TypeError("Failed to fetch dynamically imported module: https://polls.pizza/build/p-abc123.entry.js");
      // Use a never-settling promise so the synthetic dispatch doesn't
      // itself trigger a second, real unhandledrejection.
      const promise = new Promise(() => {
        // never settles
      });
      window.dispatchEvent(
        new PromiseRejectionEvent("unhandledrejection", {
          promise,
          reason,
          cancelable: true,
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
    // (log stays undefined until the first event is recorded.)
    expect(log ?? []).toHaveLength(0);
  });

  // -------------------------------------------------------------------
  // 4. Deduplication — second failure for same chunk is suppressed
  // -------------------------------------------------------------------
  it("deduplicates failures per chunk id", async () => {
    const page = await mountApp();

    // NOTE: chunk ids must be hex-compatible ([a-f0-9]+) to be recognised
    // by the guard's chunk-id extractor, hence the cryptic names below.
    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("TypeError: undefined is not an object (evaluating 's.isProxied')"),
          filename: "https://polls.pizza/build/p-deadbeef1.entry.js",
          message: "TypeError: undefined is not an object (evaluating 's.isProxied')",
        }),
      );
    });
    await page.waitForChanges();

    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("TypeError: undefined is not an object (evaluating 's.isProxied')"),
          filename: "https://polls.pizza/build/p-deadbeef1.entry.js",
          message: "TypeError: undefined is not an object (evaluating 's.isProxied')",
        }),
      );
    });
    await page.waitForChanges();

    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("TypeError: undefined is not an object (evaluating 's.isProxied')"),
          filename: "https://polls.pizza/build/p-cafebabe2.entry.js",
          message: "TypeError: undefined is not an object (evaluating 's.isProxied')",
        }),
      );
    });
    await page.waitForChanges();

    const log = await page.evaluate(() => (window as any).__pizza_component_load_log);
    expect(log.length).toBe(2);
    expect(log[0].chunkId).toBe("p-deadbeef1.entry.js");
    expect(log[1].chunkId).toBe("p-cafebabe2.entry.js");
  });

  // -------------------------------------------------------------------
  // 5. ES5 / dynamicImportShim path (no .entry suffix in URL)
  // -------------------------------------------------------------------
  it("handles chunk URL without .entry suffix (ES5/dynamicImportShim)", async () => {
    const page = await mountApp({ recentRetry: true });

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

    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", {
          error: new Error("TypeError: undefined is not an object (evaluating 's.isProxied')"),
          filename: "https://polls.pizza/build/p-earlybad.entry.js",
          message: "TypeError: undefined is not an object (evaluating 's.isProxied')",
        }),
      );
    });

    await page.waitForChanges();

    const log = await page.evaluate(() => (window as any).__pizza_component_load_log);
    expect(log.length).toBeGreaterThanOrEqual(1);
    // Fresh page, no prior retry recorded, still within the initial window:
    // the decision should be "reload".
    expect(log[0].fallback).toBe("reload");

    // Because auto-reload is disabled, the page should NOT have reloaded
    // (we're still here and can read the log).
  });

  // -------------------------------------------------------------------
  // 7. Guard installs cleanly alongside normal app bootstrap
  // -------------------------------------------------------------------
  it("installs the guard during normal bootstrap without interfering", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/health": {
          body: JSON.stringify({ ok: true }),
        },
      }) + "<app-root></app-root>",
    );

    await page.waitForChanges();
    // Puppeteer 21+ removed page.waitForTimeout; wait inside the page instead.
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));

    // App-root should upgrade normally
    const appRoot = await page.find("app-root");
    expect(appRoot).not.toBeNull();

    // Guard should be installed
    const guardInstalled = await page.evaluate(() => !!(window as any).__pizza_guard_installed);
    expect(guardInstalled).toBe(true);

    // Log array is exposed (empty until a failure occurs)
    const log = await page.evaluate(() => (window as any).__pizza_component_load_log);
    expect(log ?? []).toHaveLength(0);
  });
});

describe("app-root client-side navigation", () => {
  it("navigates between routes when clicking route links", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/health": { body: JSON.stringify({ ok: true }) },
        "/totals": { body: JSON.stringify({ pizzas: 0, snacks: 0, orders: 0, locations: 0 }) },
      }) + "<app-root></app-root>",
    );
    await page.waitForChanges();

    // The home route should be visible initially
    const homeInitiallyVisible = await page.evaluate(() => {
      const el = document.querySelector("page-home");
      return el != null && (el as HTMLElement).style.display !== "none";
    });
    expect(homeInitiallyVisible).toBe(true);

    // Click a header route link and wait for the route switch to settle
    await page.evaluate(() => {
      const link = document.querySelector<HTMLAnchorElement>('a[href="/about"]');
      if (!link) throw new Error("no /about anchor found");
      link.click();
    });
    await page.waitForChanges();

    // URL should reflect the new route...
    expect(await page.url()).toContain("/about");

    // ...the about page must be visible
    const aboutVisible = await page.evaluate(() => {
      const el = document.querySelector("page-about");
      return el != null && (el as HTMLElement).style.display !== "none";
    });
    expect(aboutVisible).toBe(true);

    // ...and the previous page must be hidden (this is the regression guard:
    // with the router's visibility update broken, page-home stays visible).
    const homeHidden = await page.evaluate(() => {
      const el = document.querySelector("page-home");
      return el == null || (el as HTMLElement).style.display === "none";
    });
    expect(homeHidden).toBe(true);
  });
});
