import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-trucks",
  styleUrl: "page-trucks.scss",
})
export class PageTrucks {
  public componentWillLoad() {
    document.title = `Food Trucks | Pizza to the Polls`;
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
              For the 2020 election season, Pizza to the Polls launched a food truck program in partnership with Uber Eats and vendors such as Milk Bar, Shake Shack, and Pipcorn.
              We sent our food trucks to 29 cities, delivering treats to polling locations with long lines throughout early voting and Election Day.
            </p>
          </div>
          <div class="about">
            <div class="container">
              <p>
                Since the COVID-19 pandemic began in March 2020, we saw in-person voting locations struggle. Poll worker shortages reduced the number of polling places — and social
                distancing measures limited the number of people who could vote at one time. As a result, lines got longer.
              </p>
              <p>
                We launched our Food Truck program to safely provide free, individually wrapped snacks and beverages to everyone. Our food trucks were staffed with trained
                professionals wearing masks and gloves and equipped with hand sanitizer, soap, disinfectant, and additional cleaning supplies. We had many{" "}
                <a href="/partners">partners</a> that ensured the success of this program, including Impactual, Tinsel Experiential Design, Roaming Hunger, Uber Eats, and dozens of
                food & drink vendors. In the end, we delivered 1m+ snacks to 29 Cities over 290+ truck rolling days. We plan to continue our Food Truck program in future election
                cycles.
              </p>
            </div>
          </div>
          <div class="hashtag">#democracyisdelicious</div>
          <div class="container schedule">
            <h2>2020 Locations and Schedule</h2>
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
                <strong>Indianapolis, IN</strong> Oct. 29 - Nov. 3
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
                <strong>Cleveland, OH</strong> Oct. 30 - Nov. 3
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
