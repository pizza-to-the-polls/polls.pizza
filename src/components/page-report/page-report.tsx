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
export class PageDonate {
  // Show/hide form & confirmations
  @State() private showConfirmation: boolean = false; // *Always* required to hide form, regardless of other show booleans
  @State() private showFoodTruckOnSiteConfirmation: boolean = false; // Enable to show food truck already at location
  @State() private showDistributorConfirmation: boolean = false; // Enable to show distributor confirmation & guidelines
  @State() private showSuccessfulReportConfirmation: boolean = false; // Enable to show successful report confirmation
  @State() private showDuplicateReportConfirmation: boolean = false; // Enable to show duplicate report message
  @State() private showServerError: boolean = false; // Enable to show submission error
  // Other vars
  @State() private viewportIsMobile: boolean = false;
  @State() private isDisabled: boolean = false; // Disable form and submit
  @State() private isLoading: boolean = false; // Submit button loading state
  @State() private submitResponse: { [key: string]: string } = {};
  @State() private submitError: { [key: string]: string } = {};
  @State() private showLocationInput: boolean = true;
  @State() private locationName: string = "";
  @State() private reportType: string = ""; // 'social' or 'photo'
  @State() private hasPhoto: boolean = false;
  @State() private photoUrl: string = "";
  @State() private canDistribute: string = ""; // watchdog or distributor

