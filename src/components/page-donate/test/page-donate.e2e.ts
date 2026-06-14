import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("page-donate", () => {
  it("renders the donation form", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-donate></page-donate>");

    const donateForm = await page.find("form-donate");
    expect(donateForm).not.toBeNull();
  });

  it("shows confirmation state when query param success=true", async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<script>
        window.__history = {
          location: { query: { success: "1", amount_usd: "20", type: "donation" } }
        };
      </script>` + `<page-donate></page-donate>`,
    );
    // Inject the history prop directly because page.setProperty() doesn't handle
    // nested objects like { location: { query: ... } } reliably in Stencil E2E.
    await page.evaluate(() => {
      const el = document.querySelector("page-donate") as any;
      if (el) {
        el.history = (window as any).__history;
      }
    });
    await page.waitForChanges();

    const confirmation = await page.find("ui-share-links");
    expect(confirmation).not.toBeNull();
  });
});
