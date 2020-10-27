import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "ui-modal",
  styleUrl: "ui-modal.scss",
  shadow: false,
})
export class UiModal {
  /**
   * TODO: implement
   */
  public render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
