import { Build, Component, Event, EventEmitter, h, Prop } from "@stencil/core";

const GMAPS_COMPONENT_MAPPING: { [key: string]: string } = {
  sublocality: "city",
  locality: "city",
  postal_code: "zip",
  route: "street",
  street_number: "num",
  administrative_area_level_1: "state",
};

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

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 100;

/**
 * Auto-complete input for street addresses using the Google Maps Places API.
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
  private place?: google.maps.places.PlaceResult;
  private autocomplete?: google.maps.places.Autocomplete;
  private retryCount: number = 0;
  private retryTimer?: number;
  private initializing: boolean = false;

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
            lat: this.place?.geometry?.location?.lat() || 0,
            lng: this.place?.geometry?.location?.lng() || 0,
          });
          if (evt.defaultPrevented) {
            e.preventDefault();
          }
        }}
      />
    );
  }

  private initAutocomplete() {
    if (!Build.isBrowser) {
      return;
    }

    // Already initialized or currently initializing
    if (this.autocomplete != null || this.initializing) {
      return;
    }

    const gmaps = window.google;
    if (gmaps?.maps?.places?.Autocomplete == null) {
      this.scheduleRetry("Google Maps API not yet fully loaded");
      return;
    }

    const { inputElement: addressInput } = this;
    if (addressInput == null) {
      this.scheduleRetry("input element ref not yet set");
      return;
    }

    this.initializing = true;

    addressInput.getInputElement().then(el => {
      if (el == null) {
        if (this.retryCount < MAX_RETRIES) {
          this.initializing = false;
          this.scheduleRetry("input element not yet mounted");
        } else {
          console.warn("ui-address-input: autocomplete failed to initialize — input element never mounted");
          this.initializing = false;
        }
        return;
      }

      try {
        const PlacesAutocomplete = gmaps?.maps?.places?.Autocomplete;
        if (PlacesAutocomplete == null) {
          this.initializing = false;
          this.scheduleRetry("Google Maps Places API not ready on retry");
          return;
        }
        this.autocomplete = new PlacesAutocomplete(el, {
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "us" },
        });

        this.autocomplete!.addListener("place_changed", () => {
          const autocomplete = this.autocomplete!;
          const place = autocomplete.getPlace();
          this.place = place;
          const fullAddress = place.address_components ? toFullAddress(place.address_components) : null;
          addressInput.setValue(fullAddress ? fullAddress : place.name ? place.name : "the location");
        });

        this.retryCount = 0;
        this.initializing = false;
      } catch (e) {
        console.warn("ui-address-input: failed to create autocomplete", e);
        this.initializing = false;
      }
    });
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
