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
    waitTime: string;
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
  @State() public isRefreshing: boolean = false;

  public async componentWillLoad() {
    document.title = `Activity | Pizza to the Polls`;
    this.loadMore();
  }

  public render() {
    const ordersByDay = this.ordersByDay();
    return (
      <Host>
        <section class="page activity">
          <div class="container">
            <div class="box">
              <a class={"refresh-button button is-teal is-hidden-mobile " + (this.isRefreshing ? "is-loading is-disabled " : "")} onClick={(_e: Event) => this.refreshRecent()}>
                Refresh
              </a>
              <h1>Recent Deliveries</h1>
              <a
                class={"refresh-button button is-teal is-fullwidth is-hidden-tablet " + (this.isRefreshing ? "is-loading is-disabled " : "")}
                onClick={(_e: Event) => this.refreshRecent()}
              >
                Refresh
              </a>
              <p>
                If you'd like to help keep the pizza flowing, <stencil-route-link url="/donate">make a donation!</stencil-route-link>
              </p>
              {ordersByDay.map(({ date, orders }) => (
                <div class="order-day">
                  <h3 class="date-header">{date}</h3>
                  <ul class="pizza-list order-list">
                    {orders.map(({ id, createdAt, pizzas, location: { fullAddress }, reports }: Order) => (
                      <li id={"order-id-" + id}>
                        <b>
                          {pizzas} pizza{pizzas === 1 ? "" : "s"} ordered at {new Date(createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} for{" "}
                          {fullAddress}
                        </b>
                        <ul>
                          {reports.map(({ reportURL, createdAt: reportCreatedAt, waitTime }) => (
                            <li>
                              <a href={reportURL} target="_blank" rel="noopener noreferrer">
                                Reported at {new Date(reportCreatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </a>
                              {waitTime && (
                                <span>
                                  {" "}
                                  with an est. wait time <span class="has-no-word-break">of {waitTime}</span>
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {ordersByDay.length > 0 ? (
                <button
                  hidden={!this.hasMore}
                  class={"button is-teal is-fullwidth " + (this.isRefreshing ? "is-loading is-disabled " : "")}
                  onClick={(_e: Event) => this.loadMore()}
                >
                  Load More
                </button>
              ) : (
                <div id="loading-container">
                  <div class="box is-small has-background-blue">
                    <p class="has-text-centered has-text-white">Loading...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </Host>
    );
  }

  private async refreshRecent() {
    this.page = 0;
    this.orders = [];
    // Scroll page to top
    if (window) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    await this.loadMore(false);
  }
  private async loadMore(withScroll = true) {
    this.isRefreshing = true;
    // Get last visible order to scroll to after loading more
    const lastDay = document.querySelector(".order-day:last-of-type") as HTMLElement;
    const lastOrder = lastDay?.querySelector(".order-list > li:last-of-type") as HTMLElement;

    const { count, results } = await await baseFetch(`/orders?page=${this.page}`);

    this.orders = Object.values(
      (this.orders || []).concat(results).reduce((combined: { [key: number]: Order }, order: Order) => {
        combined[order.id] = combined[order.id] || order;
        return combined;
      }, {}),
    ).reverse();

    if (!!withScroll && lastOrder) {
      setTimeout(() => {
        document.getElementById(lastOrder.id)?.scrollIntoView();
      }, 200);
    }
    this.hasMore = this.orders.length < count;
    this.page += 1;
    this.isRefreshing = false;
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
