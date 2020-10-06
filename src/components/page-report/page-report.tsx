import { Component, h, Host, State } from "@stencil/core";

@Component({
  tag: "page-report",
  styleUrl: "page-report.scss",
})
export class PageDonate {
  @State() private submitMessage: string = "";
  @State() private submitError: boolean = false;
  @State() private addressHidden: boolean = true;

  public componentWillLoad() {
    document.title = `Report | Pizza to the Polls`;
  }
  public componentDidRender() {
    const google: any = (window as any).google;

    const autocomplete = new google.maps.places.Autocomplete(document.getElementById("autocomplete"), {
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
        formatted_address: "formatted_address",
      };

      Object.keys(componentForm).forEach(component => {
        const elem = document.getElementById(component) as HTMLInputElement;
        if (elem) {
          elem.value = "";
        }
      });

      this.addressHidden = false;

      place.address_components.forEach((address_component: { [key: string]: any }) => {
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
      const formatted_address = document.getElementById("formatted_address") as HTMLInputElement;
      if (formatted_address) {
        formatted_address.value = place.formatted_address;
      }
    });
  }
  public render() {
    const handleSubmit = async () => {
      let data: { [key: string]: string } = {};
      this.submitMessage = "";
      this.submitError = false;

      Array.prototype.map.call(document.querySelectorAll("#form input"), (el: HTMLInputElement) => {
        data[el.name] = el.value;
      });

      if (!data.social_link) {
        this.submitMessage = "Whoops! Can you add a link to a report of a long line - preferrably " + "on twitter - so we can verify this is on the level?";
        this.submitError = true;
        return false;
      }

      if (!data.formatted_address) {
        this.submitMessage = "Whoops - we can't read taht address";
        this.submitError = true;
        return false;
      }

      await fetch("https://hooks.zapier.com/hooks/catch/2966893/qk6is7/", {
        body: JSON.stringify(data),
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
      });

      this.addressHidden = true;

      Array.prototype.map.call(document.querySelectorAll("#form input"), (el: HTMLInputElement) => {
        el.value = "";
      });
      this.submitMessage = "Thanks! We will get right on that";
      this.submitError = false;
    };
    return (
      <Host>
        <div id="report" class="report">
          <div class="container">
            <h1>Report a line</h1>
            <p class={`message ${this.submitError ? "is-error" : ""}`} hidden={this.submitMessage.length < 1}>
              {this.submitMessage}
            </p>

            <form id="form">
              <div class="form-item">
                <label htmlFor="social-link">Link to a report on social media</label>
                <input id="social-link" type="text" name="social_link" />
                <span class="help">
                  <strong>Required:</strong> We'll make sure there's really a line.
                </span>
              </div>
              <div class="form-item">
                <label htmlFor="address">Polling place address</label>
                <input type="text" id="autocomplete" name="full_place" />
                <span class="help">
                  <strong>Required:</strong> Search by the name of the place ("St. John's Library") or street address.
                </span>
              </div>
              <div id="address" class="form-item" hidden={this.addressHidden}>
                <table>
                  <tr>
                    <td class="label">Place</td>
                    <td colSpan={4}>
                      <input id="premise" disabled={true} />
                    </td>
                  </tr>
                  <tr>
                    <td class="label">Street address</td>
                    <td class="slimField">
                      <input name="street_number" class="field" id="street_number" disabled={true} />
                    </td>
                    <td class="wideField" colSpan={2}>
                      <input class="field" name="route" id="route" disabled={true} />
                    </td>
                  </tr>
                  <tr>
                    <td class="label">City</td>
                    <td class="wideField" colSpan={3}>
                      <input name="locality" class="field" id="locality" disabled={true} />
                    </td>
                  </tr>
                  <tr>
                    <td class="label">State</td>
                    <td class="slimField">
                      <input name="state" class="field" id="administrative_area_level_1" disabled={true} />
                    </td>
                    <td class="label">Zip code</td>
                    <td class="wideField">
                      <input name="zip" class="field" id="postal_code" disabled={true} />
                    </td>
                    <input type="hidden" name="formatted_address" id="formatted_address" />
                  </tr>
                </table>
              </div>
              <div class="form-item">
                <label htmlFor="address">Your phone number or email address</label>
                <input type="text" name="contact" />
                <br />
                <span class="help">Optional: So we can follow up when the pizza is inbound</span>
              </div>
              <button onClick={handleSubmit} class="submit" type="button">
                Submit report. Feed democracy
              </button>
            </form>
          </div>
        </div>
      </Host>
    );
  }
}
