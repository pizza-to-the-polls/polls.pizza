import { newE2EPage } from "@stencil/core/testing";

describe("page-privacy", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-privacy></page-privacy>");

    const element = await page.find("page-privacy");
    expect(element).toHaveClass("hydrated");
  });
});
