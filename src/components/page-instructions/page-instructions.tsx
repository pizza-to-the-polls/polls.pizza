import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-instructions",
  styleUrl: "page-instructions.scss",
})
export class PageInstructions {
  public componentWillLoad() {
    document.title = `Delivery Instructions | Pizza to the Polls`;
  }

  public render() {
    return (
      <Host>
        <section id="instructions" class="page">
          <div class="container">
            <h1>Delivery Instructions</h1>
            <p>
              Hello there! You’re probably here because you received an order from Pizza to the Polls. We’re a nonprofit that orders food to be delivered to busy polling places and
              we’re hoping you can help us out! We’d really appreciate it if you could cut the pizzas into small slices, and if you’re able to bring plates and/or napkins that’s a
              huge help too.
            </p>
            <h2>Here’s how it works:</h2>
            <ol>
              <li>
                Whenever possible, we include the name and phone number of a person at the location who can receive the order and help you set it out. Otherwise, you’ll see Scott
                Duncombe as the customer and a 971 phone number.
              </li>
              <li>
                If the only name on the order is Scott that means we don’t have anyone who is physically at the site. In these cases, we recommend finding a poll worker and asking
                for a table.
              </li>
              <li>
                If you want, you can print out these signs to tape them up around the food: <a href="/downloads/color-sign.pdf">color PDF</a> |{" "}
                <a href="/downloads/bw.pdf">black and white PDF</a>
              </li>
              <li>
                And remember: The food is for anyone at the polling place: poll workers, people standing in line, their children, or anyone who just walks by.{" "}
                <a href="/guidelines">Please see our full guidelines here</a>. You can download a <a href="/downloads/guidelines.pdf">printable version here</a>.
              </li>
            </ol>
            <p>
              If you have any questions, you can call our hotline at: <a href="tel:+1-971-407-1829">971-407-1829</a>
            </p>
          </div>
        </section>
      </Host>
    );
  }
}
