import { Component, h, Host, Prop, State } from "@stencil/core";
import { RouterHistory } from "@stencil/router";

import { ApiError, PizzaApi, ReportPostResults } from "../../api";
import { trackEvent } from "../../util/analytics";
import shaFile from "../../util/shaFile";

// Shared with pizzabase
const PHONE_REGEX = /^[+]?(1\-|1\s|1|\d{3}\-|\d{3}\s|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/;

/**
 * Georgia's Senate Bill 22 (SB 22, 2025) makes it illegal to give anything of
 * value — including food and beverages — to voters waiting in line at or
 * near a polling place, so reports from Georgia polling places cannot be
 * accepted. Mirrors GEORGIA_ERROR in pizzabase (src/lib/validator/constants.ts)
 * — keep the copy in sync.
 */
const GEORGIA_ERROR = "Whoops! Georgia's Senate Bill 22 (SB 22) bans giving food or beverages to voters waiting in line, so we can't accept reports for polling places in Georgia.";

const GEORGIA_STATE_CODE = "GA";

/**
 * Google formatted addresses put the two-letter state right before the zip
 * ("206 Washington St SW, Atlanta, GA 30334, USA"). Fallback for the
 * formattedAddress prop path, where the place's addressComponents aren't
 * available to us — the API/validator is the authoritative check.
 */
const stateFromFormattedAddress = (formattedAddress: string): string => {
  const match = formattedAddress?.match(/,\s*([A-Za-z]{2})\s+\d{5}/);
  return match ? match[1].toUpperCase() : "";
};

const isGeorgiaState = (state: string): boolean => state.trim().toUpperCase() === GEORGIA_STATE_CODE;

/**
 * The S3 POST failed at the network layer on every attempt AND the follow-up
 * verification confirmed the bytes never landed — the photo definitely did
 * not upload. Distinct from a plain TypeError, where the request may still
 * have reached the bucket (a fetch can fail on the response leg after the
 * request landed) and the honest copy is "may have reached us".
 */
class UploadDidNotLandError extends Error {
  constructor() {
    super("photo upload did not land in the bucket");
    this.name = "UploadDidNotLandError";
  }
}

@Component({
  tag: "form-report",
  styleUrl: "form-report.scss",
})
export class FormReport {
  @Prop() public formattedAddress?: string;
  // Injected by stencil-router via the routed page (page-report). The SPA
  // route guard (see armUnsavedUploadGuard) needs it; optional because the
  // component also renders outside a routed context (e2e, previews).
  @Prop() public history?: RouterHistory;

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
  /**
   * Value of the hidden #formatted_address input. State-driven (not the
   * @Prop formattedAddress) so a Georgia pick can clear it (SB 22) and
   * Stencil re-renders keep it cleared.
   */
  @State() private addressInputValue: string = "";
  /** Two-letter state of the selected location ("" until one is picked). */
  private selectedState: string = "";
  @State() private reportType: string = "photo"; // "social" | "photo"
  @State() private hasPhoto: boolean = false;
  @State() private hasVideo: boolean = false;
  @State() private photoUrl: string = "";
  @State() private uploadId: number | null = null;
  @State() private videoUrl: string = "";
  @State() private userClickedGuidelinesLink: boolean = true;

  public componentWillLoad() {
    // Funnel start: the form component itself mounted (GA4 session entry).
    trackEvent("report_form_start");
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
      const videoPreview = document.getElementById("video-preview") as HTMLVideoElement;

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
        // Captured from the upload response so the analytics event can carry
        // the duplicate flag without leaking anything user-typed.
        let uploadDuplicate = false;
        // Set when a network-failed S3 POST was verified landed (duplicate
        // response) and the attach completed anyway — a distinct funnel flag
        // so analytics can tell the recovered path from a clean upload.
        let verifiedAfterFailure = false;

        // Network-layer failure classifier. A raw fetch rejection is a
        // TypeError, but PizzaApi's baseFetch swallows those for POST calls
        // and handleResponse re-throws them as ApiError objects with
        // errors.network set — same event, different shape. Either way the
        // request may have landed server-side, so the honest copy is
        // "may have reached us — pick again" (the dedupe skips the S3 POST).
        const isNetworkFailure = (e: unknown) => e instanceof TypeError || Boolean((e as ApiError)?.errors?.network);

        // The uploader's failure path is fully handled (inline form message),
        // so @bugsnag/js never sees it — it only auto-reports *unhandled*
        // errors. Notify explicitly (2026-10-28: a volunteer's recurring
        // upload failures left no trace in Bugsnag, so the S3 fan-out it
        // caused went undiagnosed for a day). Same window-client pattern as
        // componentLoadGuard; PII-free metadata only — no address, no hash,
        // no presigned URL.
        // Build a readable Bugsnag headline. Thrown values on this path are
        // either real Errors (TypeError, UploadDidNotLandError) or
        // ApiError-shaped objects ({ isError, status, errors }) with no
        // .message — String() on those used to render "[object Object]",
        // hiding the HTTP status and server text from the error headline.
        const buildUploadErrorMsg = (e: unknown): string => {
          if (e instanceof Error) return `Photo upload failed: ${e.message}`;
          const apiErr = e as { status?: number; errors?: { fileName?: string } };
          const parts: string[] = [];
          if (typeof apiErr.status === "number") parts.push(`HTTP ${apiErr.status}`);
          if (apiErr.errors?.fileName) parts.push(`— ${apiErr.errors.fileName}`);
          return parts.length > 0 ? `Photo upload failed: ${parts.join(" ")}` : `Photo upload failed: ${String(e)}`;
        };

        const notifyUploadError = (error: unknown) => {
          try {
            if (typeof window !== "undefined" && (window as any).__pizza_bugsnag_started) {
              const bugsnag = (window as any).__pizza_bugsnag_client;
              if (bugsnag !== undefined && typeof bugsnag.notify === "function") {
                bugsnag.notify(new Error(buildUploadErrorMsg(error)), {
                  context: "/report",
                  severity: "warning",
                  metadata: {
                    upload: {
                      networkRetryExhausted: isNetworkFailure(error),
                      verifiedAfterFailure,
                      duplicate: uploadDuplicate,
                      uploadId: this.uploadId,
                      s3Status: (error as { status?: number })?.status ?? null,
                      file: { type: file.type, size: file.size },
                    },
                  },
                });
              }
            }
          } catch {
            // Bugsnag failure must never cascade
          }
        };

        const uploadPhoto = async (file: File, address: string): Promise<void> => {
          const fileHash = await shaFile(file);

          const { id, filePath, isDuplicate, presigned } = await PizzaApi.postUpload(fileHash, file.name, address);

          uploadDuplicate = isDuplicate;

          // Backend returns the canonical upload id on both the fresh and duplicate
          // paths — link it either way so submit always carries uploadId.
          this.uploadId = id;

          // Resolved media key: the fresh path's, or the verified canonical
          // row's when a network failure is recovered via the dedupe lookup.
          let canonicalFilePath = filePath;

          if (!isDuplicate && presigned) {
            const formData = new FormData();
            const { url, fields } = presigned;

            formData.append("Content-Type", file.type);

            // Note: ACL and x-amz-acl removed — backend now uses private buckets

            Object.entries(fields).forEach(([k, v]: [string, any]) => {
              formData.append(k, v);
            });

            formData.append("file", file);

            // Cap at ONE retry. The old loop re-PUT the entire file up to 5×:
            // a browser fetch that fails on the response leg usually landed
            // server-side anyway, so every "retry" multiplied backend
            // pipeline runs (2026-10-28: five concurrent runs, five feed
            // pictures, one photo).
            const MAX_S3_ATTEMPTS = 2;

            let landed = false;
            let lastNetworkError: unknown = null;
            for (let attempt = 1; attempt <= MAX_S3_ATTEMPTS; attempt++) {
              try {
                const awsReq = await fetch(url, {
                  method: "POST",
                  mode: "cors",
                  body: formData,
                });
                if (awsReq.status > 299) {
                  const awsError: ApiError = { isError: true, status: awsReq.status, errors: { fileName: "Whoops! That did not work - try again!" } };
                  throw awsError;
                }
                landed = true;
                break;
              } catch (error) {
                if (!(error instanceof TypeError)) {
                  // S3 answered with an error status — a definite failure,
                  // not worth another upload.
                  throw error;
                }
                // Network-layer failure: the request may have landed anyway.
                lastNetworkError = error;
              }
            }

            if (!landed && lastNetworkError) {
              // Final fallback is a VERIFICATION, not another upload: the same
              // fileHash answers whether an earlier attempt's bytes landed.
              // A duplicate response carries the canonical row and no
              // presigned POST, so nothing is re-uploaded either way.
              const verify = await PizzaApi.postUpload(fileHash, file.name, address);
              if (verify.isDuplicate) {
                // An earlier attempt landed — adopt the canonical row and
                // complete the attach with no user-visible error.
                uploadDuplicate = true;
                verifiedAfterFailure = true;
                this.uploadId = verify.id;
                canonicalFilePath = verify.filePath;
                notifyUploadError(lastNetworkError);
              } else {
                // Verified nothing landed — a definite failure, honestly stated.
                throw new UploadDidNotLandError();
              }
            }
          }

          // Stable permalink — pizzabase resolves it to wherever the media
          // currently lives (processed output, or the public bucket for legacy).
          // canonicalFilePath is the full storage key ("uploads/<name>"); the
          // permalink route is /uploads/:fileName, so pass only the basename.
          const fileName = (canonicalFilePath ?? "").split("/").pop() || "";
          this.photoUrl = `${process.env.PIZZA_BASE_DOMAIN}/uploads/${fileName}`;
          // Bytes are in the bucket from here until submit — leaving now
          // strands them with no report attached. Arm the guard (demo: arm()
          // at upload-done).
          this.armUnsavedUploadGuard();
        };

        try {
          await uploadPhoto(file, addressInput.value);
          trackEvent("report_photo_uploaded", { duplicate: uploadDuplicate, verifiedAfterFailure });
        } catch (error) {
          // Notify BEFORE removePhoto() — removePhoto clears this.uploadId,
          // and the Bugsnag metadata must link the upload row that actually
          // failed (it may exist even when the S3 POST is what failed).
          notifyUploadError(error);
          this.removePhoto();
          // Funnel the failure into GA (BUG-027): previously only the success
          // path was tracked, so upload failures were invisible in the funnel.
          // Same classifier as the copy below: a raw TypeError from the S3 POST
          // never reaches this catch when retries are exhausted — baseFetch
          // swallows TypeErrors on POST calls and re-throws the verification
          // failure as an ApiError with errors.network set — so the classifier
          // (not a bare instanceof) decides "network"; genuine HTTP responses
          // (blocked-IP 403s etc.) are "api_error". PII-free params only:
          // fixed-enum string, number, boolean.
          trackEvent("report_photo_upload_failed", {
            reason: isNetworkFailure(error) ? "network" : "api_error",
            status: (error as { status?: number })?.status ?? 0,
            duplicate: uploadDuplicate,
          });
          if (error instanceof UploadDidNotLandError) {
            // Verified the bytes never reached the bucket — say so plainly.
            this.submitError.photo = "Whoops! We couldn't reach the photo upload service — that photo didn't upload. Please try again.";
          } else if (isNetworkFailure(error)) {
            // Network failure that could NOT be verified (the verification
            // call itself failed at the network layer): the bytes may still
            // have landed, so re-picking (which dedupes and skips the S3
            // POST entirely) is the honest remedy.
            this.submitError.photo = "Network hiccup — your photo may have already reached us. Try picking the photo again.";
          } else {
            // Read the API's _general message first (BUG-030): blocked-IP
            // 403s carry { errors: { _general: "Your submission was not
            // accepted…" } } — the user must see that, not the generic
            // "could not upload" copy that also shows for network failures.
            const errors = (error as { errors?: { _general?: string; fileName?: string } })?.errors;
            this.submitError.photo = errors?._general || errors?.fileName || "Whoops! We could not upload that photo";
          }
        } finally {
          // Always reset
          this.photoIsProcessing = false;
          this.isDisabled = false;
        }
      } else {
        // No polling location selected — this fails before any network
        // request is sent and is the most common "can't upload" report
        // (BUG-027): track it so it finally shows up in the funnel.
        trackEvent("report_photo_upload_failed", { reason: "no_location" });
        this.submitError.photo = "Whoops! We could not upload that photo. Try adding a link to a social media report instead.";
        this.removePhoto();
        // Always reset
        this.photoIsProcessing = false;
        this.isDisabled = false;
      }
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
      trackEvent("report_submit_attempted");

      // Update loading
      this.isLoading = true;
      // Disable submit
      this.isDisabled = true;
      // Clear request data
      this.submitResponse = {};
      this.submitError = {};
      // Setup request
      const data: { [key: string]: string } = {};

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

      if (!this.hasPhoto && !this.hasVideo) {
        this.submitError.photo = "Whoops! Can you add a photo or video of the line to your report so we can verify this is on the level?";
      } else {
        // Always submit the stable permalink, never the local blob URL.
        data.url = this.photoUrl;
      }

      if (!data.address) {
        this.showLocationInput = true;
        this.submitError.address = "Whoops - we can't read that address";
      }

      // Georgia SB 22 — block before the POST. The API would 422 with the
      // same error; catching it here avoids the wasted round trip.
      if (isGeorgiaState(stateFromFormattedAddress(data.address) || this.selectedState)) {
        this.submitError.address = GEORGIA_ERROR;
        this.showLocationInput = true;
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
        // Field names only — never user-typed values.
        trackEvent("report_validation_error", { fields: Object.keys(this.submitError).join(",") });
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
      const requestData: {
        address: string;
        url: string;
        waitTime: string;
        canDistribute: boolean;
        contactRole: string;
        contactFirstName: string;
        contactLastName: string;
        contact: string;
        uploadId?: number;
      } = {
        address: data.address,
        url: data.url,
        waitTime: data.waitTime,
        canDistribute: true, // required, so default
        contactRole: data.contactRole,
        contactFirstName: data.contactFirstName,
        contactLastName: data.contactLastName,
        contact: data.contactPhone,
      };

      if (this.uploadId) {
        requestData.uploadId = this.uploadId;
      }

      try {
        this.submitResponse = await PizzaApi.postReport(requestData);
        trackEvent("report_submitted");

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
        // Report delivered — the upload is linked; leaving is safe again.
        this.disarmUnsavedUploadGuard();
      } catch (error) {
        trackEvent("report_submit_failed");
        const errors = (error as { errors?: { [key: string]: string } })?.errors;
        this.submitError = errors || {};

        // If invalid address, take user back to location input
        if (errors?.address) {
          this.showLocationInput = true;
          this.showConfirmation = false;
          return false;
        }

        // If invalid url, take user back to report step 2
        if (errors?.url) {
          this.showLocationInput = false;
          this.showConfirmation = false;
          return false;
        }

        // If the API rejected the submission wholesale (_general — e.g. a
        // blocked-IP 403, BUG-030), keep the form visible so the general
        // banner near the top can be read and any field errors render too.
        if (errors?._general) {
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
            <h2 class="is-display" hidden={this.showConfirmation}>
              See a long line near a polling site? Let us know where and we’ll send pizza!
            </h2>
            <div id="form-step-1" hidden={!this.showLocationInput}>
              {/* Intro content */}
              <slot></slot>
              {/* Location */}
              <div class="form-item">
                <label class="label" htmlFor="autocomplete-input-report-form">
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
                <p class="help has-text-red" hidden={!("address" in this.submitError)}>
                  {this.submitError.address}
                </p>
              </div>
              <input type="hidden" name="address" id="formatted_address" value={this.addressInputValue} />
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

              {/* General API error (e.g. blocked-IP rejection, BUG-030) */}
              <p id="form-general-error" class="help has-text-red" hidden={!("_general" in this.submitError)}>
                {this.submitError._general}
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
                        <span class="file-label">{this.hasPhoto || this.hasVideo ? "Change media" : "Add a photo or video of the line"}</span>
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
                    id="contactFirstName"
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
                    id="contactLastName"
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
                  id="contactPhone"
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
                {this.photoIsProcessing ? (this.hasVideo ? "🎬 Processing video..." : "📸 Processing photo...") : "Submit report. Feed democracy"}
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

  private handleLocationSelected({ formattedAddress, locationName, state }: { formattedAddress: string; locationName: string; state?: string }) {
    // Prefer the state straight from the place's addressComponents; fall back
    // to parsing the formatted address (the prop path has no components).
    this.selectedState = state || stateFromFormattedAddress(formattedAddress);

    if (isGeorgiaState(this.selectedState)) {
      // Georgia SB 22: block the report, show the reason inline, and keep the
      // "Report line" button disabled (locationName stays empty).
      this.locationName = "";
      this.addressInputValue = "";
      this.submitError = { ...this.submitError, address: GEORGIA_ERROR };
      trackEvent("report_location_georgia_blocked");
      return;
    }

    this.clearFormError("address");
    this.locationName = locationName;
    this.addressInputValue = formattedAddress;
    trackEvent("report_location_selected");
  }

  private handleLoadStepTwo() {
    // Georgia SB 22 — never advance past the location step for GA addresses
    // (see handleLocationSelected).
    if (isGeorgiaState(this.selectedState)) {
      return;
    }
    this.showLocationInput = false;
  }

  private clearFormError(field: string): void {
    // Remove field from existing errors
    const { [field]: _remove, ...rest } = this.submitError;
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
    this.addressInputValue = "";
    this.selectedState = "";
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

  /**
   * beforeunload guard — mirrors https://hotnready.polls.pizza/beforeunload-demo/
   *
   * Armed from the moment an upload lands (fresh or duplicate path) until
   * the photo/video is removed or the report submits: that window is where
   * leaving the page strands an uploaded photo with no report attached to
   * it. The browser's native "Leave site?" prompt covers reload/close/tab-loss.
   */
  private unsavedUploadGuardArmed = false;
  private unblockRouter?: () => void;

  /** Dialog copy shared by the unload and SPA-route guards. */
  private static readonly UNSAVED_UPLOAD_GUARD_MESSAGE = "Your uploaded photo isn't attached to a report yet — leave without submitting?";

  private readonly onBeforeUnload = (event: BeforeUnloadEvent) => {
    // Chrome requires preventDefault + a non-null returnValue for the dialog.
    event.preventDefault();
    event.returnValue = "";
  };

  private armUnsavedUploadGuard() {
    if (this.unsavedUploadGuardArmed) return;
    window.addEventListener("beforeunload", this.onBeforeUnload);
    this.unsavedUploadGuardArmed = true;
    // SPA route guard: stencil-router swaps views client-side, so beforeunload
    // never fires for <stencil-route-link> pushes or back/forward pops.
    // history.block() runs every transition through the router's
    // confirmTransitionTo — a declined POP reverts via revertPop.
    // A function prompt is required here: a string prompt would be routed
    // through getUserConfirmation, whose default in @stencil/router 1.0.1 has
    // a mismatched signature ((win, message, callback) called as
    // (message, callback)) and throws; a function prompt is called directly.
    // Returning "" = confirmed (string, proceed); false = declined (cancel).
    if (this.history) {
      this.unblockRouter = this.history.block(() => (window.confirm(FormReport.UNSAVED_UPLOAD_GUARD_MESSAGE) ? "" : false) as unknown as string);
    }
  }

  private disarmUnsavedUploadGuard() {
    if (!this.unsavedUploadGuardArmed) return;
    window.removeEventListener("beforeunload", this.onBeforeUnload);
    this.unsavedUploadGuardArmed = false;
    if (this.unblockRouter) {
      this.unblockRouter();
      this.unblockRouter = undefined;
    }
  }

  disconnectedCallback() {
    this.disarmUnsavedUploadGuard();
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
    // Deliberately discarding the upload — nothing left to guard.
    this.disarmUnsavedUploadGuard();
    if (imagePreview) {
      imagePreview.style.backgroundImage = "";
    }
    if (videoPreview) {
      videoPreview.src = "";
    }
    this.photoIsProcessing = false;
  }
}
