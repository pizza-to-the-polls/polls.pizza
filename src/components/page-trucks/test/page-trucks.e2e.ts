import { newE2EPage } from "@stencil/core/testing";

describe("page-trucks", () => {
  it("renders food truck program content", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-trucks></page-trucks>");

    const heading = await page.find("h1");
    expect(heading).not.toBeNull();
    const text = await heading.getProperty("textContent");
    expect(text.toLowerCase()).toContain("food trucks");
  });
});
