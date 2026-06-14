import { newE2EPage } from "@stencil/core/testing";

describe("page-signup-form", () => {
  it("renders the newsletter signup form", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-signup-form></page-signup-form>");

    const form = await page.find("form");
    expect(form).not.toBeNull();

    const emailInput = await page.find('input[type="email"]');
    expect(emailInput).not.toBeNull();
  });
});
