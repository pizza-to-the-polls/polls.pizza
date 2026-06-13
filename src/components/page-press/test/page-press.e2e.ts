import { newE2EPage } from "@stencil/core/testing";

describe("page-press", () => {
  it("renders press page with video and logos", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-press></page-press>");

    const heading = await page.find("h1");
    expect(heading).not.toBeNull();
    const text = await heading.getProperty("textContent");
    expect(text.toLowerCase()).toContain("press");

    const logos = await page.findAll(".press-logos li");
    expect(logos.length).toBeGreaterThan(10);
  });
});
