import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-faq",
  styleUrl: "page-faq.scss",
})
export class PageFAQ {
  public componentWillLoad() {
    document.title = `FAQ | Pizza to the Polls`;
  }
  public render() {
    return (
      <Host>
        <section id="faq" class="page faq">
          <ui-main-content>
            <ui-card>
              <h1 class="has-text-red">Frequently Asked Question</h1>
              <ui-card is-collapsible={true} header-text="Is this a charity?">
                <p>
                  Pizza to the Polls is a 501(c)(3) nonpartisan, nonprofit public charity. Contributions are tax deductible. If you’d like to learn more about how you can
                  contribute or work with us,{" "}
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
                  We send food trucks with snacks and deliver pizza to polling places with long lines. The food is free for anyone there — people in line, their kids, poll
                  volunteers and staff, and anyone else hungry for a slice.
                </p>
              </ui-card>
              <ui-card is-collapsible={true} header-text="Where will you deliver pizzas?">
                <p>Any polling place in the US, as long as we can find a delivery place that services that location.</p>
              </ui-card>
              <ui-card is-collapsible={true} header-text="Can I help distribute pizzas?">
                <p>
                  Yes! When you report a line, let us know that you can receive an order on behalf of Pizza to the Polls. We’ll send you a text once an order has been placed!
                  Pizzas usually take around 90 minutes to be delivered after an order is placed. Please be sure to{" "}
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
            </ui-card>
          </ui-main-content>
        </section>
      </Host>
    );
  }
}
