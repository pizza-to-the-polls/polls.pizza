import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-about",
  styleUrl: "page-about.scss",
})
export class PageAbout {
  public componentWillLoad() {
    document.title = `About | Pizza to the Polls`;
  }

  public render() {
    return (
      <Host>
        <section id="about" class="page about">
          <ui-main-content>
            <h1>About Pizza to the Polls</h1>
            <ul class="toc-list">
              <li>
                <a href="#how-it-got-started" class="has-text-teal">
                  How it got started
                </a>
              </li>
              <li>
                <a href="#how-we-do-it" class="has-text-teal">
                  How we do it
                </a>
              </li>
              <li>
                <a href="#faq" class="has-text-teal">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#covid-safety" class="has-text-teal">
                  COVID Safety
                </a>
              </li>
            </ul>

            <hr />

            <div class="content">
              <p>Americans are hungry for democracy and are turning out in record numbers to vote. But that means long lines and sometimes empty stomachs.</p>
              <p>
                Fortunately, Pizza to the Polls is here to deliver the one thing that pairs perfectly with freedom: piping hot ’za. We take reports of long lines from folks around
                the country and then find local pizza places to deliver the goods.
              </p>
            </div>

            <ui-card is-collapsible={true} header-text="How it got started" scroll-id="how-it-got-started" is-active={true}>
              <p>
                The weekend before the 2016 election, long lines were reported at early voting locations across the country. In response, Pizza to the Polls was born. In a few
                short hours, the co-founders came up with a name, a Twitter handle, a website, and a plan: Give pizza to the people. And give people watching at home a way to help.
              </p>

              <p>
                We collected reports of long lines and sent in delivery pizzas to feed the crowds. The feedback was immediate and immense: it fortified hungry voters in line,
                cheered up beleaguered poll workers, and gave people a way to help out their communities.
              </p>

              <p>
                By the morning of Election Day, we had raised $10k and were confronted with the seemingly impossible task of spending it all before the polls closed. We recruited
                and trained a team of 20+ volunteers to order and coordinate the delivery of 2k+ pizzas to 100+ polling places across 24 states.
              </p>

              <p>By the time the dust had settled and the ballots were cast, we had raised $40k from 1.5k donors, and over 20k+ slices of pizza were consumed!</p>

              <ui-pizza-list has-icon={false}>
                <li>
                  <h3>2018</h3>
                  <p>
                    With the momentum we gained after the 2016 election, we were able to send 10k+ pizzas to 600+ polling places across 41 states and to raise $400k+ from 10k+
                    donors.
                  </p>
                </li>
                <li>
                  <h3>2020</h3>
                  <p>
                    We delivered 70k+ pizzas to 3k+ polling sites across 48 states and raised $1.5m+ from 30k+ donors. We also launched a Food Truck program in response to the
                    COVID-19 pandemic with 1m+ snacks distributed in 29 cities across 290+ truck rolling days.
                  </p>
                </li>
              </ui-pizza-list>
            </ui-card>

            <ui-card is-collapsible={true} header-text="How we do it" scroll-id="how-we-do-it">
              <img src="/images/truck.jpg" alt="Democracy is Delicious food truck" class="image" />
              <h3>Food trucks</h3>
              <p>
                For the 2020 election season, we launched a food truck program in 29 cities around the country for early voting and election day.
                <br />
                <stencil-route-link url="/trucks" anchorClass="has-text-teal">
                  Learn more
                </stencil-route-link>
              </p>
              <img src="/images/pics/pizza-on-plate.jpg" alt="Slice of pizza on paper plate" class="image" />
              <h3>On-Demand</h3>
              <p>
                Our signature program is back! We need you to help by reporting crowded polling places and sticking around to ensure food gets delivered safely.
                <br />
                <stencil-route-link url="/on-demand" anchorClass="has-text-teal">
                  Learn more
                </stencil-route-link>
              </p>
            </ui-card>
          </ui-main-content>
          <ui-main-content background="yellow">
            <h2 id="faq" class="is-display is-scroll-to">
              FAQ
            </h2>
            <ui-card is-collapsible={true} header-text="Is this a charity?" is-active={true}>
              <p>
                We are currently incorporated as a 501(c)(4) nonprofit social welfare organization, however all of our activities are 501(c)(3) compliant. Contributions or gifts to
                Pizza to the Polls are not tax deductible. If you’d like to learn more about how you can contribute or work with us,{" "}
                <stencil-route-link url="/partners" anchorClass="has-text-teal">
                  learn more here
                </stencil-route-link>
                .
              </p>
            </ui-card>
            <ui-card is-collapsible={true} header-text="How do I report a line?">
              <p>
                You can submit a report of a long line through our{" "}
                <stencil-route-link url="/#report" anchorClass="has-text-teal">
                  submission form
                </stencil-route-link>
                . We’ll ask for a delivery address, photo or link to a social media post to verify the line, an estimate of the line’s wait time, and your phone number. Once you
                submit a report, our volunteers will review to verify the line, and then ship pizzas or snacks your way.
              </p>
            </ui-card>
            <ui-card is-collapsible={true} header-text="Who do you give snacks to?">
              <p>
                We send food trucks with snacks and deliver pizza to polling places with long lines. The food is free for anyone there — people in line, their kids, poll volunteers
                and staff, and anyone else hungry for a slice.
              </p>
            </ui-card>
            <ui-card is-collapsible={true} header-text="Where will you deliver pizzas?">
              <p>Any polling place in the US, as long as we can find a delivery place that services that location.</p>
            </ui-card>
            <ui-card is-collapsible={true} header-text="What precautions is Pizza to the Polls taking as a result of COVID&#8209;19?">
              <p>Pizza to the Polls values the health and safety of our communities, and will be working to mitigate risk of disease transmission:</p>
              <ui-pizza-list>
                <li>
                  Our{" "}
                  <stencil-route-link url="/trucks" anchorClass="has-text-teal">
                    food truck program
                  </stencil-route-link>{" "}
                  will be staffed by professionals who’ve been trained in food safety and policies to help reduce the spread of COVID-19, but please keep in mind that it isn’t
                  possible to eliminate the risk of exposure.
                </li>
                <li>
                  For{" "}
                  <stencil-route-link url="/on-demand" anchorClass="has-text-teal">
                    on-demand
                  </stencil-route-link>{" "}
                  pizza deliveries, we will be supporting local pizzerias with our pizza delivery partners at{" "}
                  <a href="https://slicelife.com/" target="_blank">
                    Slice
                  </a>
                  . We plan to share{" "}
                  <a
                    href="https://www.cdc.gov/coronavirus/2019-ncov/community/organizations/business-employers/bars-restaurants.html"
                    class="has-text-teal"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    safety recommendations
                  </a>{" "}
                  with delivery drivers and restaurants, but it’s up to each person to consider their own personal risks.
                </li>
              </ui-pizza-list>
              <p>
                You can learn more about safety precautions you can take to stay safe at the polls{" "}
                <stencil-route-link url="/covid" anchorClass="has-text-teal">
                  here
                </stencil-route-link>
                .
              </p>
            </ui-card>
            <ui-card is-collapsible={true} header-text="Can I help distribute pizzas?">
              <p>
                Yes! When you report a line, let us know that you can receive an order on behalf of Pizza to the Polls. We’ll send you a text once an order has been placed! Pizzas
                usually take around 90 minutes to be delivered after an order is placed. Please be sure to{" "}
                <stencil-route-link url="/guidelines" anchorClass="has-text-teal">
                  read our guidelines
                </stencil-route-link>{" "}
                to learn how to help out safely.
              </p>
            </ui-card>
            <ui-card is-collapsible={true} header-text="Can you send water, chairs, umbrellas, or other items besides pizza to people in lines?">
              <p>Unfortunately, we’re only able to support sending snacks or food trucks to lines at this time.</p>
            </ui-card>
            <ui-card is-collapsible={true} header-text="Is this partisan?">
              <p>No. Ain’t nothing partisan about trying to make voting less of a drag.</p>
            </ui-card>
            <ui-card is-collapsible={true} header-text="Where do you get your pizzas?">
              <p>
                We often use{" "}
                <a href="https://slicelife.com/" target="_blank">
                  Slice
                </a>{" "}
                to find a pizza place close to each polling location. We love to support local businesses in each city! We’ll also order from larger chains.
              </p>
            </ui-card>
            <ui-card is-collapsible={true} header-text="I have more questions?">
              <p>
                That’s more of a statement, but please send them to us at{" "}
                <a href="mailto:morequestions@polls.pizza" class="has-text-teal" target="_blank" rel="noopener noreferrer">
                  morequestions@polls.pizza
                </a>
                {"."}
              </p>
            </ui-card>
          </ui-main-content>
          <ui-main-content background="teal">
            <ui-card>
              <h2 id="covid-safety" class="is-display is-scroll-to">
                COVID Safety
              </h2>
              <p>
                <strong>
                  COVID-19 is a serious illness. Pizza to the Polls values the health and safety of our communities, and will be working to mitigate risk of disease transmission.
                  Everyone visiting their polling location in person should take{" "}
                  <a href="https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/prevention.html" target="_blank" rel="noopener noreferrer">
                    extra precautions
                  </a>{" "}
                  this year.
                </strong>
              </p>
              <p>
                <stencil-route-link url="/covid" anchorClass="has-text-teal">
                  Learn more about best practices and guidelines
                </stencil-route-link>
              </p>
            </ui-card>
          </ui-main-content>
        </section>
      </Host>
    );
  }
}
