import { Build, Component, h, Host, Prop, State } from "@stencil/core";

import { PizzaApi } from "../../api";

const AMOUNTS = [5, 10, 20, 50, 100];

@Component({
  tag: "form-donate",
  styleUrl: "form-donate.scss",
})
export class FormDonate {
  @Prop() public referral?: string;
  @Prop() public showConfirmation: boolean = false;
  @Prop() public initialDonationType: string = "donation";
  @Prop() public initialAmount?: number | null;
  @Prop() public redirectURL?: string | null;

  @State() private donationType: string = "donation";
  @State() private amount?: number | null;
  @State() private enteredOther?: boolean = false;
  @State() private canNativeShare: boolean = false;
  @State() private error?: string | null;

  public componentWillLoad() {
    this.donationType = this.initialDonationType || this.donationType;
    if (this.initialAmount) {
      if (this.showConfirmation) {
        this.amount = this.initialAmount;
      } else {
        this.amount = AMOUNTS.includes(this.initialAmount) ? this.initialAmount : null;
      }
    }
  }

  public async donate(amount: number) {
    this.error = null;
    try {
      const extra: { referrer?: string; url?: string } = { referrer: this.referral };
      if (this.redirectURL) {
        extra.url = this.redirectURL;
      }
      await PizzaApi.postDonation(this.donationType, amount, extra);
    } catch (e) {
      console.error(e);
      this.showError(e.message || PizzaApi.genericErrorMessage);
    }
  }

  public showError(error: string) {
    this.error = error;
  }

  public render() {
    if (Build.isBrowser) {
      // Determine if `navigator.share` is supported in browser (native device sharing)
      this.canNativeShare = navigator && navigator.share ? true : false;
    }

    const activateCustomAmountRadio = () => {
      this.enteredOther = true;

      const selected = document.getElementById("input[name=amount]:checked") as HTMLInputElement;
      const custom = document.getElementById("custom-amount-radio") as HTMLInputElement;

      if (selected) {
        selected.checked = false;
        this.amount = null;
      }
      if (custom) {
        custom.checked = true;
      }
    };

    const getAmount = (): number | null => {
      const checked = document.querySelector("input[name=amount]:checked") as HTMLInputElement;
      const custom = document.getElementById("custom-amount") as HTMLInputElement;

      if (checked?.value && custom) {
        this.enteredOther = false;
        custom.value = "";
      }
      const amount = custom?.value ? custom.value : checked?.value;

      return amount && amount.length > 0 ? Number(amount) : null;
    };

    const getAmountForCheck = (): number | null | undefined => (this.enteredOther ? 0 : this.amount);

    const getDonationType = (): string => {
      const checked = document.querySelector("input[name=donationType]:checked") as HTMLInputElement;
      return checked?.value || "donation";
    };

    const handleChange = () => {
      this.error = null;
      this.amount = getAmount();
      this.donationType = getDonationType();
    };
    const handleCheckout = (e: Event) => {
      if (this.amount) {
        if (this.amount >= 0.5) {
          this.donate(this.amount);
        } else {
          this.showError("Whoops! Donations must be $0.50 or greater.");
        }
      }
      e.preventDefault();
    };

    // Donation Sharing
    const shareAmount = this.amount
      ? " $" +
        Number(this.amount)
          .toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(/\.00/g, "")
      : "";
    const shareText = "I just donated" + shareAmount + " to Pizza to the Polls to help keep Democracy Delicious this year - you should too! #democracyisdelicious";
    const shareUrl = "https://polls.pizza/donate"; // add URL tracking parameters here, if desired

    // Native sharing on device via `navigator.share` - supported on mobile, tablets, and some browsers
    const nativeShare = async () => {
      if (!navigator || !navigator.share) {
        this.canNativeShare = false;
        return;
      }

      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Sharing failed", error);
      }
    };

    // Fallback if native sharing is not available
    let metaDescription = document.querySelector("meta[name='description']");
    let shareDescription = "";
    if (metaDescription) {
      shareDescription = metaDescription.getAttribute("content") || "";
    }

