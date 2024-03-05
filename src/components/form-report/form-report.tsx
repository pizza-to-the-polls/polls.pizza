import { Component, h, Host, Prop, State } from "@stencil/core";

import { ApiError, PizzaApi, ReportPostResults } from "../../api";
import shaFile from "../../util/shaFile";

// Shared with pizzabase
const PHONE_REGEX = /^[+]?(1\-|1\s|1|\d{3}\-|\d{3}\s|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/;

@Component({
  tag: "form-report",
  styleUrl: "form-report.scss",
})
export class FormReport {
  @Prop() public formattedAddress?: string;

  /**
   * *Always* required to hide form, regardless of other show booleans
   */
  @State() private showConfirmation: boolean = false;
  /**
   * Enable to show food truck already at location
   */
  @State() private showFoodTruckOnSiteConfirmation: boolean = false;
  /**
   * Enable to show distributor confirmation & guidelines
   */
  @State() private showDistributorConfirmation: boolean = false;
  /**
   * Enable to show successful report confirmation
   */
  @State() private showSuccessfulReportConfirmation: boolean = false;
  /**
   * Enable to show duplicate report message
   */
  @State() private showDuplicateReportConfirmation: boolean = false;
  /**
   * Enable to show submission error
   */
  @State() private showServerError: boolean = false;
  /**
   * Disable form and submit
   */
  @State() private isDisabled: boolean = false;
  /**
   * Submit button loading state
   */
  @State() private isLoading: boolean = false;
  /**
   * Submit button loading state
   */
  @State() private photoIsProcessing: boolean = false;
  @State() private submitResponse: ReportPostResults | { [id: string]: string } = {};
  @State() private submitError: { [key: string]: string } = {};
  @State() private showLocationInput: boolean = true;
  @State() private locationName: string = "";
  @State() private reportType: string = "photo"; // "social" | "photo"
  @State() private hasPhoto: boolean = false;
  @State() private photoUrl: string = "";
  @State() private userClickedGuidelinesLink: boolean = true;

  public componentWillLoad() {
    if (this.formattedAddress) {
      this.handleLocationSelected({
        formattedAddress: this.formattedAddress,
        locationName: this.formattedAddress.replace(/, USA/gi, ""),
      });
      this.handleLoadStepTwo();
    }
  }

  public render() {
    const handleNewLocation = (e: Event) => {
      this.resetForm();
      e.preventDefault();
    };

    const handlePhotoChange = async (e?: Event) => {
      const target = e?.target as HTMLInputElement;
      const file = (target.files as FileList)[0];
      const imagePreview = document.getElementById("photo-preview");

      // Prevent submit before photo finishes processing
      this.photoIsProcessing = true;
      this.isDisabled = true;

      // If no files
      if (!file) {
        this.removePhoto();
        // Reset
        this.photoIsProcessing = false;
        this.isDisabled = false;
        return false;
      }
      this.submitError = {};
      this.hasPhoto = true;
      this.photoUrl = window.URL.createObjectURL(file);
      // Generate file preview
      if (imagePreview) {
        imagePreview.style.backgroundImage = "url(" + this.photoUrl + ")";
      }

      const addressInput = document.getElementById("formatted_address") as HTMLInputElement;
      if (addressInput.value && file) {
        try {
          await uploadPhoto(file, addressInput.value);
        } catch ({ errors }) {
          this.removePhoto();
          this.submitError.photo = errors?.fileName || "Whoops! We could not upload that photo";
        } finally {
          // Always reset
          this.photoIsProcessing = false;
          this.isDisabled = false;
        }
      } else {
        this.submitError.photo = "Whoops! We could not upload that photo. Try adding a link to a social media report instead.";
        this.removePhoto();
        // Always reset
        this.photoIsProcessing = false;
        this.isDisabled = false;
      }
    };

    const uploadPhoto = async (file: File, address: string): Promise<void> => {
      const fileHash = await shaFile(file);

      const { id, filePath, isDuplicate, presigned } = await PizzaApi.postUpload(fileHash, file.name, address);

      if (!isDuplicate && presigned) {
        const formData = new FormData();
        const { url, fields } = presigned;

        formData.append("ACL", "public-read");
        formData.append("x-amz-acl", "public-read");
        formData.append("x-amz-meta-user-id", id);
        formData.append("Content-Type", file.type);

        Object.entries(fields).forEach(([k, v]: [string, any]) => {
          formData.append(k, v);
        });

        formData.append("file", file);

        const awsReq = await fetch(url, {
          method: "POST",
          mode: "cors",
          body: formData,
        });
        if (awsReq.status > 299) {
          const awsError: ApiError = { isError: true, status: awsReq.status, errors: { fileName: "Whoops! That did not work - try again!" } };
          throw awsError;
        }
      }

      this.photoUrl = `https://polls.pizza/${filePath}`;
    };

    // Has user clicked the "On-Demand Guidelines" link?
    const handleGuidelinesClick = () => {
      const distributorDisclaimerAgree = (document.querySelector("input[name=distributorDisclaimer]") as HTMLInputElement)?.checked;
      // If checkbox is already checked, remove other error message
      if (distributorDisclaimerAgree) {
        this.clearFormError("distributorDisclaimer");
      }
      this.clearFormError("viewGuidelines");
      // Toggle boolean to allow user to submit form
      this.userClickedGuidelinesLink = true;
      this.isDisabled = false;
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

      Array.prototype.forEach.call(document.querySelectorAll("#form-report input, #form-report select"), (el: HTMLInputElement) => {
        if (el) {
          if (el.type === "radio") {
            if (el.checked) {
              data[el.name] = el.value;
            }
          } else {
            data[el.name] = el.value;
          }
        }
      });

      // Reset checkboxes and radios in data (values will be set below if present)
      data[`distributorDisclaimer`] = ``;

      data.reportType = this.reportType;

      if (!this.hasPhoto) {
        this.submitError.photo = "Whoops! Can you add a photo of the line to your report so we can verify this is on the level?";
      } else {
        data.url = this.photoUrl;
      }

      if (!data.address) {
        this.showLocationInput = true;
        this.submitError.address = "Whoops - we can't read that address";
      }

      if (!data.waitTime) {
        this.submitError.waitTime = "Whoops! Can you estimate the wait time?";
      }

      // Contact Role
      if (!data.contactRole) {
        this.submitError.contactRole = "Whoops! Can you specify your role at the polling location?";
      }

      // Contact First Name
      if (!(data.contactFirstName || "")) {
        this.submitError.contactFirstName = "Whoops! Can you please add your first name?";
      }

      // Contact Last Name
      if (!(data.contactLastName || "")) {
        this.submitError.contactLastName = "Whoops! Can you please add your last name?";
      }

      if (!(data.contactPhone || "").match(PHONE_REGEX)) {
        this.submitError.contactPhone = "Whoops! Can you add your phone number?";
      }

      // Disclaimer

      // Is the agree checkbox checked?
      const distributorDisclaimerAgree = (document.querySelector("input[name=distributorDisclaimer]") as HTMLInputElement)?.checked;

      // User did not click the link or the checkbox
      if (!this.userClickedGuidelinesLink && !distributorDisclaimerAgree) {
        this.submitError.viewGuidelines = "Whoops! You must click the link to read the On-Demand Delivery Guidelines, then accept the conditions before hitting submit.";
      } else if (!this.userClickedGuidelinesLink) {
        // User has not clicked to view the On-Demand Guidelines
        this.submitError.viewGuidelines = "Whoops! You must click the link to read the On-Demand Delivery Guidelines before hitting submit.";
      }

      if (!distributorDisclaimerAgree) {
        this.submitError.distributorDisclaimer = "Whoops! You must accept the conditions before hitting submit.";
      } else {
        data[`distributorDisclaimer`] = `agree`;
      }

      // Check if the only errors are related to the checkbox. If yes, prevent scrolling to the top
      const shouldPreventScroll = Object.keys(this.submitError).every(error => ["viewGuidelines", "distributorDisclaimer"].includes(error));

      // Check for any errors
      if (Object.keys(this.submitError).length > 0) {
        // Update loading
        this.isLoading = false;
        // Disable submit
        this.isDisabled = true;
        if (!shouldPreventScroll) {
          // Scroll to top
          document.getElementById("form-report-component")?.scrollIntoView({
            behavior: "smooth",
          });
        }
        return false;
      }

      // Setup request data
      let requestData = {
        address: data.address,
        url: data.url,
        waitTime: data.waitTime,
        canDistribute: true, // required, so default
        contactRole: data.contactRole,
        contactFirstName: data.contactFirstName,
        contactLastName: data.contactLastName,
        contact: data.contactPhone,
      };

      try {
        this.submitResponse = await PizzaApi.postReport(requestData);

        this.submitError = {};
        this.showServerError = false;

        // If truck is scheduled/on-site
        if (this.submitResponse.hasTruck) {
          this.showFoodTruckOnSiteConfirmation = true;
        } else {
          if (this.submitResponse.willReceive && !this.submitResponse.alreadyOrdered) {
            // If Distributor, and they WILL receive order, and we haven't already ordered
            this.showDistributorConfirmation = true;
          } else {
            // If Distributor, and they will NOT receive order
            this.showDuplicateReportConfirmation = true;
          }
        }

        // Show confirmation: *Always* required to hide form
        this.showConfirmation = true;
      } catch ({ errors }) {
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
        document.getElementById("form-report-component")?.scrollIntoView({
          behavior: "smooth",
        });
      }
    };

    return (
      <Host>
        <div id="form-report-component">
          <form id="form-report" onSubmit={handleSubmit} onChange={() => (this.isDisabled = false)} onInput={() => (this.isDisabled = false)} hidden={this.showConfirmation}>
            <div id="form-step-1" hidden={!this.showLocationInput}>
              {/* Intro content */}
              <slot></slot>
              {/* Location */}
              <div class="form-item">
                <label class="label" htmlFor="address">
                  Where should we send pizza? <span class="required">*</span>
                </label>
                <ui-location-search
                  error={this.submitError.address}
                  readOnly={!this.showLocationInput}
                  onLocationSelected={({ detail }: CustomEvent) => {
                    this.handleLocationSelected(detail);
                  }}
                  inputId="report-form"
                />
                <span class="help">Search by the name of the place ("St. John's Library") or street address.</span>
                <p class="help has-text-red" hidden={"address" in this.submitError}>
                  {this.submitError.address}
                </p>
              </div>
              <input type="hidden" name="address" id="formatted_address" value={this.formattedAddress} />
              <button
                onClick={(e: Event) => {
                  e.preventDefault();
                  this.handleLoadStepTwo();
                }}
                class={"button is-teal is-marginless " + (!this.locationName ? "is-disabled" : "")}
                disabled={!this.locationName}
              >
                Report line
              </button>
            </div>
            <div id="form-step-2" hidden={this.showLocationInput}>
              <h2 class="is-display has-text-red is-upcase">Send Pizza</h2>
              <p>
                <strong>
                  Tell us a little more about the line at <span class="has-text-red">{this.locationName ? this.locationName : "the location"}</span>.
                </strong>
                <br />
                <a href="#" class="has-text-teal is-unselectable" onClick={handleNewLocation}>
                  Change address
                </a>
              </p>

              {/* Wait Time */}
              <div class="form-item">
                <label class="label">
                  How long is the wait in line? <span class="required">*</span>
                </label>
                <p class="help has-text-red" hidden={!("waitTime" in this.submitError)}>
                  {this.submitError.waitTime}
                </p>
                <div class="radio-inputs-wrap">
                  <div class={"radio-inputs is-fullwidth " + ("waitTime" in this.submitError ? "has-error " : "")}>
                    <input type="radio" onChange={() => this.clearFormError("waitTime")} id="waitTime-less-than" name="waitTime" value="Less than one hour" />
                    <label htmlFor="waitTime-less-than">Less than an hour</label>
                    <input type="radio" onChange={() => this.clearFormError("waitTime")} id="waitTime-one-to-two" name="waitTime" value="1-2 hours" />
                    <label htmlFor="waitTime-one-to-two">1-2 hours</label>
                    <input type="radio" onChange={() => this.clearFormError("waitTime")} id="waitTime-two-to-three" name="waitTime" value="2-3 hours" />
                    <label htmlFor="waitTime-two-to-three">2-3 hours</label>
                    <input type="radio" onChange={() => this.clearFormError("waitTime")} id="waitTime-three-plus" name="waitTime" value="3+ hours" />
                    <label htmlFor="waitTime-three-plus">3+ hours</label>
                  </div>
                </div>
              </div>

              {/* Contact Role */}
              <div class="form-item">
                <label class="label">
                  What is your role at the polling location? <span class="required">*</span>
                </label>
                <p class="help has-text-red" hidden={!("contactRole" in this.submitError)}>
                  {this.submitError.contactRole}
                </p>
                <div class="radio-inputs-wrap">
                  <div class={"radio-inputs is-fullwidth " + ("contactRole" in this.submitError ? "has-error " : "")}>
                    <input onChange={() => this.clearFormError("contactRole")} name="contactRole" type="radio" id="contactRole-voter" value="Voter" />
                    <label htmlFor="contactRole-voter">Voter</label>
                    <input onChange={() => this.clearFormError("contactRole")} name="contactRole" type="radio" id="contactRole-poll-worker" value="Poll worker" />
                    <label htmlFor="contactRole-poll-worker">Poll Worker</label>
                    <input onChange={() => this.clearFormError("contactRole")} name="contactRole" type="radio" id="contactRole-poll-watcher" value="Poll watcher" />
                    <label htmlFor="contactRole-poll-watcher">Poll Watcher</label>
                    <input onChange={() => this.clearFormError("contactRole")} name="contactRole" type="radio" id="contactRole-other" value="Other" />
                    <label htmlFor="contactRole-other">Other</label>
                  </div>
                </div>
              </div>

              {/* Photo Report */}
              <div class="form-item">
                <label class="label">
                  Pizza Proof <span class="required">*</span>
                </label>
                <span class="help">Upload photos of this line will help us quickly verify this report before sending pizza.</span>
                <div class="clearfix">
                  <div
                    id="file-input-button"
                    class={"file button-large " + (this.photoIsProcessing ? "is-loading is-disabled " : "") + ("photo" in this.submitError ? "is-teal" : "is-teal")}
                  >
                    <label class="file-label">
                      <input class="file-input" type="file" name="photo" id="photo" accept="image/*" onChange={handlePhotoChange} disabled={this.photoIsProcessing} />
                      <span class="file-cta">
                        <span class="file-label">{this.hasPhoto ? "Change photo" : "Add a photo of the line"}</span>
                      </span>
                    </label>
                  </div>
                  <div class="photo-preview-container" hidden={!this.hasPhoto}>
                    <div id="photo-preview"></div>
                    <div class="delete" onClick={() => this.removePhoto()}></div>
                  </div>
                </div>
                <p class="help has-text-red" hidden={!("photo" in this.submitError)}>
                  {this.submitError.photo}
                </p>
              </div>

              {/* Contact Name */}
              <h3>Tell Us About Yourself</h3>
              <div class="form-item-group">
                <div class="form-item">
                  <label class="label" htmlFor="contactFirstName">
                    Your first name <span class="required">*</span>
                  </label>
                  <input
                    class={"input " + ("contactFirstName" in this.submitError ? "has-error" : "")}
                    type="text"
                    name="contactFirstName"
                    autoComplete="given-name"
                    onInput={() => this.clearFormError("contactFirstName")}
                  />
                  <p class="help">This is so the delivery driver can find you</p>
                  <p class="help has-text-red" hidden={!("contactFirstName" in this.submitError)}>
                    {this.submitError.contactFirstName}
                  </p>
                </div>
                <div class="form-item">
                  <label class="label" htmlFor="contactLastName">
                    Your last name <span class="required">*</span>
                  </label>
                  <input
                    class={"input " + ("contactLastName" in this.submitError ? "has-error" : "")}
                    type="text"
                    name="contactLastName"
                    autoComplete="family-name"
                    onInput={() => this.clearFormError("contactLastName")}
                  />
                  <p class="help">&nbsp;</p>
                  <p class="help has-text-red" hidden={!("contactLastName" in this.submitError)}>
                    {this.submitError.contactLastName}
                  </p>
                </div>
              </div>

              {/* Phone Number */}
              <div class="form-item">
                <label class="label" htmlFor="contactPhone">
                  Your phone number <span class="required">*</span>
                </label>
                <input
                  class={"input " + ("contactPhone" in this.submitError ? "has-error" : "")}
                  type="tel"
                  name="contactPhone"
                  autoComplete="tel-national"
                  onInput={() => this.clearFormError("contactPhone")}
                />
                <span class="help">So we can let you know when your order's sent!</span>
                <p class="help has-text-red" hidden={!("contactPhone" in this.submitError)}>
                  {this.submitError.contactPhone}
                </p>
              </div>

              {/* Delivery legal disclaimer */}
              <div class="form-item">
                <div class="form-item">
                  <h3 class="is-marginless">Pizza Promise & Guidelines</h3>
                  <p class="help">Review the guidelines before submitting your report</p>
                  <div class="guidelines-container">
                    <ui-guidelines />
                  </div>
                </div>

                <label
                  class={"checkbox is-small is-marginless " + ("viewGuidelines" in this.submitError || "distributorDisclaimer" in this.submitError ? "has-error" : "")}
                  htmlFor="accept-distributor-disclaimer"
                >
                  <input
                    type="checkbox"
                    value="agree"
                    id="accept-distributor-disclaimer"
                    name="distributorDisclaimer"
                    onChange={() => this.clearFormError("distributorDisclaimer")}
                  />
                  <span class="label-text">
                    I have read and understood the{" "}
                    <a href="/guidelines" target="_blank" onClick={handleGuidelinesClick}>
                      On-Demand Delivery Guidelines
                    </a>
                    , and I agree that I will comply with these rules as a necessary condition of requesting and receiving items from Pizza to the Polls.
                  </span>
                  <span class="indicator"></span>
                </label>
                <p class="help has-text-red" hidden={!("viewGuidelines" in this.submitError)}>
                  {this.submitError.viewGuidelines}
                </p>
                <p class="help has-text-red" hidden={!(!("viewGuidelines" in this.submitError) && "distributorDisclaimer" in this.submitError)}>
                  {this.submitError.distributorDisclaimer}
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                class={
                  "button is-teal is-fullwidth-mobile " + (this.isDisabled || this.isLoading || this.photoIsProcessing ? "is-disabled " : "") + (this.isLoading ? "is-loading" : "")
                }
                type="submit"
                disabled={this.isDisabled || this.isLoading || this.photoIsProcessing}
              >
                {this.photoIsProcessing ? "Processing photo..." : "Submit report. Feed democracy"}
              </button>
              {/* Legal */}
              <p class="agreement">
                <em>
                  By submitting a report, you agree to receive occasional emails or text messages from Pizza to the Polls and permission to use and distribute your photo as we see
                  fit - see our{" "}
                  <a href="/privacy" class="has-text-blue" target="_blank">
                    Privacy Policy
                  </a>
                  . You can unsubscribe at any time. For texts, message and data rates may apply. Text HELP for Info. Text STOP to quit.
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
              <h3>Can you help support our work?</h3>
              <form-donate redirectURL={`https://${document.location.host}/donate`} />
            </div>
          )}
          {/* Watchdog Confirmation */}
          {this.showConfirmation && !this.showServerError && this.showSuccessfulReportConfirmation && (
            <div id="watchdog-confirmation">
              <h2 class="is-display is-red is-upcase">We're on it!</h2>
              <h3>Thank you for your submission! Our team will review your report shortly. In the meantime, please donate to keep the pizza flowing!</h3>
              <h3>Can you help support our work?</h3>
              <form-donate redirectURL={`https://${document.location.host}/donate`} />
            </div>
          )}
          {/* Distributor Confirmation */}
          {this.showConfirmation && !this.showServerError && this.showDistributorConfirmation && (
            <div id="distributor-confirmation">
              <h2 class="is-display">We're on it!</h2>
              <p>
                <b>Thank you for your submission! Our team will review your report shortly.</b>
              </p>
              <ui-pizza-list>
                <li>
                  One of our volunteers will send a text to verify the order has been placed. Keep in mind that pizzas can take up to 90 minutes to arrive once the line is
                  reported.
                </li>
                <li>
                  Please be at the location to coordinate pickup with the delivery driver. When the food arrives, let people around the site know it's free for all: poll workers,
                  voters, children, journalists, poll watchers, and anyone else who's out and about.
                </li>
                <li>We are nonpartisan and we never provide any pizza or anything of value in exchange for voting or voting for a particular candidate.</li>
              </ui-pizza-list>
              <h3>Can you help support our work?</h3>
              <form-donate redirectURL={`https://${document.location.host}/donate`} />
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
              <form-donate redirectURL={`https://${document.location.host}/donate`} />
              <p>
                <a href="#" class="has-text-teal" onClick={handleNewLocation}>
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
              <button
                class={"button is-blue " + (this.isDisabled || this.isLoading ? "is-disabled " : "") + (this.isLoading ? "is-loading" : "")}
                onClick={handleSubmit}
                disabled={this.isLoading}
              >
                Retry submission
              </button>
              <p>
                <a href="#" class="has-text-teal" onClick={handleNewLocation}>
                  Return to the beginning
                </a>
              </p>
            </div>
          )}
        </div>
      </Host>
    );
  }

  private handleLocationSelected({ formattedAddress, locationName }: { formattedAddress: string; locationName: string }) {
    this.locationName = locationName;

    const addressInput = document.getElementById("formatted_address") as HTMLInputElement;
    if (addressInput) {
      addressInput.value = formattedAddress;
    }
  }

  private handleLoadStepTwo() {
    this.showLocationInput = false;
  }

  private clearFormError(field: string): void {
    // Remove field from existing errors
    const { [field]: remove, ...rest } = this.submitError;
    this.submitError = rest;
  }

  private resetForm() {
    this.showConfirmation = false;
    this.showServerError = false;
    this.showFoodTruckOnSiteConfirmation = false;
    this.showDistributorConfirmation = false;
    this.showSuccessfulReportConfirmation = false;
    this.showDuplicateReportConfirmation = false;
    this.submitResponse = {};
    this.submitError = {};
    this.locationName = "";
    this.photoIsProcessing = false;
    this.userClickedGuidelinesLink = false;
    this.isLoading = false;
    this.isDisabled = false;
    this.removePhoto();
    const form = document.getElementById("form-report") as HTMLFormElement;
    if (form) {
      form.reset();
    }
    // Scroll to top
    document.getElementById("form-report-component")?.scrollIntoView({
      behavior: "smooth",
    });
    this.showLocationInput = true;
  }

  private removePhoto() {
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    const imagePreview = document.getElementById("photo-preview");
    if (fileInput) {
      fileInput.value = "";
    }
    this.hasPhoto = false;
    this.photoUrl = "";
    this.clearFormError("photo");
    if (imagePreview) {
      imagePreview.style.backgroundImage = "";
    }
    this.photoIsProcessing = false;
  }
}
