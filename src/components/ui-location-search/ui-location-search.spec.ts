import { Build } from "@stencil/core";
import { newSpecPage } from "@stencil/core/testing";
import { UiLocationSearch } from "./ui-location-search";

const tick = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function basePlaceResult() {
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

/** Sets window.google on the actual JSDOM window (page.win) */
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

async function render(html = '<ui-location-search input-id="t1"></ui-location-search>') {
  // Build.isBrowser must be true so componentDidRender calls initAutoComplete
  (Build as any).isBrowser = true;

  const page = await newSpecPage({
    components: [UiLocationSearch],
    html,
    supportsShadowDom: false,
  });

  // newSpecPage wipes window.google — set it on page.win and re-render
  const wrapper = mockOnPage(page);
  await page.waitForChanges();  // triggers componentDidRender → initAutoComplete
  await tick(20);               // flush setTimeout(initAutoComplete, 10)
  await page.waitForChanges();

  return { page, wrapper };
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
    // Don't set google — re-render without it
    await page.waitForChanges();
    for (let i = 0; i < 5; i++) {
      await tick(15);
      await page.waitForChanges();
    }

    const input = page.root?.querySelector("input") as HTMLInputElement;
    expect((input.parentElement as HTMLElement)?.tagName).not.toBe("GMP-PLACE-AUTOCOMPLETE");
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

    // Re-render
    await page.waitForChanges();
    await tick(20);
    await page.waitForChanges();

    expect(input.parentElement).toBe(firstParent);
  });
});

// ---------------------------------------------------------------------------
describe("ui-location-search — gmp-select", () => {
  it("emits locationSelected (USA stripped)", async () => {
    const { page, wrapper } = await render();

    const onSel = jest.fn();
    (page.root as HTMLElement).addEventListener("locationSelected", onSel);

    wrapper.dispatchEvent(new Event("gmp-select"));

    expect(onSel).toHaveBeenCalledTimes(1);
    const d = onSel.mock.calls[0][0].detail;
    expect(d.formattedAddress).toBe("1600 Pennsylvania Avenue NW, Washington, DC 20500, USA");
    expect(d.locationName).toBe("1600 Pennsylvania Avenue NW, Washington, DC 20500");
  });

  it("falls back to place.name", async () => {
    const { page, wrapper } = await render();
    // Replace getPlace result
    (wrapper as any).getPlace = () => ({ name: "St. John's", formatted_address: "", address_components: [] });

    const onSel = jest.fn();
    (page.root as HTMLElement).addEventListener("locationSelected", onSel);
    wrapper.dispatchEvent(new Event("gmp-select"));

    expect(onSel.mock.calls[0][0].detail.locationName).toBe("St. John's");
  });
});

// ---------------------------------------------------------------------------
describe("ui-location-search — hidden fields", () => {
  it("populates fields from address_components", async () => {
    const { wrapper } = await render('<ui-location-search input-id="t99"></ui-location-search>');

    wrapper.dispatchEvent(new Event("gmp-select"));

    expect((document.getElementById("street_number-t99") as HTMLInputElement)?.value).toBe("1600");
    expect((document.getElementById("route-t99") as HTMLInputElement)?.value).toBe("Pennsylvania Avenue NW");
    expect((document.getElementById("locality-t99") as HTMLInputElement)?.value).toBe("Washington");
    expect((document.getElementById("administrative_area_level_1-t99") as HTMLInputElement)?.value).toBe("DC");
    expect((document.getElementById("postal_code-t99") as HTMLInputElement)?.value).toBe("20500");
    expect((document.getElementById("premise-t99") as HTMLInputElement)?.value).toBe("The White House");
  });
});