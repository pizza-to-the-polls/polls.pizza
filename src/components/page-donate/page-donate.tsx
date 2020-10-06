import { Component, h, Host, State } from "@stencil/core";

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

  public componentWillLoad() {
    document.title = `Donate | Pizza to the Polls`;
  }

  public render() {
    const StripeCheckout: any = (window as any).StripeCheckout;

    const tokenHandler = async (token: Token) => {
      const params: { [key: string]: any } = {
        "entry.1599572815": token.email,
        "entry.690252188": token.card.address_zip,
        "entry.1474063298": token.id,
        "entry.1036377864": this.amount,
        "entry.104127523": document.domain,
      };

      const body = Object.keys(params).reduce((form, key) => {
        form.append(key, params[key]);
        return form;
      }, new FormData());

      await fetch("https://docs.google.com/forms/d/e/1FAIpQLSf5RPXqXaVk8KwKC7kzthukydvA9vL7_bP9V9O9PIAiXl14cQ/formResponse", { body, mode: "no-cors", method: "POST" });

      this.showConfirmation = true;
    };

    const handler = StripeCheckout.configure({
      key: "pk_test_YCa5It9RFIu9vLPZSmRcTKYD",
      image: "https://polls.pizza/images/logo.png",
      locale: "auto",
      token: tokenHandler,
    });

    const getAmount = (): number | null => {
      const checked = document.querySelector("input[name=amount]:checked") as HTMLInputElement;
      const custom = document.getElementById("custom-amount") as HTMLInputElement;
      const amount = custom.value ? custom.value : checked?.value;

      return amount.length > 0 ? Number(amount) * 100 : null;
    };

    const handleChange = () => (this.amount = getAmount());
    const handleCheckout = (e: Event) => {
      if (this.amount) {
        const pizzas = Math.ceil(this.amount / 100 / 20);

        handler.open({
          name: "Pizza to the Polls",
          description: "About " + pizzas + " Pizza" + (pizzas > 1 ? "s" : ""),
          zipCode: true,
          amount: this.amount,
          image: "https://polls.pizza/images/logo.png",
        });
      }
      e.preventDefault();
    };

    return (
      <Host>
        <div class="donate">
          <div class="container">
            <h1>Donate</h1>
            <p>Waiting in line sucks. Waiting in line with pizza sucks a little less.</p>
            <p>Keep our polling places joyful and welcoming places where no one has an empty stomach by chipping into the pizza fund today.</p>

            <form id="donate-form" onChange={handleChange} onSubmit={handleCheckout}>
              <legend>How many pizzas do you wanna fund?</legend>
              <ul>
                <li>
                  <input type="radio" value="20" id="radio-1" name="amount" />
                  <label class="radio" htmlFor="radio-1">
                    1 pizza ($20) 🍕
                  </label>
                </li>
                <li>
                  <input type="radio" value="40" id="radio-2" name="amount" />
                  <label class="radio" htmlFor="radio-2">
                    2 pizzas ($40) 🍕🍕
                  </label>
                </li>
                <li>
                  <input type="radio" value="60" id="radio-3" name="amount" />
                  <label class="radio" htmlFor="radio-3">
                    3 pizzas ($60 ) 🍕🍕🍕
                  </label>
                </li>
                <li>
                  <input type="radio" value="100" id="radio-4" name="amount" />
                  <label class="radio" htmlFor="radio-4">
                    5 pizzas ($100) 🍕🍕🍕🍕🍕
                  </label>
                </li>
                <li>
                  <input type="radio" value="200" id="radio-5" name="amount" />
                  <label htmlFor="radio-5" class="radio">
                    10 pizzas ($200) 🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕
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
              <h3>Thanks for helping make the pizza magic happen!</h3>
              <p>Thanks for donating ${this.amount} to Pizza to the Polls. You'll receive a receipt in your email soon.</p>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
