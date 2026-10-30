import { Component, Event, EventEmitter, h, Host, Prop, State } from "@stencil/core";

import { ApiError, PizzaApi } from "../../api";
import shaFile from "../../util/shaFile";

// Shared with pizzabase
const PHONE_REGEX = /^[+]?(1\-|1\s|1|\d{3}\-|\d{3}\s|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/;

/**
 * Trusted partner report form — private counterpart of form-report.
 *
 * Same location + wait-time flow as the public form, but:
 *  - photo/video is optional (backend attaches a Street View image of the
 *    location when the partner doesn't upload one)
 *  - on-the-ground contact name + phone are optional
 *  - submits to POST /partner/report with the magic-link session token
 *  - after a successful submit the form resets for the next report —
 *    partners file several during a shift
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
  @State() private showLocationInput: boolean = true;
  @State() private locationName: string = "";
  @State() private hasPhoto: boolean = false;
  @State() private hasVideo: boolean = false;
  @State() private photoUrl: string = "";
  @State() private videoUrl: string = "";
  @State() private uploadId: number | null = null;
  @State() private lastSubmittedAddress: string = "";
  @State() private showSuccess: boolean = false;

  public render() {
    const handleNewLocation = (e: Event) => {
      this.resetForm();
      e.preventDefault();
    };

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
          await this.uploadPhoto(file, addressInput.value);
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
        this.showLocationInput = true;
        this.submitError.address = "Whoops - we can't read that address";
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

      // Optional photo — the backend fills a Street View image when absent.
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

        // Partners file several reports per shift: confirm briefly, then
        // reset straight to a fresh location search for the next one.
        this.lastSubmittedAddress = data.address;
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
        if (errors?.address) {
          this.showLocationInput = true;
        }
      } finally {
        this.isLoading = false;
        this.isDisabled = false;
        document.getElementById("form-partner-report-component")?.scrollIntoView({ behavior: "smooth" });
      }
    };

    return (
      <Host>
        <div id="form-partner-report-component">
          {this.showSuccess && (
            <div class="notification is-success">
              <h2 class="is-display">Thanks — we're on it!</h2>
              <p>
                Your report for <strong>{this.lastSubmittedAddress}</strong> has been sent straight to the team as a trusted partner report.
              </p>
            </div>
          )}
          <form id="form-partner-report" onSubmit={handleSubmit} onChange={() => (this.isDisabled = false)} onInput={() => (this.isDisabled = false)}>
            <div id="form-step-1" hidden={!this.showLocationInput}>
              <h2 class="is-display">Report a line</h2>
              <div class="form-item">
                <label class="label" htmlFor="autocomplete-input-partner-report-form">
                  Where is the line? <span class="required">*</span>
                </label>
                <ui-location-search
                  error={this.submitError.address}
                  readOnly={!this.showLocationInput}
                  onLocationSelected={({ detail }: CustomEvent) => {
                    this.handleLocationSelected(detail);
                  }}
                  inputId="partner-report"
                />
                <span class="help">Search by the name of the place ("St. John's Library") or street address.</span>
              </div>
              <input type="hidden" name="address" id="formatted_address" />
              <button
                onClick={(e: Event) => {
                  e.preventDefault();
                  this.showLocationInput = false;
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
                  Tell us about the line at <span class="has-text-red">{this.locationName ? this.locationName : "the location"}</span>.
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

              {/* Photo — optional for partners */}
              <div class="form-item">
                <label class="label">Photo or video of the line</label>
                <span class="help">Optional — helps our social posts. If you skip it, we'll attach an image of the location for the record.</span>
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

              {/* On-the-ground contact — optional */}
              <h3>Person on the ground (optional)</h3>
              <div class="form-item-group">
                <div class="form-item">
                  <label class="label" htmlFor="contactFirstName">
                    Their name
                  </label>
                  <input
                    class={"input " + ("contactFirstName" in this.submitError ? "has-error" : "")}
                    type="text"
                    name="contactFirstName"
                    id="contactFirstName"
                    autoComplete="name"
                  />
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
                  <span class="help">So we can let them know when the order's sent</span>
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
            </div>
          </form>
        </div>
      </Host>
    );
  }

  private async uploadPhoto(file: File, address: string): Promise<void> {
    const fileHash = await shaFile(file);

    const { id, filePath, isDuplicate, presigned } = await PizzaApi.postUpload(fileHash, file.name, address);

    if (!isDuplicate && presigned) {
      this.uploadId = id;
      const formData = new FormData();
      const { url, fields } = presigned;

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

    // Stable permalink — pizzabase resolves it to wherever the media
    // currently lives. Pass only the basename of the storage key.
    const fileName = (filePath ?? "").split("/").pop() || "";
    this.photoUrl = `${process.env.PIZZA_BASE_DOMAIN}/uploads/${fileName}`;
  }

  private handleLocationSelected({ formattedAddress, locationName }: { formattedAddress: string; locationName: string }) {
    this.locationName = locationName;

    const addressInput = document.getElementById("formatted_address") as HTMLInputElement;
    if (addressInput) {
      addressInput.value = formattedAddress;
    }
  }

  private clearFormError(field: string): void {
    const { [field]: _remove, ...rest } = this.submitError;
    this.submitError = rest;
  }

  private resetForm({ keepSuccess = false }: { keepSuccess?: boolean } = {}) {
    this.submitError = {};
    this.locationName = "";
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
    this.showLocationInput = true;
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
