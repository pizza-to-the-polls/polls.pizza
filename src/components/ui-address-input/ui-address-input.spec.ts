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

function basePredictions() {
  const placeResult = basePlaceResult();
  return [
    {
      mainText: { text: "1600 Pennsylvania Avenue NW" },
      secondaryText: { text: "Washington, DC, USA" },
      toPlace: () => ({
        fetchFields: () => Promise.resolve({ place: placeResult }),
      }),
    },
  ];
}

function mockOnPage(page: any, predictions = basePredictions()) {
  (page.win as any).google = {
    maps: {
      places: {
        AutocompleteSessionToken: class {},
        AutocompleteSuggestion: {
          fetchAutocompleteSuggestions: () => Promise.resolve({ suggestions: predictions.map(p => ({ placePrediction: p })) }),
        },
      },
    },
  };
  return predictions;
}

async function render(html = '<ui-address-input label="Addr" button-label="Go"></ui-address-input>') {
  (Build as any).isBrowser = true;

  const page = await newSpecPage({
    components: [UiAddressInput, UiSingleInput],
    html,
    supportsShadowDom: false,
  });

  const predictions = mockOnPage(page);
  await page.waitForChanges();
  await tick(300); // init retry (100ms) + getInputElement promise
  await page.waitForChanges();

  return { page, predictions };
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
      await tick(120);
      await page.waitForChanges();
    }

    expect(page.root?.querySelector("ui-single-input")).toBeTruthy();
  });

  it("shows suggestion dropdown after typing", async () => {
    const { page } = await render();

    const input = page.doc?.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = "1600 penn";
    input.dispatchEvent(new Event("input"));
    await tick(250);

    const items = document.querySelectorAll(".gmpac-item");
    expect(items.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
describe("ui-address-input — selection", () => {
  it("sets input value to full address on selection", async () => {
    const { page } = await render();

    const input = page.doc?.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = "1600 penn";
    input.dispatchEvent(new Event("input"));
    await tick(250);

    (document.querySelector(".gmpac-item") as HTMLElement).dispatchEvent(new Event("mousedown"));
    await tick(20); // fetchFields + setValue

    const si = page.root?.querySelector("ui-single-input") as any;
    const val = await si.getCurrentValue();
    expect(val).toBe("1600 Pennsylvania Avenue NW Washington DC 20500");
  });

  it("emits addressSelected with lat/lng on submit", async () => {
    const { page } = await render();

    const onAddr = jest.fn();
    (page.root as HTMLElement).addEventListener("addressSelected", onAddr);

    const input = page.doc?.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = "1600 penn";
    input.dispatchEvent(new Event("input"));
    await tick(250);

    (document.querySelector(".gmpac-item") as HTMLElement).dispatchEvent(new Event("mousedown"));
    await tick(20);

    (page.doc?.querySelector(".submit-button") as HTMLInputElement).click();

    expect(onAddr).toHaveBeenCalled();
    const d = onAddr.mock.calls[0][0].detail;
    expect(d.address).toBe("1600 Pennsylvania Avenue NW Washington DC 20500");
    expect(d.lat).toBe(38.8977);
    expect(d.lng).toBe(-77.0365);
  });

  it("falls back to displayName when addressComponents incomplete", async () => {
    const predictions = [
      {
        mainText: { text: "The White House" },
        secondaryText: { text: "" },
        toPlace: () => ({
          fetchFields: () =>
            Promise.resolve({
              place: {
                displayName: "The White House",
                formattedAddress: "",
                location: { lat: () => 0, lng: () => 0 },
                addressComponents: [{ types: ["locality"], shortText: "Washington" }],
              },
            }),
        }),
      },
    ];
    const { page } = await render();
    mockOnPage(page, predictions);

    const input = page.doc?.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = "white house";
    input.dispatchEvent(new Event("input"));
    await tick(250);

    (document.querySelector(".gmpac-item") as HTMLElement).dispatchEvent(new Event("mousedown"));
    await tick(20);

    const si = page.root?.querySelector("ui-single-input") as any;
    const val = await si.getCurrentValue();
    expect(val).toBe("The White House");
  });
});
