import { Component, Fragment, FunctionalComponent, h, Host, Prop, State, Watch } from "@stencil/core";
import { MatchResults, RouterHistory } from "@stencil/router";
// @ts-ignore
import {} from "googlemaps";

import { LocationInfo, LocationStatus, OrderDetails, OrderInfo, OrderTypes, PizzaApi, TruckInfo } from "../../api";
import { scrollPageToTop } from "../../util";
import { UiGeoMap } from "../ui-geo-map/ui-geo-map";

enum FoodChoice {
  all = "All food",
  pizza = "Pizza",
  trucks = "Food trucks",
}

type OrderOrTruckItem = { type: "pizza"; data: OrderDetails | null } | { type: "truck"; data: TruckInfo | null };

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

const formatDate = (date: Date) => date.toLocaleDateString([], { day: "2-digit", month: "2-digit" });

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

const OrderDetailDisplay: FunctionalComponent<{ order: OrderDetails | null | undefined; noIcon?: boolean; onClick?: () => void }> = ({ order, onClick, noIcon }) => (
  <li class={{ "pizza-icon": noIcon !== true, "interactive": onClick != null }} onClick={onClick}>
    <span style={{ fontSize: "0.8em", fontWeight: "600" }}>
      <ui-dynamic-text value={order} format={x => x.location.fullAddress} />
    </span>
    <div>
      <ui-dynamic-text value={order} format={x => `${x.quantity} ${x.orderType} at ${formatDate(x.createdAt)} ${formatTime(x.createdAt)}`} />
    </div>
  </li>
);

const OrderInfoDisplay: FunctionalComponent<{ order: OrderInfo | null | undefined; reportCount: number; noIcon?: boolean }> = ({ order, reportCount, noIcon }) => (
  <li class={{ "pizza-icon": noIcon !== true }}>
    <span style={{ fontSize: "0.8em", fontWeight: "600" }}>
      <ui-dynamic-text value={order} format={x => `${x.quantity} ${x.orderType} en route`} />
    </span>
    <div>
      <ui-dynamic-text value={order} format={x => `${formatDate(x.createdAt)} ${formatTime(x.createdAt)} • ${reportCount} reports`} />
    </div>
  </li>
);

const TruckInfoDisplay: FunctionalComponent<{ truck: TruckInfo | null | undefined; noIcon?: boolean; onClick?: () => void }> = ({ truck, noIcon, onClick }) => (
  <li class={{ "truck-icon": noIcon !== true, "interactive": onClick != null }} onClick={onClick}>
    <span style={{ fontSize: "0.8em", fontWeight: "600" }}>
      <ui-dynamic-text value={truck} format={x => x.location.fullAddress} />
    </span>
    <div>
      <ui-dynamic-text value={truck} format={x => `Food truck on location since ${formatDate(x.createdAt)} ${formatTime(x.createdAt)}`} />
    </div>
  </li>
);

const OrderAndTruckInfoList: FunctionalComponent<{
  items: OrderOrTruckItem[];
  selectedLocation?: LocationStatus;
  noIcon?: boolean;
}> = ({ items, selectedLocation, noIcon }) =>
  items.map(x =>
    x?.type === "truck" ? (
      <TruckInfoDisplay noIcon={noIcon} truck={x.data} />
    ) : (
      <OrderInfoDisplay noIcon={noIcon} order={x?.data} reportCount={selectedLocation?.notFound ? 0 : selectedLocation?.reports.length || 0} />
    ),
  );

const DEFAULT_ZOOM = 4;
const SELECTED_LOCATION_ZOOM = 16;

@Component({
  tag: "page-deliveries",
  styleUrl: "page-deliveries.scss",
  shadow: false,
})
export class PageDeliveries {
  @Prop() public history!: RouterHistory;
  @Prop() public match!: MatchResults;

  @State() private selectedAddress?: string;
  /**
   * Watched and used to re-center the map
   */
  // @ts-ignore
  @State() private mapCenterPoint: { lat: number; lng: number };
  @State() private selectedFood: FoodChoice;
  @State() private selectedLocation?: LocationStatus;
  @State() private recentOrders?: OrderDetails[];
  @State() private recentTrucks?: TruckInfo[];
  @State() private mapZoom: number;

  constructor() {
    this.selectedFood = FoodChoice.all;
    this.mapZoom = DEFAULT_ZOOM;
    this.mapCenterPoint = UiGeoMap.US_CENTER;
  }

