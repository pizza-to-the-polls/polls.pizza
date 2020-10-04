import { Component, h } from "@stencil/core";

@Component({
  tag: "app-home",
  styleUrl: "app-home.scss",
})
export class AppHome {
  public render() {
    return (
      <section class="hero">
        <div class="container">
          <div class="intro">
            <p>Pizza to the Polls is making democracy delicious by delivering free food for all to polling places with long lines.</p>
            <p>Send us reports of long lines and we'll send in the delicious reinforcements.</p>
          </div>
          <section class="dashboard">
            <div class="container">
              <div class="stats">
                <h2 class="display">2020 Election Totals</h2>
                <div class="stats__row"></div>
                <a href="/report" class="button primary">Report a line</a>
                <a href="/activity" class="stat__link">View recent deliveries</a>
              </div>
            </div>
          </section>
        </div>
      </section>
    );
  }
}
