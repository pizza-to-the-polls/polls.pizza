import { newE2EPage } from "@stencil/core/testing";

describe("page-press", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-press></page-press>");

    const element = await page.find("page-press");
    expect(element).toHaveClass("hydrated");
  });
});
