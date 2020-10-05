import { newE2EPage } from "@stencil/core/testing";

describe("page-trucks", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-trucks></page-trucks>");

    const element = await page.find("page-trucks");
    expect(element).toHaveClass("hydrated");
  });
});
