import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-donate",
  styleUrl: "page-donate.scss",
})
export class PageDonate {
  public componentWillLoad() {
    document.title = `Donate | Pizza to the Polls`;
  }
  public render() {
    return (
      <Host>
        <div class="donate">
          <div class="container">
            <h1>Donate</h1>
            <p>Waiting in line sucks. Waiting in line with pizza sucks a little less.</p>
            <p>Keep our polling places joyful and welcoming places where no one has an empty stomach by chipping into the pizza fund today.</p>

            <form id="donate-form">
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
              <button class="submit is-disabled" id="checkout">
                Donate
              </button>
            </form>
            <div id="donate-confirmation" class="message" hidden>
              <h3>Thanks for helping make the pizza magic happen!</h3>
              <p id="donate-confirmation-message"></p>
              <p>Why not spread the word?</p>
              <a
                href="https://twitter.com/share?ref_src=twsrc%5Etfw"
                class="twitter-share-button"
                data-size="large"
                data-text="I just donated to @pizzatothepolls! You can give today at"
                data-url="https://polls.pizza"
                data-show-count="false"
              >
                Tweet
              </a>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
