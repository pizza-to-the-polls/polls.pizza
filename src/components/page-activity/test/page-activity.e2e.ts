import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("page-activity", () => {
  it("renders a list of recent deliveries", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
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
                quantity: 10,
                orderType: "pizzas",
                restaurant: "Slice",
                reports: [],
                snacks: 0,
                cancelledAt: null,
              },
              {
                id: 2,
                createdAt: "2024-11-01T12:00:00.000Z",
                location: {
                  id: 11,
                  city: "Seattle",
                  state: "WA",
                  fullAddress: "456 Pine St, Seattle, WA",
                  lat: "47.6",
                  lng: "-122.3",
                },
                pizzas: 14,
                quantity: 14,
                orderType: "pizzas",
                restaurant: "Pagliacci",
                reports: [],
                snacks: 0,
                cancelledAt: null,
              },
            ],
            count: 2,
          }),
        },
      }) + "<page-activity></page-activity>",
    );
    await page.waitForChanges();

    const orderDays = await page.findAll(".order-day");
    expect(orderDays.length).toBeGreaterThan(0);
  });

  it("calls the API with page=0 on initial load", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/orders": {
          body: JSON.stringify({
            results: [],
            count: 0,
          }),
        },
      }) + "<page-activity></page-activity>",
    );
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const orderCalls = calls.filter((c: any) => c.url.includes("/orders"));
    expect(orderCalls.length).toBeGreaterThan(0);
    expect(orderCalls[0].url).toContain("page=0");
  });
});
