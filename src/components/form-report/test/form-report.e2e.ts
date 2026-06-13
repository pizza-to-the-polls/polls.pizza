import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("form-report", () => {
  it("renders step 1 initially", async () => {
    const page = await newE2EPage();
    await page.setContent("<form-report></form-report>");

    const step1 = await page.find("#form-step-1");
    expect(step1).not.toBeNull();
    expect(await step1.isVisible()).toBe(true);
  });

  it("shows step 2 when formattedAddress is provided", async () => {
    const page = await newE2EPage();
    await page.setContent('<form-report formatted-address="123 Main St, Portland, OR"></form-report>');
    await page.waitForChanges();

    const step2 = await page.find("#form-step-2");
    expect(step2).not.toBeNull();
    expect(await step2.isVisible()).toBe(true);
  });

  it("shows validation errors on empty submit in step 2", async () => {
    const page = await newE2EPage();
    await page.setContent('<form-report formatted-address="123 Main St"></form-report>');
    await page.waitForChanges();

    const submitBtn = await page.find("#form-step-2 button[type='submit']");
    expect(submitBtn).not.toBeNull();
    await submitBtn.click();
    await page.waitForChanges();

    const visibleErrors = [];
    const errors = await page.findAll("#form-step-2 p.help.has-text-red");
    for (const el of errors) {
      if (await el.isVisible()) {
        visibleErrors.push(await el.getProperty("textContent"));
      }
    }
    expect(visibleErrors.length).toBeGreaterThan(0);
    const errorTexts = visibleErrors.join(" ");
    expect(errorTexts.toLowerCase()).toContain("wait time");
  });

  it("submits successfully and shows distributor confirmation", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/report": {
          body: JSON.stringify({ hasTruck: false, willReceive: true, alreadyOrdered: false }),
        },
      }) + '<form-report formatted-address="123 Main St, Portland, OR"></form-report>',
    );
    await page.waitForChanges();

    await page.evaluate(() => {
      const form = document.querySelector("form-report") as any;
      if (form) {
        form.hasPhoto = true;
        form.photoUrl = "https://example.com/photo.jpg";
      }
    });
    await page.waitForChanges();

    const waitTime = await page.find('input[name="waitTime"][value="1-2 hours"]');
    await waitTime.click();
    const contactRole = await page.find('input[name="contactRole"][value="Voter"]');
    await contactRole.click();
    const firstName = await page.find('input[name="contactFirstName"]');
    await firstName.type("Test");
    const lastName = await page.find('input[name="contactLastName"]');
    await lastName.type("User");
    const phone = await page.find('input[name="contactPhone"]');
    await phone.type("5035551234");
    const disclaimer = await page.find('input[name="distributorDisclaimer"]');
    await disclaimer.click();
    await page.waitForChanges();

    const submitBtn = await page.find("#form-step-2 button[type='submit']");
    await submitBtn.click();
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const reportCalls = calls.filter((c: any) => c.url.includes("/report"));
    expect(reportCalls.length).toBeGreaterThan(0);

    const confirmation = await page.find("#distributor-confirmation");
    expect(confirmation).not.toBeNull();
    expect(await confirmation.isVisible()).toBe(true);
  });

  it("shows food-truck confirmation when location already has a truck", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/report": {
          body: JSON.stringify({ hasTruck: true, willReceive: false, alreadyOrdered: false }),
        },
      }) + '<form-report formatted-address="456 Oak Ave"></form-report>',
    );
    await page.waitForChanges();

    await page.evaluate(() => {
      const form = document.querySelector("form-report") as any;
      if (form) {
        form.hasPhoto = true;
        form.photoUrl = "https://example.com/photo.jpg";
      }
    });
    await page.waitForChanges();

    await (await page.find('input[name="waitTime"][value="1-2 hours"]')).click();
    await (await page.find('input[name="contactRole"][value="Voter"]')).click();
    await (await page.find('input[name="contactFirstName"]')).type("Test");
    await (await page.find('input[name="contactLastName"]')).type("User");
    await (await page.find('input[name="contactPhone"]')).type("5035551234");
    await (await page.find('input[name="distributorDisclaimer"]')).click();
    await page.waitForChanges();

    await (await page.find("#form-step-2 button[type='submit']")).click();
    await page.waitForChanges();

    const confirmation = await page.find("#food-truck-at-location-confirmation");
    expect(confirmation).not.toBeNull();
    expect(await confirmation.isVisible()).toBe(true);
  });

  it("shows duplicate report confirmation when already ordered", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/report": {
          body: JSON.stringify({ hasTruck: false, willReceive: true, alreadyOrdered: true }),
        },
      }) + '<form-report formatted-address="789 Pine St"></form-report>',
    );
    await page.waitForChanges();

    await page.evaluate(() => {
      const form = document.querySelector("form-report") as any;
      if (form) {
        form.hasPhoto = true;
        form.photoUrl = "https://example.com/photo.jpg";
      }
    });
    await page.waitForChanges();

    await (await page.find('input[name="waitTime"][value="1-2 hours"]')).click();
    await (await page.find('input[name="contactRole"][value="Voter"]')).click();
    await (await page.find('input[name="contactFirstName"]')).type("Test");
    await (await page.find('input[name="contactLastName"]')).type("User");
    await (await page.find('input[name="contactPhone"]')).type("5035551234");
    await (await page.find('input[name="distributorDisclaimer"]')).click();
    await page.waitForChanges();

    await (await page.find("#form-step-2 button[type='submit']")).click();
    await page.waitForChanges();

    const confirmation = await page.find("#duplicate-report-confirmation");
    expect(confirmation).not.toBeNull();
    expect(await confirmation.isVisible()).toBe(true);
  });
});
