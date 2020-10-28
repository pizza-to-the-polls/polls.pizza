import { newE2EPage } from "@stencil/core/testing";

describe("form-report", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<form-report></form-report>");

    const element = await page.find("form-report");
    expect(element).toHaveClass("hydrated");
  });
});
