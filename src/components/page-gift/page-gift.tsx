import { Build, Component, h, Host, Prop, State } from "@stencil/core";
import { RouterHistory } from "@stencil/router";

import { baseFetch } from "../../api/PizzaApi";

@Component({
  tag: "page-gift",
  styleUrl: "page-gift.scss",
})
export class PageGift {
  @State() private amount?: number | null;
  @State() private giftName?: string | null;
  @State() private giftEmail?: string | null;
  @State() private showConfirmation: boolean = false;
  @State() private canNativeShare: boolean = false;
  @State() private referral?: string | null;
  @State() private error?: string | null;
  @Prop() public history?: RouterHistory;

  public componentWillLoad() {
    document.title = `Give Pizza | Pizza to the Polls`;
    this.referral = this.history?.location.query.referral || "";

    const isPostDonate = !!this.history?.location.query.success;
    const amountDonatedUsd = this.history?.location.query.amount_usd;
    const giftName = this.history?.location.query.gift_name;

    if (isPostDonate && amountDonatedUsd) {
      this.amount = parseFloat(amountDonatedUsd as string);
      this.giftName = giftName as string;
      this.showConfirmation = true;
    }
  }

  public async donate(amount: number) {
    this.error = null;
    const showError = this.showError;
    try {
      const resp = await baseFetch(`/donations`, {
        body: JSON.stringify({
          amountUsd: amount,
          referrer: this.referral,
          giftName: this.giftName,
          giftEmail: this.giftEmail,
          url: `${document.location}`,
        }),
        method: "POST",
      });

      if (resp.status === 200) {
        const { success, checkoutSessionId, message } = await resp.json();
        if (success) {
          const sessionId = checkoutSessionId;
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
          console.error(message);
          this.showError(message);
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

    const getGift = (name: string): string | null => {
      const elem = document.querySelector(`input[name=${name}]`) as HTMLInputElement;
      return (elem?.value || "").length > 0 ? elem?.value : null;
    };

    const handleChange = () => {
      this.amount = getAmount();
      this.giftName = getGift("giftName");
      this.giftEmail = getGift("giftEmail");
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
    const shareText = "I just gave" + shareAmount + " worth of Pizza to the Polls as a gift to help keep Democracy Delicious this year - you should too! #democracyisdelicious";
    const shareUrl = "https://polls.pizza/gift"; // add URL tracking parameters here, if desired

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
      this.history?.replace("/gift/", {});
      e.preventDefault();
    };

    return (
      <Host>
        <ui-main-content background="red">
          <ui-card>
            <h1>Give Pizza to the Polls 🎁</h1>

            {!this.showConfirmation && (
              <div>
                <div class="donation-intro">
                  <p>Give someone you care about the gift of Pizza to the Polls - and we'll send them an email that you're contributing to the pizza fund in their name.</p>
                  <p>We use the pizza fund to keep our locations of civic engagement joyful and welcoming places where no one has an empty stomach.</p>
                </div>

                <form id="donate-form" onChange={handleChange} onSubmit={handleCheckout}>
                  <label class="label">
                    Choose an amount <span class="required">*</span>
                  </label>
                  <ul class="donation-amount-list">
                    <li>
                      <label class="radio" htmlFor="radio-1">
                        <input type="radio" value="40" id="radio-1" name="amount" />
                        <span class="label-text">$40 🍕🍕</span>
                        <span class="indicator"></span>
                      </label>
                    </li>
                    <li>
                      <label class="radio" htmlFor="radio-2">
                        <input type="radio" value="80" id="radio-2" name="amount" />
                        <span class="label-text">$80 🍕🍕🍕</span>
                        <span class="indicator"></span>
                      </label>
                    </li>
                    <li>
                      <label class="radio" htmlFor="radio-3">
                        <input type="radio" value="100" id="radio-3" name="amount" />
                        <span class="label-text">$100 🍕🍕🍕🍕🍕</span>
                        <span class="indicator"></span>
                      </label>
                    </li>
                    <li>
                      <label class="radio" htmlFor="radio-4">
                        <input type="radio" value="$120" id="radio-4" name="amount" />
                        <span class="label-text">$120 🍕🍕🍕🍕🍕</span>
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
                  <p>
                    <label class="label">
                      Their Name <span class="required">*</span>
                    </label>
                    <input class="input" type="text" name="giftName" id="giftName" onInput={handleChange} autocomplete="off" />
                  </p>
                  <p>
                    <label class="label">
                      Their Email <span class="required">*</span>
                    </label>
                    <input class="input" type="email" name="giftEmail" id="giftEmail" onInput={handleChange} autocomplete="off" />
                  </p>

                  <button
                    onClick={handleCheckout}
                    class={"button is-red is-fullwidth-mobile " + (!this.amount || isNaN(this.amount) ? "is-disabled" : "")}
                    disabled={!this.amount || isNaN(this.amount) || !this.giftName || !this.giftEmail || (this.error || "").length > 0}
                  >
                    Send Gift
                  </button>
                  {this.error && (
                    <div id="donation-error" class="help has-text-red">
                      <p>{this.error}</p>
                    </div>
                  )}
                  <p>
                    We are currently incorporated as a 501(c)(4) nonprofit social welfare organization, however all of our activities are 501(c)(3) compliant. Contributions or
                    gifts to Pizza to the Polls are not tax deductible.
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
                  to Pizza to the Polls on behalf of {this.giftName}. You'll receive a receipt in your email&nbsp;soon.
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
                  <a href="#" class="button" onClick={resetDonationForm}>
                    Give another gift
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
