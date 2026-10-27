import { newE2EPage } from "@stencil/core/testing";

/**
 * Regression tests for #156.
 *
 * When Stencil hydrates prerendered markup, it hides the server-rendered
 * children of any component that renders a `<slot />` and only reveals them
 * when slot relocation moves them into place. Children already in their final
 * position are never relocated, so they keep a stale `hidden` attribute and
 * the page collapses (the `/partners` grid rendered 88 logos that stayed
 * `hidden` and measured 0×0).
 *
 * `revealSlottedChildren` in `componentDidLoad` restores them.
 */
describe("ui-card slotted content reveal (#156)", () => {
  it("reveals prerendered slotted children that the runtime left hidden", async () => {
    const page = await newE2EPage();
    // Mimic the SSR output: slotted light-DOM children carry `hidden`.
    await page.setContent(`
      <ui-card>
        <h2 hidden>Our partners</h2>
        <ul class="partners" hidden>
          <li><img src="/images/logos/a.png" alt="a" /></li>
          <li><img src="/images/logos/b.png" alt="b" /></li>
        </ul>
      </ui-card>
    `);

    await page.waitForChanges();

    const state = await page.evaluate(() => {
      const ul = document.querySelector("ul.partners") as HTMLElement;
      const h2 = document.querySelector("h2") as HTMLElement;
      return {
        ulHidden: ul.hasAttribute("hidden"),
        h2Hidden: h2.hasAttribute("hidden"),
        liCount: ul.querySelectorAll("li").length,
      };
    });

    expect(state.liCount).toBe(2);
    expect(state.ulHidden).toBe(false);
    expect(state.h2Hidden).toBe(false);
  });

  it("does not un-hide elements that app code hides later", async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <ui-card>
        <div id="toggle">content</div>
        <div id="step" hidden>step</div>
      </ui-card>
    `);
    await page.waitForChanges();

    // App-driven hiding after load must survive.
    await page.evaluate(() => {
      const el = document.getElementById("step") as HTMLElement;
      el.setAttribute("hidden", "");
    });
    await page.waitForChanges();

    const stillHidden = await page.evaluate(() => (document.getElementById("step") as HTMLElement).hasAttribute("hidden"));
    expect(stillHidden).toBe(true);
  });
});
