import { newSpecPage } from "@stencil/core/testing";

import { UiPizzaList } from "../ui-pizza-list";

describe("ui-pizza-list", () => {
  it("renders", async () => {
    const page = await newSpecPage({
      components: [UiPizzaList],
      html: `<ui-pizza-list></ui-pizza-list>`,
    });
    expect(page.root).toEqualHtml(`
      <ui-pizza-list>
          <slot></slot>
      </ui-pizza-list>
    `);
  });
});
