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
    const press2020 = [
      {
        url: "https://www.nytimes.com/2020/11/03/opinion/volunteers-election-2020.html",
        title: "New York Times Opinion",
      },
      {
        url: "https://www.facebook.com/watch/?extid=0&v=760120704846575",
        title: "NowThis",
      },
      {
        url: "https://www.today.com/video/59-million-voters-have-already-cast-ballots-a-us-record-94645317535",
        title: "Today Show",
      },
      {
        url: "https://www.kcrw.com/culture/shows/good-food/smells-flavors-tortilla-tournament-winner-pizza-polls/scott-duncombe-pizza-polls",
        title: "KCRW",
      },
      {
        url: "https://www.cnn.com/2020/09/21/politics/pizza-polling-early-voting-election/index.html",
        title: "CNN",
      },
      {
        url: "https://www.today.com/food/pizza-polls-hopes-free-pizza-will-keep-voters-line-t196771",
        title: "Today.com",
      },
      {
        url: "https://www.inc.com/gabrielle-bienasz/pipcorn-nuchas-sticky-fingers-pizza-to-the-polls.html",
        title: "Inc",
      },
      {
        url: "https://time.com/5904611/early-voting-long-lines-entertainment/",
        title: "Time",
      },
      {
        url: "https://www.eater.com/21539118/do-food-at-the-polls-initiatives-work-voter-turnout-election-voting",
        title: "Eater",
      },
      {
        url: "https://www.grubstreet.com/2020/10/pizza-to-the-polls-early-voting-lines-nyc.html",
        title: "Grub Street",
      },
      {
        url: "https://www.thrillist.com/eat/nation/pizza-to-the-polls-nonprofit-scott-duncombe-interview",
        title: "Thrillist",
      },
      {
        url: "https://www.shondaland.com/act/news-politics/a34535143/delivering-pizza-to-voters-at-the-polls/",
        title: "Shondaland",
      },
      {
        url: "https://www.oprahmag.com/life/a34483172/pizza-to-the-polls-long-lines/",
        title: "Oprah Magazine",
      },
      {
        url: "https://www.buzzfeednews.com/article/skbaer/long-lines-election-day-2020",
        title: "BuzzFeed",
      },
      {
        url: "https://www.eater.com/21539118/do-food-at-the-polls-initiatives-work-voter-turnout-election-voting",
        title: "Eater",
      },
    ];
    return (
      <Host>
        <section id="trucks" class="page">
          <div class="container">
            <h1>Press</h1>
            <h3>
              <a href="/press-release.pdf">Press release for our 2020 work.</a>
            </h3>
            <h3>
              <a href="/downloads/press-release-2.pdf">Second press release for our 2020 work.</a>
            </h3>
            <p>
              If you’d like to get in touch with us for a story send an email to <a href="mailto:press@polls.pizza">press@polls.pizza</a>.
            </p>
            <p>
              <a href="/about" class="has-text-teal">
                Learn more about our story.
              </a>
            </p>
            <h2>2020 Press</h2>
            <div class="photos">
              <img src="/images/pics/2020_photo_1.JPG" alt="Person holding pizza" />
              <img src="/images/pics/2020_photo_2.JPG" alt="Person receiving pizza" />
              <img src="/images/pics/2020_photo_3.JPG" alt="Person delivering pizza" />
              <p> Photo Credit: Nina Roberts for Grub Street</p>
            </div>
            <ul>
              {press2020.map(p => (
                <li>
                  <a href={p.url} target="_blank">
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
            <hr />
            <h2>2018 press</h2>
            <ul>
              <li>
                <a href="https://npr.org/2018/10/25/660436884/long-line-to-vote-a-pizza-delivery-service-will-send-a-pie-to-crowded-polling-pl">NPR’s Morning Edition</a>
              </li>
              <li>
                <a href="https://www.foodandwine.com/news/pizza-delivery-polling-places-long-lines">Food &amp; Wine</a>
              </li>
              <li>
                <a href="https://thetakeout.com/pizza-delivery-polls-voting-long-lines-group-1830071157">The Takeout</a>
              </li>
              <li>
                <a href="https://www.abc15.com/news/national/pizza-to-the-polls-delivers-pizza-to-hungry-voters?fbclid=IwAR3lGkR-GHqOY0UopEStfXkd_7AxQYitbnahAa8VGYlIVog8dkZEWMf8KRg">
                  ABC15
                </a>
              </li>
              <li>
                <a href="https://www.newsweek.com/pizza-polls-delivers-thousands-pizzas-waiting-voters-1203911">Newsweek</a>
              </li>
              <li>
                <a href="https://www.buzzfeed.com/aliciabarron/stuck-in-a-long-line-waiting-to-vote-pizza-to-the-polls?bftw&amp;utm_term=4ldqpfp#4ldqpfp">Buzzfeed</a>
              </li>
              <li>
                <a href="https://abcnews.go.com/GMA/News/video/people-helping-polls-58993925">Good Morning America</a>
              </li>
            </ul>
            <h2>2016 press</h2>
            <ul>
              <li>
                <a href="https://twitter.com/complexhustle/status/796103228945534976">Complex</a>
              </li>
              <li>
                <a href="https://www.businessinsider.com/pizza-to-the-polls-election-polling-2016-11">Business Insider</a>
              </li>
              <li>
                <a href="https://people.com/food/how-to-donate-pizza-to-voters-at-polls/">People</a>
              </li>
              <li>
                <a href="https://www.eater.com/2016/11/7/13552938/pizza-delivery-polls-feed-voters">Eater</a>
              </li>
              <li>
                <a href="https://munchies.vice.com/en_us/article/wnb8x5/this-website-lets-you-send-pizza-to-protestors-around-america">Vice</a>
              </li>
              <li>
                <a href="https://www.foxnews.com/food-drink/stuck-in-a-long-voting-line-pizza-to-the-polls-to-the-rescue">Fox News</a>
              </li>
              <li>
                <a href="https://www.wweek.com/news/2016/11/07/portland-political-organizers-are-sending-pizza-to-people-waiting-in-poll-lines-across-america/">Willamette Week</a>
              </li>
              <li>
                <a href="https://www.kgw.com/video/entertainment/television/programs/portland-today/group-delivered-pizza-to-voters/283-2418311">KGW</a>
              </li>
              <li>
                <a href="https://www.refinery29.com/en-us/2016/11/129103/pizza-to-the-polls-election-day-delivery-service">Refinery29</a>
              </li>
              <li>
                <a href="https://www.fastcompany.com/3065430/want-to-help-democracy-donate-to-send-pizza-to-people-waiting-in-line-to-vote">Fast Company</a>
              </li>
            </ul>
          </div>
        </section>
      </Host>
    );
  }
}
