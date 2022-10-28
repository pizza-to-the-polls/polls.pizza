import { Build } from "@stencil/core";
import { Component, h, Host, Prop, Watch } from "@stencil/core";
import { injectHistory, LocationSegments } from "@stencil/router";

import { PizzaApi } from "../../api";

// this fixes a build error where the ga var was not found, because it is declared in index.html
// declare var ga: any;

declare global {
  interface Window {
    ga: any;
  }
}

@Component({
  tag: "app-root",
  styleUrl: "app-root.scss",
})
export class AppRoot {
  @Prop() public location: LocationSegments | undefined;

  public componentWillLoad() {
    // Ensure the backend is loaded by hitting a health check
    if (Build.isBrowser) {
      PizzaApi.getHealth();
    }
  }

  @Watch("location") public onRouteChange(newRoute: { pathname: string }) {
    // when the app initializes, newRoute has a blank pathname and it would run, so this conditional stops that.
    if (newRoute.pathname) {
      window.ga("send", "pageview", newRoute.pathname);
    }
  }

  public render() {
    return (
      <Host>
        <header class="header">
          <stencil-route-link url="/" exact={true}>
            <img src="/images/lockup.png" alt="Pizza to the Polls" />
          </stencil-route-link>
          <ul class="menu" id="menu">
            <li>
              <stencil-route-link url="/" exact={true}>
                Report
              </stencil-route-link>
            </li>
            <li>
              <stencil-route-link url="/donate">Donate</stencil-route-link>
            </li>
            <li>
              <stencil-route-link url="/deliveries">Deliveries</stencil-route-link>
            </li>
            <li>
              <stencil-route-link url="/about">About</stencil-route-link>
            </li>
          </ul>
        </header>

        <main>
          <stencil-router>
            <stencil-route-switch scrollTopOffset={1}>
              <stencil-route url="/" component="page-home" exact={true} />
              <stencil-route url="/about" component="page-about" />
              <stencil-route url="/activity" component="page-activity" />
              <stencil-route url="/covid" component="page-covid" />
              <stencil-route url="/contact" component="page-contact" />
              <stencil-route url={["/deliveries/:location", "/deliveries"]} component="page-deliveries" />
              <stencil-route url="/donate" component="page-donate" />
              <stencil-route url="/gift" component="page-gift" />
              <stencil-route url="/crustclub" component="page-crustclub" />
              <stencil-route url={["/sign-in", "/session/:token"]} component="page-session" />
              <stencil-route url="/guidelines" component="page-guidelines" />
              <stencil-route url="/instructions" component="page-instructions" />
              <stencil-route url="/on-demand" component="page-on-demand" />
              <stencil-route url="/partners" component="page-partners" />
              <stencil-route url="/press" component="page-press" />
              <stencil-route url="/privacy" component="page-privacy" />
              <stencil-route url="/report" routeRender={() => <stencil-router-redirect url="/" />} />
              <stencil-route url="/trucks" component="page-trucks" />
              <stencil-route url="/vax-and-snacks" component="page-vax-and-snacks" />
              <stencil-route component="page-home" />
            </stencil-route-switch>
          </stencil-router>
        </main>

        <footer>
          <ui-main-content background="none">
            <p class="disclaimer">
              Pizza to the Polls is a nonpartisan, nonprofit organization whose purposes are (i) to educate individuals about America's institutions, citizens' civic duties and
              opportunities, and (ii) to increase turnout and ensure all people are well-informed about their civic obligations.
            </p>
            <div
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
                name="mc-embedded-subscribe-form"
                target="_blank"
                noValidate
              >
                <ui-single-input label="Sign up for updates" buttonLabel="Sign up" type="email" name="EMAIL" placeholder="Your email address">
                  <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
                    <input type="text" name="b_ff4b828d01c30e7ef1de2e24b_a2d940b77b" tabindex="-1" value="" readOnly />
                  </div>
                </ui-single-input>
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
                  <stencil-route-link url="/contact">Contact Us</stencil-route-link>
                </li>
              </ul>
              <ul>
                <li>
                  <stencil-route-link url="/trucks">Food Trucks</stencil-route-link>
                </li>
                <li>
                  <stencil-route-link url="/on-demand">On Demand</stencil-route-link>
                </li>
                <li>
                  <stencil-route-link url="/vax-and-snacks">Vax and Snacks</stencil-route-link>
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
          </ui-main-content>
        </footer>
        <ui-scroll-to-top-button />
      </Host>
    );
  }
}

injectHistory(AppRoot);
