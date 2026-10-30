import { Component, Event, EventEmitter, h, Host, Prop, State } from "@stencil/core";

import { ApiError, PizzaApi } from "../../api";
import { PHONE_REGEX } from "../../util/phone";
import { uploadPhoto } from "../../util/uploadPhoto";

/**
 * Trusted partner report form — the partner-facing counterpart of
 * form-report, deliberately its own component (the public form's flow is
 * hardened for anonymous traffic and its upload path carries prod-specific
 * verification/guard logic; see util/uploadPhoto.ts).
 *
 * Everything is framed around what makes a partner report different:
 *  - submissions skip the review queue and go straight to dispatch, so the
 *    address must be exactly right (emphasized in copy + validation)
 *  - photo/video optional — skipped media gets a Street View image of the
 *    location attached server-side
 *  - on-the-ground contact info optional — needed only when someone is
 *    actually at the line; we text that number when pizza's on the way,
 *    and say so in the confirmation
 *  - after submitting, the confirmation emphasizes received / will-text /
 *    file-another, and the form is already cleared for the next report
 *
 * Emits `sessionExpired` when the token is rejected (401) so the host page
 * can drop the token and show the email sign-in step again.
 */
@Component({
  tag: "form-partner-report",
  styleUrl: "form-partner-report.scss",
})
export class FormPartnerReport {
  @Prop() public token: string = "";

  @Event() sessionExpired!: EventEmitter<void>;

  @State() private submitError: { [key: string]: string } = {};
  @State() private isDisabled: boolean = false;
  @State() private isLoading: boolean = false;
  @State() private photoIsProcessing: boolean = false;
  @State() private hasPhoto: boolean = false;
  @State() private hasVideo: boolean = false;
  @State() private photoUrl: string = "";
  @State() private videoUrl: string = "";
  @State() private uploadId: number | null = null;
  @State() private lastSubmittedAddress: string = "";
  @State() private lastSubmittedContact: string = "";
  @State() private showSuccess: boolean = false;

