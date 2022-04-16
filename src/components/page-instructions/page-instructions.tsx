import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-instructions",
  styleUrl: "page-instructions.scss",
  shadow: false,
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
                The name and phone number of the person at the location receiving and distributing the order will be provided. 
              </li>
              <li>
                If you want, you can print out these signs to tape them up around the food: <a href="/downloads/color-sign.pdf" target="_blank">color PDF</a> |{" "}
                <a href="/downloads/bw.pdf" target="_blank">black and white PDF</a>
              </li>
              <li>
                And remember: The food is for anyone at the polling place: poll workers, people standing in line, their children, or anyone who just walks by.{" "}
                <a href="/guidelines">Please see our full guidelines here</a>. You can download a <a href="/downloads/guidelines.pdf" target="_blank">printable version here</a>.
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
