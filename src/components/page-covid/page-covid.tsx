import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-covid",
})
export class PageCovid {
  public render() {
    return (
      <Host>
        <section id="covid" class="page">
          <div class="container">
            <h1>COVID Safety</h1>
            <p>
              Pizza to the Polls values the health and safety of our communities, and will be working to mitigate risk of disease transmission. We encourage everyone visiting their
              polling location in person to take extra precautions this year:
            </p>
            <ul>
              <li>Wear a mask.</li>
              <li>Practice social distancing and stay at least 6 feet apart from others.</li>
              <li>Wash hands frequently or use hand sanitizer that contains at least 60% alcohol.</li>
              <li>Stay home when sick or after recent close contact with a person with COVID-19.</li>
              <li>Make sure to comply with local guidance and COVID protocols put in place by your city or election officials.</li>
            </ul>
          </div>
        </section>
      </Host>
    );
  }
}
