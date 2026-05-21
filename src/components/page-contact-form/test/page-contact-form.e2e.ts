import { newE2EPage } from "@stencil/core/testing";

describe("page-contact-form", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-contact-form></page-contact-form>");

    const element = await page.find("page-contact-form");
    expect(element).toHaveClass("hydrated");
  });
});
