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
          <ui-main-content>
            <ui-card>
              <div class="container intro">
                <h1>Food Trucks</h1>
                <img src="/images/truck.jpg" alt="Food truck" class="image" />
                <div class="democracy-is-delicious">
                  <img src="/images/democracy-is-delicious.png" alt="Democracy is Delicious" width="200" />
                </div>
                <div class="highlights">
                  <img src="/images/cities.png" alt="25 cities" class="highlight" />
                  <img src="/images/staff.png" alt="Trained staff" class="highlight" />
                  <img src="/images/food.png" alt="Free food" class="highlight" />
                </div>
                <p>
                  For the 2020 election season, Pizza to the Polls launched a food truck program in partnership with Uber Eats and vendors such as Milk Bar, Shake Shack, and
                  Pipcorn. We sent our food trucks to 29 cities, delivering treats to polling locations with long lines throughout early voting and Election Day.
                </p>
              </div>
              <div class="about">
                <div class="container">
                  <p>
                    Since the COVID-19 pandemic began in March 2020, we saw in-person voting locations struggle. Poll worker shortages reduced the number of polling places — and
                    social distancing measures limited the number of people who could vote at one time. As a result, lines got longer.
                  </p>
                  <p>
                    We launched our Food Truck program to safely provide free, individually wrapped snacks and beverages to everyone. Our food trucks were staffed with trained
                    professionals wearing masks and gloves and equipped with hand sanitizer, soap, disinfectant, and additional cleaning supplies. We had many{" "}
                    <a href="/partners">partners</a> that ensured the success of this program, including Impactual, Tinsel Experiential Design, Roaming Hunger, Uber Eats, and
                    dozens of food & drink vendors. In the end, we delivered 1m+ snacks to 29 Cities over 290+ truck rolling days. We plan to continue our Food Truck program in
                    future election cycles.
                  </p>
                </div>
              </div>
              <div class="hashtag">#democracyisdelicious</div>
            </ui-card>
          </ui-main-content>
        </section>
      </Host>
    );
  }
}
