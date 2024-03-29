import { Build, Component, Fragment, FunctionalComponent, h, Host, Listen, Prop, State, Watch } from "@stencil/core";
import { MatchResults, RouterHistory } from "@stencil/router";

import { LocationInfo, LocationStatus, OrderDetails, OrderInfo, OrderTypes, PizzaApi, TruckDetails, TruckInfo } from "../../api";
import { formatDateTime, formatTime, scrollPageToTop } from "../../util";
import { UiGeoMap } from "../ui-geo-map/ui-geo-map";

enum FoodChoice {
  all = "All food",
  pizza = "Pizza",
  trucks = "Food trucks",
}

type OrderOrTruckItem = { type: "pizza"; data: OrderDetails | null } | { type: "truck"; data: TruckDetails | null };

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

const OrderDetailDisplay: FunctionalComponent<{
  order: OrderDetails | null | undefined;
  noIcon?: boolean;
  onClick?: () => void;
}> = ({ order, onClick, noIcon }) => (
  <li class={{ "pizza-icon": noIcon !== true, "interactive": onClick != null }} onClick={onClick}>
    <span style={{ fontSize: "0.8em", fontWeight: "600" }}>
      <ui-dynamic-text value={order} format={x => x.location.fullAddress} />
    </span>
    <div>
      <ui-dynamic-text value={order} format={x => `${x.quantity} ${x.orderType} at ${formatDateTime(x.createdAt)}`} />
    </div>
  </li>
);

const OrderInfoDisplay: FunctionalComponent<{
  order: OrderInfo | null | undefined;
  reportCount: number;
  noIcon?: boolean;
  onClick?: () => void;
}> = ({ order, reportCount, noIcon, onClick }) => (
  <li class={{ "pizza-icon": noIcon !== true, "interactive": onClick != null }} onClick={onClick}>
    <span style={{ fontSize: "0.8em", fontWeight: "600" }}>
      <ui-dynamic-text value={order} format={x => `${x.quantity} ${x.orderType} en route`} />
    </span>
    <div>
      <ui-dynamic-text value={order} format={x => `${formatDateTime(x.createdAt)}${reportCount > 0 ? ` • ${reportCount} report${reportCount === 1 ? "" : "s"}` : ""}`} />
    </div>
  </li>
);

const TruckInfoDisplay: FunctionalComponent<{
  truck: TruckInfo | null | undefined;
  noIcon?: boolean;
  onClick?: () => void;
}> = ({ truck, noIcon, onClick }) => (
  <li class={{ "truck-icon": noIcon !== true, "interactive": onClick != null }} onClick={onClick}>
    <span style={{ fontSize: "0.8em", fontWeight: "600" }}>
      <ui-dynamic-text value={truck} format={x => x.location.fullAddress} />
    </span>
    <div>
      <ui-dynamic-text value={truck} format={x => `Food truck on location since ${formatDateTime(x.createdAt)}`} />
    </div>
  </li>
);

const OrderAndTruckInfoList: FunctionalComponent<{
  items: OrderOrTruckItem[];
  selectedLocation?: LocationStatus;
  noIcon?: boolean;
  onOrderSelected?: (order: OrderDetails) => void;
}> = ({ items, selectedLocation, noIcon, onOrderSelected }) =>
  items.map(x =>
    x != null && x.type === "truck" ? (
      <TruckInfoDisplay noIcon={noIcon} truck={x.data} />
    ) : (
      <OrderInfoDisplay
        noIcon={noIcon}
        order={x?.data}
        reportCount={selectedLocation?.notFound ? 0 : x?.data?.reports?.length || 0}
        onClick={onOrderSelected == null || x == null || x.data == null ? undefined : () => onOrderSelected(x.data!)}
      />
    ),
  );

@Component({
  tag: "page-deliveries",
  styleUrl: "page-deliveries.scss",
  shadow: false,
})
export class PageDeliveries {
  @Prop() public history!: RouterHistory;
  @Prop() public match!: MatchResults;

  @State() private selectedAddress?: string;
  @State() private selectedLocation?: LocationStatus;
  @State() private selectedOrder?: OrderInfo;
  /**
   * Watched and used to re-center the map
   */
  @State() private mapCenterPoint: { lat: number; lng: number };
  @State() private selectedFood: FoodChoice;
  @State() private recentOrders?: OrderDetails[];
  @State() private recentTrucks?: TruckInfo[];
  @State() private mapZoom: number;

