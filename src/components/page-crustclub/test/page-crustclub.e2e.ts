import { newE2EPage } from "@stencil/core/testing";

describe("page-crustclub", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-crustclub></page-crustclub>");

    const element = await page.find("page-crustclub");
    expect(element).toHaveClass("hydrated");
  });
});
