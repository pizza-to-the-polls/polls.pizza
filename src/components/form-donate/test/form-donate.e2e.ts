import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("form-donate", () => {
  it("renders the donation form", async () => {
    const page = await newE2EPage();
    await page.setContent("<form-donate></form-donate>");

    const form = await page.find("#donate-form");
    expect(form).not.toBeNull();
  });

  it("submits a one-time donation", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/donations": {
          body: JSON.stringify({ success: true, checkoutSessionId: "cs_test_donation" }),
        },
      }) + "<form-donate></form-donate>",
    );
    await page.waitForChanges();

    const amountRadio = await page.find('input[name="amount"][value="20"]');
    await amountRadio.click();
    await page.waitForChanges();

    const donateBtn = await page.find("#donate-form button[type='submit']");
    await donateBtn.click();
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const donationCalls = calls.filter((c: any) => c.url.includes("/donations"));
    expect(donationCalls.length).toBe(1);
    const body = JSON.parse(donationCalls[0].opts.body);
    expect(body.amountUsd).toBe(20);
    expect(body.type).toBe("donation");
  });

  it("submits a subscription when type is changed", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/donations": {
          body: JSON.stringify({ success: true, checkoutSessionId: "cs_test_sub" }),
        },
      }) + "<form-donate></form-donate>",
    );
    await page.waitForChanges();

    const typeRadio = await page.find('input[name="donationType"][value="subscription"]');
    await typeRadio.click();
    await page.waitForChanges();

    const amountRadio = await page.find('input[name="amount"][value="10"]');
    await amountRadio.click();
    await page.waitForChanges();

    const donateBtn = await page.find("#donate-form button[type='submit']");
    await donateBtn.click();
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const donationCalls = calls.filter((c: any) => c.url.includes("/donations"));
    expect(donationCalls.length).toBe(1);
    const body = JSON.parse(donationCalls[0].opts.body);
    expect(body.type).toBe("subscription");
    expect(body.amountUsd).toBe(10);
  });

  it("shows confirmation state when showConfirmation prop is true", async () => {
    const page = await newE2EPage();
    await page.setContent('<form-donate show-confirmation="true" initial-amount="25"></form-donate>');
    await page.waitForChanges();

    const shareLinks = await page.find("ui-share-links");
    expect(shareLinks).not.toBeNull();
  });
});
