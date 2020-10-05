import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-on-demand",
  styleUrl: "page-on-demand.css",
})
export class PageOnDemand {
  public render() {
    return (
      <Host>
        <section id="on-demand" class="page">
          <div class="container">
            <h1>On-demand delivery</h1>
            <img src="/images/pics/photo_5.jpg" alt="Pizzas at a polling place" />
            <h2>How to help</h2>
            <h3>1. Report a crowd</h3>
            <p>
              If you’re at a crowded polling place that could use some snacks, let us know! Just <a href="/report">report the address and give us a bit of info</a> and we’ll get to
              work finding a restaurant that can deliver the goods.
            </p>
            <h3>2. Stick around</h3>
            <p>
              Deliveries work best when there’s someone there to receive the order, so let us know on the reporting form if you’re able to stick around (in your mask, of course!).
              We’ll text you as soon as the order is placed.
            </p>
            <p>Most deliveries take at least 90 minutes to arrive once the line is reported, so please keep this in mind before opting to receive the delivery.</p>
            <h3>3. Help out</h3>
            <p>
              Keep an eye out for a delivery driver. When the food arrives, let people around the polling site know it’s free for all: poll workers, voters, children, journalists,
              poll watchers, and anyone else who’s out and about.
            </p>
            <h3>4. Follow election laws</h3>
            <p>We are nonpartisan and we never provide any pizza or anything of value in exchange for voting or voting for a particular candidate.</p>
            <h3>See a line, but can’t stick around? That’s ok!?</h3>
            <p>
              If you’re not actually at the crowded polling place, you can still report the line. Just note that we’re prioritizing deliveries to places where someone can help make
              sure the food gets received and handed out safely.
            </p>
            <a class="button primary">Report a line</a>
          </div>
        </section>
      </Host>
    );
  }
}
