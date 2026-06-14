import { newE2EPage } from "@stencil/core/testing";

describe("page-vax-and-snacks", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-vax-and-snacks></page-vax-and-snacks>");

    const element = await page.find("page-vax-and-snacks");
    expect(element).not.toBeNull();
  });
});
