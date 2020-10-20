import { Component, h, Host, State } from "@stencil/core";

import { baseFetch } from "../../lib/base";

interface Order {
  id: number;
  pizzas: number;
  createdAt: string;
  location: {
    fullAddress: string;
    city: string;
    state: string;
  };
  reports: Array<{
    reportURL: string;
    createdAt: string;
  }>;
}

@Component({
  tag: "page-activity",
  styleUrl: "page-activity.scss",
})
export class PageActivity {
  @State() public orders: Order[] = [];
  @State() public page: number = 0;
  @State() public hasMore: boolean = false;

  public async componentWillLoad() {
    document.title = `Activity | Pizza to the Polls`;
    this.loadMore();
  }

  public render() {
    const ordersByDay = this.ordersByDay();
    return (
      <Host>
        <section class="page">
          <div class="container">
            <a class="refresh" onClick={(_e: Event) => this.refreshRecent()}>
              Refresh
            </a>
            <h1>Recent Deliveries</h1>
            {ordersByDay.map(({ date, orders }) => (
              <div>
                <h3>{date}</h3>
                <ul class="orders">
                  {orders.map(({ createdAt, pizzas, location: { fullAddress }, reports }: Order) => (
                    <li>
                      {pizzas} pizza{pizzas === 1 ? "" : "s"} at {new Date(createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} for {fullAddress}
                      <ul>
                        {reports.map(({ reportURL, createdAt: reportCreatedAt }) => (
                          <li>
                            <a href={reportURL} target="_blank">
                              Reported at {new Date(reportCreatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {ordersByDay.length > 0 ? (
              <button hidden={!this.hasMore} class="button is-cyan is-fullwidth" onClick={(_e: Event) => this.loadMore()}>
                Load More
              </button>
            ) : (
              <h3>Loading...</h3>
            )}
          </div>
        </section>
      </Host>
    );
  }

  private async refreshRecent() {
    this.page = 0;
    this.orders = [];
    await this.loadMore();
  }
  private async loadMore() {
    const { count, results } = await await baseFetch(`/orders?page=${this.page}`);

    this.orders = Object.values(
      (this.orders || []).concat(results).reduce((combined: { [key: number]: Order }, order: Order) => {
        combined[order.id] = combined[order.id] || order;
        return combined;
      }, {}),
    ).reverse();

    this.hasMore = this.orders.length < count;
    this.page += 1;
  }

  private ordersByDay(): Array<{ date: string; orders: Order[] }> {
    return Object.values(
      this.orders.reduce((byDate: { [key: string]: { date: string; orders: Array<Order> } }, order: Order) => {
        const date = new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        byDate[date] = byDate[date] || { orders: [], date };
        byDate[date].orders.push(order);
        return byDate;
      }, {}),
    );
  }
}
