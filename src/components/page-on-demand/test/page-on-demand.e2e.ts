import { newE2EPage } from "@stencil/core/testing";

describe("page-on-demand", () => {
  it("renders on-demand content with how-to-help steps", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-on-demand></page-on-demand>");

    const heading = await page.find("h1");
    expect(heading).not.toBeNull();
    const text = await heading.getProperty("textContent");
    expect(text.toLowerCase()).toContain("on demand");

    const steps = await page.findAll("h3");
    expect(steps.length).toBeGreaterThanOrEqual(3);
  });

  it("has a report link button", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-on-demand></page-on-demand>");

    const reportBtn = await page.find("a.button[href='/#report']");
    expect(reportBtn).not.toBeNull();
  });
});
