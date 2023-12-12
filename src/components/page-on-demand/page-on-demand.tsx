import { Component, h } from "@stencil/core";

@Component({
  tag: "page-on-demand",
  styleUrl: "page-on-demand.scss",
})
export class PageOnDemand {
  public componentWillLoad() {
    document.title = `On Demand | Pizza to the Polls`;
  }

  public render() {
    return (
      <ui-main-content class="page">
        <ui-card>
          <h1>On Demand</h1>
          <img style={{ margin: "0 auto", display: "block" }} src="/images/pics/photo_6.jpeg" alt="Mother and daughter enjoying pizza in front of American flag" class="image" />
          <h2>How to help</h2>
          <h3>1. Report a crowd</h3>
          <p>
            If you’re at a crowded polling place that could use some snacks, let us know! Just <a href="/#report">report the address and give us a bit of info</a> and we’ll get to
            work finding a restaurant that can deliver the goods.
          </p>
          <h3>2. Stick around</h3>
          <p>
            Most deliveries take up to 90 minutes to arrive once the line is reported, so please keep this in mind before making the report. We’ll text you as soon as the order is
            placed.
          </p>
          <h3>3. Help out</h3>
          <p>
            Keep an eye out for a delivery driver. When the food arrives, let people around the polling site know it’s free for all: poll workers, voters, children, journalists,
            poll watchers, and anyone else who’s out and about.
          </p>
          <h3>4. Follow election laws</h3>
          <p>
            We are nonpartisan and we never provide any pizza or anything of value in exchange for voting or voting for a particular candidate. Please review our full{" "}
            <a href="/guidelines">election law compliance policies here.</a>
          </p>
          <a class="button is-teal" href="/#report">
            Report a line
          </a>
          <img style={{ margin: "30px auto 0", display: "block" }} src="/images/pics/photo_7.jpg" alt="Students handing out pizzas to classmates" class="image" />
          <h1>Pre-Order</h1>
          <p>
            Are you a non profit working on voter registration, turnout and education events? Email
            <a href="mailto:partners@polls.pizza">partners@polls.pizza</a>
            for more information!
          </p>
        </ui-card>
      </ui-main-content>
    );
  }
}
