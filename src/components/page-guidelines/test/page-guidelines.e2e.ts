import { newE2EPage } from "@stencil/core/testing";

describe("page-guidelines", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-guidelines></page-guidelines>");

    const element = await page.find("page-guidelines");
    expect(element).not.toBeNull();
  });
});
