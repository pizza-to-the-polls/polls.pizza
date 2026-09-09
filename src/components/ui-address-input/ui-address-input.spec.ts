import { Build } from "@stencil/core";
import { newSpecPage } from "@stencil/core/testing";
import { UiAddressInput } from "./ui-address-input";
import { UiSingleInput } from "../ui-single-input/ui-single-input";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defaultPlaceResult() {
  return {
    formatted_address: "1600 Pennsylvania Avenue NW, Washington, DC 20500, USA",
    name: "The White House",
    geometry: { location: { lat: () => 38.8977, lng: () => -77.0365 } },
    address_components: [
      { types: ["street_number"], short_name: "1600" },
      { types: ["route"], short_name: "Pennsylvania Avenue NW" },
      { types: ["locality"], short_name: "Washington" },
      { types: ["administrative_area_level_1"], short_name: "DC" },
      { types: ["postal_code"], short_name: "20500" },
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

// Flush microtask queue (for Promise.resolve in getInputElement())
async function flushMicrotasks() {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
  jest.advanceTimersByTime(0);
}

async function renderAddressInput(html = '<ui-address-input label="Address" button-label="Go"></ui-address-input>') {
  (Build as any).isBrowser = true;
  const page = await newSpecPage({
    components: [UiAddressInput, UiSingleInput],
    html,
    supportsShadowDom: false,
  });
  await page.waitForChanges();
  // Flush the retry timer + microtasks from getInputElement().then(...)
  jest.advanceTimersByTime(200);
  await flushMicrotasks();
  await page.waitForChanges();
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

describe("ui-address-input — API readiness", () => {
  it("retries without crashing when API is not loaded", async () => {
    (Build as any).isBrowser = true;
    (window as any).google = undefined;

    const page = await newSpecPage({
      components: [UiAddressInput, UiSingleInput],
      html: '<ui-address-input label="Address"></ui-address-input>',
      supportsShadowDom: false,
    });
    await page.waitForChanges();
    jest.advanceTimersByTime(200);

    // Component renders a child ui-single-input
    const singleInput = page.root?.querySelector("ui-single-input");
    expect(singleInput).toBeTruthy();
  });

  it("wraps input with PlaceAutocompleteElement when API becomes available", async () => {
    const FakeEl = mockGooglePlacesApi();
    const page = await renderAddressInput();

    const input = page.doc?.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    const parent = input.parentElement as HTMLElement;
    // Parent should be our fake PlaceAutocompleteElement, not the original <div>
    expect(parent).toBeInstanceOf(FakeEl);
  });
});

// ---------------------------------------------------------------------------
// gmp-select → sets value and stores place for lat/lng
// ---------------------------------------------------------------------------

describe("ui-address-input — gmp-select handling", () => {
  it("sets input value to full address on place selection", async () => {
    mockGooglePlacesApi();
    const page = await renderAddressInput();

    const input = page.doc?.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    (input.parentElement as any).triggerSelect();
    await page.waitForChanges();

    // The ui-single-input's value should be set to the formatted full address
    expect(input.value).toBe("1600 Pennsylvania Avenue NW Washington DC 20500");
  });

  it("emits addressSelected with lat/lng on submit click", async () => {
    mockGooglePlacesApi();
    const page = await renderAddressInput();

    const onAddress = jest.fn();
    (page.root as HTMLElement).addEventListener("addressSelected", onAddress);

    // Select a place first
    const input = page.doc?.querySelector('input[type="text"]') as HTMLInputElement;
    (input.parentElement as any).triggerSelect();
    await page.waitForChanges();

    // Now click the submit button
    const submitBtn = page.doc?.querySelector('.submit-button') as HTMLInputElement;
    expect(submitBtn).toBeTruthy();
    submitBtn.click();

    expect(onAddress).toHaveBeenCalled();
    const detail = onAddress.mock.calls[0][0].detail;
    expect(detail.address).toBe("1600 Pennsylvania Avenue NW Washington DC 20500");
    expect(detail.lat).toBe(38.8977);
    expect(detail.lng).toBe(-77.0365);
  });

  it("falls back to place.name when address_components are incomplete", async () => {
    mockGooglePlacesApi({
      name: "The White House",
      formatted_address: "",
      geometry: { location: { lat: () => 0, lng: () => 0 } },
      address_components: [{ types: ["locality"], short_name: "Washington" }],
    });
    const page = await renderAddressInput();

    const input = page.doc?.querySelector('input[type="text"]') as HTMLInputElement;
    (input.parentElement as any).triggerSelect();
    await page.waitForChanges();

    expect(input.value).toBe("The White House");
  });
});