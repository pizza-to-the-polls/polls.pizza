import { Build } from "@stencil/core";
import { newSpecPage } from "@stencil/core/testing";
import { UiAddressInput } from "./ui-address-input";
import { UiSingleInput } from "../ui-single-input/ui-single-input";

const tick = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function basePlaceResult() {
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

function mockOnPage(page: any, placeResult = basePlaceResult()) {
  const wrapper = document.createElement("div");
  Object.defineProperty(wrapper, "tagName", { value: "GMP-PLACE-AUTOCOMPLETE" });
  (wrapper as any).getPlace = () => placeResult;

  (page.win as any).google = {
    maps: {
      places: {
        PlaceAutocompleteElement: function () { return wrapper; } as any,
      },
    },
  };

  return wrapper;
}

async function render(html = '<ui-address-input label="Addr" button-label="Go"></ui-address-input>') {
  (Build as any).isBrowser = true;

  const page = await newSpecPage({
    components: [UiAddressInput, UiSingleInput],
    html,
    supportsShadowDom: false,
  });

  // newSpecPage wipes window.google — set it on page.win and re-render.
  // The retry timer (100ms) does the actual wrapping since the child
  // ui-single-input's internal ref may not be ready on the first attempt.
  const wrapper = mockOnPage(page);
  await page.waitForChanges();
  await tick(300); // let the 100ms retry fire + Promise settle
  await page.waitForChanges();

  return { page, wrapper };
}

beforeEach(() => {
  (Build as any).isBrowser = false;
  delete (window as any).google;
});

// ---------------------------------------------------------------------------
describe("ui-address-input — init", () => {
  it("survives when API never loads", async () => {
    (Build as any).isBrowser = true;

    const page = await newSpecPage({
      components: [UiAddressInput, UiSingleInput],
      html: '<ui-address-input label="Addr"></ui-address-input>',
      supportsShadowDom: false,
    });
    await page.waitForChanges();
    for (let i = 0; i < 5; i++) {
      await tick(15);
      await page.waitForChanges();
    }

    expect(page.root?.querySelector("ui-single-input")).toBeTruthy();
  });

  it("wraps input when API is available", async () => {
    const { page, wrapper } = await render();

    const input = page.doc?.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(wrapper.contains(input)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
describe("ui-address-input — gmp-select", () => {
  it("sets input value to full address on selection", async () => {
    const { page, wrapper } = await render();

    wrapper.dispatchEvent(new Event("gmp-select"));
    await page.waitForChanges();

    const si = page.root?.querySelector("ui-single-input") as any;
    const val = await si.getCurrentValue();
    expect(val).toBe("1600 Pennsylvania Avenue NW Washington DC 20500");
  });

  it("emits addressSelected with lat/lng on submit", async () => {
    const { page, wrapper } = await render();

    const onAddr = jest.fn();
    (page.root as HTMLElement).addEventListener("addressSelected", onAddr);

    const input = page.doc?.querySelector('input[type="text"]') as HTMLInputElement;
    wrapper.dispatchEvent(new Event("gmp-select"));
    await page.waitForChanges();

    (page.doc?.querySelector(".submit-button") as HTMLInputElement).click();

    expect(onAddr).toHaveBeenCalled();
    const d = onAddr.mock.calls[0][0].detail;
    expect(d.address).toBe("1600 Pennsylvania Avenue NW Washington DC 20500");
    expect(d.lat).toBe(38.8977);
    expect(d.lng).toBe(-77.0365);
  });

  it("falls back to place.name when address_components incomplete", async () => {
    const { page, wrapper } = await render();
    (wrapper as any).getPlace = () => ({
      name: "The White House",
      formatted_address: "",
      geometry: { location: { lat: () => 0, lng: () => 0 } },
      address_components: [{ types: ["locality"], short_name: "Washington" }],
    });

    wrapper.dispatchEvent(new Event("gmp-select"));
    await page.waitForChanges();

    const si = page.root?.querySelector("ui-single-input") as any;
    const val = await si.getCurrentValue();
    expect(val).toBe("The White House");
  });
});