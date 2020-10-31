import { Component, Fragment, FunctionalComponent, h, Host, Prop, State, Watch } from "@stencil/core";
import { MatchResults, RouterHistory } from "@stencil/router";
// @ts-ignore
import {} from "googlemaps";

import { LocationStatus, OrderDetails, OrderInfo, OrderTypes, PizzaApi } from "../../api";
import { scrollPageToTop } from "../../util";

enum FoodChoice {
  all = "All food",
  pizza = "Pizza",
  trucks = "Food trucks",
}

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

const formatDate = (date: Date) => date.toLocaleDateString([], { year: "2-digit", month: "2-digit" });

const ReportLink = () => <stencil-route-link url="/report">Make a report</stencil-route-link>;

const FoodChoices: FunctionalComponent<{
  selected: FoodChoice;
  onSelected: (option: FoodChoice) => void;
}> = ({ selected, onSelected }) => (
  <div class="food-choices">
    <ul>
      {(Object.values(FoodChoice) as FoodChoice[]).map(x => (
        <li class={{ selected: selected === x }} onClick={() => onSelected(x)}>
          {x}
        </li>
      ))}
    </ul>
  </div>
);

const OrderDetailDisplay: FunctionalComponent<{ order: OrderDetails | null; onClick?: () => void }> = ({ order, onClick }) => (
  <li style={{ cursor: "pointer" }} onClick={onClick}>
    <span style={{ fontSize: "0.8em", fontWeight: "600" }}>
      <ui-dynamic-text value={order} format={x => x.location.fullAddress} />
    </span>
    <div>
      <ui-dynamic-text value={order} format={x => `${x.quantity} ${x.orderType} at ${formatDate(x.createdAt)} ${formatTime(x.createdAt)}`} />
    </div>
  </li>
);

const OrderInfoDisplay: FunctionalComponent<{ order: OrderInfo | null; reportCount: number }> = ({ order, reportCount }) => (
  <li>
    <span style={{ fontSize: "0.8em", fontWeight: "600" }}>
      <ui-dynamic-text value={order} format={x => `${x.quantity} ${x.orderType} en route`} />
    </span>
    <div>
      <ui-dynamic-text value={order} format={x => `${formatDate(x.createdAt)} ${formatTime(x.createdAt)} • ${reportCount} reports`} />
    </div>
  </li>
);

const OrderInfoList: FunctionalComponent<{ items: OrderInfo[]; selectedLocation: LocationStatus }> = ({ items, selectedLocation }) =>
  items.map(x => <OrderInfoDisplay order={x} reportCount={selectedLocation.notFound ? 0 : selectedLocation.reports.length} />);

@Component({
  tag: "page-deliveries",
  styleUrl: "page-deliveries.scss",
  shadow: false,
})
export class PageDeliveries {
  @Prop() public history!: RouterHistory;
  @Prop() public match!: MatchResults;

  @State() private selectedAddress?: string;
  // @ts-ignore
  @State() private selectedAddressLatLng?: { lat: number; lng: number };
  @State() private selectedFood: FoodChoice;
  @State() private selectedLocation?: LocationStatus;
  @State() private recentOrders?: OrderDetails[];

  private map?: HTMLUiGeoMapElement;

  constructor() {
    this.selectedFood = FoodChoice.all;
  }

  public componentWillLoad() {
    document.title = `Deliveries | Pizza to the Polls`;
    this.setAddressFromUrl(this.match);

    PizzaApi.getOrders().then(orders => (this.recentOrders = orders.results));
  }

  /**
   * Watch for changes in the URL by watching for the match prop and make sure we are viewing that address
   */
  @Watch("match")
  public matchChanged(newMatch: MatchResults) {
    this.setAddressFromUrl(newMatch);
  }

  /**
   * Lookup location info when the selected address value changes
   */
  @Watch("selectedAddress")
  public onSelectedAddressChanged(newAddress?: string, oldAddress?: string) {
    const ownPathFragment = this.history.location.pathname.split("/").filter(x => x !== "")[0];
    if (newAddress == null && oldAddress != null) {
      const path = `/${ownPathFragment}`;
      this.selectedLocation = undefined;
      if (this.history.location.pathname !== path) {
        this.history.push(path, {});
      }
      if (this.recentOrders != null) {
        this.onOrdersChanged(this.recentOrders);
      }
    } else if (newAddress != null && newAddress !== oldAddress) {
      const path = `/${ownPathFragment}/${newAddress}`;
      if (this.history.location.pathname !== path) {
        this.history.push(path, {});
      }
      PizzaApi.getLocationStatus(newAddress, e => console.log(e)).then(x => {
        this.selectedLocation = x || { notFound: true };
        if (x == null) {
          console.log("No polling place found for address");
        }
      });
    }
  }

  @Watch("selectedLocation")
  public onSelectedLocation(newLocation: LocationStatus) {
    if (newLocation != null && newLocation.notFound == null) {
      // make sure we have the correct lat/lng selected
      this.selectedAddressLatLng = {
        lat: parseFloat(newLocation.lat),
        lng: parseFloat(newLocation.lng),
      };
    }
  }

  @Watch("selectedAddressLatLng")
  public onSelectedAddressLatLngChanges(coords?: { lat: number; lng: number }) {
    // center map when selected location changes
    if (coords?.lat == null) {
      const { recentOrders } = this;
      if (recentOrders != null && recentOrders.length > 0) {
        this.onOrdersChanged(recentOrders);
      }
    } else {
      this.recenterMap(coords);
    }
  }

  /**
   * Center map on the first location when the recent order list changes (unless we're viewing a specific address)
   */
  @Watch("recentOrders")
  public onOrdersChanged(orders: OrderDetails[]) {
    if (orders && orders.length > 0 && this.selectedAddress == null) {
      this.recenterMap({
        lat: parseFloat(orders[0].location.lat),
        lng: parseFloat(orders[0].location.lng),
      });
    }
  }

