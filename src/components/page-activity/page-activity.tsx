import { Component, h, Host, State } from "@stencil/core";

import { getActivity } from "../../lib/sheets";

@Component({
  tag: "page-activity",
  styleUrl: "page-activity.scss",
})
export class PageActivity {
  @State() public locations: Array<{ url: string; location: string }> = [];

  public async componentWillLoad() {
    document.title = `Activity | Pizza to the Polls`
    this.locations = await getActivity();
  }

  public render() {
    return (
      <Host>
        <section class="page">
          <div class="container">
            <h1>Activity</h1>
            <h2>Recent Deliveries</h2>
            <ul class="locations">
              {this.locations.map(({ url, location }) => (
                <li>
                  <a href={url} target="_blank">
                    {location}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Host>
    );
  }
}
