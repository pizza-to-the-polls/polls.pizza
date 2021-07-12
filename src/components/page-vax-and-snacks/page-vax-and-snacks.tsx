import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-vax-and-snacks",
})
export class PageVaxAndSnacks {
  public componentWillLoad() {
    document.title = `Vax and Snacks program | Pizza to the Polls`;
  }

  public render() {
    return (
      <Host>
        <section id="trucks" class="page">
          <div class="container intro">
            <img class="vax-logo" src="/images/vax-and-snacks.png" alt="Vax and Snacks" />
            <h1>Pizza to the Polls Vax and Snacks program</h1>
            <p>
              When long lines during the 2020 Election were set to deter Americans from exercising their right to vote, Pizza to the Polls stepped up to the plate to help people
              perform their civic duties. COVID vaccination lines were no exception. While following all recommended{" "}
              <a href="https://www.cdc.gov/coronavirus/2019-ncov/community/organizations/business-employers/bars-restaurants.html">CDC</a> and state health guidelines, Pizza to the
              Polls used its technology, expertise, and network of passionate supporters to get food to vaccination locations where it was needed the most.
            </p>
            <p>
              Thanks to your generosity, our Vax and Snacks vaccination site delivery program was a huge success. We were able to feed thousands of people at vaccination sites
              across the country and continue our mission of helping support people who engage in their civic duties.
            </p>
            <p>
              We couldn’t have done it without our incredible partners at <a href="https://slicelife.com/">Slice</a>, <a href="https://www.coreresponse.org/">CORE</a>,{" "}
              <a href="https://sliceouthunger.org/">Slice Out Hunger</a>, <a href="https://www.wetzels.com/">Wetzel’s Pretzels</a>, and{" "}
              <a href="https://www.bresee.org/">Bresee Foundation</a>.
            </p>
            <img src="/images/pics/vax-and-snacks-photo.jpg" alt="People holding slices of pizza in boxes" />
          </div>
        </section>
      </Host>
    );
  }
}
