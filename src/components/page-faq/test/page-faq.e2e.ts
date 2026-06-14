import { newE2EPage } from "@stencil/core/testing";

describe("page-faq", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-faq></page-faq>");

    const element = await page.find("page-faq");
    expect(element).not.toBeNull();
  });
});
