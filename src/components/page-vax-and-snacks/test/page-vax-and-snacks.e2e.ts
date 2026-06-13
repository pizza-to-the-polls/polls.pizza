import { newE2EPage } from "@stencil/core/testing";

describe("page-vax-and-snacks", () => {
  it("renders vax and snacks program content", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-vax-and-snacks></page-vax-and-snacks>");

    const heading = await page.find("h1");
    expect(heading).not.toBeNull();
    const text = await heading.getProperty("textContent");
    expect(text.toLowerCase()).toContain("vax and snacks");
  });
});
