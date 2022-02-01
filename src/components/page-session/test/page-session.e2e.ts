import { newE2EPage } from "@stencil/core/testing";

describe("page-session", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-session></page-session>");

    const element = await page.find("page-session");
    expect(element).toHaveClass("hydrated");
  });
});
