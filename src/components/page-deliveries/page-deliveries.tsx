import { Component, Fragment, FunctionalComponent, h, Host, Listen, Prop, State } from "@stencil/core";

import { LocationInfo } from "../../api/types";

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

@Component( {
  tag: "page-deliveries",
  styleUrl: "page-deliveries.scss",
  shadow: false,
} )
export class PageDeliveries {
  @Prop() public selectedLocation?: LocationInfo;
  @State() public selectedFood: FoodChoice;

  constructor() {
    this.selectedFood = FoodChoice.all;
  }

  @Listen( "keyup", { target: "document" } )
  public onKey( e: KeyboardEvent ) {
    if( e.key === "f" ) {
      this.selectedLocation = { fullAddress: "dsdsds ds das dsad sad sa dv" } as LocationInfo;
    }
  }

  public render() {
    const { selectedLocation } = this;
    return (
      <Host>
        <ui-main-content>
          <div>
            {selectedLocation != null ?
              (
                <Fragment>
                  <a onClick={() => ( this.selectedLocation = undefined )}>Back to all deliveries</a>
                  <h3>{selectedLocation.fullAddress}</h3>
                </Fragment>
              ) : (
                <Fragment>
                  <h2>Deliveries</h2>
                  <h3>Search for your polling place</h3>
                  <input type="text" />
                </Fragment>
              )}
          </div>
          <FoodChoices selected={this.selectedFood} onSelected={x => ( this.selectedFood = x )} />
        </ui-main-content>

        <hr class="heavy" />
        <div>Now feeding 123 Fake St.</div>
        <div style={{ width: "100%", height: "300px" }}>
          <ui-geo-map />
        </div>

        <ui-main-content>
          <ui-card>
            <h3>Current Deliveries</h3>
            <ul>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </ui-card>

          <ui-card>
            <h3>Previous Deliveries</h3>
            <ul>
              <li></li>
              <li></li>
              <li></li>
            </ul>
            <stencil-route-link url="/activity">view more</stencil-route-link>
          </ui-card>

          {selectedLocation != null && (
            <ui-card isCollapsible={true}>
              <h3>Reports</h3>
              <ul>
                <li></li>
                <li></li>
                <li></li>
              </ul>
            </ui-card>
          )}
        </ui-main-content>
      </Host>
    );
  }
}