  constructor() {
    this.selectedFood = FoodChoice.all;
    this.mapZoom = UiGeoMap.DEFAULT_ZOOM;
    this.mapCenterPoint = UiGeoMap.US_CENTER;
  }

  public componentWillLoad() {
    document.title = `Deliveries | Pizza to the Polls`;
    this.setAddressFromUrl(this.match);

    if (Build.isBrowser) {
      PizzaApi.getOrders().then(orders => (this.recentOrders = orders.results));
      PizzaApi.getTrucks(true).then(trucks => (this.recentTrucks = trucks.results));
    }
  }

  /**
   * Watch for changes in the URL to make sure we are viewing that location
   */
  @Watch("match")
  public matchChanged(newMatch: MatchResults) {
    this.setAddressFromUrl(newMatch);
  }

  @Listen("hashchange", { target: "window" })
  public hashChanged() {
    const choice: FoodChoice | undefined = (FoodChoice as any)[window.location.hash.replace("#", "")];
    if (choice != null) {
      this.selectedFood = choice == null ? FoodChoice.all : choice;
    }
  }

  /**
   * Lookup location info when the selected address value changes
   */
  @Watch("selectedAddress")
  public selectedAddressChanged(newAddress?: string, oldAddress?: string) {
    if (newAddress === undefined && oldAddress != null) {
      const path = `/deliveries`;
      this.selectedLocation = undefined;
      if (this.history.location.pathname !== path) {
        this.history.push(path, {});
      }
    } else if (newAddress != null && newAddress !== oldAddress) {
      const path = `/deliveries/${newAddress.replace(/\s/g, "+")}`;
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
  public selectedLocationChanged(newLocation: LocationStatus) {
    if (newLocation != null && newLocation.notFound == null) {
      // make sure we have the correct lat/lng selected
      this.mapCenterPoint = {
        lat: parseFloat(newLocation.lat),
        lng: parseFloat(newLocation.lng),
      };
    }
  }

  @Watch("mapCenterPoint")
  public mapCenterPointChanged(coords?: { lat: number; lng: number }) {
    if (coords?.lat === UiGeoMap.US_CENTER.lat) {
      this.mapZoom = UiGeoMap.DEFAULT_ZOOM;
    } else {
      this.mapZoom = UiGeoMap.SELECTED_LOCATION_ZOOM;
    }
    scrollPageToTop();
  }

  public render() {
    const { mapCenterPoint, mapZoom, selectedAddress, selectedFood, selectedLocation, selectedOrder } = this;
    const now = new Date();
    const orderFilter = (order: OrderDetails | null) =>
      order == null || order.cancelledAt || selectedFood === FoodChoice.all || (selectedFood === FoodChoice.pizza && order.orderType === OrderTypes.pizzas);

    const foundLocation = selectedLocation != null && selectedLocation.notFound == null ? selectedLocation : null;

    // TODO: This data manipulation should have its own field and be triggered by @Watch on the relevant input fields
    const locationOrders =
      foundLocation?.orders
        .filter(orderFilter)
        .slice(0, 10)
        .map(x => ({ type: "pizza", data: x } as OrderOrTruckItem)) || [];
    const locationTrucks =
      (foundLocation != null &&
        (selectedFood === FoodChoice.all || selectedFood === FoodChoice.trucks) &&
        this.recentTrucks
          ?.filter(x => x.location.id === foundLocation.id)
          .slice(0, 10)
          .map(x => ({ type: "truck", data: x } as OrderOrTruckItem))) ||
      [];
    const ORDER_CURRENT = Number(now) - 1000 * 60 * 60 * 2.5;
    const TRUCK_CURRENT = Number(now) - 1000 * 60 * 60 * 4;
    const [locationCurrentOrders, locationPreviousOrders] = locationOrders.reduce(
      (sorted: [OrderOrTruckItem[], OrderOrTruckItem[]], x: OrderOrTruckItem) => {
        if (x.data) {
          sorted[Number(x.data.createdAt) > ORDER_CURRENT ? 0 : 1].push(x);
        }
        return sorted;
      },
      [[], []],
    );
    const [locationCurrentTrucks, locationPreviousTrucks] = locationTrucks.reduce(
      (sorted: [OrderOrTruckItem[], OrderOrTruckItem[]], x: OrderOrTruckItem) => {
        if (x.data) {
          sorted[Number(x.data.createdAt) > TRUCK_CURRENT ? 0 : 1].push(x);
        }
        return sorted;
      },
      [[], []],
    );

    const locationItems = [...locationCurrentOrders, ...locationCurrentTrucks].sort((l, r) => (l.data!.createdAt > r.data!.createdAt ? -1 : 1)).slice(0, 3);
    const previousItems = [...locationItems.slice(3, 10000), ...locationPreviousOrders, ...locationPreviousTrucks].sort((l, r) => (l.data!.createdAt > r.data!.createdAt ? -1 : 1));

    const orders = (this.recentOrders || [])
      .filter(orderFilter)
      .slice(0, 10)
      .map(x => ({ type: "pizza", data: x } as OrderOrTruckItem));
    const trucks = (this.recentTrucks != null && (selectedFood === FoodChoice.all || selectedFood === FoodChoice.trucks) ? this.recentTrucks : [])
      .slice(0, 10)
      .map(x => ({ type: "truck", data: x } as OrderOrTruckItem));

    const [currentItems, pastItems] = [...orders, ...trucks]
      .sort((l, r) => (l.data!.createdAt > r.data!.createdAt ? -1 : 1))
      .reduce(
        (sorted: [OrderOrTruckItem[], OrderOrTruckItem[]], x: OrderOrTruckItem) => {
          if (x.data) {
            const TIME_LIMIT = x.type === "pizza" ? ORDER_CURRENT : TRUCK_CURRENT;
            sorted[Number(x.data.createdAt) > TIME_LIMIT ? 0 : 1].push(x);
          }
          return sorted;
        },
        [[], []],
      );
    const combinedItems = [...currentItems.slice(3, 1000), ...pastItems];

    return (
      <Host>
        <ui-main-content class={{ "selected-location": selectedAddress != null }}>
          <ui-card>
            {selectedAddress != null ? (
              <div style={{ padding: "1em 0 0 0" }}>
                <a onClick={() => (this.selectedAddress = undefined)}>Back to all deliveries</a>
                <h2>{selectedAddress}</h2>
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
                    this.selectLocation({
                      fullAddress: e.detail.address,
                      lat: e.detail.lat,
                      lng: e.detail.lng,
                    });
                  }}
                />
              </Fragment>
            )}
            <FoodChoices selected={selectedFood} onSelected={x => (this.selectedFood = x)} />
            <div id="deliveries-map-container" class={{ "is-single-location": selectedAddress != null }}>
              <ui-geo-map
                center={mapCenterPoint}
                zoom={mapZoom}
                currentAddress={selectedAddress}
                deliveries={
                  selectedFood === FoodChoice.all || selectedFood === FoodChoice.pizza
                    ? this.recentOrders?.slice(0, 100).map(x => ({
                        coords: {
                          lat: parseFloat(x.location.lat),
                          lng: parseFloat(x.location.lng),
                        },
                        id: x.location.id,
                      }))
                    : undefined
                }
                trucks={
                  selectedFood === FoodChoice.all || selectedFood === FoodChoice.trucks
                    ? this.recentTrucks?.slice(0, 50).map(x => ({
                        coords: {
                          lat: parseFloat(x.location.lat),
                          lng: parseFloat(x.location.lng),
                        },
                        id: x.location.id,
                      }))
                    : undefined
                }
                onMarkerSelected={({ detail: { type, location } }) => {
                  let locationInfo: LocationInfo | undefined;
                  switch (type) {
                    case "pizza":
                      locationInfo = this.recentOrders?.find(x => x.location.id === location)?.location;
                      break;
                    case "truck":
                      locationInfo = this.recentTrucks?.find(x => x.location.id === location)?.location;
                      break;
                  }
                  this.selectLocation(locationInfo);
                }}
              />
            </div>
          </ui-card>

          <ui-card>
            <div>
              <h3>Recent Deliveries</h3>
              {selectedLocation != null && selectedFood === FoodChoice.trucks && locationItems.length < 1 ? (
                <p>
                  There are no food trucks currently at this location.
                  <br />
                  <ReportLink />
                </p>
              ) : selectedLocation != null && (locationItems.length < 1 || selectedLocation.notFound === true) ? (
                <p>
                  There are no reports of lines at this location.
                  <br />
                  <ReportLink />
                </p>
              ) : (
                <ul>
                  {selectedAddress != null ? (
                    <OrderAndTruckInfoList
                      items={locationItems.length > 0 ? locationItems.slice(0, 3) : []}
                      selectedLocation={selectedLocation}
                      onOrderSelected={order => (this.selectedOrder = order)}
                    />
                  ) : (
                    (currentItems?.length > 0 ? currentItems : []).map(x =>
                      x != null && x.type === "truck" ? (
                        <TruckInfoDisplay truck={x.data} onClick={() => this.selectLocation(x?.data?.location)} />
                      ) : (
                        <OrderDetailDisplay order={x?.data} onClick={() => this.selectLocation(x?.data?.location)} />
                      ),
                    )
                  )}
                </ul>
              )}
            </div>
          </ui-card>

          {((selectedLocation != null && previousItems.length > 0) || selectedLocation == null) && (
            <ui-card>
              <h3>Previous Deliveries</h3>
              <ul>
                {selectedLocation != null ? (
                  <OrderAndTruckInfoList items={previousItems.slice(0, 3)} selectedLocation={selectedLocation} onOrderSelected={order => (this.selectedOrder = order)} />
                ) : (
                  (combinedItems?.length > 0 ? combinedItems?.slice(0, 6) : ([null, null, null] as (OrderOrTruckItem | null)[])) // show placeholders if no data
                    .map(x =>
                      x != null && x.type === "truck" ? (
                        <TruckInfoDisplay truck={x.data} onClick={() => this.selectLocation(x?.data?.location)} noIcon={true} />
                      ) : (
                        <OrderDetailDisplay order={x?.data} onClick={() => this.selectLocation(x?.data?.location)} noIcon={true} />
                      ),
                    )
                )}
              </ul>
              {selectedLocation == null && this.recentOrders != null && <stencil-route-link url="/activity">view more</stencil-route-link>}
            </ui-card>
          )}

          {selectedLocation != null && selectedLocation.notFound !== true && selectedLocation.reports.length > 0 && (
            <ui-card isCollapsible={true} headerText="Reports">
              <ul>{selectedLocation != null && selectedLocation.reports.slice(0, 3).map(x => <li>{x}</li>)}</ul>
            </ui-card>
          )}
        </ui-main-content>

        {selectedOrder && (
          <ui-modal isActive={selectedOrder != null} onRequestClose={() => (this.selectedOrder = undefined)}>
            <div>
              <h3>{selectedOrder!.pizzas} Pizzas</h3>
              <p>
                <strong>{formatDateTime(selectedOrder!.createdAt)}</strong>
              </p>
              <p>From {selectedOrder!.restaurant}</p>
              <ul>
                {selectedOrder!.reports.map(x => (
                  <li>
                    Reported at{" "}
                    <a href={x.reportURL} target="_blank">
                      {formatTime(x.createdAt)}
                    </a>{" "}
                    ({x.waitTime} wait expected)
                  </li>
                ))}
              </ul>
            </div>
          </ui-modal>
        )}
      </Host>
    );
  }

  /**
   * Assign the selected address and map center point from `location` or no-op if `location` is `null`
   */
  private selectLocation(location: { fullAddress: string; lat: string | number; lng: string | number } | null | undefined): void {
    if (location == null) {
      return;
    }
    this.selectedAddress = location.fullAddress;
    this.mapCenterPoint = {
      lat: typeof location.lat === "number" ? location.lat : parseFloat(location.lat),
      lng: typeof location.lng === "number" ? location.lng : parseFloat(location.lng),
    };
  }

  private async setAddressFromUrl(match: MatchResults) {
    const location = match.params?.location?.replace(/\+/g, " ");

    if (location !== this.selectedAddress) {
      this.selectedAddress = location;
      // TODO: Lookup address lat/lng from selectedAddress
      this.mapCenterPoint = UiGeoMap.US_CENTER;
    } else if (location == null) {
      this.mapCenterPoint = UiGeoMap.US_CENTER;
    }
  }
}
