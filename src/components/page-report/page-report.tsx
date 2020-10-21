import { Build, Component, h, Host, State } from "@stencil/core";

import { baseFetch } from "../../lib/base";

// Shared with pizzabase
const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
// const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const PHONE_REGEX = /^[+]?(1\-|1\s|1|\d{3}\-|\d{3}\s|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/;

@Component({
  tag: "page-report",
  styleUrl: "page-report.scss",
})
export class PageReport {
  @State() private submitMessage: string = "";
  @State() private submitError: { [key: string]: string } = {};
  @State() private showLocationInput: boolean = true;
  @State() private locationName: string = "";
  @State() private reportType: string = ""; // 'social' or 'photo'
  @State() private hasPhoto: boolean = false;

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

        // Get readable address (either name or the address; remove USA)
        // this.locationName = place.name ? place.name : place.formatted_address ? place.formatted_address.replace(/, USA/gi, "") : "the location";
        // Just show address for now
        this.locationName = place.formatted_address ? place.formatted_address.replace(/, USA/gi, "") : place.name ? place.name : "the location";
      });
    }
  }
  public render() {
    const handleLoadStepTwo = (e: Event) => {
      e.preventDefault();
      this.showLocationInput = false;
    };

    const clearReportVerification = () => {
      const socialLink = document.getElementById("social-link") as HTMLInputElement;
      if (socialLink) {
        socialLink.value = "";
      }
      removePhoto();
    };

    const handleReportTypeChange = () => {
      const reportType = document.querySelector("input[name=reportType]:checked") as HTMLInputElement;
      // Clear errors
      this.submitError = {};
      // Clear if changing report type
      if (this.reportType !== reportType?.value) {
        clearReportVerification();
      }
      this.reportType = reportType?.value;
    };

    const resetForm = () => {
      const form = document.getElementById("form") as HTMLFormElement;
      if (form) {
        removePhoto();
        form.reset();
      }
    };

    const handleChangeAddress = (e: Event) => {
      resetForm();
      this.locationName = "";
      this.showLocationInput = true;
      this.reportType = "";
      e.preventDefault();
    };

    const handlePhotoChange = async (e?: Event) => {
      const fileInput = document.getElementById("photo") as HTMLInputElement;
      const target = e?.target as HTMLInputElement;
      const file = (target.files as FileList)[0];
      const imagePreview = document.getElementById("photo-preview");

      // If no files
      if (!file) {
        if (imagePreview) {
          imagePreview.style.backgroundImage = "";
        }
        this.hasPhoto = false;
        fileInput.value = "";
        return false;
      }
      this.submitError = {};
      this.hasPhoto = true;
      // Generate file preview
      if (imagePreview) {
        imagePreview.style.backgroundImage = "url(" + window.URL.createObjectURL(file) + ")";
      }

      // Do more things with the photo here (await, etc.)
    };

    const removePhoto = () => {
      const fileInput = document.getElementById("photo") as HTMLInputElement;
      const imagePreview = document.getElementById("photo-preview");
      if (fileInput) {
        fileInput.value = "";
      }
      this.hasPhoto = false;
      if (imagePreview) {
        imagePreview.style.backgroundImage = "";
      }
    };

    const handleSubmit = async (event: Event) => {
      event.preventDefault();

      let data: { [key: string]: string } = {};
      this.submitMessage = "";
      this.submitError = {};

      Array.prototype.forEach.call(document.querySelectorAll("#form input"), (el: HTMLInputElement) => {
        data[el.name] = el.value;
      });

      if (!this.reportType || this.reportType.length < 1) {
        // Insert photo validation
        this.submitError.reportType = "Whoops! Pick how you'd like to help us verify the line at this location.";
      }

      console.log("reportType", this.reportType);
      if (this.reportType === "social") {
        data.url = (data.url || "").replace(/<[^>]*>/g, "");
        if (!data.url.includes("http") && !data.url.match(/\s/)) {
          data.url = `http://${data.url}`;
        }
        if (data.url.match(URL_REGEX) !== null || !data.url.match(URL_REGEX)) {
          this.submitError.url = "Whoops! Can you add a link to a report of a long line - with a publicly accessible photo - so we can verify this is on the level?";
        }
      } else if (this.reportType === "photo" && !this.hasPhoto) {
        this.submitError.photo = "Whoops! Can you add a photo of the line to your report so we can verify this is on the level?";
      }

      if (!(data.contact || "").match(PHONE_REGEX)) {
        this.submitError.contact = "Whoops! Can you add your phone number?";
      }

      if (!data.address) {
        this.showLocationInput = true;
        this.submitError.address = "Whoops - we can't read that address";
      }

      if (!data.wait) {
        this.submitError.wait = "Whoops! Can you estimate the wait time?";
      }

      if (Object.keys(this.submitError).length > 0) {
        return false;
      }

      try {
        await baseFetch(`/report`, {
          body: JSON.stringify(data),
          method: "POST",
        });
      } catch (errors) {
        this.submitError = errors;
        return false;
      }

      Array.prototype.map.call(document.querySelectorAll("#form input"), (el: HTMLInputElement) => {
        el.value = "";
      });
      this.submitMessage = "Thanks! We will get right on that";
      this.submitError = {};
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return (
      <Host>
        <div id="report" class="report">
          <div class="container">
            <div class="box">
              {this.submitMessage.length > 1 && <p>{this.submitMessage}</p>}

              {(!this.submitMessage || this.submitMessage.length < 1) && (
                <form id="form">
                  <div id="form-step-1" class={!this.showLocationInput ? "is-hidden" : ""}>
                    <h1>Report a line</h1>
                    {/* Location */}
                    <div class="form-item">
                      <label class="label" htmlFor="address">
                        Polling place address <span class="required">*</span>
                      </label>
                      <input
                        class={"input " + ("address" in this.submitError ? "has-error" : "")}
                        type="text"
                        id="autocomplete"
                        name="full_place"
                        placeholder="St. John's Library"
                      />
                      <span class="help">Search by the name of the place ("St. John's Library") or street address.</span>
                      <p class="help has-text-red" hidden={!("address" in this.submitError)}>
                        {this.submitError.address}
                      </p>
                    </div>
                    {/* Hidden address info (needed for submit) */}
                    <div id="address" class="form-item is-hidden" hidden={true}>
                      <table>
                        <tr>
                          <td class="label">Place</td>
                          <td colSpan={4}>
                            <input class="input" id="premise" disabled={true} />
                          </td>
                        </tr>
                        <tr>
                          <td class="label">Street address</td>
                          <td class="slimField">
                            <input name="street_number" class="input" id="street_number" disabled={true} />
                          </td>
                          <td class="wideField" colSpan={2}>
                            <input name="route" class="input" id="route" disabled={true} />
                          </td>
                        </tr>
                        <tr>
                          <td class="label">City</td>
                          <td class="wideField" colSpan={3}>
                            <input name="locality" class="input" id="locality" disabled={true} />
                          </td>
                        </tr>
                        <tr>
                          <td class="label">State</td>
                          <td class="slimField">
                            <input name="state" class="input" id="administrative_area_level_1" disabled={true} />
                          </td>
                          <td class="label">Zip code</td>
                          <td class="wideField">
                            <input name="zip" class="input" id="postal_code" disabled={true} />
                          </td>
                          <input type="hidden" name="address" id="formatted_address" />
                        </tr>
                      </table>
                    </div>
                    <button onClick={handleLoadStepTwo} class={"button is-teal " + (!this.locationName ? "is-disabled" : "")} disabled={!this.locationName}>
                      Find line
                    </button>
                  </div>
                  <div id="form-step-2" class={this.showLocationInput ? "is-hidden" : ""}>
                    {/* Line Verification */}
                    <p class="is-marginless is-unselectable">
                      <a href="#" class="has-text-teal" onClick={handleChangeAddress}>
                        Change address
                      </a>
                    </p>
                    <h2 class="is-display">
                      Tell us a little more about the line at <span class="is-dotted">{this.locationName ? this.locationName : "the location"}</span>
                    </h2>
                    <div class="form-item">
                      <label class="label" htmlFor="">
                        Social media report or photo <span class="required">*</span>
                      </label>
                      <div class="radio-group social-radio-group">
                        <label class="radio" htmlFor="report-type-social" onClick={handleReportTypeChange}>
                          <input type="radio" value="social" id="report-type-social" name="reportType" />
                          <span class="label-text">Social link</span>
                          <span class="indicator"></span>
                        </label>
                        <label class="radio" htmlFor="report-type-photo" onClick={handleReportTypeChange}>
                          <input type="radio" value="photo" id="report-type-photo" name="reportType" />
                          <span class="label-text">Photo</span>
                          <span class="indicator"></span>
                        </label>
                      </div>
                      <span class="help">We'll make sure there's really a line.</span>
                      <p class="help has-text-red" hidden={!("reportType" in this.submitError)}>
                        {this.submitError.reportType}
                      </p>
                    </div>
                    {/* Social Report */}
                    {this.reportType && this.reportType === "social" && (
                      <div class="form-item">
                        <label class="label" htmlFor="social-link">
                          Link to a report on social media <span class="required">*</span>
                        </label>
                        <input
                          class={"input " + ("url" in this.submitError ? "has-error" : "")}
                          id="social-link"
                          type="text"
                          name="url"
                          placeholder="ex. Link to Twitter, IG, etc."
                        />
                        <p class="help has-text-red" hidden={!("url" in this.submitError)}>
                          {this.submitError.url}
                        </p>
                      </div>
                    )}
                    {/* Photo Report */}
                    {this.reportType && this.reportType === "photo" && (
                      <div class="form-item">
                        <div class="clearfix">
                          <div id="file-input-button" class="file is-blue">
                            <label class="file-label">
                              <input class="file-input" type="file" name="photo" id="photo" accept="image/*" onChange={handlePhotoChange} />
                              <span class="file-cta">
                                <span class="file-label">{this.hasPhoto ? "Change photo" : "Upload photo"}</span>
                              </span>
                            </label>
                          </div>
                          <div class={"photo-preview-container " + (!this.hasPhoto ? "is-hidden" : "")}>
                            <div id="photo-preview"></div>
                            <div class="delete" onClick={removePhoto}></div>
                          </div>
                        </div>
                        <p class="help has-text-red" hidden={!("photo" in this.submitError)}>
                          {this.submitError.photo}
                        </p>
                      </div>
                    )}
                    {/* Line Wait */}
                    <div class="form-item">
                      <label class="label" htmlFor="address">
                        How long is the wait in line? <span class="required">*</span>
                      </label>
                      <input class={"input " + ("wait" in this.submitError ? "has-error" : "")} name="wait" />
                      <br />
                      <span class="help">Select your best guess</span>
                      <p class="help has-text-red" hidden={!("wait" in this.submitError)}>
                        {this.submitError.wait}
                      </p>
                    </div>
                    {/* Contact Info */}
                    <div class="form-item">
                      <label class="label" htmlFor="address">
                        Your phone number <span class="required">*</span>
                      </label>
                      <input class={"input " + ("contact" in this.submitError ? "has-error" : "")} type="tel" name="contact" />
                      <br />
                      <span class="help">So we can let you know when your order's sent!</span>
                      <p class="help has-text-red" hidden={!("contact" in this.submitError)}>
                        {this.submitError.contact}
                      </p>
                    </div>
                    {/* Submit */}
                    <button onClick={handleSubmit} class="button is-teal is-fullwidth-mobile" type="submit">
                      Submit report. Feed democracy.
                    </button>
                    {/* Legal */}
                    <p class="agreement">
                      <em>
                        By submitting a report, you agree to receive occasional emails or text messages from Pizza to the Polls and accept our{" "}
                        <stencil-route-link url="/privacy">Privacy Policy</stencil-route-link>. You can unsubscribe at any time. For texts, message and data rates may apply. Text
                        HELP for Info. Text STOP to quit.
                      </em>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
