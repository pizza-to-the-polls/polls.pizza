import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-trucks",
  styleUrl: "page-trucks.css",
})
export class PageTrucks {
  public componentWillLoad() {
    document.title = `Food Trucks | Pizza to the Polls`;
  }

  public render() {
    return (
      <Host>
        <section id="trucks" class="page">
          <div class="container">
            <h1>Food Trucks</h1>
            <img src="/images/truck.jpg" alt="Food truck" class="photo" />
            <p>
              For the 2020 election season, Pizza to the Polls is launching a food truck program in partnership with Uber Eats and restaurant partners like Milk Bar, Shake Shack,
              and more. We’ll be sending out food trucks in 25 cities, delivering treats to polling locations with long lines throughout early voting and Election Day.
            </p>
            <p>
              Since the COVID-19 pandemic began in March, we’ve seen in-person voting locations struggle. Poll worker shortages are reducing the number of polling places — and
              social distancing measures are limiting the number of people who can vote at one time. As a result, lines are getting longer. By launching food trucks in cities with
              a history of long lines, we plan to safely provide free, individually wrapped snacks and beverages to everyone.
            </p>
            <p>
              Our food trucks will be staffed with trained professionals who will be wearing masks and gloves and will be equipped with hand sanitizer, soap, disinfectant, and
              additional cleaning supplies.
            </p>
            <h2>Locations and schedule</h2>
            <ul>
              <li>Phoenix, AZ (Oct. 29, Oc. 30, Nov. 3)</li>
              <li>Los Angeles, CA (Nov. 3)</li>
              <li>Washington, DC (Oct. 30 - Nov. 3)</li>
              <li>Miami, FL (Oct. 29 - Nov. 1, Nov. 3)</li>
              <li>Tampa, FL (Oct. 29 - Nov. 1, Nov. 3)</li>
              <li>Orlando, FL (Oct. 29 - Nov. 1, Nov. 3)</li>
              <li>Gainesville, FL (Oct. 29 - Nov. 1, Nov. 3)</li>
              <li>Atlanta, GA (Oct. 29, Oc. 30, Nov. 3)</li>
              <li>Louisville, KY (Nov. 3)</li>
              <li>Detroit, MI (Oct. 29 - Nov. 3)</li>
              <li>Ann Arbor, MI (Oct. 29 - Nov. 3)</li>
              <li>Minneapolis, MN (Oct. 29 - Nov. 3)</li>
              <li>Charlotte, NC (Oct. 29 - Oct. 31, Nov. 3)</li>
              <li>Raleigh, NC (Oct. 29 - Oct. 31, Nov. 3)</li>
              <li>Greensboro, NC (Oct. 29 - Oct. 31, Nov. 3)</li>
              <li>Las Vegas, NV (Nov. 3)</li>
              <li>Reno, NV (Nov. 3)</li>
              <li>New York, NY (Oct. 29 - Nov. 1, Nov. 3)</li>
              <li>Philadelphia, PA (Oct. 29 - Nov. 3)</li>
              <li>Pittsburgh, PA (Oct. 29 - Nov. 3)</li>
              <li>Charleston, SC (Nov. 3)</li>
              <li>Nashville, TN (Oct. 29, Nov. 3)</li>
              <li>Houston, TX (Nov. 3)</li>
              <li>Austin, TX (Oct. 29, Oct. 30, Nov. 3)</li>
              <li>Milwaukee, WI (Oct. 29 - Nov. 1, Nov. 3)</li>
            </ul>
          </div>
        </section>
      </Host>
    );
  }
}
