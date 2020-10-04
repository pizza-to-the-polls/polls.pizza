import { newE2EPage } from "@stencil/core/testing";

describe("page-about", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-about></page-about>");

    const element = await page.find("page-about");
    expect(element).toHaveClass("hydrated");
  });
});
