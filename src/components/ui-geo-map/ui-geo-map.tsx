import { Build, Component, Event, EventEmitter, h, Prop, Watch } from "@stencil/core";
// @ts-ignore
import {} from "googlemaps";

import { LocationId } from "../../api";

@Component({
  tag: "ui-geo-map",
  styleUrl: "ui-geo-map.scss",
  shadow: true,
})
export class UiGeoMap {
  public static readonly US_CAPITOL: google.maps.LatLngLiteral = { lat: 38.8899, lng: -77.0091 };
  public static readonly US_CENTER: google.maps.LatLngLiteral = { lat: 39.8283, lng: -98.5795 };
  public static readonly DEFAULT_CENTER: google.maps.LatLngLiteral = UiGeoMap.US_CENTER;
  public static readonly DEFAULT_ZOOM = 4;
  public static readonly SELECTED_LOCATION_ZOOM = 15;

  @Prop() public center?: google.maps.LatLngLiteral;
  @Prop() public zoom?: number;
  @Prop() public deliveries?: { coords: google.maps.LatLngLiteral; id: LocationId }[];
  @Prop() public trucks?: { coords: google.maps.LatLngLiteral; id: LocationId }[];
  @Prop() public currentAddress?: string;

  @Event({ cancelable: false }) public markerSelected!: EventEmitter<{
    type: "pizza" | "truck";
    coords: google.maps.LatLngLiteral;
    location: LocationId;
  }>;

  private map?: google.maps.Map;
  private mapElement?: HTMLElement;
  private truckMarkers: google.maps.Marker[];
  private deliveryMarkers: google.maps.Marker[];

  constructor() {
    this.zoom = 16;
    this.center = UiGeoMap.US_CAPITOL;
    this.truckMarkers = [];
    this.deliveryMarkers = [];
    // this.id = "map-" + Math.floor( Math.random() * 100000 );
  }

  public componentDidLoad() {
    if (!Build.isBrowser) {
      return;
    }

    this.map = new google.maps.Map(this.mapElement!, {
      center: this.center || UiGeoMap.DEFAULT_CENTER,
      zoom: this.zoom || UiGeoMap.DEFAULT_ZOOM,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      scrollwheel: false,
    });
  }

  @Watch("deliveries")
  public deliveriesChanged(newDeliveries?: { coords: google.maps.LatLngLiteral; id: LocationId }[]) {
    this.modifyMarkers("pizza", this.deliveryMarkers, newDeliveries || []);
  }

  @Watch("trucks")
  public trucksChanged(newTrucks?: { coords: google.maps.LatLngLiteral; id: LocationId }[]) {
    this.modifyMarkers("truck", this.truckMarkers, newTrucks || []);
  }

  @Watch("center")
  public centerChanged(newCenter?: google.maps.LatLngLiteral) {
    this.map?.setCenter(newCenter || UiGeoMap.DEFAULT_CENTER);
  }

  @Watch("zoom")
  public zoomChanged(zoom?: number) {
    this.map?.setZoom(zoom || UiGeoMap.DEFAULT_ZOOM);
  }

  public render() {
    return (
      <div>
        <hr class="heavy" />
        <div class="now-feeding">Now feeding {this.currentAddress || "American voters"}</div>
        <div id="deliveries-map-container" class={this.currentAddress ? "is-single-location" : ""}>
          <div id="map" ref={x => (this.mapElement = x)}></div>
        </div>
      </div>
    );
  }

  private modifyMarkers(type: "pizza" | "truck", existingMarkers: google.maps.Marker[], newMarkers: { coords: google.maps.LatLngLiteral; id: LocationId }[]) {
    let index = 0;
    for (let newMarker of newMarkers) {
      // create a new marker if we've received a location beyond our current marker count
      if (index > existingMarkers.length - 1) {
        const m = new google.maps.Marker({
          icon: type === "pizza" ? "/images/pin-pizza@1x.png" : "/images/pin-truck@1x.png",
          map: this.map,
          visible: false,
        });
        const i = index;
        const t = type;
        m.addListener("click", () => this.selectMarker(t, i));
        existingMarkers.push(m);
      }
      const marker = existingMarkers[index];
      marker.setPosition(newMarker.coords);
      marker.setVisible(true);
      index += 1;
    }

    // hide any extra markers instead of creating and destroying them
    for (; index < existingMarkers.length; ++index) {
      existingMarkers[index].setVisible(false);
    }
  }

  private selectMarker(type: "pizza" | "truck", index: number): void {
    switch (type) {
      case "pizza":
        this.markerSelected.emit({
          type,
          coords: this.deliveries![index].coords,
          location: this.deliveries![index].id,
        });
        break;

      case "truck":
        this.markerSelected.emit({
          type,
          coords: this.trucks![index].coords,
          location: this.trucks![index].id,
        });
        break;
    }
  }
}
