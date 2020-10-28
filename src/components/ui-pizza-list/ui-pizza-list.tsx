import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "ui-pizza-list",
  styleUrl: "ui-pizza-list.scss",
  shadow: false,
})
export class UiPizzaList {
  public render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
