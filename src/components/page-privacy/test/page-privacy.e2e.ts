import { newE2EPage } from "@stencil/core/testing";

describe("page-privacy", () => {
  it("renders privacy policy headings", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-privacy></page-privacy>");

    const heading = await page.find("h1");
    expect(heading).not.toBeNull();
    const text = await heading.getProperty("textContent");
    expect(text.toLowerCase()).toContain("privacy policy");

    const subHeadings = await page.findAll("h3");
    expect(subHeadings.length).toBeGreaterThanOrEqual(4);
  });
});
