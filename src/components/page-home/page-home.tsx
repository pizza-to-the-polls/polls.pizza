import { Component, h, State } from "@stencil/core";

import { PizzaApi, PizzaTotals } from "../../api";
import { scrollPageToTop } from "../../util";

@Component({
  tag: "page-home",
  styleUrl: "page-home.scss",
})
export class PageHome {
  @State() private totals?: PizzaTotals;
  @State() public available: string = "";

  public async componentWillLoad() {
    document.title = `Home | Pizza to the Polls`;

    PizzaApi.getTotals().then(totals =>
      PizzaApi.getDonations().then(raised => {
        this.totals = { ...totals, raised };

        // Calculate available before transforming values
        this.available =
          raised && totals.costs
            ? "$" +
              (raised - totals.costs).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            : "";
      }),
    );
  }

  public componentDidLoad() {
    if (!window.location.hash) {
      scrollPageToTop();
    }
  }

  public render() {
    return (
      <div>
        <section class="hero-section">
          <div class="container">
            <h2 class="is-display has-text-centered">2020 Election Totals</h2>
            <div class="stats-row">
              <div class="stat">
                <span class="stat-number">
                  <ui-dynamic-text value={this.totals?.pizzas} format={x => x.toLocaleString()} />
                </span>
                <span class="stat-label">Pizzas sent</span>
              </div>
              <div class="stat">
                <span class="stat-number">
                  <ui-dynamic-text value={this.totals?.states} format={x => x.toLocaleString()} />
                </span>
                <span class="stat-label">States</span>
              </div>
              <div class="stat">
                <span class="stat-number">
                  <ui-dynamic-text value={this.totals?.locations} format={x => x.toLocaleString()} />
                </span>
                <span class="stat-label">Polling places</span>
              </div>
            </div>
          </div>
          <div class="report">
            <div class="container">
              <ui-card class="report-content">
                <form-report>
                  <h2 id="report" class="is-display is-scroll-to">
                    Report a line
                  </h2>
                  <p>
                    <strong>Pizza to the Polls is making democracy delicious by delivering free food for all to polling places with long lines.</strong>
                  </p>
                  <p>Send us reports of long lines and we'll send in the delicious reinforcements.</p>
                </form-report>
                <br />
                <p>
                  <stencil-route-link url="/activity" anchorClass="has-text-teal">
                    View recent deliveries
                  </stencil-route-link>
                </p>
              </ui-card>
            </div>
            <div class="report-bg"></div>
          </div>
        </section>
        <section class="donate">
          <div class="container">
            <ui-card class="donate-content">
              <h2 class="is-display">Donation Totals</h2>
              <p>
                <strong>Pizza to the Polls is a nonpartisan, nonprofit initiative founded in 2016 with a simple mission: deliver food to crowded polling locations.</strong>
              </p>
              <div class="stats-row">
                <div class="stat">
                  <span class="stat-number">
                    <ui-dynamic-text value={this.totals?.raised} format={x => `\$${x.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} />
                  </span>
                  <span class="stat-label">Raised in 2020</span>
                </div>
                <div class="stat">
                  <span class="stat-number">
                    <ui-dynamic-text value={this.totals?.costs} format={x => `\$${x.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} />
                  </span>
                  <span class="stat-label">Total Spent</span>
                </div>
              </div>
              <stencil-route-link url="/donate" anchorClass="button is-red">
                Donate to feed democracy
              </stencil-route-link>
            </ui-card>
          </div>
        </section>
        <section class="how-we-do-it">
          <div class="container">
            <h2 class="has-text-white">How we do it</h2>
            <div class="cards">
              <div class="card">
                <h3>Food trucks</h3>
                <img src="/images/truck.jpg" alt="Food truck" />
                <p>For the 2020 election season, we’re launching a food truck program in 25 cities around the country for early voting and election day. </p>
                <a href="/trucks">Learn more</a>
              </div>
              <div class="card">
                <h3>On-demand</h3>
                <img src="/images/pics/photo_5.jpg" alt="Pizza at a polling location" />
                <p>Our signature program is back and we need you to help by reporting crowded polling places and then sticking around to make sure food gets delivered safely.</p>
                <a href="/on-demand">Learn more</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
