import { newE2EPage } from "@stencil/core/testing";

describe("page-partners", () => {
  it("renders partners list", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-partners></page-partners>");

    const heading = await page.find("h2");
    expect(heading).not.toBeNull();
    const text = await heading.getProperty("textContent");
    expect(text.toLowerCase()).toContain("partners");

    const partners = await page.findAll(".partners li");
    expect(partners.length).toBeGreaterThan(5);
  });
});
