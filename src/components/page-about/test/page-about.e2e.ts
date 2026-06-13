import { newE2EPage } from "@stencil/core/testing";

describe("page-about", () => {
  it("renders about content with heading", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-about></page-about>");

    const element = await page.find("page-about");
    expect(element).not.toBeNull();

    const heading = await page.find("h1");
    expect(heading).not.toBeNull();
    const text = await heading.getProperty("textContent");
    expect(text.toLowerCase()).toContain("about");
  });

  it("renders year milestones", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-about></page-about>");

    const milestones = await page.findAll("h3");
    expect(milestones.length).toBeGreaterThanOrEqual(4);
  });
});
