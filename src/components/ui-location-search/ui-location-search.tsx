import { Build, Component, Event, EventEmitter, h, Host, Prop, State } from "@stencil/core";
import { attachPlacesAutocomplete, fetchPlaceDetails, PlacesAutocompleteHandle } from "../../util/places-autocomplete";

const PLACE_FIELDS = ["displayName", "formattedAddress", "addressComponents"];

// New Places API AddressComponent → legacy componentForm mapping
const COMPONENT_FORM: { [key: string]: "short" | "long" } = {
  street_number: "short",
  route: "long",
  locality: "long",
  administrative_area_level_1: "short",
  postal_code: "short",
  premise: "long",
};

@Component({
  tag: "ui-location-search",
  shadow: false,
})
export class UiLocationSearch {
  @Prop() public error: string | null = null;
  @Prop() public readOnly: boolean = false;
  @Prop() public placeholder: string = "ex. St. John's Library";
  @Prop() public inputId: string = `${Math.round(new Date().getTime() * Math.random() * 9999)}`;

  @State() public locationName: string = "";
  @Event() public locationSelected!: EventEmitter<{ formattedAddress: string; locationName: string }>;

  private autocomplete?: PlacesAutocompleteHandle;
  private retryTimer?: number;

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

  private initAutocomplete = () => {
    if (!Build.isBrowser || this.autocomplete) {
      return;
    }

    const autocompleteInput = document.getElementById(`autocomplete-input-${this.inputId}`) as HTMLInputElement;
    const placesLib = (window as any).google?.maps?.places;

    if (!autocompleteInput || !placesLib?.AutocompleteSuggestion) {
      this.retryTimer = window.setTimeout(this.initAutocomplete, 100);
      return;
    }

    this.autocomplete = attachPlacesAutocomplete(autocompleteInput, {
      onSelect: prediction => this.handlePlaceSelected(prediction),
    });
  };

  private async handlePlaceSelected(prediction: any) {
    try {
      const place = await fetchPlaceDetails(prediction, PLACE_FIELDS);

      // Clear hidden fields then fill from addressComponents
      Object.keys(COMPONENT_FORM).forEach(component => {
        const elem = document.getElementById(`${component}-${this.inputId}`) as HTMLInputElement;
        if (elem) {
          elem.value = "";
        }
      });

      place.addressComponents?.forEach((ac: any) => {
        const addressType: string = ac.types[0];
        const useShort = COMPONENT_FORM[addressType] === "short";
        const elem = document.getElementById(`${addressType}-${this.inputId}`) as HTMLInputElement;
        if (elem) {
          elem.value = (useShort ? ac.shortText : ac.longText) || "";
        }
      });

      const premise = document.getElementById(`premise-${this.inputId}`) as HTMLInputElement;
      if (premise) {
        premise.value = place.displayName || "";
      }

      // Get readable address (either name or the address; remove USA)
      const locationName = place.formattedAddress ? place.formattedAddress.replace(/, USA/gi, "") : place.displayName ? place.displayName : "the location";
      const formattedAddress = place.formattedAddress || "";

      const input = document.getElementById(`autocomplete-input-${this.inputId}`) as HTMLInputElement;
      if (input) {
        input.value = locationName;
      }

      this.locationSelected.emit({ locationName, formattedAddress });
    } catch (e) {
      console.warn("ui-location-search: failed to fetch place details", e);
    }
  }

  public render() {
    const handleAddressChange = () => {
      const address = document.getElementById("autocomplete-input") as HTMLInputElement;
      if (address && !address.value) {
        this.locationName = "";
      }
    };

    return (
      <Host>
        <div>
          <input
            class={"input " + (!this.error ? "has-error" : "")}
            type="text"
            id={`autocomplete-input-${this.inputId}`}
            name="full_place"
            placeholder={this.placeholder}
            onInput={handleAddressChange}
            readOnly={this.readOnly}
            autocomplete="off"
          />
          {/* Hidden address info (needed for submit) */}
          <div id="address" class="form-item is-hidden" hidden={true}>
            <table>
              <tr>
                <td class="label">Place</td>
                <td colSpan={4}>
                  <input class="input" autocomplete="off" id={`premise-${this.inputId}`} disabled={true} readOnly />
                </td>
              </tr>
              <tr>
                <td class="label">Street address</td>
                <td class="slimField">
                  <input name="street_number" autocomplete="off" class="input" id={`street_number-${this.inputId}`} disabled={true} readOnly />
                </td>
                <td class="wideField" colSpan={2}>
                  <input name="route" autocomplete="off" class="input" id={`route-${this.inputId}`} disabled={true} readOnly />
                </td>
              </tr>
              <tr>
                <td class="label">City</td>
                <td class="wideField" colSpan={3}>
                  <input name="locality" autocomplete="off" class="input" id={`locality-${this.inputId}`} disabled={true} readOnly />
                </td>
              </tr>
              <tr>
                <td class="label">State</td>
                <td class="slimField">
                  <input name="state" autocomplete="off" class="input" id={`administrative_area_level_1-${this.inputId}`} disabled={true} readOnly />
                </td>
                <td class="label">Zip code</td>
                <td class="wideField">
                  <input name="zip" autocomplete="off" class="input" id={`postal_code-${this.inputId}`} disabled={true} readOnly />
                </td>
              </tr>
            </table>
          </div>
        </div>
      </Host>
    );
  }
}
