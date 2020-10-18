import { Component, h, State } from "@stencil/core";

import { getTotals } from "../../lib/sheets";

@Component({
  tag: "page-home",
  styleUrl: "page-home.scss",
})
export class PageHome {
  @State() public pizzas: string = "";
  @State() public locations: string = "";
  @State() public states: string = "";
  @State() public raised: string = "";

  public async componentWillLoad() {
    document.title = `Home | Pizza to the Polls`;

    const { raised } = await getTotals();

    const resp = await fetch(`${process.env.PIZZA_BASE_DOMAIN}/totals/2020`, {
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });
    const { pizzas, locations, states } = await resp.json();

    this.pizzas = pizzas;
    this.locations = locations;
    this.states = states;
    this.raised = `\$${raised}`;
  }

  public render() {
    return (
      <div>
        <section class="hero">
          <div class="intro">
            <div class="container">
              <p>Pizza to the Polls is making democracy delicious by delivering free food for all to polling places with long lines.</p>
              <p>Send us reports of long lines and we'll send in the delicious reinforcements.</p>
            </div>
          </div>
          <div class="dashboard">
            <div class="container">
              <div class="stats">
                <h2 class="display">2020 Election Totals</h2>
                <div class="stats__row">
                  <div class="stat">
                    <span class="stat__number">{this.pizzas}</span>
                    <span class="stat__label">Pizzas sent</span>
                  </div>
                  <div class="stat">
                    <span class="stat__number">{this.locations}</span>
                    <span class="stat__label">Polling places</span>
                  </div>
                  <div class="stat">
                    <span class="stat__number">{this.states}</span>
                    <span class="stat__label">States</span>
                  </div>
                  <div class="stat">
                    <span class="stat__number">{this.raised}</span>
                    <span class="stat__label">Raised in 2020</span>
                  </div>
                </div>
                <a href="/report" class="button primary">
                  Report a line
                </a>
                <a href="/activity" class="stat__link">
                  View recent deliveries
                </a>
              </div>
            </div>
            <div class="dashboard-bg"></div>
          </div>
        </section>
        <section class="home-secondary">
          <div class="container">
            <p>Pizza to the Polls is a nonpartisan, nonprofit initiative founded in 2016 with a simple mission: deliver food to crowded polling locations.</p>
            <a href="/donate" class="button secondary">
              Donate
            </a>
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
