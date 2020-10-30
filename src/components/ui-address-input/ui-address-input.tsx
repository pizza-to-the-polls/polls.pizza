import { Build, Component, h, Method, Prop } from "@stencil/core";

/**
 * TODO: THIS IS INCOMPLETE AND STILL UNDER DEVELOPMENT
 * AN auto-complete input for street addresses, using the Google Maps API
 */
@Component({
  tag: "ui-address-input",
  styleUrl: "ui-address-input.scss",
  shadow: true,
})
export class UiAddressInput {
  @Prop() public label: string;
  @Prop() public buttonLabel: string;
  @Prop() public name: string;
  @Prop() public placeholder: string;

  // @Event( { cancelable: false } ) public addressSubmitted:EventEmitter;

  private addressInput?: HTMLUiSingleInputElement;
  private formattedAddress: string;

  constructor() {
    this.label = "";
    this.name = "";
    this.buttonLabel = "";
    this.placeholder = "";
    this.formattedAddress = "";
  }

  public async componentDidRender() {
    if (Build.isBrowser && google && this.addressInput != null) {
      const id = await this.addressInput.getInputId();
      const autocomplete = new google.maps.places.Autocomplete(document.getElementById(id) as HTMLInputElement, {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "us" },
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        this.formattedAddress = place.formatted_address ? place.formatted_address.replace(/, USA/gi, "") : place.name ? place.name : "the location";
      });
    }
  }

  @Method()
  public getFormattedAddress(): Promise<string> {
    return Promise.resolve(this.formattedAddress);
  }

  public render() {
    return (
      <ui-single-input
        ref={(x?: HTMLUiSingleInputElement) => (this.addressInput = x)}
        label={this.label}
        buttonLabel={this.buttonLabel}
        placeholder={this.placeholder}
        name={this.name}
        onButtonClicked={e => {
          e.preventDefault();
          // this.selectedAddress = e.detail;
        }}
      />
    );
  }
}