  public render() {
    const handlePhotoChange = async (e?: Event) => {
      const target = e?.target as HTMLInputElement;
      const file = (target.files as FileList)[0];
      const imagePreview = document.getElementById("photo-preview");
      const videoPreview = document.getElementById("video-preview") as HTMLVideoElement;

      // Prevent submit before photo finishes processing
      this.photoIsProcessing = true;
      this.isDisabled = true;

      // If no files
      if (!file) {
        this.removePhoto();
        this.photoIsProcessing = false;
        this.isDisabled = false;
        return false;
      }

      // Client-side 50MB limit
      if (file.size > 52_428_800) {
        this.submitError.photo = "Whoops! That file is too large. Please upload a file under 50MB.";
        this.photoIsProcessing = false;
        this.isDisabled = false;
        return false;
      }

      this.submitError = {};

      const isVideo = file.type.startsWith("video/");

      if (isVideo) {
        this.hasPhoto = false;
        this.hasVideo = true;
        this.photoUrl = "";
        this.videoUrl = window.URL.createObjectURL(file);
        if (videoPreview) {
          videoPreview.src = this.videoUrl;
        }
      } else {
        this.hasPhoto = true;
        this.hasVideo = false;
        this.videoUrl = "";
        this.photoUrl = window.URL.createObjectURL(file);
        if (imagePreview) {
          imagePreview.style.backgroundImage = "url(" + this.photoUrl + ")";
        }
      }

      const addressInput = document.getElementById("formatted_address") as HTMLInputElement;
      if (addressInput.value && file) {
        try {
          const uploaded = await uploadPhoto(file, addressInput.value);
          this.uploadId = uploaded.uploadId;
          this.photoUrl = uploaded.photoUrl;
        } catch (error) {
          const errors = (error as { errors?: { fileName?: string } })?.errors;
          this.removePhoto();
          this.submitError.photo = errors?.fileName || "Whoops! We could not upload that photo";
        } finally {
          // Always reset
          this.photoIsProcessing = false;
          this.isDisabled = false;
        }
      } else {
        this.submitError.photo = "Whoops! We could not upload that photo. Pick a location first, or just skip the photo.";
        this.removePhoto();
        this.photoIsProcessing = false;
        this.isDisabled = false;
      }
    };

    const handleSubmit = async (event: Event) => {
      event.preventDefault();

      if (this.isDisabled) {
        return false;
      }

      this.isLoading = true;
      this.isDisabled = true;
      this.submitError = {};
      this.showSuccess = false;

      const data: { [key: string]: string } = {};
      Array.prototype.forEach.call(document.querySelectorAll("#form-partner-report input, #form-partner-report select"), (el: HTMLInputElement) => {
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

      if (!data.address) {
        this.submitError.address = "Whoops — pick the exact location from the search results. Your reports skip our review, so the address has to be right.";
      }

      if (!data.waitTime) {
        this.submitError.waitTime = "Whoops! Can you estimate the wait time?";
      }

      if (data.contactPhone && !data.contactPhone.match(PHONE_REGEX)) {
        this.submitError.contactPhone = "Whoops! Can you double-check that phone number?";
      }

      if (Object.keys(this.submitError).length > 0) {
        this.isLoading = false;
        this.isDisabled = false;
        document.getElementById("form-partner-report-component")?.scrollIntoView({ behavior: "smooth" });
        return false;
      }

      const requestData: {
        address: string;
        url?: string;
        waitTime: string;
        contactFirstName?: string;
        contact?: string;
        uploadId?: number;
      } = {
        address: data.address,
        waitTime: data.waitTime,
      };

      // Optional photo — the backend attaches a Street View image when absent.
      if (this.hasPhoto || this.hasVideo) {
        requestData.url = this.photoUrl;
      }

      // Optional on-the-ground contact info
      if (data.contactFirstName) {
        requestData.contactFirstName = data.contactFirstName;
      }
      if (data.contactPhone) {
        requestData.contact = data.contactPhone;
      }
      if (this.uploadId) {
        requestData.uploadId = this.uploadId;
      }

      try {
        await PizzaApi.postPartnerReport(requestData, this.token);

        // Partners file several reports per shift: confirm clearly, then
        // clear the form for the next one.
        this.lastSubmittedAddress = data.address;
        this.lastSubmittedContact = data.contactPhone || "";
        this.showSuccess = true;
        this.resetForm({ keepSuccess: true });
      } catch (error) {
        const apiError = error as ApiError;

        if (apiError?.status === 401) {
          // Magic link expired / revoked — hand back to the sign-in step.
          this.sessionExpired.emit();
          return false;
        }

        const errors = (error as { errors?: { [key: string]: string } })?.errors;
        this.submitError = errors || {};
        if (!errors || Object.keys(errors).length === 0) {
          this.submitError.general = "Whoops! That didn't work. Our servers might be a little stuffed right now.";
        }
      } finally {
        this.isLoading = false;
        this.isDisabled = false;
        document.getElementById("form-partner-report-component")?.scrollIntoView({ behavior: "smooth" });
      }
    };

    const focusNextReport = (e: Event) => {
      e.preventDefault();
      document.getElementById("autocomplete-input-partner-report")?.focus();
    };

    return (
      <Host>
        <div id="form-partner-report-component">
          {this.showSuccess && (
            <div class="notification is-success">
              <h2 class="is-display">Got it — report received!</h2>
              <p>
                Your report for <strong>{this.lastSubmittedAddress}</strong> is with our dispatch team now. Trusted partner reports skip the review queue — they can start sending
                pizza right away.
              </p>
              {this.lastSubmittedContact ? (
                <p>
                  We'll text <strong>{this.lastSubmittedContact}</strong> when the pizza is on its way.
                </p>
              ) : (
                <p class="help">No one on the ground was listed, so there's no number to text — we've noted that in the record.</p>
              )}
              <p>
                Filing more today? The form below is cleared and ready —{" "}
                <a href="#" class="has-text-teal" onClick={focusNextReport}>
                  start the next report
                </a>
                .
              </p>
            </div>
          )}
          <form id="form-partner-report" onSubmit={handleSubmit} onChange={() => (this.isDisabled = false)} onInput={() => (this.isDisabled = false)}>
            <h2 class="is-display">Report a line</h2>
            <p class="help">
              Partner reports go <strong>straight to dispatch</strong> — no review queue. That's what makes the details below matter.
            </p>

            {/* Location */}
            <div class="form-item">
              <label class="label" htmlFor="autocomplete-input-partner-report">
                Where is the line? <span class="required">*</span>
              </label>
              <ui-location-search
                error={this.submitError.address}
                onLocationSelected={({ detail }: CustomEvent) => {
                  this.handleLocationSelected(detail);
                }}
                inputId="partner-report"
              />
              <span class="help">
                <strong>The address has to be exactly right.</strong> Search for the polling place — a school, church, or library name works best — and pick it from the dropdown.
                We trust partner reports, so an imprecise address can send pizza to the wrong place.
              </span>
              <p class="help has-text-red" hidden={!("address" in this.submitError)}>
                {this.submitError.address}
              </p>
            </div>
            <input type="hidden" name="address" id="formatted_address" />

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

            {/* Photo — optional for partners */}
            <div class="form-item">
              <label class="label">Photo or video of the line</label>
              <span class="help">
                <strong>Optional.</strong> Great for our social posts — but don't wait on it. If you skip it, we'll attach an image of the location for the record.
              </span>
              <div class="clearfix">
                <div id="file-input-button" class={"file button-large " + (this.photoIsProcessing ? "is-loading is-disabled " : "") + "is-teal"}>
                  <label class="file-label">
                    <input
                      class="file-input"
                      type="file"
                      name="photo"
                      id="photo"
                      accept="image/*,video/mp4,video/quicktime,video/webm"
                      onChange={handlePhotoChange}
                      disabled={this.photoIsProcessing}
                    />
                    <span class="file-cta">
                      <span class="file-label">{this.hasPhoto || this.hasVideo ? "Change media" : "Add a photo or video (optional)"}</span>
                    </span>
                  </label>
                </div>
                <div class="photo-preview-container" hidden={!this.hasPhoto && !this.hasVideo}>
                  <div id="photo-preview" hidden={!this.hasPhoto}></div>
                  <video id="video-preview" hidden={!this.hasVideo} controls style={{ maxWidth: "100%", maxHeight: "200px" }}></video>
                  <div class="delete" onClick={() => this.removePhoto()}></div>
                </div>
              </div>
              <p class="help has-text-red" hidden={!("photo" in this.submitError)}>
                {this.submitError.photo}
              </p>
            </div>

            {/* On-the-ground contact */}
            <h3>Is someone on the ground at the line?</h3>
            <p class="help">
              <strong>Optional — unless someone's actually there.</strong> If they are, give us their name and number: the driver will look for them, and we'll text that number
              when the pizza's on its way. If you're filing from off-site, leave these blank and we'll mark the report "no one on site."
            </p>
            <div class="form-item-group">
              <div class="form-item">
                <label class="label" htmlFor="contactFirstName">
                  Their name
                </label>
                <input class="input" type="text" name="contactFirstName" id="contactFirstName" autoComplete="name" />
                <span class="help">So the delivery driver can find them</span>
              </div>
              <div class="form-item">
                <label class="label" htmlFor="contactPhone">
                  Their phone number
                </label>
                <input
                  class={"input " + ("contactPhone" in this.submitError ? "has-error" : "")}
                  type="tel"
                  name="contactPhone"
                  id="contactPhone"
                  autoComplete="tel-national"
                  onInput={() => this.clearFormError("contactPhone")}
                />
                <span class="help">We'll text this number when the pizza's on its way</span>
                <p class="help has-text-red" hidden={!("contactPhone" in this.submitError)}>
                  {this.submitError.contactPhone}
                </p>
              </div>
            </div>

            {/* Submit */}
            <p class="help has-text-red" hidden={!("general" in this.submitError)}>
              {this.submitError.general}
            </p>
            <button
              onClick={handleSubmit}
              class={
                "button is-teal is-fullwidth-mobile " + (this.isDisabled || this.isLoading || this.photoIsProcessing ? "is-disabled " : "") + (this.isLoading ? "is-loading" : "")
              }
              type="submit"
              disabled={this.isDisabled || this.isLoading || this.photoIsProcessing}
            >
              {this.photoIsProcessing ? (this.hasVideo ? "🎬 Processing video..." : "📸 Processing photo...") : "Submit report"}
            </button>
            <p class="agreement">
              <em>
                By submitting, you agree to receive occasional emails or text messages from Pizza to the Polls and permission to use and distribute your photo as we see fit - see
                our{" "}
                <a href="/privacy" class="has-text-blue" target="_blank">
                  Privacy Policy
                </a>
                . You can unsubscribe at any time. For texts, message and data rates may apply. Text HELP for Info. Text STOP to quit.
              </em>
            </p>
          </form>
        </div>
      </Host>
    );
  }

  private handleLocationSelected({ formattedAddress }: { formattedAddress: string; locationName: string }) {
    const addressInput = document.getElementById("formatted_address") as HTMLInputElement;
    if (addressInput) {
      addressInput.value = formattedAddress;
    }
    this.clearFormError("address");
  }

  private clearFormError(field: string): void {
    const { [field]: _remove, ...rest } = this.submitError;
    this.submitError = rest;
  }

  private resetForm({ keepSuccess = false }: { keepSuccess?: boolean } = {}) {
    this.submitError = {};
    this.photoIsProcessing = false;
    this.isLoading = false;
    this.isDisabled = false;
    if (!keepSuccess) {
      this.showSuccess = false;
    }
    this.removePhoto();
    const form = document.getElementById("form-partner-report") as HTMLFormElement;
    if (form) {
      form.reset();
    }
    // form.reset() restores inputs to their *default* values, which Stencil
    // re-renders can pollute from the picked values — set the fields we
    // manage directly so a fresh report truly starts clean.
    const addressInput = document.getElementById("formatted_address") as HTMLInputElement;
    if (addressInput) {
      addressInput.value = "";
      addressInput.defaultValue = "";
    }
    // ui-location-search keeps its typed text in component state (light DOM
    // but not part of this form) — clear the visible input too.
    const searchInput = document.getElementById("autocomplete-input-partner-report") as HTMLInputElement;
    if (searchInput) {
      searchInput.value = "";
    }
  }

  private removePhoto() {
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    const imagePreview = document.getElementById("photo-preview");
    const videoPreview = document.getElementById("video-preview") as HTMLVideoElement;
    if (fileInput) {
      fileInput.value = "";
    }
    this.hasPhoto = false;
    this.hasVideo = false;
    this.photoUrl = "";
    this.uploadId = null;
    this.videoUrl = "";
    this.clearFormError("photo");
    if (imagePreview) {
      imagePreview.style.backgroundImage = "";
    }
    if (videoPreview) {
      videoPreview.src = "";
    }
    this.photoIsProcessing = false;
  }
}
