import { Component, h, Host, State } from "@stencil/core";

// Debounce function for back-to-top scroll event
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced as (...args: Parameters<F>) => ReturnType<F>;
};

@Component({
  tag: "app-root",
  styleUrl: "app-root.scss",
})
export class AppRoot {
  @State() private scrollTop: number = 0;
  @State() private scrollTopThreshold: number = 300;
  @State() private longPageThreshold: number = 2200;
  @State() private showBackToTop: boolean = false;

  public render() {
    const getScrollTop = () => {
      // Determine if long page
      if (document.body.scrollHeight || document.documentElement.scrollHeight) {
        this.showBackToTop = Math.max(document.body.scrollHeight || 0, document.documentElement.scrollTop || 0) > this.longPageThreshold;
      } else {
        this.showBackToTop = false;
      }
      // Get offset
      return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };

    this.scrollTop = getScrollTop();
    if (window) {
      window.addEventListener(
        "scroll",
        debounce(() => {
          this.scrollTop = getScrollTop();
        }, 200),
      );
    }

    const scrollBackToTop = (e?: Event) => {
      e?.preventDefault();
      (e?.target as HTMLElement)?.blur();
      if (window) {
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
        this.scrollTop = 0;
      }
    };

    return (
      <Host>
        <header class="header">
          <stencil-route-link url="/">
            <img src="/images/lockup.png" alt="Pizza to the Polls" />
          </stencil-route-link>
          <ul class="menu" id="menu">
            <li>
              <stencil-route-link url="/report">Report</stencil-route-link>
            </li>
            <li>
              <stencil-route-link url="/donate">Donate</stencil-route-link>
            </li>
            <li>
              <stencil-route-link url="/about">About</stencil-route-link>
            </li>
          </ul>
        </header>

        <main>
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url="/" component="page-home" exact={true} />
              <stencil-route url="/donate" component="page-donate" />
              <stencil-route url="/report" component="page-report" />
              <stencil-route url="/about" component="page-about" />
              <stencil-route url="/trucks" component="page-trucks" />
              <stencil-route url="/partners" component="page-partners" />
              <stencil-route url="/on-demand" component="page-on-demand" />
              <stencil-route url="/covid" component="page-covid" />
              <stencil-route url="/press" component="page-press" />
              <stencil-route url="/instructions" component="page-instructions" />
              <stencil-route url="/guidelines" component="page-guidelines" />
              <stencil-route url="/activity" component="page-activity" />
              <stencil-route url="/privacy" component="page-privacy" />
              <stencil-route component="page-home" />
            </stencil-route-switch>
          </stencil-router>
        </main>

        <footer>
          <div class="container">
            <div
              id="mc_embed_signup"
              class="clearfix"
              style={{
                clear: "left",
                width: "100%",
                maxWidth: "500px",
                margin: "0 auto 40px auto",
              }}
            >
              <form
                action="https://pizza.us14.list-manage.com/subscribe/post?u=ff4b828d01c30e7ef1de2e24b&amp;id=a2d940b77b"
                method="post"
                id="mc-embedded-subscribe-form"
                name="mc-embedded-subscribe-form"
                class="validate"
                target="_blank"
                noValidate
              >
                <div id="mc_embed_signup_scroll">
                  <label class="label" htmlFor="mce-EMAIL">
                    Sign up for updates
                  </label>
                  <input type="email" value="" name="EMAIL" class="input email email-signup-input" id="mce-EMAIL" placeholder="Your email address" autocomplete="on" required />
                  <input type="submit" value="Sign up" name="subscribe" id="mc-embedded-subscribe" class="button is-teal email-signup-button" />
                  <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
                    <input type="text" name="b_ff4b828d01c30e7ef1de2e24b_a2d940b77b" tabindex="-1" value="" readOnly />
                  </div>
                </div>
              </form>
            </div>
            <div class="footer-nav">
              <ul>
                <li>
                  <stencil-route-link url="/about">About</stencil-route-link>
                </li>
                <li>
                  <stencil-route-link url="/partners">Partners</stencil-route-link>
                </li>
                <li>
                  <stencil-route-link url="/press">Press</stencil-route-link>
                </li>
                <li>
                  <a href="mailto:morequestions@polls.pizza">Contact us</a>
                </li>
              </ul>
              <ul>
                <li>
                  <stencil-route-link url="/trucks">Food trucks</stencil-route-link>
                </li>
                <li>
                  <stencil-route-link url="/on-demand">On-demand</stencil-route-link>
                </li>
                <li>
                  <stencil-route-link url="/covid">COVID safety</stencil-route-link>
                </li>
                <li>
                  <stencil-route-link url="/privacy">Privacy Policy</stencil-route-link>
                </li>
              </ul>
              <ul class="social">
                <li>
                  <a class="twitter" href="https://twitter.com/pizzatothepolls" target="blank">
                    <img class="icon" alt="Twitter" src="/images/icons/twitter.svg" />
                  </a>
                </li>
                <li>
                  <a class="facebook" href="https://facebook.com/pizzatothepolls" target="blank">
                    <img class="icon" alt="Facebook" src="/images/icons/facebook.svg" />
                  </a>
                </li>
                <li>
                  <a class="instagram" href="https://www.instagram.com/pizzatothepolls/" target="blank">
                    <img class="icon" alt="Instagram" src="/images/icons/instagram.svg" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
        {this.scrollTop > this.scrollTopThreshold && this.showBackToTop && (
          <span onClick={scrollBackToTop} class={"back-to-top " + (this.scrollTop > this.scrollTopThreshold && this.showBackToTop ? "is-active" : "")} title="Back to top"></span>
        )}
      </Host>
    );
  }
}
