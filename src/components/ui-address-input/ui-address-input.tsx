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

/**
 * TODO: THIS IS INCOMPLETE AND STILL UNDER DEVELOPMENT
 * AN auto-complete input for street addresses, using the Google Maps API
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

  constructor() {
    this.label = "";
    this.name = "";
    this.buttonLabel = "";
    this.placeholder = "";
  }

  public async componentDidRender() {
    const { inputElement: addressInput } = this;
    if (Build.isBrowser && google && addressInput != null) {
      const el = await addressInput.getInputElement();
      if (el == null) {
        return;
      }

      const autocomplete = new google.maps.places.Autocomplete(el, {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "us" },
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        this.place = place;
        const fullAddress = place.address_components ? toFullAddress(place.address_components) : null;
        addressInput.setValue(fullAddress ? fullAddress : place.name ? place.name : "the location");
      });
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
            lat: this.place?.geometry?.location.lat() || 0,
            lng: this.place?.geometry?.location.lng() || 0,
          });
          if (evt.defaultPrevented) {
            e.preventDefault();
          }
        }}
      />
    );
  }
}
