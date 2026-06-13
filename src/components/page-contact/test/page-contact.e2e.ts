import { newE2EPage } from "@stencil/core/testing";

describe("page-contact", () => {
  it("renders contact page with FAQ and email links", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-contact></page-contact>");

    const heading = await page.find("h1");
    expect(heading).not.toBeNull();
    const text = await heading.getProperty("textContent");
    expect(text.toLowerCase()).toContain("contact");

    const links = await page.findAll("a[href^='mailto:']");
    expect(links.length).toBeGreaterThan(0);
  });
});
