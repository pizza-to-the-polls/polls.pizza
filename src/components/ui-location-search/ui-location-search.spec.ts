import { Build } from "@stencil/core";
import { newSpecPage } from "@stencil/core/testing";
import { UiLocationSearch } from "./ui-location-search";

const tick = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function basePlaceResult() {
  return {
    displayName: "The White House",
    formattedAddress: "1600 Pennsylvania Avenue NW, Washington, DC 20500, USA",
    addressComponents: [
      { types: ["street_number"], shortText: "1600", longText: "1600" },
      { types: ["route"], shortText: "Pennsylvania Avenue NW", longText: "Pennsylvania Avenue NW" },
      { types: ["locality"], shortText: "Washington", longText: "Washington" },
      { types: ["administrative_area_level_1"], shortText: "DC", longText: "District of Columbia" },
      { types: ["postal_code"], shortText: "20500", longText: "20500" },
    ],
  };
}

function basePredictions() {
  const placeResult = basePlaceResult();
  const prediction = (text: string, secondary: string) => ({
    mainText: { text },
    secondaryText: { text: secondary },
    toPlace: () => ({
      fetchFields: () => Promise.resolve({ place: placeResult }),
    }),
  });
  return [prediction("asdfasdf", "North Bristol Street, Santa Ana, CA, USA"), prediction("asdf", "San Antonio, TX, USA")];
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

async function render(html = '<ui-location-search input-id="t1"></ui-location-search>') {
  (Build as any).isBrowser = true;

  const page = await newSpecPage({
    components: [UiLocationSearch],
    html,
    supportsShadowDom: false,
  });

  const predictions = mockOnPage(page);
  await page.waitForChanges();
  await tick(150); // init retry (100ms)
  await page.waitForChanges();

  return { page, predictions };
}

beforeEach(() => {
  (Build as any).isBrowser = false;
  delete (window as any).google;
});

// ---------------------------------------------------------------------------
describe("ui-location-search — init", () => {
  it("does not crash when API never loads", async () => {
    (Build as any).isBrowser = true;

    const page = await newSpecPage({
      components: [UiLocationSearch],
      html: '<ui-location-search input-id="t2"></ui-location-search>',
      supportsShadowDom: false,
    });
    await page.waitForChanges();
    for (let i = 0; i < 5; i++) {
      await tick(120);
      await page.waitForChanges();
    }

    const input = page.root?.querySelector("input") as HTMLInputElement;
    expect(input).not.toBeNull();
  });

  it("shows suggestion dropdown after typing", async () => {
    await render();

    const input = document.getElementById("autocomplete-input-t1") as HTMLInputElement;
    input.value = "asdf";
    input.dispatchEvent(new Event("input"));
    await tick(250);

    const items = document.querySelectorAll(".gmpac-item");
    expect(items.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
describe("ui-location-search — selection", () => {
  it("emits locationSelected (USA stripped) when a suggestion is picked", async () => {
    const { page } = await render();

    const input = document.getElementById("autocomplete-input-t1") as HTMLInputElement;
    input.value = "asdf";
    input.dispatchEvent(new Event("input"));
    await tick(250);

    const onSel = jest.fn();
    (page.root as HTMLElement).addEventListener("locationSelected", onSel);

    const firstItem = document.querySelector(".gmpac-item") as HTMLElement;
    firstItem.dispatchEvent(new Event("mousedown"));
    await tick(20); // fetchFields

    expect(onSel).toHaveBeenCalledTimes(1);
    const d = onSel.mock.calls[0][0].detail;
    expect(d.formattedAddress).toBe("1600 Pennsylvania Avenue NW, Washington, DC 20500, USA");
    expect(d.locationName).toBe("1600 Pennsylvania Avenue NW, Washington, DC 20500");
  });

  it("falls back to displayName when formattedAddress is empty", async () => {
    const predictions = [
      {
        mainText: { text: "St. John's" },
        secondaryText: { text: "" },
        toPlace: () => ({
          fetchFields: () => Promise.resolve({ place: { displayName: "St. John's", formattedAddress: "", addressComponents: [] } }),
        }),
      },
    ];
    const page = await (async () => {
      (Build as any).isBrowser = true;
      const p = await newSpecPage({
        components: [UiLocationSearch],
        html: '<ui-location-search input-id="t3"></ui-location-search>',
        supportsShadowDom: false,
      });
      mockOnPage(p, predictions);
      await p.waitForChanges();
      await tick(150);
      await p.waitForChanges();
      return p;
    })();

    const onSel = jest.fn();
    (page.root as HTMLElement).addEventListener("locationSelected", onSel);

    const input = document.getElementById("autocomplete-input-t3") as HTMLInputElement;
    input.value = "st john";
    input.dispatchEvent(new Event("input"));
    await tick(250);

    (document.querySelector(".gmpac-item") as HTMLElement).dispatchEvent(new Event("mousedown"));
    await tick(20);

    expect(onSel.mock.calls[0][0].detail.locationName).toBe("St. John's");
  });
});

// ---------------------------------------------------------------------------
describe("ui-location-search — hidden fields", () => {
  it("populates fields from addressComponents", async () => {
    await render('<ui-location-search input-id="t99"></ui-location-search>');

    const input = document.getElementById("autocomplete-input-t99") as HTMLInputElement;
    input.value = "white house";
    input.dispatchEvent(new Event("input"));
    await tick(250);

    (document.querySelector(".gmpac-item") as HTMLElement).dispatchEvent(new Event("mousedown"));
    await tick(20);

    expect((document.getElementById("street_number-t99") as HTMLInputElement)?.value).toBe("1600");
    expect((document.getElementById("route-t99") as HTMLInputElement)?.value).toBe("Pennsylvania Avenue NW");
    expect((document.getElementById("locality-t99") as HTMLInputElement)?.value).toBe("Washington");
    expect((document.getElementById("administrative_area_level_1-t99") as HTMLInputElement)?.value).toBe("DC");
    expect((document.getElementById("postal_code-t99") as HTMLInputElement)?.value).toBe("20500");
    expect((document.getElementById("premise-t99") as HTMLInputElement)?.value).toBe("The White House");
  });
});
