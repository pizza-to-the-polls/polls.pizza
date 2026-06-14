import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("page-gift", () => {
  it("renders the gift donation form", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-gift></page-gift>");

    const form = await page.find("#donate-form");
    expect(form).not.toBeNull();
  });

  it("requires amount, giftName and giftEmail before checkout", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-gift></page-gift>");
    await page.waitForChanges();

    const checkoutBtn = await page.find("#donate-form button");
    expect(await checkoutBtn.getProperty("disabled")).toBe(true);
  });

  it("submits a gift donation with all fields filled", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/donations": {
          body: JSON.stringify({ success: true, checkoutSessionId: "cs_test_gift_789" }),
        },
      }) + "<page-gift></page-gift>",
    );
    await page.waitForChanges();

    const amountRadio = await page.find('input[name="amount"][value="40"]');
    await amountRadio.click();

    const giftName = await page.find('input[name="giftName"]');
    await giftName.type("Alice");

    const giftEmail = await page.find('input[name="giftEmail"]');
    await giftEmail.type("alice@example.com");

    await page.waitForChanges();

    const checkoutBtn = await page.find("#donate-form button");
    await checkoutBtn.click();
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const donationCalls = calls.filter((c: any) => c.url.includes("/donations"));
    expect(donationCalls.length).toBe(1);
    const body = JSON.parse(donationCalls[0].opts.body);
    expect(body.type).toBe("donation");
    expect(body.amountUsd).toBe(40);
    expect(body.giftName).toBe("Alice");
    expect(body.giftEmail).toBe("alice@example.com");
  });
});