    const shareTwitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}&via=PizzaToThePolls`;

    const shareFacebookLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&title=${encodeURIComponent(shareText)}&description=${encodeURIComponent(
      shareDescription,
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

    return (
      <Host>
        {!this.showConfirmation && (
          <div>
            <form id="donate-form" onChange={handleChange} onSubmit={handleCheckout}>
              <div class="form-item ">
                <label class="label">One time or monthly</label>
                <div class="radio-group social-radio-group">
                  <label class="radio" htmlFor="donation-type-donation" onClick={handleChange}>
                    <input type="radio" value="donation" id="donation-type-donation" name="donationType" checked={this.donationType === "donation"} />
                    <span class="label-text">One time</span>
                    <span class="indicator"></span>
                  </label>
                  <label class="radio" htmlFor="donation-type-subscription" onClick={handleChange}>
                    <input type="radio" value="subscription" id="donation-type-subscription" name="donationType" checked={this.donationType === "subscription"} />
                    <span class="label-text">Monthly</span>
                    <span class="indicator"></span>
                  </label>
                </div>
              </div>

              <label class="label">Choose an amount</label>
              <ul class="donation-amount-list">
                {AMOUNTS.map((amount, idx) => (
                  <li>
                    <label class="radio" htmlFor={`radio-${idx + 1}`}>
                      <input type="radio" value={amount} id={`radio-${idx + 1}`} name="amount" checked={getAmountForCheck() === amount} />
                      <span class="label-text">
                        ${amount} {"🍕".repeat(idx + 1)}
                      </span>
                      <span class="indicator"></span>
                    </label>
                  </li>
                ))}

                <li>
                  {this.donationType === "subscription" ? (
                    <p>Your first online gift will be charged to your credit card today. All subsequent charges will occur on the same date each month.</p>
                  ) : (
                    <label class="radio" htmlFor="custom-amount" onClick={activateCustomAmountRadio}>
                      <input type="radio" id="custom-amount-radio" name="amount" value="" />
                      <span class="label-text" id="custom-amount-text">
                        Other: $
                      </span>
                      <input class="input" type="text" name="amount" id="custom-amount" onInput={handleChange} autocomplete="off" />
                      <span class="indicator"></span>
                    </label>
                  )}
                </li>
              </ul>
              <button
                onClick={handleCheckout}
                class={"button is-cyan is-fullwidth " + (!this.amount || isNaN(this.amount) ? "is-disabled" : "")}
                disabled={!this.amount || isNaN(this.amount) || (this.error || "").length > 0}
              >
                Donate
              </button>
              {this.error && (
                <div id="donation-error" class="help has-text-red">
                  <p>{this.error}</p>
                  <a class="button is-blue is-fullwidth-mobile" target="_blank" href={`https://paypal.me/pizzatothepolls/${this.amount || "0.0"}`}>
                    Donate via PayPal
                  </a>
                </div>
              )}
              <p>Pizza to the Polls is a 501(c)(3) nonpartisan, nonprofit public charity. Contributions are tax deductible.</p>
            </form>
          </div>
        )}

        {this.showConfirmation && (
          <div id="donate-confirmation">
            <h3>Thanks for helping to make the pizza magic happen!</h3>

            <p>Help spread the word by sharing your donation!</p>

            {this.canNativeShare && (
              <button id="share-donation" onClick={nativeShare} class="button is-blue is-fullwidth-mobile">
                <img class="icon" alt="Share" src="/images/icons/share.svg" />
                <span>Share your donation!</span>
              </button>
            )}

            <div class={"share-donation-link-container " + (this.canNativeShare ? "can-native-share" : "")}>
              <ul class="share-donation-links">
                <li>
                  <a
                    class="share-donation-link button is-twitter is-fullwidth-mobile"
                    href={shareTwitterLink}
                    rel="noopener noreferrer"
                    target="popup"
                    onClick={openSharePopup}
                    title="Share to Twitter"
                  >
                    <img class="icon" alt="Twitter" src="/images/icons/twitter.svg" />
                    <span>Share on Twitter</span>
                  </a>
                </li>
                <li>
                  <a
                    class="share-donation-link button is-facebook is-fullwidth-mobile"
                    href={shareFacebookLink}
                    rel="noopener noreferrer"
                    target="popup"
                    onClick={openSharePopup}
                    title="Share to Facebook"
                  >
                    <img class="icon" alt="Facebook" src="/images/icons/facebook.svg" />
                    <span>Share on Facebook</span>
                  </a>
                </li>
                <li>
                  <stencil-route-link url="/donate" class="button is-fullwidth-mobile" exact={true}>
                    Make another donation
                  </stencil-route-link>
                </li>
              </ul>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
