import { newE2EPage } from "@stencil/core/testing";

describe("page-report", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-report></page-report>");

    const element = await page.find("page-report");
    expect(element).toHaveClass("hydrated");
  });
});
