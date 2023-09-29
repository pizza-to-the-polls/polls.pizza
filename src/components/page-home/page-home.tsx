import { Build, Component, h, State } from "@stencil/core";

import { OrderDetails, PizzaApi, PizzaTotals } from "../../api";

import Deliveries from "./Deliveries";
import Stats from "./Stats";
import Tweets from "./Tweets";

@Component({
  tag: "page-home",
  styleUrl: "page-home.scss",
})
export class PageHome {
  @State() private totals?: PizzaTotals;
  @State() private orders?: OrderDetails[];
  @State() public available: string = "";

  public async componentWillLoad() {
    document.title = `Home | Pizza to the Polls`;

    if (Build.isBrowser) {
      PizzaApi.getTotals().then(totals => (this.totals = totals));
      PizzaApi.getOrders(0, 5).then(({ results }) => (this.orders = results));
    }
  }

  public render() {
    return (
      <div>
        <div class="hero">
          <div class="container">
            <div>
              <h1>Help feed democracy</h1>
              <p>Our mission is to deliver free food to people who are participating in civic life, from long lines at polling places to nonpartisan events focused on voter
                education, registration, and turnout.</p>
              <div class="button-group">
                <a class="button button-large is-cyan" href="/donate">
                  Donate now
                </a>
                <span class="donate-button-subtext">* All contributions are tax deductible</span>
              </div>
            </div>
            <div>
              <img src="/images/hero.png" alt="collage of pepperoni pizza, pizza ingredients and a pizza to the polls volunteer" />
            </div>
          </div>
        </div>
        <section class="totals">{this.totals && <Stats totals={this.totals} />}</section>
        <section class="tweets-deliveries">
          <div class="container">
            <Tweets />
            <Deliveries orders={this.orders} />
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
