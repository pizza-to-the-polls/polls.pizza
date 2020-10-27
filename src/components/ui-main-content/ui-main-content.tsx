import { Component, h } from "@stencil/core";

/**
 * Container for the main content section between the top nav and the footer (see app-root.tsx)
 * @example
 * Set a color or image on the background class:
 * ```
 * ui-main-content {
 *   .background {
 *     background-color: $cyan;
 *     background-image: url("/images/bg2.png");
 *   }
 * }
 * ```
 * TODO: Add a prop to toggle the background and colors instead of setting via CSS
 */
@Component({
  tag: "ui-main-content",
  styleUrl: "ui-main-content.scss",
  shadow: false,
})
export class UiMainContent {
  public render() {
    return (
      <div class="background">
        <div class="container">
          <slot />
        </div>
      </div>
    );
  }
}
