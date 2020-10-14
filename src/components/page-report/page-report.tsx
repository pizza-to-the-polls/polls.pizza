import { Build, Component, h, Host, State } from "@stencil/core";

// Shared with pizzabase
const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const PHONE_REGEX = /^[+]?(1\-|1\s|1|\d{3}\-|\d{3}\s|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/;

@Component({
  tag: "page-report",
  styleUrl: "page-report.scss",
})
export class PageDonate {
  @State() private submitMessage: string = "";
  @State() private submitError: { [key: string]: string } = {};
  @State() private addressHidden: boolean = true;

  public componentWillLoad() {
    document.title = `Report | Pizza to the Polls`;
  }
  public componentDidRender() {
    const google: any = (window as any).google;

    if (Build.isBrowser && google) {
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
          address: "formatted_address",
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
  }
  public render() {
    const handleSubmit = async (event: Event) => {
      event.preventDefault();

      let data: { [key: string]: string } = {};
      this.submitMessage = "";
      this.submitError = {};

      Array.prototype.forEach.call(document.querySelectorAll("#form input"), (el: HTMLInputElement) => {
        data[el.name] = el.value;
      });

      data.url = (data.url || "").replace(/<[^>]*>/g, "");
      if (!data.url.includes("http") && !data.url.match(/\s/)) {
        data.url = `http://${data.url}`;
      }
      if (!data.url.match(URL_REGEX)) {
        this.submitError.url = "Whoops! Can you add a link to a report of a long line - with a publicly accessible photo - so we can verify this is on the level?";
      }

      if (!(data.contact || "").match(PHONE_REGEX) && !(data.contact || "").match(EMAIL_REGEX)) {
        this.submitError.contact = "Whoops! Can you add a";
      }

      if (!data.address) {
        this.submitError.address = "Whoops - we can't read that address";
      }

      if (Object.keys(this.submitError).length > 0) {
        return false;
      }

      const resp = await fetch(`${process.env.PIZZA_BASE_DOMAIN}/report`, {
        body: JSON.stringify(data),
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
      });

      if (resp.status !== 200) {
        const { errors } = await resp.json();
        this.submitError = errors;
        return false;
      }

      this.addressHidden = true;

      Array.prototype.map.call(document.querySelectorAll("#form input"), (el: HTMLInputElement) => {
        el.value = "";
      });
      this.submitMessage = "Thanks! We will get right on that";
      this.submitError = {};
    };
    return (
      <Host>
        <div id="report" class="report">
          <div class="container">
            <h1>Report a line</h1>
            <p class="message" hidden={this.submitMessage.length < 1}>
              {this.submitMessage}
            </p>

            <form id="form">
              <div class="form-item">
                <label htmlFor="social-link">Link to a report on social media</label>
                <input id="social-link" type="text" name="url" />
                <span class="help">
                  <strong>Required:</strong> We'll make sure there's really a line.
                </span>
                <p class="message error" hidden={!("url" in this.submitError)}>
                  {this.submitError.url}
                </p>
              </div>
              <div class="form-item">
                <label htmlFor="address">Polling place address</label>
                <input type="text" id="autocomplete" name="full_place" />
                <span class="help">
                  <strong>Required:</strong> Search by the name of the place ("St. John's Library") or street address.
                </span>
                <p class="message error" hidden={!("address" in this.submitError)}>
                  {this.submitError.address}
                </p>
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
                    <input type="hidden" name="address" id="formatted_address" />
                  </tr>
                </table>
              </div>
              <div class="form-item">
                <label htmlFor="address">Your phone number or email address</label>
                <input type="text" name="contact" />
                <br />
                <span class="help">
                  <strong>Required:</strong> So we can let you know when the order's sent out
                </span>
                <p class="message error" hidden={!("contact" in this.submitError)}>
                  {this.submitError.contact}
                </p>
              </div>
              <button onClick={handleSubmit} class="submit" type="button">
                Submit report. Feed democracy
              </button>
              <p class="agreement">
                <em>
                  By submitting a report, you agree to receive occasional emails or text messages from Pizza to the Polls and accept our{" "}
                  <stencil-route-link url="/privacy">Privacy Policy</stencil-route-link>. You can unsubscribe at any time. For texts, message and data rates may apply. Text HELP
                  for Info. Text STOP to quit.
                </em>
              </p>
            </form>
          </div>
        </div>
      </Host>
    );
  }
}
