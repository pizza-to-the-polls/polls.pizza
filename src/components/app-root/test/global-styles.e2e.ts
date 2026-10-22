import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

/**
 * Regression tests for BUG-018:
 *
 * `styles/main.scss` (Stencil's `globalStyle`) used to start with two
 * CSS-level `@import url("https://fonts.googleapis.com/...")` rules.
 * Stencil compiles the global stylesheet into a string that is embedded
 * in every lazy chunk, and its shadow-root setup code passes that string
 * to `new CSSStyleSheet().replaceSync()` for every `shadow: true`
 * component. The CSSOM spec forbids `@import` rules in synchronously
 * constructed stylesheets, so legacy Chromium builds (e.g. Chrome Mobile
 * 75 on Android 5) throw
 *
 *   NotAllowedError: Failed to execute 'replaceSync' on 'CSSStyleSheet':
 *   @import rules are not allowed when creating stylesheet synchronously.
 *
 * synchronously inside `customElements.define()`. That kills the whole
 * component registry and leaves the site a dead prerendered shell.
 *
 * The fix removes the `@import url(...)` lines from `styles/main.scss`
 * and loads the Google Fonts via `<link>` tags in `src/index.html`.
 *
 * The site-wide shadow component `ui-scroll-to-top-button` (rendered by
 * `app-root` on every page) exercises the shadow-root adoption path that
 * used to crash, so it doubles as the regression target here.
 */
describe("global styles: shadow-root stylesheet adoption (BUG-018)", () => {
  const mountApp = async () => {
    const pageErrors: string[] = [];
    const page = await newE2EPage();
    page.on("pageerror", err => pageErrors.push(err.message));
    await page.setContent(
      mockFetchScript({
        "/health": {
          body: JSON.stringify({ ok: true }),
        },
        "/totals": {
          body: JSON.stringify({
            donors: 15000,
            raised: 2500000,
            pizzas: 70000,
            snacks: 100000,
            orders: 5000,
            locations: 3000,
            states: 48,
            costs: 2000000,
          }),
        },
      }) + "<app-root></app-root>",
    );
    await page.waitForChanges();
    return { page, pageErrors };
  };

  it("hydrates ui-scroll-to-top-button with an adopted stylesheet and zero page errors", async () => {
    const { page, pageErrors } = await mountApp();

    const button = await page.find("ui-scroll-to-top-button");
    expect(button).not.toBeNull();

    // The shadow root must have at least one adopted stylesheet: Stencil
    // adopts the compiled global stylesheet (and the component style) via
    // CSSStyleSheet#replaceSync. Before the fix this step threw
    // NotAllowedError on legacy Chromium builds.
    const adoptedSheetCount = await page.evaluate(() => {
      const el = document.querySelector("ui-scroll-to-top-button");
      return el?.shadowRoot?.adoptedStyleSheets?.length ?? 0;
    });
    expect(adoptedSheetCount).toBeGreaterThanOrEqual(1);

    expect(pageErrors).toHaveLength(0);
  });

  it("does not embed any external @import rule in the adopted global stylesheets", async () => {
    const { page, pageErrors } = await mountApp();

    const importedUrls = await page.evaluate(() => {
      const urls: string[] = [];
      const el = document.querySelector("ui-scroll-to-top-button");
      const sheets = el?.shadowRoot?.adoptedStyleSheets ?? [];
      for (const sheet of Array.from(sheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSImportRule && rule.href) {
            urls.push(rule.href);
          }
        }
      }
      return urls;
    });

    // Before the fix, the global stylesheet carried the Google Fonts
    // @import rules into every shadow root, crashing replaceSync on
    // legacy browsers. No external @import may remain.
    expect(importedUrls).toHaveLength(0);

    expect(pageErrors).toHaveLength(0);
  });

  it("keeps the Fredoka/Chivo/Inter font stacks intact on body and heading", async () => {
    const { page, pageErrors } = await mountApp();

    // The global stylesheet (now free of @import rules) still applies the
    // font stacks from styles/include/_vars.scss:
    //   body  -> $body-font   ("Inter", fallbacks)
    //   h1    -> $header-font ("Chivo", fallbacks)
    // The computed font-family reflects the declared stack regardless of
    // whether the font files themselves have finished loading, which keeps
    // this assertion deterministic (no network dependency).
    const fontFamilies = await page.evaluate(() => {
      const body = getComputedStyle(document.body).fontFamily;
      const heading = document.querySelector("h1") ? getComputedStyle(document.querySelector("h1")!).fontFamily : null;
      return { body, heading };
    });

    expect(fontFamilies.body).toContain("Inter");
    expect(fontFamilies.heading).toContain("Chivo");

    expect(pageErrors).toHaveLength(0);
  });
});
