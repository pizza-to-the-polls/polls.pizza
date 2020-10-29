import { Component, Element, h, Host, Method } from "@stencil/core";
// @ts-ignore
import {} from "googlemaps";

const DONE = Promise.resolve();

@Component({
  tag: "ui-geo-map",
  styleUrl: "ui-geo-map.scss",
  shadow: true,
})
export class UiGeoMap {
  @Element() private el!: HTMLElement;

  private map?: google.maps.Map;
  private marker?: google.maps.Marker;

  public componentDidLoad() {
    const m = this.el.shadowRoot!.querySelector("#map");
    this.map = new google.maps.Map(m as HTMLElement, {
      center: { lat: 38.8899, lng: -77.0091 },
      zoom: 16,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      scrollwheel: false,
    });
    this.marker = new google.maps.Marker({
      // icon: ,
      map: this.map,
      visible: false,
    });
  }

  @Method()
  public setCenter(newCenter: google.maps.LatLngLiteral, showMarker: boolean = false) {
    if (this.map) {
      this.map.setCenter(newCenter);
      this.marker?.setPosition(newCenter);
      this.marker?.setVisible(showMarker);
    }
    return DONE;
  }

  @Method()
  public getCenter() {
    return Promise.resolve(this.map?.getCenter());
  }

  public render() {
    return (
      <Host>
        <div id="map"></div>
      </Host>
    );
  }
}
