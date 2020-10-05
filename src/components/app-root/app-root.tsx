import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "app-root",
  styleUrl: "app-root.scss",
})
export class AppRoot {
  public render() {
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
              <stencil-route url="/activity" component="page-activity" />
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
                  <label htmlFor="mce-EMAIL">Sign up for updates</label>
                  <input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="email address" required />
                  <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button" />
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
              </ul>
              <ul class="social">
                <li>
                  <a class="twitter" href="https://twitter.com/pizzatothepolls" target="blank">
                    <img alt="Twitter" src="/images/twitter.svg" />
                  </a>
                </li>
                <li>
                  <a class="facebook" href="https://facebook.com/pizzatothepolls" target="blank">
                    <img alt="Facebook" src="/images/facebook.svg" />
                  </a>
                </li>
                <li>
                  <a class="instagram" href="https://www.instagram.com/pizzatothepolls/" target="blank">
                    <img alt="Instagram" src="/images/instagram.svg" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </Host>
    );
  }
}
