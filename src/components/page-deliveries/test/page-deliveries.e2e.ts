import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("page-deliveries", () => {
  it("renders the deliveries map and recent deliveries list", async () => {
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
            ],
            count: 1,
          }),
        },
        "/trucks": {
          body: JSON.stringify({
            results: [],
            count: 0,
          }),
        },
      }) + "<page-deliveries></page-deliveries>",
    );
    await page.waitForChanges();

    const mapContainer = await page.find("#deliveries-map-container");
    expect(mapContainer).not.toBeNull();

    const recentDeliveries = await page.find("h3");
    expect(recentDeliveries).not.toBeNull();
  });

  it("loads location details when address is selected", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/orders": {
          body: JSON.stringify({ results: [], count: 0 }),
        },
        "/trucks": {
          body: JSON.stringify({ results: [], count: 0 }),
        },
        "/locations/123%20Main%20St%2C%20Portland%2C%20OR": {
          body: JSON.stringify({
            id: 10,
            city: "Portland",
            state: "OR",
            fullAddress: "123 Main St, Portland, OR",
            lat: "45.5",
            lng: "-122.6",
            hasTruck: false,
            reports: [],
            orders: [],
          }),
        },
      }) + `<page-deliveries></page-deliveries>`,
    );

    await page.evaluate(() => {
      const el = document.querySelector("page-deliveries") as any;
      el.history = { location: { pathname: "/deliveries" }, push: () => undefined, replace: () => undefined };
      el.match = { params: {} };
    });
    await page.waitForChanges();

    await page.evaluate(() => {
      const el = document.querySelector("page-deliveries") as any;
      el.selectedAddress = "123 Main St, Portland, OR";
    });
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const locationCalls = calls.filter((c: any) => c.url.includes("/locations/"));
    expect(locationCalls.length).toBe(1);
  });
});
