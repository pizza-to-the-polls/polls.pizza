import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-covid",
})
export class PageCovid {
  public componentWillLoad() {
    document.title = `COVID Safety | Pizza to the Polls`;
  }
  public render() {
    return (
      <Host>
        <section id="covid" class="page">
          <div class="container">
            <h1>COVID Safety</h1>
            <p>
              COVID-19 is a serious illness. Pizza to the Polls values the health and safety of our communities, and will be working to mitigate risk of disease transmission.
              Everyone visiting their polling location in person should take{" "}
              <a href="https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/prevention.html" target="_blank">
                extra precautions
              </a>{" "}
              this year:
            </p>
            <ul>
              <li>
                <a href="https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/diy-cloth-face-coverings.html" target="_blank">
                  Wear a mask
                </a>
                .
              </li>
              <li>
                Practice{" "}
                <a href="https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/social-distancing.html" target="_blank">
                  social distancing
                </a>{" "}
                and stay at least 6 feet apart from others.
              </li>
              <li>
                <a href="https://www.cdc.gov/handwashing/when-how-handwashing.html" target="_blank">
                  Wash hands
                </a>{" "}
                frequently or use hand sanitizer that contains at least 60% alcohol.
              </li>
              <li>
                Be aware of the{" "}
                <a href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html" target="_blank">
                  signs and symptoms
                </a>
                .
              </li>
              <li>Stay home if you are sick, experiencing any symptoms, or after recent close contact with a person with COVID-19.</li>
              <li>Make sure to comply with local guidance and COVID-19 protocols put in place by your city or election officials.</li>
            </ul>
            <p>
              Our <a href="/trucks">food truck</a> program will be staffed by professionals who’ve been trained in food safety and policies to help reduce the spread of COVID-19,
              but please keep in mind that it isn’t possible to eliminate the risk of exposure.
            </p>
            <p>
              For <a href="/on-demand">on-demand</a> pizza deliveries, we will be supporting local pizzerias with our pizza delivery partners at Slice. We plan to share{" "}
              <a href="https://www.cdc.gov/coronavirus/2019-ncov/community/organizations/business-employers/bars-restaurants.html" target="_blank">
                safety recommendations
              </a>{" "}
              with delivery drivers and restaurants, but it’s up to each person to consider their own personal risks.
            </p>
          </div>
        </section>
      </Host>
    );
  }
}
