import { newSpecPage } from "@stencil/core/testing";

import { PageContactForm } from "../page-contact-form";

describe("page-contact-form", () => {
  it("renders", async () => {
    const page = await newSpecPage({
      components: [PageContactForm],
      html: `<page-contact-form></page-contact-form>`,
    });
    expect(page.root).toEqualHtml(`
      <page-contact-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </page-contact-form>
    `);
  });
});
