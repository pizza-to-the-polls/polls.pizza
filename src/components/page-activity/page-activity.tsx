import { Component, h, Host, State } from "@stencil/core";

interface Location {
  url: string;
  fullAddress: string;
}

const loadOrders = async (page: number): Promise<{ results: Array<Location>; count: number }> => {
  const resp = await fetch(`${process.env.PIZZA_BASE_DOMAIN}/orders?page=${page}`, {
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  });
  return await resp.json();
};

@Component({
  tag: "page-activity",
  styleUrl: "page-activity.scss",
})
export class PageActivity {
  @State() public locations: Array<Location> = [];
  @State() public page: number = 0;
  @State() public hasMore: boolean = false;

  public async componentWillLoad() {
    document.title = `Activity | Pizza to the Polls`;
    this.loadMore();
  }

  public render() {
    return (
      <Host>
        <section class="page">
          <div class="container">
            <h1>Activity</h1>
            <h2>Recent Deliveries</h2>
            <ul class="locations">
              {this.locations.map(({ url, fullAddress }) => (
                <li>
                  <a href={url} target="_blank">
                    {fullAddress}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Host>
    );
  }

  private async loadMore() {
    const { count, results } = await loadOrders(this.page);
    const { locations } = this;

    this.page += 1;
    this.locations = (locations || []).concat(results);
    this.hasMore = this.locations.length < count;
  }
}
