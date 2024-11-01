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
    // this conditional is here because the build's prerender phase fails without it.
    if (typeof window !== "undefined" && typeof window.ga !== "undefined") {
      // when the app initializes, newRoute has a blank pathname and it would run, so this conditional stops that.
      if (newRoute.pathname) {
        window.ga("send", "pageview", newRoute.pathname);
      }
    }
  }

  public render() {
    return (
      <Host>
        <header class="header">
          <div class="logo">
            <stencil-route-link url="/" exact={true}>
              <img src="/images/logo.png" alt="Pizza to the Polls" />
              Pizza to the Polls
            </stencil-route-link>
          </div>
          <ul class="menu" id="menu">
            <li>
              <stencil-route-link url="/report">🍕 Send pizza</stencil-route-link>
            </li>
            <li>
              <stencil-route-link url="/donate">💵 Donate</stencil-route-link>
            </li>
            <li>
              <stencil-route-link url="/about">📢 About</stencil-route-link>
            </li>
            <li>
              <stencil-route-link url="/faq">💬 FAQ</stencil-route-link>
            </li>
          </ul>
        </header>

        <main>
          <stencil-router>
            <stencil-route-switch scrollTopOffset={1}>
              <stencil-route url="/" component="page-home" exact={true} />
              <stencil-route url="/billie" component="page-donate" />
              <stencil-route url="/about" component="page-about" />
              <stencil-route url="/faq" component="page-faq" />
              <stencil-route url="/activity" component="page-activity" />
              <stencil-route url="/contact" component="page-contact" />
              <stencil-route url={["/deliveries/:location/:order", "/deliveries/:location", "/deliveries"]} component="page-deliveries" />
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
              <stencil-route url="/report" component="page-report" />
              <stencil-route url="/trucks" component="page-trucks" />
              <stencil-route url="/vax-and-snacks" component="page-vax-and-snacks" />
              <stencil-route component="page-home" />
            </stencil-route-switch>
          </stencil-router>
        </main>

        <footer>
          <ui-main-content pageType="full-bleed">
            <div class="footer-nav">
              <div class="left">
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
                    <stencil-route-link url="/privacy">Privacy Policy</stencil-route-link>
                  </li>
                </ul>
                <p class="disclaimer">
                  Pizza to the Polls is a nonpartisan, nonprofit organization whose purposes are (i) to educate individuals about America's institutions, citizens' civic duties and
                  opportunities, and (ii) to increase turnout and ensure all people are well-informed about their civic obligations.
                </p>
              </div>
              <div class="right">
                <ul class="social">
                  <li>
                    <a class="x" href="https://x.com/pizzatothepolls" target="blank">
                      <img class="icon" alt="X" src="/images/icons/x.svg" />
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
                  <li>
                    <a class="tiktok" href="https://www.tiktok.com/@pizzatothepolls/" target="blank">
                      <img class="icon" alt="TikTok" src="/images/icons/tiktok.svg" />
                    </a>
                  </li>
                  <li>
                    <a class="threads" href="https://www.threads.net/@pizzatothepolls/" target="blank">
                      <img class="icon" alt="Threads" src="/images/icons/threads.svg" />
                    </a>
                  </li>
                  <li>
                    <a class="bluesky" href="https://bsky.app/profile/polls.pizza" target="blank">
                      <img class="icon" alt="Bluesky" src="/images/icons/bluesky.svg" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </ui-main-content>
        </footer>
        <ui-scroll-to-top-button />
      </Host>
    );
  }
}

injectHistory(AppRoot);
