import { Build, Component, h, Host, State } from "@stencil/core";

interface Token {
  email: string;
  card: {
    address_zip: string;
  };
  id: string;
  amount: number;
}

@Component({
  tag: "page-donate",
  styleUrl: "page-donate.scss",
})
export class PageDonate {
  @State() private amount?: number | null;
  @State() private showConfirmation: boolean = false;
  @State() private canNativeShare: boolean = false;

  public componentWillLoad() {
    document.title = `Donate | Pizza to the Polls`;
  }

  public render() {
    let handler: any = null;
    const StripeCheckout: any = (window as any).StripeCheckout;

    // Get referral from URL
    const urlParams = new URLSearchParams(window.location.search);
    const referral = urlParams.get("referral") || "";

    if (Build.isBrowser && StripeCheckout) {
      const tokenHandler = async (token: Token) => {
        const params: { [key: string]: any } = {
          "entry.1599572815": token.email,
          "entry.690252188": token.card.address_zip,
          "entry.1474063298": token.id,
          "entry.1036377864": this.amount,
          "entry.104127523": document.domain,
          "entry.901888082": referral,
        };

        const body = Object.keys(params).reduce((form, key) => {
          form.append(key, params[key]);
          return form;
        }, new FormData());

        await fetch("https://docs.google.com/forms/d/e/1FAIpQLSf5RPXqXaVk8KwKC7kzthukydvA9vL7_bP9V9O9PIAiXl14cQ/formResponse", { body, mode: "no-cors", method: "POST" });

        this.showConfirmation = true;
      };

      handler = StripeCheckout.configure({
        key: process.env.STRIPE_PUBLIC_KEY,
        image: "https://polls.pizza/images/logo.png",
        locale: "auto",
        token: tokenHandler,
      });

      // Determine if `navigator.share` is supported in browser (native device sharing)
      this.canNativeShare = navigator && navigator.share ? true : false;
    }

    const getAmount = (): number | null => {
      const checked = document.querySelector("input[name=amount]:checked") as HTMLInputElement;
      const custom = document.getElementById("custom-amount") as HTMLInputElement;
      const amount = custom.value ? custom.value : checked?.value;

      return amount.length > 0 ? Number(amount) : null;
    };

    const handleChange = () => (this.amount = getAmount());
    const handleCheckout = (e: Event) => {
      if (this.amount) {
        const pizzas = Math.ceil(this.amount / 20);

        handler?.open({
          name: "Pizza to the Polls",
          description: "About " + pizzas + " Pizza" + (pizzas > 1 ? "s" : ""),
          zipCode: true,
          amount: this.amount * 100,
          image: "https://polls.pizza/images/logo.png",
        });
      }
      e.preventDefault();
    };

    // Donation Sharing
    const shareText =
      "I just donated" + (this.amount ? " $" + this.amount : "") + " to Pizza to the Polls to help keep Democracy Delicious this year - you should too! #democracyisdelicious";
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
        <div class="donate">
          <div class="container">
            <h1>Donate</h1>
            <p>Waiting in line sucks. Waiting in line with pizza sucks a little less.</p>
            <p>Keep our polling places joyful and welcoming places where no one has an empty stomach by chipping into the pizza fund today.</p>

            <form id="donate-form" onChange={handleChange} onSubmit={handleCheckout} hidden={this.showConfirmation}>
              <legend>Choose an amount</legend>
              <ul>
                <li>
                  <label class="radio" htmlFor="radio-1">
                    <input type="radio" value="20" id="radio-1" name="amount" />
                    $20 🍕
                  </label>
                </li>
                <li>
                  <label class="radio" htmlFor="radio-2">
                    <input type="radio" value="40" id="radio-2" name="amount" />
                    $40 🍕🍕
                  </label>
                </li>
                <li>
                  <label class="radio" htmlFor="radio-3">
                    <input type="radio" value="60" id="radio-3" name="amount" />
                    $60 🍕🍕🍕
                  </label>
                </li>
                <li>
                  <label class="radio" htmlFor="radio-4">
                    <input type="radio" value="100" id="radio-4" name="amount" />
                    $100 🍕🍕🍕🍕🍕
                  </label>
                </li>
                <li>
                  <label htmlFor="radio-5" class="radio">
                    <input type="radio" value="200" id="radio-5" name="amount" />
                    $200 🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕
                  </label>
                </li>
              </ul>
              <div class="radio">
                <label htmlFor="custom-amount">Other:</label> $
                <input type="text" name="amount" id="custom-amount" />
              </div>
              <p>
                Pizza to the Polls is incorporated as a 501(c)(4) nonprofit social welfare organization. Contributions or gifts to Pizza to the Polls are not tax deductible. Our
                activities are 501(c)(3) compliant.
              </p>
              <button onClick={handleCheckout} class={`submit ${this.amount ? "" : "is-disabled"}`}>
                Donate
              </button>
            </form>

            <div id="donate-confirmation" class="message" hidden={!this.showConfirmation}>
              <h3>Thanks for helping make the pizza magic&nbsp;happen!</h3>
              <p>Thanks for donating {this.amount ? "$" + this.amount : null} to Pizza to the Polls. You'll receive a receipt in your email&nbsp;soon.</p>

              <p>Help spread the word by sharing your donation!</p>

              <button id="share-donation" onClick={nativeShare} class={"button " + (this.canNativeShare ? "" : "is-hidden")}>
                <img alt="Share" src="/images/share.svg" />
                <span>Share your donation!</span>
              </button>

              <div class={"share-donation-link-container " + (this.canNativeShare ? "can-native-share" : "")}>
                <ul class="share-donation-links">
                  <li>
                    <a class="share-donation-link twitter" href={shareTwitterLink} rel="noopener noreferrer" target="popup" onClick={openSharePopup} title="Share to Twitter">
                      <img alt="Twitter" src="/images/twitter.svg" />
                      <span>Share on Twitter</span>
                    </a>
                  </li>
                  <li>
                    <a class="share-donation-link facebook" href={shareFacebookLink} rel="noopener noreferrer" target="popup" onClick={openSharePopup} title="Share to Facebook">
                      <img alt="Facebook" src="/images/facebook.svg" />
                      <span>Share on Facebook</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
