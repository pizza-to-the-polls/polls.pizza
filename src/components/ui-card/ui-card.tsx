import { Component, h, Host, Prop } from "@stencil/core";

@Component( {
  tag: "ui-card",
  styleUrl: "ui-card.scss",
  shadow: false,
} )
export class UiCard {

  @Prop() public isCollapsible: boolean;

  /**
   * TODO: Is this used anywhere?
   */
  @Prop() public isSmall: boolean;

  constructor() {
    // TODO: Implement and show caret and collapse content to header
    this.isCollapsible = false;
    this.isSmall = false;
  }

  public render() {
    return (
      <Host class={{ "is-small": this.isSmall }}>
        <slot />
      </Host >
    );
  }
}
