import { Component, h, Host } from "@stencil/core";

const scrollPageToTop = () => {
  if (window) {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

@Component({
  tag: "page-covid",
  styleUrl: "page-covid.scss",
})
export class PageCovid {
  public componentWillLoad() {
    document.title = `COVID Safety | Pizza to the Polls`;
  }

  public componentDidLoad() {
    if (!window.location.hash) {
      scrollPageToTop();
    }
  }

  public render() {
    // Expand/collapse section
    const toggleCollapse = (e?: Event) => {
      e?.preventDefault();
      const header = e?.target as HTMLInputElement;
      const contentId = header.getAttribute("data-section");
      if (contentId) {
        const content = document.getElementById(contentId) as HTMLElement;
        if (content.classList.contains("is-active")) {
          content.style.maxHeight = "";
        } else {
          content.style.maxHeight = content.scrollHeight + 500 + "px"; // Add 500 to account for changing viewport size
        }
        content.classList.toggle("is-active");
        header.classList.toggle("is-active");
        header.setAttribute("aria-expanded", header.classList.contains("is-active") ? "true" : "false");
      }
    };

    return (
      <Host>
        <section id="covid" class="page covid">
          <div class="covid-safety">
            <div class="container">
              <div class="box">
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
                    this year:
                  </strong>
                </p>
                <ul class="pizza-list">
                  <li>
                    <a href="https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/diy-cloth-face-coverings.html" target="_blank" rel="noopener noreferrer">
                      Wear a mask.
                    </a>
                  </li>
                  <li>
                    Practice{" "}
                    <a href="https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/social-distancing.html" target="_blank" rel="noopener noreferrer">
                      social distancing
                    </a>{" "}
                    and stay at least 6 feet apart from others.
                  </li>
                  <li>
                    <a href="https://www.cdc.gov/handwashing/when-how-handwashing.html" target="_blank" rel="noopener noreferrer">
                      Wash hands
                    </a>{" "}
                    frequently or use hand sanitizer that contains at least 60% alcohol.
                  </li>
                  <li>
                    Be aware of the{" "}
                    <a href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html" target="_blank" rel="noopener noreferrer">
                      signs and symptoms
                    </a>
                    .
                  </li>
                  <li>Stay home if you are sick, experiencing any symptoms, or after recent close contact with a person with COVID-19.</li>
                  <li>Make sure to comply with local guidance and COVID-19 protocols put in place by your city or election officials.</li>
                </ul>
                <p>
                  Our <stencil-route-link url="/trucks">food truck</stencil-route-link> program will be staffed by professionals who’ve been trained in food safety and policies to
                  help reduce the spread of COVID-19, but please keep in mind that it isn’t possible to eliminate the risk of exposure.
                </p>
                <p>
                  For <stencil-route-link url="/on-demand">on-demand</stencil-route-link> pizza deliveries, we will be supporting local pizzerias with our pizza delivery partners
                  at Slice. We plan to share{" "}
                  <a href="https://www.cdc.gov/coronavirus/2019-ncov/community/organizations/business-employers/bars-restaurants.html" target="_blank" rel="noopener noreferrer">
                    safety recommendations
                  </a>{" "}
                  with delivery drivers and restaurants, but it’s up to each person to consider their own personal risks.
                </p>
              </div>
            </div>
          </div>
          <div class="container guidelines">
            <div class="box">
              <a href="#" class="expand-section-link is-header is-active" onClick={toggleCollapse} data-section="distributor-guidelines" aria-expanded="true">
                Guidelines for Distributors
              </a>
              <div id="distributor-guidelines" class="expand-section is-active">
                <div class="expand-content">
                  <p>
                    <b>Thank you for helping us get pizza to hungry poll workers and poll-goers!</b>
                  </p>
                  <p>
                    <b>If you’re waiting to receive an order:</b>
                  </p>
                  <ul class="pizza-list">
                    <li>We’ll let you know when an order has been placed. Pizzas usually take around 90 minutes to be delivered after an order is placed.</li>
                    <li>
                      Be sure to be at the location once confirmed to coordinate pickup. Keep an eye out for a delivery driver. When the food arrives, let people around the polling
                      site know it's free for all: poll workers, voters, children, journalists, poll watchers, and anyone else who's out and about. Be sure to practice social
                      distancing and stay at least 6 feet apart from others.
                    </li>
                  </ul>
                  <p>
                    <b>Once you receive an order:</b>
                  </p>
                  <ul class="pizza-list">
                    <li>
                      <b>Wear a mask</b>
                      <br />
                      Wear a mask when providing food and drink, social distance as much as possible, and follow state and local COVID-19 protocols.
                    </li>
                    <li>
                      <b>Minimize crowding</b>
                      <br />
                      Distribute food in a way that minimizes crowding around the food.
                    </li>
                    <li>
                      <b>Keep food covered</b>
                      <br />
                      Try not to distribute food directly, and keep the food covered when not being accessed by the public (e.g. no open pizza boxes being passed around).
                    </li>
                    <li>
                      <b>Wash or sanitize your hands</b>
                      <br />
                      Wash or sanitize your hands (with sanitizer containing at least 60% alcohol) prior to handling food at the polling location. If possible, put on gloves after
                      sanitizing and prior to handling food.
                    </li>
                    <li>
                      <b>Dispose of food waste</b>
                      <br />
                      Be sure to dispose of food waste in trash cans, and encourage people consuming food to do the same.
                    </li>
                    <li>
                      <b>Respect your needs</b>
                      <br />
                      If you feel unsafe at any point, leave the area.
                    </li>
                    <li>
                      <b>Stay safe</b>
                      <br />
                      If there are protests or unrest at or around a polling place, keep your distance and do not engage while distributing pizza to people in the area.
                    </li>
                  </ul>
                  <p>
                    <stencil-route-link url="guidelines" anchorClass="has-text-teal">
                      Learn more about our guidelines to provide free food for all
                    </stencil-route-link>
                  </p>
                </div>
              </div>
            </div>
            <div class="box">
              <a href="#" class="expand-section-link is-header" onClick={toggleCollapse} data-section="delivery-guidelines" aria-expanded="false">
                Guidelines for Restaurants and Delivery
              </a>
              <div id="delivery-guidelines" class="expand-section">
                <div class="expand-content">
                  <p>
                    <b>
                      Thank you for helping us get pizza to hungry poll workers and poll-goers! Below, you can find our COVID recommendations for restaurants and delivery people.
                    </b>
                  </p>
                  <p>
                    For restaurants preparing the food,{" "}
                    <stencil-route-link url="/instructions" anchorClass="has-text-teal">
                      learn more here about how it works
                    </stencil-route-link>
                    . For restaurant partners, food delivery people, and volunteers helping hand out food at polling locations,{" "}
                    <stencil-route-link url="/guidelines" anchorClass="has-text-teal">
                      find our full guidelines here
                    </stencil-route-link>
                    .
                  </p>
                  <h3>Guidelines for Restaurants</h3>
                  <ul class="pizza-list">
                    <li>
                      <b>Print out signs to place by the pizza!</b>
                      <br />
                      If you want, you can print out these signs to tape them up around the food. These PDF’s have links to our COVID guidelines for people in line!
                      <br />
                      <a href="/downloads/color-sign.pdf" target="_blank">
                        Color PDF
                      </a>{" "}
                      |{" "}
                      <a href="/downloads/bw.pdf" target="_blank">
                        Black &amp; White PDF
                      </a>
                    </li>
                    <li>
                      <b>Send napkins and plates if you can</b>
                      <br />
                      In order to help facilitate indirect contact with the food, please consider sending extra napkins and plates!
                    </li>
                    <li>
                      <b>Cut into small slices!</b>
                      <br />
                      We’d appreciate it if you could cut the pizza into small slices so that more folks can have a piece.
                    </li>
                  </ul>
                  <h3>Guidelines for Delivery People</h3>
                  <ul class="pizza-list">
                    <li>
                      <b>Wear a mask</b>
                      <br />
                      Wear a mask when providing food and drink, social distance as much as possible, and follow state and local COVID-19 protocols.
                    </li>
                    <li>
                      <b>Minimize crowding</b>
                      <br />
                      Distribute food in a way that minimizes crowding around the food.
                    </li>
                    <li>
                      <b>Keep food covered</b>
                      <br />
                      Try not to distribute food directly, if distributing food always wear a mask and keep the food covered when not being accessed by the public (e.g. no open
                      pizza boxes being passed around).
                    </li>
                    <li>
                      <b>Wash or sanitize your hands</b>
                      <br />
                      Wash or sanitize your hands (with sanitizer containing at least 60% alcohol) prior to handling food at the polling location. If possible, put on gloves after
                      sanitizing and prior to handling food.
                    </li>
                    <li>
                      <b>Respect your needs</b>
                      <br />
                      If you feel unsafe at any point, leave the area.
                    </li>
                    <li>
                      <b>Stay safe</b>
                      <br />
                      If there are protests or unrest at or around a polling place, keep your distance and do not engage while distributing pizza to people in the area.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
