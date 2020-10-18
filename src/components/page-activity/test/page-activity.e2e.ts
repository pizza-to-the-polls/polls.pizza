import { newE2EPage } from "@stencil/core/testing";

describe("page-activity", () => {
  it.skip("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-activity></page-activity>");

    const element = await page.find("page-activity");
    expect(element).toHaveClass("hydrated");
  });
});
