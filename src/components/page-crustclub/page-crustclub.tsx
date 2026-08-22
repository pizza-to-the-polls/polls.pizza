import { Component, h, Host, Prop, State } from "@stencil/core";
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
    try {
      await PizzaApi.postDonation("subscription", amount, { referrer: this.referral });
    } catch (e) {
      console.error(e);
      this.showError(e.message || PizzaApi.genericErrorMessage);
    }
  }

  public showError(error: string) {
    this.error = error;
  }

  public render() {
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

    return (
      <Host>
        <ui-main-content>
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
              <ui-share-links
                shareText={shareText}
                shareUrl={shareUrl}
                additionalLinks={
                  <div>
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
                  </div>
                }
              >
                <h3>Thanks for helping to make the pizza magic happen!</h3>
                <p>Thanks for joining Crust Club. You'll receive a receipt in your email&nbsp;soon.</p>

                <p>Help spread the word by sharing your membership!</p>
              </ui-share-links>
            )}
          </ui-card>
        </ui-main-content>
      </Host>
    );
  }
}
