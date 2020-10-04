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
          <h1 class="display">
            <stencil-route-link url="/">
              Pizza to
              <img src="/images/logo.png" />
              the Polls
            </stencil-route-link>
          </h1>
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
              <stencil-route url="/" component="app-home" exact={true} />
              <stencil-route url="/donate" component="page-donate" />
              <stencil-route url="/report" component="page-report" />
              <stencil-route url="/about" component="page-about" />
            </stencil-route-switch>
          </stencil-router>
        </main>

        <footer>
          <div class="container">
            <ul class="utility-nav">
              <li>
                <stencil-route-link url="/press">Press</stencil-route-link>
              </li>
              <li>
                <stencil-route-link url="/about">About</stencil-route-link>
              </li>
              <li>
                <a href="mailto:morequestions@polls.pizza">Contact</a>
              </li>
            </ul>
            <div
              id="mc_embed_signup"
              class="clearfix"
              style={{
                clear: "left",
                width: "100%",
                maxWidth: "600px",
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
                  <label htmlFor="mce-EMAIL">Sign up for updates from Pizza to the Polls</label>
                  <input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="email address" required />
                  <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button" />
                  <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
                    <input type="text" name="b_ff4b828d01c30e7ef1de2e24b_a2d940b77b" tabindex="-1" value="" readOnly />
                  </div>
                </div>
              </form>
            </div>

            <div class="clearfix">
              <a href="mailto:morequestions@polls.pizza">morequestions@polls.pizza</a> |<a href="https://twitter.com/PizzaToThePolls">@PizzaToThePolls</a> |
              <a href="https://facebook.com/PizzaToThePolls">On Facebook</a> |<a href="https://instagram.com/PizzaToThePolls">On Instagram</a>
            </div>
          </div>
        </footer>
      </Host>
    );
  }
}
