import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-covid",
  styleUrl: "page-covid.scss",
})
export class PageCovid {
  public componentWillLoad() {
    document.title = `COVID Safety | Pizza to the Polls`;
  }

  public render() {
    return (
      <Host>
        <section id="covid" class="page covid">
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
                  this year:
                </strong>
              </p>
              <ui-pizza-list>
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
              </ui-pizza-list>
              <p>
                Our <stencil-route-link url="/trucks">food truck</stencil-route-link> program will be staffed by professionals who’ve been trained in food safety and policies to
                help reduce the spread of COVID-19, but please keep in mind that it isn’t possible to eliminate the risk of exposure.
              </p>
              <p>
                For <stencil-route-link url="/on-demand">on-demand</stencil-route-link> pizza deliveries, we will be supporting local pizzerias with our pizza delivery partners at
                Slice. We plan to share{" "}
                <a href="https://www.cdc.gov/coronavirus/2019-ncov/community/organizations/business-employers/bars-restaurants.html" target="_blank" rel="noopener noreferrer">
                  safety recommendations
                </a>{" "}
                with delivery drivers and restaurants, but it’s up to each person to consider their own personal risks.
              </p>
              <p>
                For our <a href="/vax-and-snacks">Vax and Snacks program</a>, we are partnering with CORE staff on the ground, who are experts in the field, to safely follow all
                recommended CDC guidelines at vaccination sites. All deliveries are pre-arranged with on site staff and we are not taking requests for snacks from the general
                public. All volunteers and staff will be wearing masks and other protective equipment, while pizza and additional snacks handed out will be individually wrapped. We
                will be encouraging anyone who receives food to practice social distancing while eating.
              </p>
              <hr />
              <h3 class="instructions-subheader">Are you a restaurant or helping distribute food?</h3>
              <stencil-route-link url="/guidelines" anchorClass="button is-teal">
                View our guidelines for distributors
              </stencil-route-link>
              <p>
                <stencil-route-link url="/instructions" anchorClass="has-text-teal">
                  View our guidelines for restaurants
                </stencil-route-link>
              </p>
            </ui-card>
          </ui-main-content>
        </section>
      </Host>
    );
  }
}
