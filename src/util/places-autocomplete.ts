/**
 * Programmatic Places Autocomplete using the new (non-deprecated) Places API.
 *
 * Replaces the legacy `google.maps.places.Autocomplete` widget (which rendered
 * the `.pac-container` dropdown) with:
 *   - `AutocompleteSuggestion.fetchAutocompleteSuggestions()` for predictions
 *   - `PlacePrediction.toPlace().fetchFields()` for place details on selection
 *
 * The Google web components (`gmp-basic-place-autocomplete` etc.) were ruled
 * out because they render their own shadow-DOM input and dropdown that cannot
 * be styled to match the site. This helper keeps the site's own `<input>` and
 * renders a body-attached dropdown that can be styled with regular CSS.
 */

const PIN_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>';

const DEBOUNCE_MS = 200;

export interface PlacesAutocompleteHandle {
  destroy(): void;
}

export interface PlacesAutocompleteOptions {
  /**
   * Called when the user picks a suggestion. Receives the raw
   * `google.maps.places.PlacePrediction` (call `.toPlace().fetchFields()` on it).
   */
  onSelect: (prediction: any) => void;
  /** Restrict results to these CLDR region codes. Defaults to ["US"]. */
  includedRegionCodes?: string[];
  /** Restrict result types. Defaults to ["geocode", "establishment"]. */
  includedPrimaryTypes?: string[];
}

/**
 * Attaches autocomplete behaviour to a plain text input and returns a handle.
 * The dropdown is appended to `document.body` and positioned under the input,
 * mirroring how the legacy `pac-container` worked.
 */
export function attachPlacesAutocomplete(
  input: HTMLInputElement,
  { onSelect, includedRegionCodes = ["US"], includedPrimaryTypes = ["geocode", "establishment"] }: PlacesAutocompleteOptions,
): PlacesAutocompleteHandle {
  let container: HTMLDivElement | null = null;
  let items: any[] = [];
  let activeIndex = -1;
  let debounceTimer: number | undefined;
  let requestSeq = 0;
  let sessionToken: any = null;
  let destroyed = false;

  const places = () => (window as any).google?.maps?.places;

  const hide = () => {
    container?.remove();
    container = null;
    activeIndex = -1;
  };

  const position = () => {
    if (!container) {
      return;
    }
    const rect = input.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    // Never let the dropdown extend past the viewport (mobile spill guard)
    const left = Math.max(8, Math.min(rect.left + window.scrollX, viewportWidth - rect.width - 8));
    const width = Math.min(rect.width, viewportWidth - 16);
    container.style.left = `${left}px`;
    container.style.top = `${rect.bottom + window.scrollY + 2}px`;
    container.style.width = `${width}px`;
  };

  const show = () => {
    if (!container) {
      container = document.createElement("div");
      container.className = "gmpac-dropdown";
      document.body.appendChild(container);
    }
    position();
  };

  const pick = (prediction: any) => {
    hide();
    // The session ends when a place is selected — start fresh next time.
    sessionToken = null;
    onSelect(prediction);
  };

  const setActive = (index: number) => {
    if (!container) {
      return;
    }
    activeIndex = index;
    Array.from(container.querySelectorAll(".gmpac-item")).forEach((el, i) => {
      el.classList.toggle("gmpac-active", i === activeIndex);
    });
  };

  const renderItems = () => {
    if (!container) {
      return;
    }
    container.innerHTML = "";

    items.forEach(prediction => {
      const item = document.createElement("div");
      item.className = "gmpac-item";
      item.innerHTML = `${PIN_SVG}<span class="gmpac-main"></span><span class="gmpac-secondary"></span>`;
      const main = item.querySelector(".gmpac-main") as HTMLElement;
      const secondary = item.querySelector(".gmpac-secondary") as HTMLElement;
      main.textContent = prediction.mainText?.text ?? "";
      secondary.textContent = prediction.secondaryText?.text ?? "";

      // mousedown fires before the input's blur, so selection works
      item.addEventListener("mousedown", e => {
        e.preventDefault();
        pick(prediction);
      });

      container!.appendChild(item);
    });

    const powered = document.createElement("div");
    powered.className = "gmpac-powered";
    powered.textContent = "powered by Google";
    container.appendChild(powered);

    setActive(-1);
  };

  const fetchNow = async () => {
    const query = input.value.trim();
    const placesLib = places();
    if (!query || !placesLib?.AutocompleteSuggestion) {
      hide();
      return;
    }

    if (!sessionToken) {
      sessionToken = new placesLib.AutocompleteSessionToken();
    }
    const seq = ++requestSeq;

    try {
      const { suggestions } = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
        includedPrimaryTypes,
        includedRegionCodes,
        sessionToken,
      });
      if (destroyed || seq !== requestSeq) {
        return; // stale response
      }
      items = (suggestions ?? []).map((s: any) => s.placePrediction).filter((p: any) => p != null);

      if (items.length === 0) {
        hide();
        return;
      }
      show();
      renderItems();
    } catch {
      if (!destroyed) {
        hide();
      }
    }
  };

  const onInput = () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(fetchNow, DEBOUNCE_MS);
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (!container || items.length === 0) {
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(activeIndex + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === "Enter") {
      const index = activeIndex >= 0 ? activeIndex : 0;
      if (items[index]) {
        e.preventDefault();
        pick(items[index]);
      }
    } else if (e.key === "Escape") {
      hide();
    }
  };

  const onBlur = () => {
    // Delay so item mousedown handlers can fire first
    window.setTimeout(() => {
      if (!destroyed) {
        hide();
      }
    }, 150);
  };

  const onReposition = () => position();

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKeydown);
  input.addEventListener("blur", onBlur);
  window.addEventListener("resize", onReposition);
  window.addEventListener("scroll", onReposition, true);

  return {
    destroy() {
      destroyed = true;
      window.clearTimeout(debounceTimer);
      input.removeEventListener("input", onInput);
      input.removeEventListener("keydown", onKeydown);
      input.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
      hide();
    },
  };
}

/**
 * Fetches full place details for a selected prediction using the new API.
 * Returns the populated `google.maps.places.Place`.
 */
export async function fetchPlaceDetails(prediction: any, fields: string[]): Promise<any> {
  const place = prediction.toPlace();
  const { place: fetched } = await place.fetchFields({ fields });
  return fetched;
}
