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

  public componentDidLoad() {
    const m = this.el.shadowRoot!.querySelector("#map");
    this.map = new google.maps.Map(m as HTMLElement, {
      center: { lat: 38.8899, lng: -77.0091 },
      zoom: 12,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
    });
  }

  @Method()
  public setCenter(newCenter: google.maps.LatLngLiteral) {
    if (this.map) {
      this.map.setCenter(newCenter);
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
