import { Build } from "@stencil/core";
import { newSpecPage } from "@stencil/core/testing";
import { UiLocationSearch } from "./ui-location-search";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defaultPlaceResult() {
  return {
    formatted_address: "1600 Pennsylvania Avenue NW, Washington, DC 20500, USA",
    name: "The White House",
    address_components: [
      { types: ["street_number"], short_name: "1600", long_name: "1600" },
      { types: ["route"], short_name: "Pennsylvania Avenue NW", long_name: "Pennsylvania Avenue NW" },
      { types: ["locality"], short_name: "Washington", long_name: "Washington" },
      { types: ["administrative_area_level_1"], short_name: "DC", long_name: "District of Columbia" },
      { types: ["postal_code"], short_name: "20500", long_name: "20500" },
    ],
  };
}

function mockGooglePlacesApi(getPlaceResult = defaultPlaceResult()) {
  class FakePlaceAutocompleteElement extends HTMLElement {
    private _listeners: Record<string, EventListener[]> = {};

    constructor(options?: any) {
      super();
      if (options?.includedRegionCodes) {
        (this as any).includedRegionCodes = options.includedRegionCodes;
      }
    }

    addEventListener(type: string, listener: EventListener) {
      (this._listeners[type] ??= []).push(listener);
    }

    // @ts-expect-error — mock
    getPlace() {
      return getPlaceResult;
    }

    triggerSelect() {
      (this._listeners["gmp-select"] ?? []).forEach(fn => fn(new Event("gmp-select")));
    }
  }

  if (!customElements.get("gmp-place-autocomplete")) {
    customElements.define("gmp-place-autocomplete", FakePlaceAutocompleteElement);
  }

  (window as any).google = {
    maps: {
      places: {
        PlaceAutocompleteElement: FakePlaceAutocompleteElement,
      },
    },
  };

  return FakePlaceAutocompleteElement;
}

/**
 * Render in browser mode, flush timers one tick at a time to avoid
 * infinite retry spirals when the API is missing.
 */
async function renderBrowser(html = '<ui-location-search></ui-location-search>') {
  (Build as any).isBrowser = true;
  const page = await newSpecPage({
    components: [UiLocationSearch],
    html,
    supportsShadowDom: false,
  });
  await page.waitForChanges();

  // Flush the setTimeout chain so the init logic runs (or retries a few times).
  // advanceTimersByTime is safe — each call fires only timers ≤ that time.
  jest.advanceTimersByTime(10);
  jest.advanceTimersByTime(10);

  return page;
}

// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.useFakeTimers();
  (Build as any).isBrowser = false;
  delete (window as any).google;
});

afterEach(() => {
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// API readiness
// ---------------------------------------------------------------------------

describe("ui-location-search — API readiness", () => {
  it("retries when PlaceAutocompleteElement is not available, never wraps", async () => {
    (Build as any).isBrowser = true;
    (window as any).google = undefined;

    const page = await newSpecPage({
      components: [UiLocationSearch],
      html: '<ui-location-search></ui-location-search>',
      supportsShadowDom: false,
    });
    await page.waitForChanges();

    // Let a handful of retries fire
    for (let i = 0; i < 5; i++) {
      jest.advanceTimersByTime(10);
    }

    const input = page.root?.querySelector("input") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect((input.parentElement as HTMLElement)?.tagName).not.toBe("GMP-PLACE-AUTOCOMPLETE");
  });

  it("wraps input with PlaceAutocompleteElement when API is available", async () => {
    const FakeEl = mockGooglePlacesApi();
    const page = await renderBrowser();

    const input = page.root?.querySelector("input") as HTMLInputElement;
    const parent = input.parentElement as HTMLElement;
    expect(parent).toBeInstanceOf(FakeEl);
  });

  it("does not double-wrap on re-renders", async () => {
    mockGooglePlacesApi();
    const page = await renderBrowser();

    expect(page.root?.querySelectorAll("gmp-place-autocomplete").length).toBe(1);

    // Simulate Stencil re-render
    await page.waitForChanges();
    jest.advanceTimersByTime(10);
    jest.advanceTimersByTime(10);

    expect(page.root?.querySelectorAll("gmp-place-autocomplete").length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// gmp-select → locationSelected event
// ---------------------------------------------------------------------------

describe("ui-location-search — gmp-select handling", () => {
  it("emits locationSelected with formatted_address (USA stripped)", async () => {
    mockGooglePlacesApi();
    const page = await renderBrowser();

    const onSelection = jest.fn();
    (page.root as HTMLElement).addEventListener("locationSelected", onSelection);

    const input = page.root?.querySelector("input") as HTMLInputElement;
    (input.parentElement as any).triggerSelect();

    expect(onSelection).toHaveBeenCalledTimes(1);
    const { formattedAddress, locationName } = onSelection.mock.calls[0][0].detail;
    expect(formattedAddress).toBe("1600 Pennsylvania Avenue NW, Washington, DC 20500, USA");
    expect(locationName).toBe("1600 Pennsylvania Avenue NW, Washington, DC 20500");
  });

  it("falls back to place.name when formatted_address is empty", async () => {
    mockGooglePlacesApi({
      name: "St. John's Library",
      formatted_address: "",
      address_components: [],
    } as any);
    const page = await renderBrowser();

    const onSelection = jest.fn();
    (page.root as HTMLElement).addEventListener("locationSelected", onSelection);

    const input = page.root?.querySelector("input") as HTMLInputElement;
    (input.parentElement as any).triggerSelect();

    expect(onSelection.mock.calls[0][0].detail.locationName).toBe("St. John's Library");
  });
});

// ---------------------------------------------------------------------------
// Hidden address fields populated from address_components
// ---------------------------------------------------------------------------

describe("ui-location-search — address_components mapping", () => {
  it("populates hidden fields from address_components", async () => {
    mockGooglePlacesApi();
    const page = await renderBrowser(
      '<ui-location-search input-id="test123"></ui-location-search>',
    );

    const input = page.root?.querySelector("input") as HTMLInputElement;
    (input.parentElement as any).triggerSelect();

    expect((document.getElementById("street_number-test123") as HTMLInputElement)?.value).toBe("1600");
    expect((document.getElementById("route-test123") as HTMLInputElement)?.value).toBe("Pennsylvania Avenue NW");
    expect((document.getElementById("locality-test123") as HTMLInputElement)?.value).toBe("Washington");
    expect((document.getElementById("administrative_area_level_1-test123") as HTMLInputElement)?.value).toBe("DC");
    expect((document.getElementById("postal_code-test123") as HTMLInputElement)?.value).toBe("20500");
    expect((document.getElementById("premise-test123") as HTMLInputElement)?.value).toBe("The White House");
  });
});