import { Component, Element, h, Prop } from "@stencil/core";
import { revealSlottedChildren } from "../../util/revealSlottedChildren";

/**
 * Container for the main content section between the top nav and the footer (see app-root.tsx)
 */
@Component({
  tag: "ui-main-content",
  styleUrl: "ui-main-content.scss",
  shadow: false,
})
export class UiMainContent {
  @Element() private host!: HTMLUiMainContentElement;
  @Prop() public pageType: "full-bleed" | "center-card" | "no-bg" = "center-card";

  public componentDidLoad() {
    // Undo the Stencil scoped-SSR slot-hide that blanks prerendered content
    // (see src/util/revealSlottedChildren.ts and issue #156).
    revealSlottedChildren(this.host as HTMLElement);
  }

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
