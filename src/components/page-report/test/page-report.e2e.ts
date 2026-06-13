import { newE2EPage } from "@stencil/core/testing";

describe("page-report", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-report></page-report>");

    const form = await page.find("form-report");
    expect(form).not.toBeNull();
  });
});
