import { newSpecPage } from "@stencil/core/testing";

import { UiText } from "../ui-dynamic-text";

describe("ui-dynamic-text", () => {
  it("renders", async () => {
    const page = await newSpecPage({
      components: [UiText],
      html: `<ui-dynamic-text></ui-dynamic-text>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-dynamic-text>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-dynamic-text>
    `);
  });
});