  public componentWillLoad() {
    document.title = `Report | Pizza to the Polls`;
  }
  public componentDidRender() {
    const google: any = (window as any).google;

    if (Build.isBrowser && google && document.getElementById("autocomplete")) {
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
        this.locationName = place.formatted_address ? place.formatted_address.replace(/, USA/gi, "") : place.name ? place.name : "the location";
      });
    }
  }
  public render() {
    // Determine if viewport is mobile.
    // Sets this.viewPortIsMobile: boolean when called.
    const checkViewport = () => {
      const viewport: MediaQueryList = window.matchMedia("(max-width: 768px)");
      this.viewportIsMobile = viewport.matches;
    };

    const handleAddressChange = () => {
      const address = document.getElementById("autocomplete") as HTMLInputElement;
      if (address && !address.value) {
        this.locationName = "";
      }
    };

    const handleLoadStepTwo = (e: Event) => {
      e.preventDefault();
      checkViewport();
      handleReportTypeChange();
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
      // Clear error
      delete this.submitError.reportType;
      // Clear if changing report type
      if (this.reportType !== reportType?.value) {
        clearReportVerification();
      }
      this.reportType = reportType?.value;
    };

    const handleWatchdogDistributorChange = () => {
      const canDistribute = document.querySelector("input[name=canDistribute]:checked") as HTMLInputElement;
      // Clear error
      delete this.submitError.canDistribute;
      this.canDistribute = canDistribute?.value;
    };

    const resetForm = () => {
      this.showConfirmation = false;
      this.showServerError = false;
      this.showFoodTruckOnSiteConfirmation = false;
      this.showDistributorConfirmation = false;
      this.showSuccessfulReportConfirmation = false;
      this.showDuplicateReportConfirmation = false;
      this.submitResponse = {};
      this.submitError = {};
      this.locationName = "";
      this.reportType = "";
      this.canDistribute = "";
      this.isDisabled = false;
      removePhoto();
      const form = document.getElementById("form") as HTMLFormElement;
      if (form) {
        form.reset();
        (document.getElementById("waitTime") as HTMLFormElement).value = "";
      }
      // Reset report type
      const reportType = document.getElementById("report-type-social") as HTMLInputElement;
      if (reportType) {
        reportType.checked = true;
      }
      checkViewport();
      this.showLocationInput = true;
    };

    const handleNewLocation = (e: Event) => {
      resetForm();
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
        this.photoUrl = "";
        fileInput.value = "";
        return false;
      }
      this.submitError = {};
      this.hasPhoto = true;
      this.photoUrl = window.URL.createObjectURL(file);
      // Generate file preview
      if (imagePreview) {
        imagePreview.style.backgroundImage = "url(" + this.photoUrl + ")";
      }

      // TODO: Do more things with the photo here (await, etc.)
    };

    const removePhoto = () => {
      const fileInput = document.getElementById("photo") as HTMLInputElement;
      const imagePreview = document.getElementById("photo-preview");
      if (fileInput) {
        fileInput.value = "";
      }
      this.hasPhoto = false;
      this.photoUrl = "";
      delete this.submitError.photo;
      if (imagePreview) {
        imagePreview.style.backgroundImage = "";
      }
    };

    // Sharing
    const shareUrl = "https://polls.pizza/";
    const shareText = "Pizza to the Polls is making democracy delicious by delivering free food for all to polling places with long lines";
    const shareTwitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}&via=PizzaToThePolls`;
    const shareFacebookLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&title=${encodeURIComponent(shareText)}&description=${encodeURIComponent(
      shareText,
    )}&quote=${encodeURIComponent(shareText)}`;

    const openSharePopup = (e: Event) => {
      e.preventDefault();
      const linkTarget = e.target as HTMLLinkElement;
      const targetURL = linkTarget.getAttribute("href");
      if (!targetURL) {
        return;
      }
      window.open(targetURL, "popup", "width=600,height=600");
      return;
    };

    const handleSubmit = async (event: Event) => {
      event.preventDefault();

      // Prevent submitting a disabled form
      if (this.isDisabled) {
        return false;
      }

      // Update loading
      this.isLoading = true;
      // Disable submit
      this.isDisabled = true;
      // Clear request data
      this.submitResponse = {};
      this.submitError = {};
      // Setup request
      let data: { [key: string]: string } = {};

      Array.prototype.forEach.call(document.querySelectorAll("#form input, #form select"), (el: HTMLInputElement) => {
        if (el) {
          data[el.name] = el.value;
        }
      });

      // Reset checkboxes and radios in data (values will be set below if present)
      data[`reportType`] = ``;
      data[`canDistribute`] = ``;
      data[`distributorDisclaimer`] = ``;

      if (!this.reportType || this.reportType.length < 1) {
        this.submitError.reportType = "Whoops! Pick how you'd like to help us verify the line at this location.";
      } else {
        // Inject correct value into data
        data[`reportType`] = this.reportType;
      }

      if (this.reportType === "social") {
        // Set data.url for report (social)
        data.url = (data.url || "").replace(/<[^>]*>/g, "");
        if (!data.url.includes("http") && !data.url.match(/\s/)) {
          data.url = `http://${data.url}`;
        }
        if (!data.url.match(URL_REGEX)) {
          this.submitError.url = "Whoops! Can you add a link to a report of a long line - with a publicly accessible photo - so we can verify this is on the level?";
        }
      } else if (this.reportType === "photo") {
        if (!this.hasPhoto) {
          this.submitError.photo = "Whoops! Can you add a photo of the line to your report so we can verify this is on the level?";
        } else {
          // TODO: Set the actual image URL here
          // Set data.url for report (photo)
          data.url = this.photoUrl;
        }
      }

      if (!data.address) {
        this.showLocationInput = true;
        this.submitError.address = "Whoops - we can't read that address";
      }

      if (!data.waitTime) {
        this.submitError.waitTime = "Whoops! Can you estimate the wait time?";
      }

      if (!this.canDistribute || this.canDistribute.length < 1) {
        this.submitError.canDistribute = "Whoops! Will you be on location to help distribute the order?";
      } else {
        // Inject correct value into data
        data[`canDistribute`] = this.canDistribute;
      }

      if (this.canDistribute === "true") {
        const distributorDisclaimerAgree = (document.querySelector("input[name=distributorDisclaimer]") as HTMLInputElement)?.checked;
        if (!distributorDisclaimerAgree) {
          this.submitError.distributorDisclaimer = "Whoops! You must read and agree to the guidelines.";
        } else {
          data[`distributorDisclaimer`] = `agree`;
        }
      }

      if (!(data.contact || "").match(PHONE_REGEX)) {
        this.submitError.contact = "Whoops! Can you add your phone number?";
      }

      // Check for any errors
      if (Object.keys(this.submitError).length > 0) {
        // Update loading
        this.isLoading = false;
        // Disable submit
        this.isDisabled = true;
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }

      // Setup request data
      let requestData = {
        address: data.address,
        contact: data.contact,
        url: data.url,
        waitTime: data.waitTime,
        canDistribute: this.canDistribute === "true",
      };

      try {
        const response = await baseFetch(`/report`, {
          body: JSON.stringify(requestData),
          method: "POST",
        });

        if (response) {
          this.submitResponse = response;
          this.submitError = {};
          this.showServerError = false;

          // I've repeated some unnecessary (hasTruck) logic here, but mainly to prevent any
          // confusion and/or errors if the logic is changed in the future.
          if (this.submitResponse.hasTruck) {
            // If truck is scheduled/on-site
            this.showFoodTruckOnSiteConfirmation = true;
          } else if (this.canDistribute === "false" && this.submitResponse.isUnique && !this.submitResponse.hasTruck) {
            // If Watchdog, unique report, and no truck on site
            this.showSuccessfulReportConfirmation = true;
          } else if (this.canDistribute === "true" && this.submitResponse.willReceive && !this.submitResponse.hasTruck) {
            // If Distributor, will receive order (confirmed), and no truck on site
            this.showDistributorConfirmation = true;
          } else if (
            ((this.canDistribute === "true" && !this.submitResponse.willReceive) || (this.canDistribute === "false" && !this.submitResponse.isUnique)) &&
            !this.submitResponse.hasTruck
          ) {
            // If Distributor, but someone else will receive
            // Or if Watchdog, and duplicate report
            // and no truck on site
            this.showDuplicateReportConfirmation = true;
          } else {
            // Catch-all confirmation - this should never fire, but just in case I'm going to
            // show the default showSuccessfulReportConfirmation, and then log in the console.
            this.showSuccessfulReportConfirmation = true;
            console.info("Confirmation Catch-all Executed: showSuccessfulReportConfirmation");
          }

          // Show confirmation
          this.showConfirmation = true;
        }
      } catch (errors) {
        this.submitError = errors;

        // If invalid address, take user back to location input
        if (errors.address) {
          this.showLocationInput = true;
          this.showConfirmation = false;
          return false;
        }

        // If invalid url, take user back to report step 2
        if (errors.url) {
          this.showLocationInput = false;
          this.showConfirmation = false;
          return false;
        }

        // Otherwise, show server error
        // Hide form
        this.showConfirmation = true;
        // Show error
        this.showServerError = true;
      } finally {
        // Do these things always
        // Update loading
        this.isLoading = false;
        // Enable submit
        this.isDisabled = false;
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    return (
      <Host>
        <div id="report" class={"report " + (this.viewportIsMobile ? "is-mobile-report" : "")}>
          <div class="container">
            <div class="box">
              <form id="form" onChange={() => (this.isDisabled = false)} onInput={() => (this.isDisabled = false)} hidden={this.showConfirmation}>
                <div id="form-step-1" hidden={!this.showLocationInput}>
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
                      placeholder="ex. St. John's Library"
                      onInput={handleAddressChange}
                      readOnly={!this.showLocationInput}
                      autocomplete="off"
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
                        <input type="hidden" name="address" id="formatted_address" />
                      </tr>
                    </table>
                  </div>
                  <button onClick={handleLoadStepTwo} class={"button is-teal is-marginless " + (!this.locationName ? "is-disabled" : "")} disabled={!this.locationName}>
                    Report line
                  </button>
                </div>
                <div id="form-step-2" hidden={this.showLocationInput}>
                  <p class="is-marginless is-unselectable">
                    <a href="#" class="has-text-teal" onClick={handleNewLocation}>
                      Change address
                    </a>
                  </p>
                  <h2 class="is-display">
                    Tell us a little more about the line at <span class="is-dotted">{this.locationName ? this.locationName : "the location"}</span>
                  </h2>
                  {/* Social or Photo */}
                  <div class="form-item is-hidden-tablet">
                    <label class="label">
                      Social media report <span class="is-hidden-tablet">or photo</span> <span class="required">*</span>
                    </label>
                    <div class="radio-group social-radio-group">
                      <label class={"radio " + ("reportType" in this.submitError ? "has-error" : "")} htmlFor="report-type-social" onClick={handleReportTypeChange}>
                        <input type="radio" value="social" id="report-type-social" name="reportType" checked />
                        <span class="label-text">Social link</span>
                        <span class="indicator"></span>
                      </label>
                      <div class="radio-group-spacer is-hidden-mobile"></div>
                      <label class={"radio is-hidden-tablet " + ("reportType" in this.submitError ? "has-error" : "")} htmlFor="report-type-photo" onClick={handleReportTypeChange}>
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
                        type="url"
                        name="url"
                        placeholder="ex. Link to Twitter, IG, etc."
                        autocomplete="off"
                      />
                      <span class="help is-hidden-mobile">We'll make sure there's really a line.</span>
                      <p class="help has-text-red" hidden={!("url" in this.submitError)}>
                        {this.submitError.url}
                      </p>
                    </div>
                  )}
                  {/* Photo Report */}
                  {this.reportType && this.reportType === "photo" && (
                    <div class="form-item is-hidden-tablet">
                      <div class="clearfix">
                        <div id="file-input-button" class={"file " + ("photo" in this.submitError ? "is-red" : "is-blue")}>
                          <label class="file-label">
                            <input class="file-input" type="file" name="photo" id="photo" accept="image/*" onChange={handlePhotoChange} />
                            <span class="file-cta">
                              <span class="file-label">{this.hasPhoto ? "Change photo" : "Upload photo"}</span>
                            </span>
                          </label>
                        </div>
                        <div class="photo-preview-container" hidden={!this.hasPhoto}>
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
                    <label class="label" htmlFor="waitTime">
                      How long is the wait in line? <span class="required">*</span>
                    </label>
                    <div class="select is-fullwidth">
                      <select id="waitTime" name="waitTime">
                        <option value="" disabled selected>
                          Select your best guess
                        </option>
                        <option value="Less than one hour">Less than an hour&nbsp;&nbsp;🍕</option>
                        <option value="1-2 hours">1-2 hours&nbsp;&nbsp;🍕🍕</option>
                        <option value="2-3 hours">2-3 hours&nbsp;&nbsp;🍕🍕🍕</option>
                        <option value="3-4 hours">3-4 hours&nbsp;&nbsp;🍕🍕🍕🍕</option>
                        <option value="4+ hours">4+ hours&nbsp;&nbsp;🍕🍕🍕🍕🍕</option>
                      </select>
                    </div>
                    <p class="help has-text-red" hidden={!("waitTime" in this.submitError)}>
                      {this.submitError.waitTime}
                    </p>
                  </div>
                  {/* Watchdog or Distributor */}
                  <div class="form-item">
                    <label class="label">
                      Will you receive the order? <span class="required">*</span>
                    </label>
                    <div class="radio-group report-watchdog-distributor-radio-group">
                      <label class={"radio " + ("canDistribute" in this.submitError ? "has-error" : "")} htmlFor="report-distributor" onClick={handleWatchdogDistributorChange}>
                        <input type="radio" value="true" id="report-distributor" name="canDistribute" />
                        <span class="label-text">Yes 🍕</span>
                        <span class="indicator"></span>
                      </label>
                      <label class={"radio " + ("canDistribute" in this.submitError ? "has-error" : "")} htmlFor="report-watchdog" onClick={handleWatchdogDistributorChange}>
                        <input type="radio" value="false" id="report-watchdog" name="canDistribute" />
                        <span class="label-text">No</span>
                        <span class="indicator"></span>
                      </label>
                    </div>
                    <span class="help">Note that we're prioritizing deliveries to places where someone can help make sure the food gets received and handed out safely.</span>
                    <p class="help has-text-red" hidden={!("canDistribute" in this.submitError)}>
                      {this.submitError.canDistribute}
                    </p>
                  </div>
                  {/* Delivery legal disclaimer */}
                  {this.canDistribute && this.canDistribute === "true" && (
                    <div class="form-item">
                      <label class={"checkbox is-small is-marginless " + ("distributorDisclaimer" in this.submitError ? "has-error" : "")} htmlFor="accept-distributor-disclaimer">
                        <input type="checkbox" value="agree" id="accept-distributor-disclaimer" name="distributorDisclaimer" />
                        <span class="label-text">
                          I have read and agreed to follow the{" "}
                          <a href="/guidelines" target="_blank">
                            on-demand delivery guidelines
                          </a>
                        </span>
                        <span class="indicator"></span>
                      </label>
                      <p class="help has-text-red" hidden={!("distributorDisclaimer" in this.submitError)}>
                        {this.submitError.distributorDisclaimer}
                      </p>
                    </div>
                  )}
                  {/* Phone Number */}
                  <div class="form-item">
                    <label class="label" htmlFor="contact">
                      Your phone number <span class="required">*</span>
                    </label>
                    <input class={"input " + ("contact" in this.submitError ? "has-error" : "")} type="tel" name="contact" autocomplete="off" />
                    <span class="help">So we can let you know when your order's sent!</span>
                    <p class="help has-text-red" hidden={!("contact" in this.submitError)}>
                      {this.submitError.contact}
                    </p>
                  </div>
                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    class={"button is-teal is-fullwidth-mobile " + (this.isDisabled ? "is-disabled " : "") + (this.isLoading ? "is-loading" : "")}
                    type="submit"
                    disabled={this.isDisabled}
                  >
                    Submit report. Feed democracy
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
              {/* Food Truck at location Confirmation */}
              {this.showConfirmation && !this.showServerError && this.showFoodTruckOnSiteConfirmation && (
                <div id="food-truck-at-location-confirmation">
                  <h2 class="is-display">Good news!</h2>
                  <p>
                    <b>We already have a food truck at this location, but if you'd still like to help out, consider donating to the fund.</b>
                  </p>
                  <a href="/donate" class="button is-red">
                    Donate to feed democracy
                  </a>
                  <p>
                    <a href="/report" class="has-text-teal" onClick={resetForm}>
                      Return to Report a Line
                    </a>
                  </p>
                  {/* TODO: Insert map and location link here */}
                </div>
              )}
              {/* Watchdog Confirmation */}
              {this.showConfirmation && !this.showServerError && this.showSuccessfulReportConfirmation && (
                <div id="watchdog-confirmation">
                  <h2 class="is-display">We're on it!</h2>
                  <p>
                    <b>Thank you for your submission! Our delivery team will review your report shortly. In the meantime, please donate to keep the pizza flowing!</b>
                  </p>
                  <a href="/donate" class="button is-red">
                    Donate to feed democracy
                  </a>
                  <hr />
                  <h3>Share us on social media!</h3>
                  <ul class="social-link-list">
                    <li>
                      <a class="twitter" href={shareTwitterLink} rel="noopener noreferrer" target="popup" onClick={openSharePopup}>
                        <img class="icon" alt="Twitter" src="/images/icons/twitter-blue.svg" />
                      </a>
                    </li>
                    <li>
                      <a class="facebook" href={shareFacebookLink} rel="noopener noreferrer" target="popup" onClick={openSharePopup}>
                        <img class="icon" alt="Facebook" src="/images/icons/facebook-blue.svg" />
                      </a>
                    </li>
                  </ul>
                </div>
              )}
              {/* Distributor Confirmation */}
              {this.showConfirmation && !this.showServerError && this.showDistributorConfirmation && (
                <div id="distributor-confirmation">
                  <h2 class="is-display">We're on it!</h2>
                  <p>
                    <b>Thank you for your submission! Our delivery team will review your report shortly. We'll reach out to you to verify delivery and pickup.</b>
                  </p>
                  <ul class="pizza-list">
                    <li>
                      One of our volunteers will reach out to you to verify timing for delivery. Pizzas usually take around 90 minutes to be delivered after an order is placed.
                    </li>
                    <li>
                      Be sure to be at the location once confirmed to coordinate pickup. Keep an eye out for a delivery driver. When the food arrives, let people around the polling
                      site know it's free for all: poll workers, voters, children, journalists, poll watchers, and anyone else who's out and about. Be sure to practice social
                      distancing and stay at least 6 feet apart from others.
                    </li>
                  </ul>
                  <a href="/guidelines" class="button is-blue">
                    Learn more about best practices
                  </a>
                  <p>
                    <a href="/report" class="has-text-teal" onClick={resetForm}>
                      Return to Report a line
                    </a>
                  </p>
                  <hr />
                  <p>
                    <b>We are nonpartisan and we never provide any pizza or anything of value in exchange for voting or voting for a particular candidate.</b>
                  </p>
                </div>
              )}
              {/* Duplicate Report Confirmation */}
              {this.showConfirmation && !this.showServerError && this.showDuplicateReportConfirmation && (
                <div id="duplicate-report-confirmation">
                  <h2 class="is-display">Good news!</h2>
                  <p>
                    <b>
                      We already have a report for <span class="is-dotted">{this.locationName ? this.locationName : "this location"}</span>, but if you'd still like to help out,
                      consider donating to the fund.
                    </b>
                  </p>
                  <a href="/donate" class="button is-red">
                    Donate to feed democracy
                  </a>
                  <p>
                    <a href="/report" class="has-text-teal" onClick={resetForm}>
                      Return to Report a line
                    </a>
                  </p>
                </div>
              )}
              {/* Server Error / Submission Failed for other reason */}
              {this.showConfirmation && this.showServerError && (
                <div id="server-error">
                  <h2 class="is-display">Our servers are a little stuffed right now.</h2>
                  <p>
                    <b>Sorry, we couldn’t process your report! Please try submitting again or return to the beginning and resubmit.</b>
                  </p>
                  <button class={"button is-blue " + (this.isLoading ? "is-loading is-disabled" : "")} onClick={handleSubmit} disabled={this.isLoading}>
                    Retry submission
                  </button>
                  <p>
                    <a href="/report" class="has-text-teal" onClick={resetForm}>
                      Return to the beginning
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
