import { Component, h, Host, Prop, State } from "@stencil/core";
import { RouterHistory } from "@stencil/router";

import { PizzaApi } from "../../api";

const AMOUNTS = [20, 40, 80, 100, 120, 200];

@Component({
  tag: "page-gift",
  styleUrl: "page-gift.scss",
})
export class PageGift {
  @State() private amount?: number | null;
  @State() private enteredOther?: boolean = false;
  @State() private giftName?: string | null;
  @State() private giftEmail?: string | null;
  @State() private showConfirmation: boolean = false;
  @State() private referral?: string | null;
  @State() private error?: string | null;
  @Prop() public history?: RouterHistory;

  public componentWillLoad() {
    document.title = `Give Pizza | Pizza to the Polls`;
    this.referral = this.history?.location.query.referral || "";

    const isPostDonate = !!this.history?.location.query.success;
    const giftName = this.history?.location.query.gift_name;
    const amountDonatedUsd = this.history?.location.query.amount_usd ? parseFloat(this.history?.location.query.amount_usd as string) : null;

    if (amountDonatedUsd) {
      if (isPostDonate) {
        this.amount = amountDonatedUsd;
        this.giftName = giftName as string;
        this.showConfirmation = true;
      } else {
        this.amount = AMOUNTS.includes(amountDonatedUsd) ? amountDonatedUsd : null;
      }
    }
  }

  public async donate(amount: number) {
    this.error = null;
    try {
      await PizzaApi.postDonation("donation", amount, {
        referrer: this.referral,
        giftName: this.giftName,
        giftEmail: this.giftEmail,
      });
    } catch (e) {
      console.error(e);
      this.showError(e.message || PizzaApi.genericErrorMessage);
    }
  }

  public showError(error: string) {
    this.error = error;
  }

  public render() {
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

    const getGift = (name: string): string | null => {
      const elem = document.querySelector(`input[name=${name}]`) as HTMLInputElement;
      return (elem?.value || "").length > 0 ? elem?.value : null;
    };

    const handleChange = () => {
      this.error = null;
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
        <ui-main-content>
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
                    class={"button is-cyan is-fullwidth-mobile " + (!this.amount || isNaN(this.amount) ? "is-disabled" : "")}
                    disabled={!this.amount || isNaN(this.amount) || !this.giftName || !this.giftEmail || (this.error || "").length > 0}
                  >
                    Send Gift
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
                  <li>
                    <a href="#" class="button" onClick={resetDonationForm}>
                      Give another gift
                    </a>
                  </li>
                }
              >
                <h3>Thanks for helping to make the pizza magic happen!</h3>
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
              </ui-share-links>
            )}
          </ui-card>
        </ui-main-content>
      </Host>
    );
  }
}
