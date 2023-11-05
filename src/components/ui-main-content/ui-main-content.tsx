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
  @Prop() public pageType: "full-bleed" | "center-card" | "no-bg" = "center-card";

  public render() {
    return (
      <div class={this.pageType === "center-card" ? "background" : ""}>
        <div class={`container ${this.pageType}`.trim()}>
          <slot />
        </div>
      </div>
    );
  }
}
