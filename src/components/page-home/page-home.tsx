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
              <p>
                Our mission is to deliver free food to people who are participating in civic life, from long lines at polling places to nonpartisan events focused on voter
                education, registration, and turnout.
              </p>
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
          <div class="container">
            {[
              {
                img: "/images/press/nyt.png",
                alt: "The New York Times",
                headline: "Feel Inspired, America",
                body:
                  "In 2016 Scott Duncombe, a software developer in Portland, Ore., saw on the news that Cleveland residents " +
                  "had to wait hours in long lines to vote. His heart went out to them. In Oregon, there are never any lines " +
                  "because everybody votes by mail. So he called up a pizza place in Cleveland and ordered a bunch of food " +
                  "to raise their spirits.",
                link: "https://www.nytimes.com/2020/11/03/opinion/volunteers-election-2020.html",
              },
              {
                link: "https://www.cnn.com/2020/09/21/politics/pizza-polling-early-voting-election/index.html",
                img: "/images/press/cnn.png",
                alt: "CNN",
                headline: "Pizza to the Polls aims to feed hungry 2020 voters stuck in long lines",
                body:
                  "A staple at birthday parties, bar crawls and bowling, few foods bring Americans together like pizza. And this election season, a new group aims to bring America’s favorite pie to those stuck waiting in long lines.",
              },
              {
                link: "https://www.buzzfeednews.com/article/skbaer/long-lines-election-day-2020",
                img: "/images/press/buzzfeed.png",
                alt: "Buzzfeed News",
                headline: "What To Do If You’re Stuck In A Line At Your Polling Place On Election Day",
                body:
                  "The big neon sign is: If you are in line when polls close, you must be allowed to vote, so don’t get out of line no matter what anybody around you tells you.",
              },
              {
                link: "https://www.oprahdaily.com/life/a34483172/pizza-to-the-polls-long-lines/",
                img: "/images/press/oprah.png",
                alt: "Opra",
                headline: "Pizza to the Polls is fueling democracy—one slice at a time.",
                body:
                  "Picture it: You slip away from your office—or work-from-home setup—at lunchtime during early voting or on Election Day to cast your ballot, but the line at your polling site is out the door and down the block.",
              },
            ].map(({ img, alt, link, body, headline }) => (
              <div class="story">
                <img src={img} alt={alt} />
                <h3>{headline}</h3>
                <p>{body}</p>
                <a href={link} class="has-text-blue" target="_blank">
                  Read the article
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}
