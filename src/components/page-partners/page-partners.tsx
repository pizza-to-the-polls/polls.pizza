import { Component, h, Host } from "@stencil/core";

const top = [
  {
    img: "ubereats.png",
    name: "Uber Eats",
    url: "https://www.ubereats.com/",
  },
  {
    img: "slice.png",
    name: "Slice",
    url: "https://slicelife.com/",
  },
];

const rest = [
  {
    img: "&pizza.png",
    name: "&Pizza",
    url: "https://andpizza.com/",
  },
  {
    img: "daybreaker.png",
    name: "Daybreaker",
    url: "https://www.daybreaker.com/",
  },
  {
    img: "hattiebs.png",
    name: "Hattie B's Chicken",
    url: "https://hattieb.com/",
  },
  {
    img: "just.png",
    name: "Just Goods, Inc.",
    url: "https://justwater.com/",
  },
  {
    img: "kind.png",
    name: "KIND Snacks",
    url: "https://www.kindsnacks.com/",
  },
  {
    img: "levis.png",
    name: "Levi Strauss & Co.",
    url: "https://levi.com",
  },
  {
    img: "nuchas.jpg",
    name: "Nuchas",
    url: "https://nuchas.com/",
  },
  {
    img: "pipcorn.png",
    name: "Pipcorn",
    url: "https://www.pipsnacks.com/",
  },
  {
    img: "planet-fitness.jpg",
    name: "Planet Fitness",
    url: "https://www.planetfitness.com/",
  },
  {
    img: "sftp.jpg",
    name: "Somebody Feed the People",
    url: "https://www.somebodyfeedthepeople.org/",
  },
  {
    img: "stickys.png",
    name: "Sticky's Finger Joint",
    url: "https://www.stickys.com/",
  },
  {
    img: "gato.png",
    name: "The Great American Takeout",
    url: "https://thegreatamericantakeout.com/",
  },
  {
    img: "thesalty.png",
    name: "The Salty",
    url: "https://www.saltydonut.com/",
  },
  {
    img: "voodoo.jpg",
    name: "Voodoo Doughnut",
    url: "https://www.voodoodoughnut.com/",
  },
  {
    img: "wetzels.jpg",
    name: "Wetzel's Pretzels",
    url: "https://www.wetzels.com/",
  },
  {
    img: "zendesk.png",
    name: "Zendesk",
    url: "https://zendesk.com/",
  },
];

@Component({
  tag: "page-partners",
  styleUrl: "page-partners.scss",
})
export class PagePartners {
  public componentWillLoad() {
    document.title = `Partners | Pizza to the Polls`;
  }
  public render() {
    return (
      <Host>
        <section id="partners" class="page">
          <div class="container">
            <div class="box">
              <h1>Partners</h1>
              <p>Pizza to the Polls is grateful for the support of its partners:</p>
              <ul class="partners">
                {top.map(l => {
                  return (
                    <li>
                      <a href={l.url} target="blank">
                        <img src={`/images/logos/${l.img}`} alt={l.name} />
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
                        <img src={`/images/logos/${l.img}`} alt={l.name} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div class="box">
              <h2>Become a partner</h2>
              <p>We’re looking for partners who can:</p>
              <ul class="pizza-list">
                <li>
                  <strong>Promote @PizzatothePolls:</strong> Help spread the word by creating or sharing content across all channels of communication so people know they can report
                  a line or donate food.
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
                <a href="mailto:partners@polls.pizza" class="has-text-teal" target="_blank">
                  partners@polls.pizza
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
