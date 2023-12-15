import { Build, Component, Event, EventEmitter, h, Host, Prop, State } from "@stencil/core";
// @ts-ignore
import {} from "googlemaps";

@Component({
  tag: "ui-location-search",
  shadow: false,
})
export class UiLocationSearch {
  @Prop() public error: string | null = null;
  @Prop() public readOnly: boolean = false;
  @Prop() public placeholder: string = "ex. St. John's Library";

  @State() public locationName: string = "";
  @Event() public locationSelected!: EventEmitter<{ formattedAddress: string; locationName: string }>;

  public componentDidRender() {
    if (Build.isBrowser && google && document.getElementById("autocomplete-input")) {
      const autocomplete = new google.maps.places.Autocomplete(document.getElementById("autocomplete-input") as HTMLInputElement, {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "us" },
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        const componentForm: { [key: string]: string } = {
          street_number: "short_name",
          route: "long_name",
          locality: "long_name",
          administrative_area_level_1: "short_name",
          postal_code: "short_name",
          premise: "name",
        };

        Object.keys(componentForm).forEach(component => {
          const elem = document.getElementById(component) as HTMLInputElement;
          if (elem) {
            elem.value = "";
          }
        });

        place.address_components?.forEach((address_component: { [key: string]: any }) => {
          const addressType: string = address_component.types[0];
          const mapping = componentForm[addressType];
          const elem = document.getElementById(addressType) as HTMLInputElement;
          if (mapping && elem) {
            elem.value = address_component[mapping];
          }
        });

        const premise = document.getElementById("premise") as HTMLInputElement;
        if (premise) {
          premise.value = place.name;
        }

        // Get readable address (either name or the address; remove USA)
        const locationName = place.formatted_address ? place.formatted_address.replace(/, USA/gi, "") : place.name ? place.name : "the location";
        const formattedAddress = place.formatted_address || "";
        this.locationSelected.emit({ locationName, formattedAddress });
      });
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
            id="autocomplete-input"
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
                  <input class="input" id="premise" disabled={true} readOnly />
                </td>
              </tr>
              <tr>
                <td class="label">Street address</td>
                <td class="slimField">
                  <input name="street_number" class="input" id="street_number" disabled={true} readOnly />
                </td>
                <td class="wideField" colSpan={2}>
                  <input name="route" class="input" id="route" disabled={true} readOnly />
                </td>
              </tr>
              <tr>
                <td class="label">City</td>
                <td class="wideField" colSpan={3}>
                  <input name="locality" class="input" id="locality" disabled={true} readOnly />
                </td>
              </tr>
              <tr>
                <td class="label">State</td>
                <td class="slimField">
                  <input name="state" class="input" id="administrative_area_level_1" disabled={true} readOnly />
                </td>
                <td class="label">Zip code</td>
                <td class="wideField">
                  <input name="zip" class="input" id="postal_code" disabled={true} readOnly />
                </td>
              </tr>
            </table>
          </div>
        </div>
      </Host>
    );
  }
}