  public recenterMap(location: { lat: number; lng: number }) {
    const map = this.map;
    if (map) {
      map.setCenter(location, true);
      scrollPageToTop();
    }
  }

  public render() {
    const { recentOrders, selectedAddress, selectedLocation, selectedFood } = this;
    const foundLocation = selectedLocation != null && selectedLocation.notFound == null ? selectedLocation : null;
    const orderFilter = (order: OrderInfo | null) => {
      return order == null || selectedFood === FoodChoice.all || (selectedFood === FoodChoice.pizza && order.orderType === OrderTypes.pizzas);
      // || ( selectedFood === FoodChoice.trucks && order. === OrderTypes.pizzas );
    };
    const locationOrders = (foundLocation && foundLocation.orders.filter(orderFilter).slice(0, 3)) || [];
    const locationOrdersPrevious = (foundLocation && foundLocation.orders.filter(orderFilter).slice(3, 6)) || [];
    const currentAddress = selectedAddress != null ? foundLocation?.fullAddress || selectedAddress : recentOrders?.find(_ => true)?.location.fullAddress;
    const nowFeeding = currentAddress != null ? ": " + currentAddress : null;
    return (
      <Host>
        <ui-main-content background={selectedAddress != null ? "teal" : "yellow"} class={{ "selected-location": selectedAddress != null }}>
          <div>
            {selectedAddress != null ? (
              <div style={{ padding: "1em 0 0 0" }}>
                <a onClick={() => (this.selectedAddress = undefined)}>Back to all deliveries</a>
                <h3>{selectedAddress}</h3>
              </div>
            ) : (
              <Fragment>
                <h2>Deliveries</h2>
                <ui-address-input
                  label="Search for your polling place"
                  buttonLabel="Search"
                  placeholder="1600 Pennsylvania Ave. Washington, D.C."
                  onAddressSelected={e => {
                    e.preventDefault();
                    this.selectedAddress = e.detail.address;
                    this.selectedAddressLatLng = { lat: e.detail.lat, lng: e.detail.lng };
                  }}
                />
              </Fragment>
            )}
          </div>
          <FoodChoices selected={selectedFood} onSelected={x => (this.selectedFood = x)} />
        </ui-main-content>

        <hr class="heavy" />
        <div class="now-feeding">Now feeding{nowFeeding || " American voters"}</div>
        <div style={{ width: "100%", height: "200px" }}>
          <ui-geo-map ref={x => (this.map = x)} />
        </div>

        <ui-main-content background="yellow">
          <ui-card>
            <h3>Current Deliveries</h3>
            {selectedLocation != null && selectedFood === FoodChoice.trucks && locationOrders.length < 1 ? (
              <p>
                There are no food trucks currently at this location.
                <br />
                <ReportLink />
              </p>
            ) : selectedLocation != null && selectedLocation.notFound === true ? (
              <p>
                There are no reports of lines at this location.
                <br />
                <ReportLink />
              </p>
            ) : (
              <ui-pizza-list>
                {selectedLocation != null ? (
                  <OrderInfoList items={locationOrders} selectedLocation={selectedLocation} />
                ) : (
                  (recentOrders || ([null, null, null] as (OrderDetails | null)[])) // show placeholders if no data
                    .filter(orderFilter)
                    .slice(0, 3)
                    .map(x => (
                      <OrderDetailDisplay
                        order={x}
                        onClick={() => {
                          if (x != null) {
                            this.selectedAddress = x.location.fullAddress;
                            this.selectedAddressLatLng = {
                              lat: parseFloat(x.location.lat),
                              lng: parseFloat(x.location.lng),
                            };
                          }
                        }}
                      />
                    ))
                )}
              </ui-pizza-list>
            )}
          </ui-card>

          {((selectedLocation != null && locationOrdersPrevious.length > 0) || selectedLocation == null) && (
            <ui-card>
              <h3>Previous Deliveries</h3>
              <ui-pizza-list hasIcon={false}>
                {selectedLocation != null ? (
                  <OrderInfoList items={locationOrdersPrevious} selectedLocation={selectedLocation} />
                ) : (
                  (recentOrders || ([null, null, null, null, null, null] as (OrderDetails | null)[])) // show placeholders if no data
                    .filter(orderFilter)
                    .slice(3, 6)
                    .map(x => (
                      <OrderDetailDisplay
                        order={x}
                        onClick={() => {
                          if (x != null) {
                            this.selectedAddress = x.location.fullAddress;
                            this.selectedAddressLatLng = {
                              lat: parseFloat(x.location.lat),
                              lng: parseFloat(x.location.lng),
                            };
                          }
                        }}
                      />
                    ))
                )}
              </ui-pizza-list>
              {selectedLocation == null && recentOrders != null && <stencil-route-link url="/activity">view more</stencil-route-link>}
            </ui-card>
          )}

          {selectedLocation != null && selectedLocation.notFound !== true && selectedLocation.reports.length > 0 && (
            <ui-card isCollapsible={true} headerText="Reports">
              <ul>{selectedLocation != null && selectedLocation.reports.slice(0, 3).map(x => <li>{x}</li>)}</ul>
            </ui-card>
          )}
        </ui-main-content>
      </Host>
    );
  }

  private setAddressFromUrl(match: MatchResults) {
    const location = match.params.location;
    if (location !== this.selectedAddress) {
      this.selectedAddress = location; // != null ? decodeURIComponent( location ) : undefined;
      // TODO: Lookup address lat/lng
      this.selectedAddressLatLng = undefined;
    }
  }
}
