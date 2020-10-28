import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "ui-pizza-list",
  styleUrl: "ui-pizza-list.scss",
  shadow: false,
})
export class UiPizzaList {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
