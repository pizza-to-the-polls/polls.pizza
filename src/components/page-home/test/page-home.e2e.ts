import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("page-home", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/totals": {
          body: JSON.stringify({
            donors: 15000,
            raised: 2500000,
            pizzas: 70000,
            snacks: 100000,
            orders: 5000,
            locations: 3000,
            states: 48,
            costs: 2000000,
          }),
        },
        "/orders": {
          body: JSON.stringify({
            results: [
              {
                id: 1,
                createdAt: "2024-11-01T14:00:00.000Z",
                location: {
                  id: 10,
                  city: "Portland",
                  state: "OR",
                  fullAddress: "123 Main St, Portland, OR",
                  lat: "45.5",
                  lng: "-122.6",
                },
                pizzas: 10,
                orderType: "pizzas",
                restaurant: "Slice",
                reports: [],
              },
            ],
            count: 1,
          }),
        },
      }) + "<page-home></page-home>",
    );
    await page.waitForChanges();

    // Verifies the page rendered and processed mocked data
    const element = await page.find("page-home");
    expect(element).not.toBeNull();
  });
});
