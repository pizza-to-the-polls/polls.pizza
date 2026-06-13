import { newE2EPage } from "@stencil/core/testing";

describe("app-root", () => {
  it("renders header navigation with key links", async () => {
    const page = await newE2EPage();
    await page.setContent("<app-root></app-root>");
    await page.waitForChanges();

    const header = await page.find("header.header");
    expect(header).not.toBeNull();

    const navLinks = await page.findAll("ul.menu li");
    expect(navLinks.length).toBeGreaterThanOrEqual(4);
  });

  it("checks health on browser", async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<script>window.__fetchCalls = []; window.fetch = function(url, opts) { window.__fetchCalls.push({url: String(url), opts}); return Promise.resolve({status: 200, text: function(){ return Promise.resolve("{}"); }}); }</script>` +
        "<app-root></app-root>",
    );
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const healthCalls = calls.filter((c: any) => c.url.includes("/health"));
    expect(healthCalls.length).toBe(1);
  });
});
