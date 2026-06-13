import { newSpecPage } from "@stencil/core/testing";

import { PabeSignUpForm } from "../page-signup-form";

describe("page-signup-form", () => {
  it("renders", async () => {
    const page = await newSpecPage({
      components: [PabeSignUpForm],
      html: `<page-signup-form></page-signup-form>`,
    });
    expect(page.root).toEqualHtml(`
      <page-signup-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </page-signup-form>
    `);
  });
});
