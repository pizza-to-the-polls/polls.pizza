import { Component, h, Host } from "@stencil/core";

import { scrollPageToTop } from "../../lib/base";

@Component({
  tag: "page-trucks",
  styleUrl: "page-trucks.scss",
})
export class PageTrucks {
  public componentWillLoad() {
    document.title = `Food Trucks | Pizza to the Polls`;
  }

  public componentDidLoad() {
    if (!window.location.hash) {
      scrollPageToTop();
    }
  }

  public render() {
    return (
      <Host>
        <section id="trucks" class="page">
          <div class="container intro">
            <h1>Food Trucks</h1>
            <img src="/images/truck.jpg" alt="Food truck" class="image" />
            <div class="democracy-is-delicious">
              <img src="/images/democracy-is-delicious.png" alt="Democracy is Delicious" width="200" />
            </div>
            <div class="highlights">
              <img src="/images/cities.png" alt="25 cities" />
              <img src="/images/staff.png" alt="Trained staff" />
              <img src="/images/food.png" alt="Free food" />
            </div>
            <p>
              For the 2020 election season, Pizza to the Polls is launching a food truck program in partnership with Uber Eats and restaurant partners like Milk Bar, Shake Shack,
              and more. We’ll be sending out food trucks in 25 cities, delivering treats to polling locations with long lines throughout early voting and Election Day.
            </p>
          </div>
          <div class="about">
            <div class="container">
              <p>
                Since the COVID-19 pandemic began in March, we’ve seen in-person voting locations struggle. Poll worker shortages are reducing the number of polling places — and
                social distancing measures are limiting the number of people who can vote at one time. As a result, lines are getting longer. By launching food trucks in cities
                with a history of long lines, we plan to safely provide free, individually wrapped snacks and beverages to everyone.
              </p>
              <p>
                Our food trucks will be staffed with trained professionals who will be wearing masks and gloves and will be equipped with hand sanitizer, soap, disinfectant, and
                additional cleaning supplies.
              </p>
            </div>
          </div>
          <div class="hashtag">#democracyisdelicious</div>
          <div class="instructions">
            <div class="container">
              If you spot a long line in one of the cities below, report it <a href="/">here</a> and we'll send along a truck!
            </div>
          </div>
          <div class="container schedule">
            <h2>Locations and schedule</h2>
            <ul>
              <li>
                <strong>Phoenix, AZ</strong> Oct. 24, Oct. 29, Oct. 30, Nov. 3
              </li>
              <li>
                <strong>Los Angeles, CA</strong> Oct. 24, Oct. 29 - Nov. 3
              </li>
              <li>
                <strong>Washington, DC</strong> Oct. 30 - Nov. 3
              </li>
              <li>
                <strong>Miami, FL</strong> Oct. 24, Oct. 29 - Nov. 1, Nov. 3
              </li>
              <li>
                <strong>Tampa, FL</strong> Oct. 24, Oct. 29 - Nov. 1, Nov. 3
              </li>
              <li>
                <strong>Orlando, FL</strong> Oct. 24, Oct. 29 - Nov. 1, Nov. 3
              </li>
              <li>
                <strong>Gainesville, FL</strong> Oct. 24, Oct. 29 - Oct. 31, Nov. 3
              </li>
              <li>
                <strong>Atlanta, GA</strong> Oct. 24, Oct. 29, Oct. 30, Nov. 3
              </li>
              <li>
                <strong>Chicago, IL</strong> Oct. 30 - Nov. 3
              </li>
              <li>
                <strong>Indianapolis, IN</strong> Oct. 30 - Nov. 3
              </li>
              <li>
                <strong>Louisville, KY</strong> Oct. 24, Nov. 3
              </li>
              <li>
                <strong>Detroit, MI</strong> Oct. 24, Oct. 29 - Oct. 31, Nov.2, Nov. 3
              </li>
              <li>
                <strong>Ann Arbor, MI</strong> Oct. 24, Oct. 29 - Oct. 31, Nov.2, Nov. 3
              </li>
              <li>
                <strong>Minneapolis, MN</strong> Oct. 24, Oct. 29 - Nov. 3
              </li>
              <li>
                <strong>Charlotte, NC</strong> Oct. 24, Oct. 29 - Oct. 31, Nov. 3
              </li>
              <li>
                <strong>Raleigh, NC</strong> Oct. 24, Oct. 29 - Oct. 31, Nov. 3
              </li>
              <li>
                <strong>Greensboro, NC</strong> Oct. 24, Oct. 29 - Oct. 31, Nov. 3
              </li>
              <li>
                <strong>Las Vegas, NV</strong> Oct. 24, Oct. 29, Oct. 30, Nov. 3
              </li>
              <li>
                <strong>Reno, NV</strong> Oct. 24, Oct. 29, Oct. 30, Nov. 3
              </li>
              <li>
                <strong>New York, NY</strong> Oct. 24, Oct. 29 - Nov. 1, Nov. 3
              </li>
              <li>
                <strong>Cleveland, OH</strong> Oct. 29 - Nov. 3
              </li>
              <li>
                <strong>Columbus, OH</strong> Oct. 29 - Nov. 3
              </li>
              <li>
                <strong>Philadelphia, PA</strong> Oct. 24, Oct. 29 - Nov. 3
              </li>
              <li>
                <strong>Pittsburgh, PA</strong> Oct. 24, Oct. 29 - Nov. 3
              </li>
              <li>
                <strong>Charleston, SC</strong> Oct. 24, Oct. 29 - Oct. 31, Nov. 3
              </li>
              <li>
                <strong>Nashville, TN</strong> Oct. 24, Oct. 29, Nov. 3
              </li>
              <li>
                <strong>Houston, TX</strong> Oct. 24, Oct. 29, Oct. 30, Nov. 3
              </li>
              <li>
                <strong>Austin, TX</strong> Oct. 24, Oct. 29, Oct. 30, Nov. 3
              </li>
              <li>
                <strong>Milwaukee, WI</strong> Oct. 24, Oct. 29 - Nov. 1, Nov. 3
              </li>
            </ul>
          </div>
        </section>
      </Host>
    );
  }
}
