import { Component, h } from "@stencil/core";

@Component({
  tag: "app-home",
  styleUrl: "app-home.scss",
})
export class AppHome {
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
                <div class="stats__row"></div>
                <a href="/report" class="button primary">Report a line</a>
                <a href="/activity" class="stat__link">View recent deliveries</a>
              </div>
            </div>
            <div class="dashboard-bg"></div>
          </div>
        </section>
        <section class="home-secondary">
          <div class="container">
            <p>Pizza to the Polls is a nonpartisan, nonprofit initiative founded in 2016 with a simple mission: deliver food to crowded polling locations.</p>
            <a href="/donate" class="button secondary">Donate</a>
            <div class="cards">
              <div class="card">
                <h3>Food trucks</h3>
                <img src="/images/truck.jpg" alt="Food truck" />
                <p>For the 2020 election season, we’re launching a food truck program in 25 cities around the country for early voting and election day. </p>
                <a href="/trucks">Learn more</a>
              </div>
              <div class="card">
                <h3>On-demand delivery</h3>
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
