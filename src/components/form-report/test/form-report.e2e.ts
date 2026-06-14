import { newE2EPage } from "@stencil/core/testing";

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
});
