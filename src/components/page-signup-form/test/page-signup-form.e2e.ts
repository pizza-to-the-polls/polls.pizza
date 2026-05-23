import { newE2EPage } from "@stencil/core/testing";

describe("page-signup-form", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-signup-form></page-signup-form>");

    const element = await page.find("page-signup-form");
    expect(element).toHaveClass("hydrated");
  });
});
