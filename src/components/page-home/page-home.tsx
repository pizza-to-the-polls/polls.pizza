import { Component, h, Prop, State } from "@stencil/core";
import { RouterHistory } from "@stencil/router";

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
  @Prop() public history!: RouterHistory;

  public async componentWillLoad() {
    document.title = `Home | Pizza to the Polls`;

    PizzaApi.getTotals().then(totals => (this.totals = totals));
    PizzaApi.getOrders(0, 20).then(({ results }) => (this.orders = results));
  }

  public render() {
    const handleLocationSelected = (e: CustomEvent) => {
      this.history?.push(`/report?q=${e.detail.formattedAddress.replace(/\s/g, "+", {})}`);
    };

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
                <stencil-route-link class="button button-large is-cyan" url="/donate">
                  Donate now
                </stencil-route-link>
                <stencil-route-link class="button button-large is-teal" url="/crustclub">
                  Join the Crust Club
                </stencil-route-link>
                <span class="donate-button-subtext">* All contributions are tax deductible</span>
              </div>
            </div>
            <div>
              <img class="inset" src="/images/pics/photo_9.jpg" alt="" />
            </div>
          </div>
        </div>
        <section class="order-pizzas">
          <label htmlFor="autocomplete-input">
            <div class="container">
              <ui-location-search
                placeholder={
                  (window?.document?.body?.clientWidth || 0) < 400
                    ? "Long line? We'll send pizza!"
                    : (window?.document?.body?.clientWidth || 0) < 600
                    ? "Long line at polling site? We'll send pizza!"
                    : "Long line at a polling site? Let us know where - we’ll send pizza!"
                }
                onLocationSelected={handleLocationSelected}
                inputId="homepage"
              />
            </div>
          </label>
        </section>
        <section class="totals">{this.totals && <Stats totals={this.totals} />}</section>
        <section class="tweets-deliveries">
          <div class="container">
            <Tweets />
            <Deliveries orders={this.orders} />
          </div>
        </section>
        <section class="donate is-round">
          <div class="container">
            <img src="/images/give-icon.png" />
            <div class="donate-text">
              <h1 class="has-text-red">Help us send pizza to hungry folks in long lines.</h1>
            </div>
            <div class="donate-button">
              <stencil-route-link url="/donate" class="button button-large is-red">
                Donate
              </stencil-route-link>
            </div>
          </div>
        </section>
        <section class="press is-round">
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
        <section class="newsletter is-round">
          <div class="container">
            <div class="has-text-white newsletter-text">
              <h1>Newsletter Sign-Up</h1>
              <p>Keep up to date with what we've got cooking.</p>
            </div>
            <form
              action="https://pizza.us14.list-manage.com/subscribe/post?u=ff4b828d01c30e7ef1de2e24b&amp;id=a2d940b77b"
              method="post"
              name="mc-embedded-subscribe-form"
              target="_blank"
              noValidate
            >
              <ui-single-input buttonLabel="Sign up" type="email" name="EMAIL">
                <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
                  <input type="text" name="b_ff4b828d01c30e7ef1de2e24b_a2d940b77b" tabindex="-1" value="" readOnly />
                </div>
              </ui-single-input>
            </form>
          </div>
        </section>
      </div>
    );
  }
}
