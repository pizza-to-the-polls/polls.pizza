import { Build, Component, h, Host, Prop, State } from "@stencil/core";
import { RouterHistory } from "@stencil/router";

import { PizzaApi } from "../../api";

const AMOUNTS = [5, 10, 20];

@Component({
  tag: "page-crustclub",
  styleUrl: "page-crustclub.scss",
})
export class PageCrustclub {
  @State() private amount?: number | null;
  @State() private showConfirmation: boolean = false;
  @State() private canNativeShare: boolean = false;
  @State() private referral?: string | null;
  @State() private error?: string | null;
  @Prop() public history?: RouterHistory;

  public componentWillLoad() {
    document.title = `Crust Club | Pizza to the Polls`;
    this.referral = this.history?.location.query.referral || "";

    const isPostDonate = !!this.history?.location.query.success;
    const amountDonatedUsd = this.history?.location.query.amount_usd ? parseFloat(this.history?.location.query.amount_usd as string) : null;
    if (amountDonatedUsd) {
      if (isPostDonate) {
        this.amount = amountDonatedUsd;
        this.showConfirmation = true;
      } else {
        this.amount = AMOUNTS.includes(amountDonatedUsd) ? amountDonatedUsd : null;
      }
    }
  }

  public async donate(amount: number) {
    this.error = null;
    const showError = this.showError;
    try {
      const { success, checkoutSessionId, message } = await PizzaApi.postDonation("subscription", amount, { referrer: this.referral });

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
        if (message) {
          console.error(message);
        }
        this.showError(message || PizzaApi.genericErrorMessage);
      }
    } catch (e) {
      console.error(e);
      this.showError(PizzaApi.genericErrorMessage);
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

    const getAmount = (): number | null => {
      const checked = document.querySelector("input[name=level]:checked") as HTMLInputElement;
      return checked ? Number(checked.value) : null;
    };

    const handleChange = () => (this.amount = getAmount());
    const handleCheckout = (e: Event) => {
      if (this.amount) {
        this.donate(this.amount);
      } else {
        this.showError("Whoops! You need to select a level to give");
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
    const shareText =
      "I'm joining the Crust Club and giving" +
      shareAmount +
      " to Pizza to the Polls each month to help keep Democracy Delicious this year - you should too! #democracyisdelicious";
    const shareUrl = "https://polls.pizza/crustclub"; // add URL tracking parameters here, if desired

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
        <ui-main-content background="red">
          <ui-card>
            <img class="logo logo-mobile is-hidden-tablet is-hidden-desktop" alt="Crust Club Logo" src="/images/crustclub.png" />
            <img class="logo logo-desktop is-hidden-mobile" alt="Crust Club Logo" src="/images/crustclub.png" />

            <h1>{this.showConfirmation ? "Welcome to Crust Club!" : "Join Crust Club"}</h1>

            {!this.showConfirmation && (
              <div>
                <div class="donation-intro">
                  <p>Waiting in line is a bummer. Waiting in line with pizza is a little less of a bummer.</p>
                  <p>
                    Keep our locations of civic engagement joyful and welcoming places where no one has an empty stomach by setting up a monthly donation. Become one of our biggest
                    supporters today by joining Crust Club!
                  </p>
                </div>

                <form id="donate-form" onChange={handleChange} onSubmit={handleCheckout}>
                  <label class="label">Choose an amount to give each month</label>
                  <ul class="donation-amount-list">
                    {AMOUNTS.map((amount, idx) => (
                      <li>
                        <label class="radio" htmlFor={`radio-${idx + 1}`}>
                          <input type="radio" value={amount} id={`radio-${idx + 1}`} name="level" checked={this.amount === amount} />
                          <span class="label-text">
                            ${amount} / month {"🍕".repeat(amount / 5)}
                          </span>
                          <span class="label-deets">
                            <strong>Impact:</strong> Your donation will feed {amount * 5} people in long lines per year
                          </span>
                          <span class="indicator"></span>
                        </label>
                      </li>
                    ))}
                    <li>
                      <p>Your first online gift will be charged to your credit card today. All subsequent charges will occur on the same date each month.</p>
                    </li>
                  </ul>
                  <button
                    onClick={handleCheckout}
                    class={"button is-teal is-fullwidth " + (!this.amount || isNaN(this.amount) ? "is-disabled" : "")}
                    disabled={!this.amount || isNaN(this.amount) || (this.error || "").length > 0}
                  >
                    Become a Member
                  </button>
                  {this.error && (
                    <div id="donation-error" class="help has-text-red">
                      <p>{this.error}</p>
                    </div>
                  )}
                  <p>Pizza to the Polls is a 501(c)(3) nonpartisan, nonprofit public charity. All contributions are tax deductible.</p>
                  <p>
                    Need help? <stencil-route-link url="/contact">Contact us</stencil-route-link>.
                  </p>
                </form>
              </div>
            )}

            {this.showConfirmation && (
              <div id="donate-confirmation">
                <h3>Thanks for helping to make the pizza magic happen!</h3>
                <p>Thanks for joining Crust Club. You'll receive a receipt in your email&nbsp;soon.</p>

                <p>Help spread the word by sharing your membership!</p>

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
                      <stencil-route-link url="/donate" class="button is-fullwidth-mobile is-cyan">
                        Make a one-time donation
                      </stencil-route-link>
                    </li>
                    <li>
                      <stencil-route-link url="/sign-in" class="button is-blue is-fullwidth-mobile">
                        Manage your membership
                      </stencil-route-link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </ui-card>
        </ui-main-content>
      </Host>
    );
  }
}
