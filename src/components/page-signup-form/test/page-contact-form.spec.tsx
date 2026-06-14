import { newSpecPage } from "@stencil/core/testing";

import { PageSignUpForm } from "../page-signup-form";

describe("page-signup-form", () => {
  it("renders", async () => {
    const page = await newSpecPage({
      components: [PageSignUpForm],
      html: `<page-signup-form></page-signup-form>`,
    });
    expect(page.root).not.toBeNull();
    const emailInput = page.root?.querySelector('input[type="email"]');
    expect(emailInput).not.toBeNull();
  });
});
