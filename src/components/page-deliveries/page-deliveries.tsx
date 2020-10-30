import { Build, Component, Fragment, FunctionalComponent, h, Host, Prop, State, Watch } from "@stencil/core";
import { MatchResults, RouterHistory } from "@stencil/router";
// @ts-ignore
import { } from "googlemaps";

import { LocationInfo, LocationStatus, OrderDetails, OrderInfo, OrderTypes, PizzaApi } from "../../api";
import { scrollPageToTop } from "../../util";

enum FoodChoice {
  all = "All food",
  pizza = "Pizza",
  trucks = "Food trucks",
}

const FoodChoices: FunctionalComponent<{
  selected: FoodChoice;
  onSelected: ( option: FoodChoice ) => void;
}> = ( { selected, onSelected } ) => (
  <div class="food-choices">
    <ul>
      {( Object.values( FoodChoice ) as FoodChoice[] ).map( x => (
        <li class={{ selected: selected === x }} onClick={() => onSelected( x )}>
          {x}
        </li>
      ) )}
    </ul>
  </div>
);

const OrderDetailDisplay: FunctionalComponent<{ order: OrderDetails; onClick?: () => void }> = ( { order, onClick } ) => (
  <li style={{ cursor: "pointer" }} onClick={onClick}>
    <span style={{ fontSize: "0.8em", fontWeight: "600" }}>{order.location.fullAddress}</span>
    <div>
      {order.quantity} {order.orderType} at {order.createdAt.toLocaleDateString( [], { year: "2-digit", month: "2-digit" } )}{" "}
      {order.createdAt.toLocaleTimeString( [], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" } )}
    </div>
  </li>
);

const OrderInfoDisplay: FunctionalComponent<{ order: OrderInfo; reportCount: number }> = ( { order, reportCount } ) => (
  <li>
    <span style={{ fontSize: "0.8em", fontWeight: "600" }}>
      {order.quantity} {order.orderType} en route
    </span>
    <div>
      {order.createdAt.toLocaleDateString( [], { year: "2-digit", month: "2-digit" } )}{" "}
      {order.createdAt.toLocaleTimeString( [], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" } )} • {reportCount} reports
    </div>
  </li>
);

@Component( {
  tag: "page-deliveries",
  styleUrl: "page-deliveries.scss",
  shadow: false,
} )
export class PageDeliveries {
  @Prop() public history!: RouterHistory;
  @Prop() public match!: MatchResults;

  @State() private selectedAddress?: string;
  @State() private selectedFood: FoodChoice;
  @State() private selectedLocation?: LocationStatus;
  @State() private recentOrders?: OrderDetails[];

  private map?: HTMLUiGeoMapElement;
  private addressInput?: HTMLUiSingleInputElement;

  constructor() {
    this.selectedFood = FoodChoice.all;
  }

  public componentWillLoad() {
    document.title = `Deliveries | Pizza to the Polls`;
    this.setAddressFromUrl( this.match );

    PizzaApi.getOrders().then( orders => ( this.recentOrders = orders.results ) );
  }

  public async componentDidRender() {
    if( Build.isBrowser && google && this.addressInput != null ) {
      const id = await this.addressInput.getInputId();
      const autocomplete = new google.maps.places.Autocomplete( document.getElementById( id ) as HTMLInputElement, {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "us" },
      } );

      autocomplete.addListener( "place_changed", () => {
        const place = autocomplete.getPlace();
        this.selectedAddress = place.formatted_address ? place.formatted_address.replace( /, USA/gi, "" ) : place.name ? place.name : "the location";
      } );
    }
  }

  @Watch( "match" )
  public matchChanged( newMatch: MatchResults ) {
    this.setAddressFromUrl( newMatch );
  }

  @Watch( "selectedAddress" )
  public onSelectedAddressChanged( newLocation?: string, oldLocation?: string ) {
    const ownPathFragment = this.history.location.pathname.split( "/" ).filter( x => x !== "" )[0];
    if( newLocation == null && oldLocation != null ) {
      const path = `/${ownPathFragment}`;
      this.selectedLocation = undefined;
      if( this.history.location.pathname !== path ) {
        this.history.push( path, {} );
      }
    } else if( newLocation != null && newLocation !== oldLocation ) {
      const path = `/${ownPathFragment}/${newLocation}`;
      if( this.history.location.pathname !== path ) {
        this.history.push( path, {} );
      }
      PizzaApi.getLocationStatus( newLocation, e => console.log( e ) ).then( x => {
        this.selectedLocation = x || undefined;
        if( x == null ) {
          // could not find this address
          console.log( "No polling place found for address" );
        }
      } );
    }
  }

  @Watch( "selectedLocation" )
  public onSelectedLocationChanged( location?: LocationStatus ) {
    if( location == null ) {
      const { recentOrders } = this;
      if( recentOrders != null ) {
        this.onOrdersChanged( recentOrders );
      }
    } else {
      this.recenterMap( location );
    }
  }

  @Watch( "recentOrders" )
  public onOrdersChanged( orders: OrderDetails[] ) {
    if( orders && orders.length > 0 ) {
      this.recenterMap( orders[0].location );
    }
  }

  public recenterMap( location: LocationInfo ) {
    const map = this.map;
    if( map ) {
      map.setCenter(
        {
          lat: parseFloat( location.lat ),
          lng: parseFloat( location.lng ),
        },
        true,
      );
      scrollPageToTop();
    }
  }

  public render() {
    const { recentOrders, selectedAddress, selectedLocation, selectedFood } = this;
    const orderFilter = ( order: OrderInfo ) => {
      return selectedFood === FoodChoice.all || ( selectedFood === FoodChoice.pizza && order.orderType === OrderTypes.pizzas );
      // || ( selectedFood === FoodChoice.trucks && order. === OrderTypes.pizzas );
    };
    const locationOrders = ( selectedLocation && selectedLocation.orders.filter( orderFilter ).slice( 0, 3 ) ) || [];
    const locationOrdersPrevious = ( selectedLocation && selectedLocation.orders.filter( orderFilter ).slice( 3, 6 ) ) || [];
    const nowFeeding = selectedLocation != null ? selectedLocation.fullAddress : recentOrders?.find( _ => true )?.location.address;
    return (
      <Host>
        <ui-main-content class={{ "selected-location": selectedAddress != null }}>
          <div>
            {selectedAddress != null ? (
              <div style={{ padding: "1em 0 0 0" }}>
                <a onClick={() => ( this.selectedAddress = undefined )}>Back to all deliveries</a>
                <h3>{selectedAddress}</h3>
              </div>
            ) : (
                <Fragment>
                  <h2>Deliveries</h2>
                  <ui-single-input
                    ref={x => ( this.addressInput = x )}
                    label="Search for your polling place"
                    buttonLabel="Search"
                    placeholder="1600 Pennsylvania Ave. Washington, D.C."
                    onButtonClicked={e => {
                      e.preventDefault();
                      // TOOD: normalize address and lookup
                      this.selectedAddress = e.detail;
                    }}
                  />
                </Fragment>
              )}
          </div>
          <FoodChoices selected={selectedFood} onSelected={x => ( this.selectedFood = x )} />
        </ui-main-content>

        <hr class="heavy" />
        <div style={{ padding: "0.5em", fontSize: "0.8em", fontWeight: "600" }}>Now feeding: {nowFeeding || "American voters"}</div>
        <div style={{ width: "100%", height: "200px" }}>
          <ui-geo-map ref={x => ( this.map = x )} />
        </div>

        <ui-main-content>
          <ui-card>
            <h3>Current Deliveries</h3>
            {selectedLocation != null && selectedFood === FoodChoice.trucks && locationOrders.length < 1 ? (
              <p>
                There are no food trucks currently at this location.
                <br />
                <stencil-route-link url="/report">Make a report</stencil-route-link>
              </p>
            ) : (
                <ui-pizza-list>
                  {selectedLocation != null
                    ? locationOrders.map( x => <OrderInfoDisplay order={x} reportCount={selectedLocation.reports.length} /> )
                    : recentOrders != null
                      ? recentOrders
                        .filter( orderFilter )
                        .slice( 0, 3 )
                        .map( x => <OrderDetailDisplay order={x} onClick={() => ( this.selectedAddress = x.location.fullAddress )} /> )
                      : null}
                </ui-pizza-list>
              )}
          </ui-card>

          {( ( selectedLocation != null && locationOrdersPrevious.length > 0 ) || ( selectedLocation == null && recentOrders != null ) ) && (
            <ui-card>
              <h3>Previous Deliveries</h3>
              <ui-pizza-list hasIcon={false}>
                {selectedLocation != null
                  ? locationOrdersPrevious.map( x => <OrderInfoDisplay order={x} reportCount={selectedLocation.reports.length} /> )
                  : recentOrders != null
                    ? recentOrders
                      .filter( orderFilter )
                      .slice( 3, 6 )
                      .map( x => <OrderDetailDisplay order={x} onClick={() => ( this.selectedAddress = x.location.fullAddress )} /> )
                    : null}
              </ui-pizza-list>
              {selectedLocation == null && <stencil-route-link url="/activity">view more</stencil-route-link>}
            </ui-card>
          )}

          {selectedLocation != null && selectedLocation.reports.length > 0 && (
            <ui-card isCollapsible={true} headerText="Reports">
              <ul>{selectedLocation != null && selectedLocation.reports.slice( 0, 3 ).map( x => <li>{x}</li> )}</ul>
            </ui-card>
          )}
        </ui-main-content>
      </Host>
    );
  }

  private setAddressFromUrl( match: MatchResults ) {
    const location = match.params.location;
    this.selectedAddress = location != null ? decodeURIComponent( location ) : undefined;
  }
}
