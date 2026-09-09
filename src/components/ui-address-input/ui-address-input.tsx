import { Build, Component, Event, EventEmitter, h, Prop } from "@stencil/core";
import { attachPlacesAutocomplete, fetchPlaceDetails, PlacesAutocompleteHandle } from "../../util/places-autocomplete";

const GMAPS_COMPONENT_MAPPING: { [key: string]: string } = {
  sublocality: "city",
  locality: "city",
  postal_code: "zip",
  route: "street",
  street_number: "num",
  administrative_area_level_1: "state",
};

// New Places API AddressComponent → legacy {short_name, types} for toFullAddress
const toFullAddress = (addressComponents: Array<{ short_name: string; types: Array<string> }>) => {
  const { city, state, zip, num, street }: { [key: string]: string } = addressComponents.reduce((obj: { [key: string]: string }, { short_name, types }) => {
    for (const type of types) {
      if (Object.keys(GMAPS_COMPONENT_MAPPING).includes(type)) {
        obj[`${GMAPS_COMPONENT_MAPPING[type]}`] = short_name;
      }
    }
    return obj;
  }, {});
  if (!num || !street || !city || !state || !zip) {
    return null;
  }

  return `${num} ${street} ${city} ${state} ${zip}`;
};

const PLACE_FIELDS = ["displayName", "formattedAddress", "addressComponents", "location"];

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 100;

/**
 * Auto-complete input for street addresses using the Google Maps Places API
 * (new programmatic API — see src/util/places-autocomplete.ts).
 * Retries mounting if the input element or Google Maps API isn't ready yet.
 */
@Component({
  tag: "ui-address-input",
  styleUrl: "ui-address-input.scss",
  shadow: false,
})
export class UiAddressInput {
  @Prop() public label: string;
  @Prop() public buttonLabel: string;
  @Prop() public name: string;
  @Prop() public placeholder: string;

  @Event() public addressSelected!: EventEmitter<{ address: string; lat: number; lng: number }>;

  private inputElement?: HTMLUiSingleInputElement;
  private place?: any;
  private autocomplete?: PlacesAutocompleteHandle;
  private retryCount: number = 0;
  private retryTimer?: number;

  constructor() {
    this.label = "";
    this.name = "";
    this.buttonLabel = "";
    this.placeholder = "";
  }

  public componentDidLoad() {
    this.initAutocomplete();
  }

  public disconnectedCallback() {
    this.autocomplete?.destroy();
    this.autocomplete = undefined;
    if (this.retryTimer != null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
    }
  }

  public render() {
    return (
      <ui-single-input
        ref={(x?: HTMLUiSingleInputElement) => (this.inputElement = x)}
        label={this.label}
        buttonLabel={this.buttonLabel}
        placeholder={this.placeholder}
        name={this.name}
        onButtonClicked={e => {
          const evt = this.addressSelected.emit({
            address: e.detail,
            lat: this.place?.location?.lat() || 0,
            lng: this.place?.location?.lng() || 0,
          });
          if (evt.defaultPrevented) {
            e.preventDefault();
          }
        }}
      />
    );
  }

  private initAutocomplete = () => {
    if (!Build.isBrowser || this.autocomplete) {
      return;
    }

    const gmaps = (window as any).google;
    if (gmaps?.maps?.places?.AutocompleteSuggestion == null) {
      this.scheduleRetry("Google Maps API not yet fully loaded");
      return;
    }

    const addressInput = this.inputElement;
    if (addressInput == null) {
      this.scheduleRetry("input element ref not yet set");
      return;
    }

    addressInput.getInputElement().then(el => {
      if (el == null) {
        this.scheduleRetry("input element not yet mounted");
        return;
      }

      this.autocomplete = attachPlacesAutocomplete(el, {
        onSelect: prediction => this.handlePlaceSelected(prediction, addressInput),
      });
      this.retryCount = 0;
    });
  };

  private async handlePlaceSelected(prediction: any, addressInput: HTMLUiSingleInputElement) {
    try {
      const place = await fetchPlaceDetails(prediction, PLACE_FIELDS);
      this.place = place;

      const legacyComponents =
        place.addressComponents?.map((ac: any) => ({
          short_name: ac.shortText || "",
          types: ac.types,
        })) || [];
      const fullAddress = toFullAddress(legacyComponents);

      const value = fullAddress ? fullAddress : place.displayName ? place.displayName : "the location";
      addressInput.setValue(value);

      const el = await addressInput.getInputElement();
      if (el) {
        el.value = value;
      }
    } catch (e) {
      console.warn("ui-address-input: failed to fetch place details", e);
    }
  }

  private scheduleRetry(reason: string) {
    if (this.retryCount >= MAX_RETRIES) {
      console.warn(`ui-address-input: autocomplete failed to initialize after ${MAX_RETRIES} attempts: ${reason}`);
      return;
    }

    this.retryCount++;
    this.retryTimer = window.setTimeout(() => {
      this.initAutocomplete();
    }, RETRY_DELAY_MS);
  }
}
