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

function mockOnPage(page: any, placeResult = basePlaceResult()) {
  // Wrap-div masquerading as BasicPlaceAutocompleteElement
  const wrapper = document.createElement("div");
  Object.defineProperty(wrapper, "tagName", { value: "GMP-BASIC-PLACE-AUTOCOMPLETE" });

  // Capture addEventListener so we can fire gmp-select with a properly-shaped event
  let selectHandler: EventListener | null = null;
  const origAddEventListener = wrapper.addEventListener.bind(wrapper);
  wrapper.addEventListener = function (type: string, fn: EventListener) {
    if (type === "gmp-select") {
      selectHandler = fn;
    }
    return origAddEventListener(type, fn);
  };

  // place object that fetchFields resolves
  const placeObj = { fetchFields: () => Promise.resolve({ place: placeResult }) };

  // Trigger a gmp-select with the place attached
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

async function render(html = '<ui-location-search input-id="t1"></ui-location-search>') {
  (Build as any).isBrowser = true;

  const page = await newSpecPage({
    components: [UiLocationSearch],
    html,
    supportsShadowDom: false,
  });

  const { wrapper, triggerSelect } = mockOnPage(page);
  await page.waitForChanges();
  await tick(20);
  await page.waitForChanges();

  return { page, wrapper, triggerSelect };
}

beforeEach(() => {
  (Build as any).isBrowser = false;
  delete (window as any).google;
});

// ---------------------------------------------------------------------------
describe("ui-location-search — init", () => {
  it("does not wrap when API never loads", async () => {
    (Build as any).isBrowser = true;

    const page = await newSpecPage({
      components: [UiLocationSearch],
      html: '<ui-location-search input-id="t2"></ui-location-search>',
      supportsShadowDom: false,
    });
    await page.waitForChanges();
    for (let i = 0; i < 5; i++) {
      await tick(15);
      await page.waitForChanges();
    }

    const input = page.root?.querySelector("input") as HTMLInputElement;
    expect((input.parentElement as HTMLElement)?.tagName).not.toBe("GMP-BASIC-PLACE-AUTOCOMPLETE");
  });

  it("wraps input when API is available", async () => {
    const { page, wrapper } = await render();

    const input = page.root?.querySelector("input") as HTMLInputElement;
    expect(wrapper.contains(input)).toBe(true);
  });

  it("does not double-wrap on re-renders", async () => {
    const { page } = await render();

    const input = page.root?.querySelector("input") as HTMLInputElement;
    const firstParent = input.parentElement;

    await page.waitForChanges();
    await tick(20);
    await page.waitForChanges();

    expect(input.parentElement).toBe(firstParent);
  });
});

// ---------------------------------------------------------------------------
describe("ui-location-search — gmp-select", () => {
  it("emits locationSelected (USA stripped)", async () => {
    const { page, triggerSelect } = await render();

    const onSel = jest.fn();
    (page.root as HTMLElement).addEventListener("locationSelected", onSel);

    triggerSelect();
    await tick(10);

    expect(onSel).toHaveBeenCalledTimes(1);
    const d = onSel.mock.calls[0][0].detail;
    expect(d.formattedAddress).toBe("1600 Pennsylvania Avenue NW, Washington, DC 20500, USA");
    expect(d.locationName).toBe("1600 Pennsylvania Avenue NW, Washington, DC 20500");
  });

  it("falls back to displayName", async () => {
    const { page, triggerSelect } = await render();

    const onSel = jest.fn();
    (page.root as HTMLElement).addEventListener("locationSelected", onSel);
    triggerSelect({ displayName: "St. John's", formattedAddress: "", addressComponents: [] });
    await tick(10);

    expect(onSel.mock.calls[0][0].detail.locationName).toBe("St. John's");
  });
});

// ---------------------------------------------------------------------------
describe("ui-location-search — hidden fields", () => {
  it("populates fields from addressComponents", async () => {
    const { triggerSelect } = await render('<ui-location-search input-id="t99"></ui-location-search>');

    triggerSelect();
    await tick(10);

    expect((document.getElementById("street_number-t99") as HTMLInputElement)?.value).toBe("1600");
    expect((document.getElementById("route-t99") as HTMLInputElement)?.value).toBe("Pennsylvania Avenue NW");
    expect((document.getElementById("locality-t99") as HTMLInputElement)?.value).toBe("Washington");
    expect((document.getElementById("administrative_area_level_1-t99") as HTMLInputElement)?.value).toBe("DC");
    expect((document.getElementById("postal_code-t99") as HTMLInputElement)?.value).toBe("20500");
    expect((document.getElementById("premise-t99") as HTMLInputElement)?.value).toBe("The White House");
  });
});
