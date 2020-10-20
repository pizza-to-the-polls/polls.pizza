import { newE2EPage } from "@stencil/core/testing";

describe("page-instructions", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-instructions></page-instructions>");

    const element = await page.find("page-instructions");
    expect(element).toHaveClass("hydrated");
  });
});
