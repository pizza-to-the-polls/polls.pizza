import { Build, Component, Event, EventEmitter, h, Prop } from "@stencil/core";

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
        addressInput.setValue(place.formatted_address ? place.formatted_address.replace(/, USA/gi, "") : place.name ? place.name : "the location");
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
