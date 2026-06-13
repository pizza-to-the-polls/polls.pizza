import { newE2EPage } from "@stencil/core/testing";

describe("page-guidelines", () => {
  it("renders guidelines content", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-guidelines></page-guidelines>");

    const uiGuidelines = await page.find("ui-guidelines");
    expect(uiGuidelines).not.toBeNull();
  });
});
