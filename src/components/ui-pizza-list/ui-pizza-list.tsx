import { Component, h, Host, Prop } from "@stencil/core";

@Component({
  tag: "ui-pizza-list",
  styleUrl: "ui-pizza-list.scss",
  shadow: false,
})
export class UiPizzaList {
  @Prop() public hasIcon: boolean;
  @Prop() public isBordered: boolean;

  constructor() {
    this.hasIcon = true;
    this.isBordered = false;
  }

  public render() {
    return (
      <Host>
        <ul class={{ "is-bordered": this.isBordered, "has-icon": !!this.hasIcon }}>
          <slot />
        </ul>
      </Host>
    );
  }
}
