import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("page-home", () => {
  it("renders totals and recent deliveries sections", async () => {
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

    const totalsSection = await page.find("section.totals");
    expect(totalsSection).not.toBeNull();

    const deliveriesSection = await page.find("section.tweets-deliveries");
    expect(deliveriesSection).not.toBeNull();
  });

  it("passes history.push when a location is selected", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-home></page-home>");
    await page.waitForChanges();

    await page.evaluate(() => {
      const el = document.querySelector("page-home") as any;
      el.history = {
        push: (url: string) => {
          (window as any).__pushedUrl = url;
        },
      };
    });
    await page.waitForChanges();

    await page.evaluate(() => {
      const el = document.querySelector("page-home") as any;
      const handler = el.handleLocationSelected;
      if (handler) {
        handler({ detail: { formattedAddress: "123 Main St, Portland, OR 97201" } } as any);
      }
    });

    const pushedUrl = await page.evaluate(() => (window as any).__pushedUrl);
    expect(pushedUrl).toContain("/report");
    expect(pushedUrl).toContain("q=");
  });
});