  public componentWillLoad() {
    document.title = `Deliveries | Pizza to the Polls`;
    this.setAddressFromUrl(this.match);

    PizzaApi.getOrders().then(orders => (this.recentOrders = orders.results));
    PizzaApi.getTrucks(true).then(trucks => (this.recentTrucks = trucks.results));
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

  /**
   * Center map on the first location when the recent order list changes (unless we're viewing a specific address)
   */
  @Watch("recentOrders")
  public onOrdersChanged(_: OrderDetails[]) {
    // TODO
  }

  @Watch("selectedLocation")
  public onSelectedLocation(newLocation: LocationStatus) {
    if (newLocation != null && newLocation.notFound == null) {
      // make sure we have the correct lat/lng selected
      this.mapCenterPoint = {
        lat: parseFloat(newLocation.lat),
        lng: parseFloat(newLocation.lng),
      };
    }
  }

  @Watch("mapCenterPoint")
  public onMapCenterPointChanged(coords?: { lat: number; lng: number }) {
    if (coords?.lat === UiGeoMap.US_CENTER.lat) {
      this.mapZoom = DEFAULT_ZOOM;
    } else {
      this.mapZoom = SELECTED_LOCATION_ZOOM;
    }
    scrollPageToTop();
  }

  public render() {
    const { mapCenterPoint, mapZoom, selectedAddress, selectedFood, selectedLocation } = this;
    const now = new Date();
    const orderFilter = (order: OrderInfo | null) =>
      order == null || selectedFood === FoodChoice.all || (selectedFood === FoodChoice.pizza && order.orderType === OrderTypes.pizzas);

    const foundLocation = selectedLocation != null && selectedLocation.notFound == null ? selectedLocation : null;

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
    const allLocationItems = [...locationOrders, ...locationTrucks].sort((l, r) => (l.data!.createdAt > r.data!.createdAt ? -1 : 1));
    const locationItems = allLocationItems.filter(x => x.data?.createdAt.getDate() === now.getDate());
    const previousItems = allLocationItems.filter(x => x.data?.createdAt.getDate() !== now.getDate());
    const orders = (this.recentOrders || [])
      .filter(orderFilter)
      .slice(0, 10)
      .map(x => ({ type: "pizza", data: x } as OrderOrTruckItem));
    const trucks = (this.recentTrucks != null && (selectedFood === FoodChoice.all || selectedFood === FoodChoice.trucks) ? this.recentTrucks : [])
      .slice(0, 10)
      .map(x => ({ type: "truck", data: x } as OrderOrTruckItem));
    const items = [...orders, ...trucks].sort((l, r) => (l.data!.createdAt > r.data!.createdAt ? -1 : 1));

    const currentAddress = selectedAddress != null ? foundLocation?.fullAddress || selectedAddress : items?.find(_ => true)?.data?.location.fullAddress;
    const nowFeeding = currentAddress != null ? ": " + currentAddress : null;

    return (
      <Host>
        <ui-main-content background={selectedAddress != null ? "teal" : "yellow"} class={{ "selected-location": selectedAddress != null }}>
          <div>
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
          </div>
          <FoodChoices selected={selectedFood} onSelected={x => (this.selectedFood = x)} />
        </ui-main-content>

        <ui-main-content background={selectedAddress != null ? "teal" : "yellow"} class={{ "selected-location": selectedAddress != null }}>
          <hr class="heavy" />
          <div class="now-feeding">Now feeding{nowFeeding || " American voters"}</div>
          <div class="map-container">
            <ui-geo-map
              center={mapCenterPoint}
              zoom={mapZoom}
              deliveries={
                selectedFood === FoodChoice.all || selectedFood === FoodChoice.pizza
                  ? this.recentOrders?.slice(0, 30).map(x => ({
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
                  ? this.recentTrucks?.slice(0, 20).map(x => ({
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
        </ui-main-content>

        <ui-main-content background="yellow">
          <ui-card>
            <h3>Current Deliveries</h3>
            {selectedLocation != null && selectedFood === FoodChoice.trucks && locationItems.length < 1 ? (
              <p>
                There are no food trucks currently at this location.
                <br />
                <ReportLink />
              </p>
            ) : selectedLocation != null && ((selectedFood === FoodChoice.pizza && locationItems.length < 1) || selectedLocation.notFound === true) ? (
              <p>
                There are no reports of lines at this location.
                <br />
                <ReportLink />
              </p>
            ) : (
              <ul>
                {selectedAddress != null ? (
                  <OrderAndTruckInfoList
                    items={
                      locationItems.length > 0
                        ? locationItems.slice(0, 3)
                        : // show placeholders if no data
                          [
                            { type: "pizza", data: null },
                            { type: "pizza", data: null },
                            { type: "pizza", data: null },
                          ]
                    }
                    selectedLocation={selectedLocation}
                  />
                ) : (
                  (items?.length > 0 ? items?.slice(0, 3) : ([null, null, null] as (OrderOrTruckItem | null)[])) // show placeholders if no data
                    .map(x =>
                      x != null && x.type === "truck" ? (
                        <TruckInfoDisplay truck={x.data} onClick={() => this.selectLocation(x?.data?.location)} />
                      ) : (
                        <OrderDetailDisplay order={x?.data} onClick={() => this.selectLocation(x?.data?.location)} />
                      ),
                    )
                )}
              </ul>
            )}
          </ui-card>

          {((selectedLocation != null && previousItems.length > 0) || selectedLocation == null) && (
            <ui-card>
              <h3>Previous Deliveries</h3>
              <ul>
                {selectedLocation != null ? (
                  <OrderAndTruckInfoList items={previousItems.slice(0, 3)} selectedLocation={selectedLocation} />
                ) : (
                  (items?.length > 3 ? items?.slice(3, 6) : ([null, null, null] as (OrderOrTruckItem | null)[])) // show placeholders if no data
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

  private setAddressFromUrl(match: MatchResults) {
    const location = match.params.location;
    if (location !== this.selectedAddress) {
      this.selectedAddress = location;
      // TODO: Lookup address lat/lng from selectedAddress
      this.mapCenterPoint = UiGeoMap.US_CENTER;
    } else if (location == null) {
      this.mapCenterPoint = UiGeoMap.US_CENTER;
    }
  }
}
