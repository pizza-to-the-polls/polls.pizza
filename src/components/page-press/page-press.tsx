import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-press",
  styleUrl: "page-press.scss",
})
export class PagePress {
  public componentWillLoad() {
    document.title = `Press | Pizza to the Polls`;
  }

  public render() {
    const press = [
      {
        url: "https://www.washingtonpost.com/politics/2020/11/03/trump-was-almost-guaranteed-victory-mississippi-voters-flooded-polls-anyway/",
        title: "Washington Post",
        img: "wapo.png",
      },
      {
        url: "https://www.today.com/video/59-million-voters-have-already-cast-ballots-a-us-record-94645317535",
        title: "Today Show",
        img: "today.png",
      },
      {
        url: "https://time.com/5904611/early-voting-long-lines-entertainment/",
        title: "Time",
        img: "time.png",
      },
      {
        url: "https://www.eater.com/21539118/do-food-at-the-polls-initiatives-work-voter-turnout-election-voting",
        title: "Eater",
        img: "eater.png",
      },
      {
        url: "https://www.grubstreet.com/2020/10/pizza-to-the-polls-early-voting-lines-nyc.html",
        title: "Grub Street",
        img: "grubstreet.png",
      },
      {
        url: "https://www.shondaland.com/act/news-politics/a34535143/delivering-pizza-to-voters-at-the-polls/",
        title: "Shondaland",
        img: "shondaland.png",
      },
      {
        url: "https://www.oprahmag.com/life/a34483172/pizza-to-the-polls-long-lines/",
        title: "Oprah Magazine",
        img: "oprah.png",
      },
      {
        url: "https://www.hollywoodreporter.com/news/general-news/ariana-grande-sends-hundreds-of-pizzas-to-florida-voters-4079678/",
        title: "The Hollywood Reporter",
        img: "thr.png",
      },
      {
        url: "https://www.buzzfeednews.com/article/skbaer/long-lines-election-day-2020",
        title: "BuzzFeed",
        img: "buzzfeed.png",
      },
      {
        url: "https://www.nytimes.com/2020/11/03/opinion/volunteers-election-2020.html",
        title: "New York Times Opinion",
        img: "nyt.png",
      },
      {
        url: "https://www.npr.org/2018/10/25/660436884/long-line-to-vote-a-pizza-delivery-service-will-send-a-pie-to-crowded-polling-pl",
        title: "NPR",
        img: "npr.png",
      },
      {
        url: "https://www.foodandwine.com/news/pizza-delivery-polling-places-long-lines",
        title: "Food and Wine",
        img: "food_wine.png",
      },
      {
        url: "https://abcnews.go.com/GMA/News/video/people-helping-polls-58993925",
        title: "Good Morning America",
        img: "gma.png",
      },
      {
        url: "https://www.refinery29.com/en-us/2016/11/129103/pizza-to-the-polls-election-day-delivery-service",
        title: "Refinery 29",
        img: "refinery_29.png",
      },
      {
        url: "https://www.fastcompany.com/3065430/want-to-help-democracy-donate-to-send-pizza-to-people-waiting-in-line-to-vote",
        title: "Fast Company",
        img: "fast_company.png",
      },
      {
        url: "https://www.vice.com/en/article/wnb8x5/this-website-lets-you-send-pizza-to-protestors-around-america",
        title: "Vice",
        img: "vice.png",
      },
    ];
    return (
      <Host>
        <section id="trucks" class="page">
          <div class="container">
            <h1>Press</h1>
            <div class="photos">
              <img src="/images/pics/2020_photo_1.JPG" alt="Person holding pizza" />
              <img src="/images/pics/2020_photo_2.JPG" alt="Person receiving pizza" />
              <img src="/images/pics/2020_photo_3.JPG" alt="Person delivering pizza" />
              <p> Photo Credit: Nina Roberts for Grub Street</p>
            </div>
            <ul class="press-logos">
              {press.map(p => (
                <li>
                  <a href={p.url} target="_blank">
                    <img src={`/images/press/${p.img}`} alt="{p.title}" />
                  </a>
                </li>
              ))}
            </ul>
            <hr />
            <p>
              If you’d like to get in touch with us for a story send an email to <a href="mailto:press@polls.pizza">press@polls.pizza</a>.
            </p>
            <p>
              <a href="/press-release.pdf">Oct. 5, 2020 Press Release</a>
            </p>
            <p>
              <a href="/downloads/press-release-2.pdf">Oct. 21, 2020 Press Release</a>
            </p>
            <p>
              <a href="/downloads/press-release-3.pdf">Dec. 17, 2020 Press Release (Georgia Runoff)</a>
            </p>
            <p>
              <a href="https://www.businesswire.com/news/home/20210318005632/en/Pizza-to-the-Polls-Slice-Slice-Out-Hunger-and-CORE-Team-Up-to-Bring-Pizza-to-Vaccination-Lines">
                Mar. 18, 2021 Press Release (Vax and Snacks)
              </a>
            </p>
            <p>
              Learn more about our story{" "}
              <a href="/about" class="has-text-teal">
                here
              </a>
              .
            </p>
          </div>
        </section>
      </Host>
    );
  }
}
