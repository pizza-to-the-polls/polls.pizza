import { Component, h, Host } from "@stencil/core";

const top = [
  {
    slug: "ubereats",
    name: "Uber Eats",
    url: "https://www.ubereats.com/",
  },
  {
    slug: "slice",
    name: "Slice",
    url: "https://slicelife.com/",
  },
];

const rest = [
  {
    slug: "daybreaker",
    name: "Daybreaker",
    url: "https://www.daybreaker.com/",
  },
  {
    slug: "just",
    name: "Just",
    url: "https://justwater.com/",
  },
  {
    slug: "pipcorn",
    name: "Pipcorn",
    url: "https://www.pipsnacks.com/",
  },
  {
    slug: "stickys",
    name: "Sticky's",
    url: "https://www.stickys.com/",
  },
];

@Component({
  tag: "page-partners",
  styleUrl: "page-partners.scss",
})
export class PagePartners {
  public componentWillLoad() {
    document.title = `Partners | Pizza to the Polls`
  }
  public render() {
    return (
      <Host>
        <section id="partners" class="page">
          <div class="container">
            <h1>Partners</h1>
            <p>Pizza to the Polls is grateful for the support of its partners:</p>
            <ul class="partners">
              {top.map(l => {
                return (
                  <li>
                    <a href={l.url} target="blank">
                      <img src={`/images/logos/${l.slug}.png`} alt={l.name} />
                    </a>
                  </li>
                );
              })}
            </ul>
            <ul class="partners">
              {rest.map(l => {
                return (
                  <li>
                    <a href={l.url} target="blank">
                      <img src={`/images/logos/${l.slug}.png`} alt={l.name} />
                    </a>
                  </li>
                );
              })}
            </ul>
            <h2>Become a partner</h2>
            <p>We’re looking for partners who can:</p>
            <ul>
              <li>
                <strong>Promote @PizzatothePolls:</strong> Help spread the word by creating or sharing content across all channels of communication so people know they can report a
                line or donate food.
              </li>
              <li>
                <strong>Feed Hungry Folks:</strong> Donate snacks, food, or beverages to be delivered to polling locations.
              </li>
              <li>
                <strong>Engage Employees & Audience Members:</strong> Make sure people know that spotting lines is a great way to make a difference in 2020!
              </li>
              <li>
                <strong>Participate in the November 3 Day of Action:</strong> Election Day
              </li>
            </ul>
            <p>
              If you’re interested in becoming a partner to help ease the pain of crowded polling places, get in touch today:{" "}
              <a href="mailto:partners@polls.pizza">partners@polls.pizza</a>.
            </p>
          </div>
        </section>
      </Host>
    );
  }
}
