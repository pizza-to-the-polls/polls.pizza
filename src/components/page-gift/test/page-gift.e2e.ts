import { newE2EPage } from "@stencil/core/testing";

describe("page-gift", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-gift></page-gift>");

    const element = await page.find("page-gift");
    expect(element).toHaveClass("hydrated");
  });
});
