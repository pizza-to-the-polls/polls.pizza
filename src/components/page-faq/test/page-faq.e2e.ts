import { newE2EPage } from "@stencil/core/testing";

describe("page-faq", () => {
  it("renders FAQ heading and collapsible cards", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-faq></page-faq>");

    const heading = await page.find("h1");
    expect(heading).not.toBeNull();
    const text = await heading.getProperty("textContent");
    expect(text.toLowerCase()).toContain("frequently asked");

    const cards = await page.findAll("ui-card[is-collapsible='true']");
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });
});
