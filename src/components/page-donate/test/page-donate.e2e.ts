import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("page-donate", () => {
  it("renders the donation form", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-donate></page-donate>");

    const donateForm = await page.find("form-donate");
    expect(donateForm).not.toBeNull();
  });

  it("selects an amount and donation type", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-donate></page-donate>");
    await page.waitForChanges();

    const amountRadio = await page.find('input[name="amount"][value="20"]');
    expect(amountRadio).not.toBeNull();
    await amountRadio.click();
    await page.waitForChanges();

    const typeSubscription = await page.find('input[name="donationType"][value="subscription"]');
    expect(typeSubscription).not.toBeNull();
    await typeSubscription.click();
    await page.waitForChanges();

    const checkedAmount = await page.find('input[name="amount"][value="20"]');
    expect(await checkedAmount.getProperty("checked")).toBe(true);
  });

  it("initiates a donation checkout", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/donations": {
          body: JSON.stringify({ success: true, checkoutSessionId: "cs_test_123" }),
        },
      }) + "<page-donate></page-donate>",
    );
    await page.waitForChanges();

    const amountRadio = await page.find('input[name="amount"][value="50"]');
    await amountRadio.click();
    await page.waitForChanges();

    const donateBtn = await page.find("#donate-form button[type='submit']");
    await donateBtn.click();
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const donationCalls = calls.filter((c: any) => c.url.includes("/donations"));
    expect(donationCalls.length).toBe(1);
    const body = JSON.parse(donationCalls[0].opts.body);
    expect(body.amountUsd).toBe(50);
    expect(body.type).toBe("donation");
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
