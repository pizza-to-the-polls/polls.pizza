import { Build, Component, h, State } from "@stencil/core";

import { PizzaApi, PizzaTotals } from "../../api";

@Component({
  tag: "page-home",
  styleUrl: "page-home.scss",
})
export class PageHome {
  @State() private totals?: PizzaTotals;
  @State() public available: string = "";

  public async componentWillLoad() {
    document.title = `Home | Pizza to the Polls`;

    if (Build.isBrowser) {
      PizzaApi.getTotals().then(totals => {
        this.totals = totals;
        const { raised, costs } = totals;

        // Calculate available before transforming values
        this.available =
          raised && costs
            ? "$" +
              (raised - costs).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            : "";
      });
    }
  }

  public render() {
    return (
      <div>
        <div class="hero">
          <div class="hero-image-container"></div>
          <div class="tagline">
            <div class="container">
              <p>Our mission is to deliver free food to people who are waiting in long lines while participating in civic life.</p>
              <a class="button is-red" href="/donate">
                Donate to feed democracy
              </a>
              <p class="donate-button-subtext"><sup>*</sup> All contributions are tax deductible</p>
            </div>
          </div>
        </div>
        <section class="totals">
          <div class="container">
            <h2 class="is-display has-text-centered">All-Time Totals</h2>
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
                  <h2 id="report" class="is-display is-scroll-to no-pointer-events">
                    Report a line
                  </h2>
                  <p>
                    <strong>
                      Pizza to the Polls is making democracy delicious by delivering free food for all to polling places with long lines. We're also sending 'za and tasty snacks to
                      people who are waiting in long lines while participating in other forms of civic life. Send us reports of long lines wherever people are doing their civic
                      duty and we'll send in the delicious reinforcements.
                    </strong>
                  </p>
                </form-report>
              </ui-card>
            </div>
          </div>
        </section>
        <section class="how-we-do-it">
          <div class="container">
            <h2 class="has-text-white">How we do it</h2>
            <div class="cards">
              <div class="card">
                <h3>Food Trucks</h3>
                <img src="/images/truck.jpg" alt="Food truck" />
                <p>For the 2020 election season, we launched a food truck program in 29 cities around the country for early voting and election day. </p>
                <a href="/trucks">Learn more</a>
              </div>
              <div class="card">
                <h3>On Demand</h3>
                <img src="/images/on-demand.jpg" alt="Pizza at a polling location" />
                <p>Our signature program is back and we need you to help by reporting crowded polling places and then sticking around to make sure food gets delivered safely.</p>
                <a href="/on-demand">Learn more</a>
              </div>
              <div class="card">
                <h3>Vax and Snacks</h3>
                <img src="/images/vax.jpg" alt="People holding slices of pizza" />
                <p>Pizza to the Polls switched gears in 2021 to fulfill another need: sending pizzas and other snacks to COVID-19 vaccination sites with long lines!</p>
                <a href="/vax-and-snacks">Learn more</a>
              </div>
            </div>
          </div>
        </section>
        <section class="press">
          <h2>Learn more about our work</h2>
          <div class="container">
            <a href="https://www.nytimes.com/2020/11/03/opinion/volunteers-election-2020.html" target="_blank">
              <img src="/images/press/nyt.png" alt="New York Times" />
            </a>
            <a href="https://www.cnn.com/2020/09/21/politics/pizza-polling-early-voting-election/index.html" target="_blank">
              <img src="/images/press/cnn.png" alt="CNN" />
            </a>
            <a href="https://www.buzzfeednews.com/article/skbaer/long-lines-election-day-2020" target="_blank">
              <img src="/images/press/buzzfeed.png" alt="Buzzfeed" />
            </a>
            <a href="https://www.oprahdaily.com/life/a34483172/pizza-to-the-polls-long-lines/" target="_blank">
              <img src="/images/press/oprah.png" alt="Oprah Daily" />
            </a>
          </div>
        </section>
      </div>
    );
  }
}
