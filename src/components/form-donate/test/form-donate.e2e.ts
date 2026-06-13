import { newE2EPage } from "@stencil/core/testing";

describe("form-donate", () => {
  it("renders the donation form", async () => {
    const page = await newE2EPage();
    await page.setContent("<form-donate></form-donate>");
    await page.waitForChanges();

    const el = await page.find("form-donate");
    expect(el).not.toBeNull();
  });

  it("shows confirmation state when showConfirmation prop is true", async () => {
    const page = await newE2EPage();
    await page.setContent('<form-donate show-confirmation="true" initial-amount="25"></form-donate>');
    await page.waitForChanges();

    const shareLinks = await page.find("ui-share-links");
    expect(shareLinks).not.toBeNull();
  });
});
