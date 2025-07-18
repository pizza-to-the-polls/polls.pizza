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
    const press: { url: string; title: string; img: string }[] = [
      {
        url: "https://www.nasdaq.com/events/pizza-polls-slice-rings-closing-bell",
        title: "NASDAQ",
        img: "nasdaq.png",
      },
      {
        url: "https://6abc.com/post/pizza-polls-feeds-philly-election-day/15513789/",
        title: "ABC Philadelphia",
        img: "abc-philadelphia.png",
      },
      {
        url: "https://www.cbs58.com/news/voter-engagement-and-pizza-take-center-stage-at-milwaukee-beaches",
        title: "CBS Milwaukee",
        img: "cbs-milwaukee.png",
      },
      {
        url: "https://www.tmj4.com/news/milwaukee-county/pizza-party-at-bradford-beach-highlights-civic-engagement",
        title: "NBC Milwaukee",
        img: "nbc-milwaukee.png",
      },
      {
        url: "https://www.cbsnews.com/miami/video/focus-on-national-voter-registration-day/",
        title: "CBS News",
        img: "cbs-news.png",
      },
      {
        url: "https://theatlantavoice.com/georgia-voter-outreach-initiatives/",
        title: "Atlanta Voice",
        img: "atlanta-voice.png",
      },
      {
        url: "https://drive.google.com/file/d/1_I_ISJ2nh3ffULjQmYPc4S5bGjs0qcWI/view",
        title: "NBC Atlanta",
        img: "nbc-atlanta.png",
      },
      {
        url: "https://www.google.com/url?q=https://www.goodgoodgood.co/articles/gen-z-politics-pizza-party&sa=D&source=docs&ust=1745617557720083&usg=AOvVaw0UmH7LkMAqw7GpJOcryF1V",
        title: "Good Good Good",
        img: "goodgoodgood.svg",
      },
      {
        url: "https://www.theatlantic.com/ideas/archive/2024/10/citizens-guide-defending-2024-election/680254/",
        title: "The Atlantic",
        img: "atlantic.png",
      },
      {
        url: "https://grist.org/looking-forward/5-ways-to-get-out-the-vote-for-climate-in-the-final-days-before-the-u-s-presidential-election/",
        title: "Grist",
        img: "grist.png",
      },
      {
        url: "https://www.bbc.co.uk/bitesize/articles/zqwjfdm",
        title: "BBC",
        img: "bbc.png",
      },
      {
        url: "https://www.vanityfair.com/news/story/monica-lewinsky-25-ways-for-us-to-calm-the-f-k-down-between-now-and-november-5",
        title: "Vanity Fair",
        img: "vanity-fair.svg",
      },
      {
        url: "https://www.aarp.org/politics-society/government-elections/info-2024/election-day-freebies-deals.html",
        title: "AARP",
        img: "arp.svg",
      },
      {
        url: "https://secretatlanta.co/pizza-to-the-poles/",
        title: "Secret Atlanta",
        img: "secret-atlanta.png",
      },
      {
        url: "https://thephiladelphiacitizen.org/we-voted-philly/",
        title: "The Philadelphia Citizen",
        img: "philly.webp",
      },
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
        <section id="press" class="page">
          <div class="container">
            <ui-card>
              <h1>Press</h1>
              <div class="video">
                <video controls>
                  <source src="videos/cnn-clip.webm" type="video/webm" />
                  <source src="videos/cnn-clip.mp4" type="video/mp4" />
                </video>
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
                Learn more about our story{" "}
                <a href="/about" class="has-text-teal">
                  here
                </a>
                .
              </p>
            </ui-card>
          </div>
        </section>
      </Host>
    );
  }
}
