import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("page-crustclub", () => {
  it("renders the membership form", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-crustclub></page-crustclub>");

    const form = await page.find("#donate-form");
    expect(form).not.toBeNull();
  });

  it("shows an error when no amount is selected and checkout is clicked", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-crustclub></page-crustclub>");
    await page.waitForChanges();

    const checkoutBtn = await page.find("#donate-form button");
    await checkoutBtn.click();
    await page.waitForChanges();

    const errorEl = await page.find("#donation-error");
    expect(errorEl).not.toBeNull();
    const text = await errorEl.getProperty("textContent");
    expect(text.toLowerCase()).toContain("select a level");
  });

  it("selects an amount and initiates a subscription", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/donations": {
          body: JSON.stringify({ success: true, checkoutSessionId: "cs_test_456" }),
        },
      }) + "<page-crustclub></page-crustclub>",
    );
    await page.waitForChanges();

    const amountRadio = await page.find('input[name="level"][value="10"]');
    await amountRadio.click();
    await page.waitForChanges();

    const checkoutBtn = await page.find("#donate-form button");
    await checkoutBtn.click();
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const donationCalls = calls.filter((c: any) => c.url.includes("/donations"));
    expect(donationCalls.length).toBe(1);
    const body = JSON.parse(donationCalls[0].opts.body);
    expect(body.type).toBe("subscription");
    expect(body.amountUsd).toBe(10);
  });
});
