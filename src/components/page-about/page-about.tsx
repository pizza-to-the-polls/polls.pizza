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
            <ui-card>
              <h1>About Pizza to the Polls</h1>

              <div class="content">
                <p>Americans are hungry for democracy and are turning out in record numbers to vote. But that means long lines and sometimes empty stomachs.</p>
                <p>
                  Fortunately, Pizza to the Polls is here to deliver the one thing that pairs perfectly with freedom: piping hot ’za. We take reports of long lines from folks
                  around the country and then find local pizza places to deliver the goods.
                </p>
              </div>
              <h2>How it got started</h2>

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
                <li>
                  <h3>2021</h3>
                  <p>
                    After volunteering at Covid-19 vaccine sites, we immediately saw a need to feed folks waiting in those lines and the Vax & Snacks program was born. Partnering
                    with Slice Out Hunger, C.O.R.E., Slice & Wetzel’s Pretzels, we fed hundreds of people in California, Georgia and South Carolina.
                  </p>
                </li>
                <li>
                  <h3>2022</h3>
                  <p>
                    Continuing the tradition of adding new programming, we created a Pre Order Program to support other non-partisan, nonprofits working on voter registration,
                    education and turnout efforts. This program heavily focused on community college students around civic holidays with generous support from Levi’s to create
                    custom food trucks and food stands as well as deliver pizzas to GOTV events around the country.
                  </p>
                </li>
                <li>
                  <h3>2023</h3>
                  <p>
                    Our Pre Order initiative continued to grow this year, supporting nationwide events. We added 40+ new partners and fed over 10k people at 75+ events throughout
                    the year across our various programs.
                  </p>
                </li>
              </ui-pizza-list>

              <h2>How we do it</h2>

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
              <ul class="toc-list">
                <li>
                  <stencil-route-link url="/faq" class="has-text-teal">
                    Frequently Asked Questions
                  </stencil-route-link>
                </li>
              </ul>
            </ui-card>
          </ui-main-content>
        </section>
      </Host>
    );
  }
}
