import { newSpecPage } from "@stencil/core/testing";

import { UiCard } from "../ui-card";

describe("ui-card", () => {
  it("renders", async () => {
    const page = await newSpecPage({
      components: [UiCard],
      html: `<ui-card></ui-card>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-card>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ui-card>
    `);
  });
});
