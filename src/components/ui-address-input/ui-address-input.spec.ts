import { Build } from "@stencil/core";
import { newSpecPage } from "@stencil/core/testing";
import { UiAddressInput } from "./ui-address-input";
import { UiSingleInput } from "../ui-single-input/ui-single-input";

const tick = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function basePlaceResult() {
  return {
    displayName: "The White House",
    formattedAddress: "1600 Pennsylvania Avenue NW, Washington, DC 20500, USA",
    location: { lat: () => 38.8977, lng: () => -77.0365 },
    addressComponents: [
      { types: ["street_number"], shortText: "1600" },
      { types: ["route"], shortText: "Pennsylvania Avenue NW" },
      { types: ["locality"], shortText: "Washington" },
      { types: ["administrative_area_level_1"], shortText: "DC" },
      { types: ["postal_code"], shortText: "20500" },
    ],
  };
}

function mockOnPage(page: any, placeResult = basePlaceResult()) {
  const wrapper = document.createElement("div");
  Object.defineProperty(wrapper, "tagName", { value: "GMP-BASIC-PLACE-AUTOCOMPLETE" });

  let selectHandler: EventListener | null = null;
  const origAddEventListener = wrapper.addEventListener.bind(wrapper);
  wrapper.addEventListener = function (type: string, fn: EventListener) {
    if (type === "gmp-select") {
      selectHandler = fn;
    }
    return origAddEventListener(type, fn);
  };

  const placeObj = { fetchFields: () => Promise.resolve({ place: placeResult }) };

  function triggerSelect(overrides?: any) {
    if (overrides) {
      (placeObj as any).fetchFields = () => Promise.resolve({ place: { ...placeResult, ...overrides } });
    }
    const event = new Event("gmp-select");
    (event as any).place = placeObj;
    selectHandler?.(event);
  }

  (page.win as any).google = {
    maps: {
      places: {
        BasicPlaceAutocompleteElement: function () {
          return wrapper;
        } as any,
      },
    },
  };

  return { wrapper, triggerSelect };
}

async function render(html = '<ui-address-input label="Addr" button-label="Go"></ui-address-input>') {
  (Build as any).isBrowser = true;

  const page = await newSpecPage({
    components: [UiAddressInput, UiSingleInput],
    html,
    supportsShadowDom: false,
  });

  const { wrapper, triggerSelect } = mockOnPage(page);
  await page.waitForChanges();
  await tick(300);
  await page.waitForChanges();

  return { page, wrapper, triggerSelect };
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
    const { page, triggerSelect } = await render();

    triggerSelect();
    await tick(10);

    const si = page.root?.querySelector("ui-single-input") as any;
    const val = await si.getCurrentValue();
    expect(val).toBe("1600 Pennsylvania Avenue NW Washington DC 20500");
  });

  it("emits addressSelected with lat/lng on submit", async () => {
    const { page, triggerSelect } = await render();

    const onAddr = jest.fn();
    (page.root as HTMLElement).addEventListener("addressSelected", onAddr);

    triggerSelect();
    await tick(10);

    (page.doc?.querySelector(".submit-button") as HTMLInputElement).click();

    expect(onAddr).toHaveBeenCalled();
    const d = onAddr.mock.calls[0][0].detail;
    expect(d.address).toBe("1600 Pennsylvania Avenue NW Washington DC 20500");
    expect(d.lat).toBe(38.8977);
    expect(d.lng).toBe(-77.0365);
  });

  it("falls back to displayName when addressComponents incomplete", async () => {
    const { triggerSelect } = await render();

    triggerSelect({
      displayName: "The White House",
      formattedAddress: "",
      location: { lat: () => 0, lng: () => 0 },
      addressComponents: [{ types: ["locality"], shortText: "Washington" }],
    });
    await tick(10);

    const si = document.querySelector("ui-single-input") as any;
    const val = si ? await si.getCurrentValue() : "";
    expect(val).toBe("The White House");
  });
});
