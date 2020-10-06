import { newE2EPage } from "@stencil/core/testing";

describe("page-donate", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-donate></page-donate>");

    const element = await page.find("page-donate");
    expect(element).toHaveClass("hydrated");
  });
});
