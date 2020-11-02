import { Component, h, Prop } from "@stencil/core";

/**
 * Container for the main content section between the top nav and the footer (see app-root.tsx)
 */
@Component({
  tag: "ui-main-content",
  styleUrl: "ui-main-content.scss",
  shadow: false,
})
export class UiMainContent {
  @Prop() public background: "yellow" | "cyan" | "teal" | "red" | "none";
  @Prop() public fullBleed: boolean;

  constructor() {
    this.background = "none";
    this.fullBleed = false;
  }

  public render() {
    return (
      <div
        class={{
          "background": this.background !== "none",
          "bg-cyan": this.background === "cyan",
          "bg-red": this.background === "red",
          "bg-teal": this.background === "teal",
          "bg-yellow": this.background === "yellow",
        }}
      >
        <div class={`container${this.fullBleed === true ? " full-bleed" : ""}`}>
          <slot />
        </div>
      </div>
    );
  }
}
