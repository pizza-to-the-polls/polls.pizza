import { newE2EPage } from "@stencil/core/testing";

describe("page-on-demand", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-on-demand></page-on-demand>");

    const element = await page.find("page-on-demand");
    expect(element).not.toBeNull();
  });

  it("has a report link button", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-on-demand></page-on-demand>");

    const reportBtn = await page.find("a.button[href='/#report']");
    expect(reportBtn).not.toBeNull();
  });
});
