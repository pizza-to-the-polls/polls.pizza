import { Build, Component, h, Host, Prop, State } from "@stencil/core";
import { RouterHistory } from "@stencil/router";

@Component({
  tag: "page-donate",
  styleUrl: "page-donate.scss",
})
export class PageDonate {
  @State() private amount?: number | null;
  @State() private showConfirmation: boolean = false;
  @State() private canNativeShare: boolean = false;
  @State() private referral?: string | null;
  @State() private error?: string | null;
  @Prop() public history?: RouterHistory;

  public componentWillLoad() {
    document.title = `Donate | Pizza to the Polls`;
    this.referral = this.history?.location.query.referral || "";

    const isPostDonate = !!this.history?.location.query.success;
    const amountDonatedUsd = this.history?.location.query.amount_usd;
    if (isPostDonate && amountDonatedUsd) {
      this.amount = parseFloat(amountDonatedUsd as string);
      this.showConfirmation = true;
    }
  }

  public async donate(amount: number) {
    this.error = null;
    const showError = this.showError;
    try {
      const resp = await fetch(`${process.env.PIZZA_BASE_DOMAIN}/donations`, {
        body: JSON.stringify({ amountUsd: amount, referrer: this.referral }),
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
      });

      if (resp.status === 200) {
        const respJson = await resp.json();
        if (respJson.success) {
          const sessionId = respJson.checkoutSessionId;
          const stripe: any = (window as any).Stripe(process.env.STRIPE_PUBLIC_KEY);

          stripe
            .redirectToCheckout({
              sessionId,
            })
            .then(function (result: any) {
              console.error(result.error.message);
              showError(result.error.message);
            });
        } else {
          console.error(respJson.message);
          this.showError(respJson.message);
        }
      } else {
        this.showError("Whoops! That didn't work. Our servers might be a little stuffed right now.");
      }
    } catch (e) {
      console.error(e);
      this.showError("Whoops! That didn't work. Our servers might be a little stuffed right now.");
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
      const form = document.getElementById("donate-form") as HTMLFormElement;
      if (form) {
        this.amount = null;
        form.reset();
      }
      document.getElementById("custom-amount-radio")?.setAttribute("checked", "true");
    };

    const getAmount = (): number | null => {
      const checked = document.querySelector("input[name=amount]:checked") as HTMLInputElement;
      const custom = document.getElementById("custom-amount") as HTMLInputElement;
      if (checked && checked.value) {
        custom.value = "";
      }
      const amount = custom.value ? custom.value : checked?.value;

      return amount.length > 0 ? Number(amount) : null;
    };

    const handleChange = () => (this.amount = getAmount());
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

    const resetDonationForm = (e: Event) => {
      this.showConfirmation = false;
      this.amount = null;
      const form = document.getElementById("donate-form") as HTMLFormElement;
      if (form) {
        form.reset();
      }
      // Remove any query parameters
      this.history?.replace("/donate/", {});
      e.preventDefault();
    };

    return (
      <Host>
        <ui-main-content background="red">
          <ui-card>
            <h1>Donate</h1>

            {!this.showConfirmation && (
              <div>
                <div class="donation-intro">
                  <p>Waiting in line sucks. Waiting in line with pizza sucks a little less.</p>
                  <p>Keep our locations of civic engagement joyful and welcoming places where no one has an empty stomach by chipping into the pizza fund today.</p>
                </div>

                <form id="donate-form" onChange={handleChange} onSubmit={handleCheckout}>
                  <label class="label">
                    Choose an amount <span class="required">*</span>
                  </label>
                  <ul class="donation-amount-list">
                    <li>
                      <label class="radio" htmlFor="radio-1">
                        <input type="radio" value="20" id="radio-1" name="amount" />
                        <span class="label-text">$20 🍕</span>
                        <span class="indicator"></span>
                      </label>
                    </li>
                    <li>
                      <label class="radio" htmlFor="radio-2">
                        <input type="radio" value="40" id="radio-2" name="amount" />
                        <span class="label-text">$40 🍕🍕</span>
                        <span class="indicator"></span>
                      </label>
                    </li>
                    <li>
                      <label class="radio" htmlFor="radio-3">
                        <input type="radio" value="60" id="radio-3" name="amount" />
                        <span class="label-text">$60 🍕🍕🍕</span>
                        <span class="indicator"></span>
                      </label>
                    </li>
                    <li>
                      <label class="radio" htmlFor="radio-4">
                        <input type="radio" value="100" id="radio-4" name="amount" />
                        <span class="label-text">$100 🍕🍕🍕🍕🍕</span>
                        <span class="indicator"></span>
                      </label>
                    </li>
                    <li>
                      <label class="radio" htmlFor="radio-5">
                        <input type="radio" value="200" id="radio-5" name="amount" />
                        <span class="label-text">$200 🍕🍕🍕🍕🍕🍕🍕🍕🍕</span>
                        <span class="indicator"></span>
                      </label>
                    </li>
                    <li>
                      <label class="radio" htmlFor="custom-amount" onClick={activateCustomAmountRadio}>
                        <input type="radio" id="custom-amount-radio" name="amount" value="" />
                        <span class="label-text" id="custom-amount-text">
                          Other: $
                        </span>
                        <input class="input" type="text" name="amount" id="custom-amount" onInput={handleChange} autocomplete="off" />
                        <span class="indicator"></span>
                      </label>
                    </li>
                  </ul>
                  <button
                    onClick={handleCheckout}
                    class={"button is-red is-fullwidth-mobile " + (!this.amount || isNaN(this.amount) ? "is-disabled" : "")}
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
                  <p>
                    Pizza to the Polls is incorporated as a 501(c)(4) nonprofit social welfare organization. Contributions or gifts to Pizza to the Polls are not tax deductible.
                    Our activities are 501(c)(3) compliant.
                  </p>
                  <p>
                    Need help? <stencil-route-link url="/contact">Contact us</stencil-route-link>.
                  </p>
                </form>
              </div>
            )}

            {this.showConfirmation && (
              <div id="donate-confirmation">
                <h3>Thanks for helping make the pizza magic&nbsp;happen!</h3>
                <p>
                  Thanks for donating{" "}
                  {this.amount
                    ? " $" +
                      Number(this.amount)
                        .toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                        .replace(/\.00/g, "")
                    : null}{" "}
                  to Pizza to the Polls. You'll receive a receipt in your email&nbsp;soon.
                </p>

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
                  </ul>
                </div>
                <p>
                  <a href="#" class="button has-text-teal" onClick={resetDonationForm}>
                    Make another donation
                  </a>
                </p>
              </div>
            )}
          </ui-card>
        </ui-main-content>
      </Host>
    );
  }
}
