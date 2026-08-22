import { Component, h, Prop } from "@stencil/core";

/**
 * Displays a provided `value` or a loading bar if `null`-like
 */
@Component({
  tag: "ui-dynamic-text",
  styleUrl: "ui-dynamic-text.scss",
  shadow: false,
})
export class UiDynamicText /*<T>*/ {
  @Prop() public value: unknown;

  /**
   * Optional display formatter.
   *
   * This component is a generic text renderer: callers pass any value plus a
   * lambda that knows its shape (e.g. `format={x => x.location.fullAddress}`).
   * Typing the parameter `unknown` would force a cast at every one of the ~10
   * call sites, so this is an intentional, documented escape hatch.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see comment above
  @Prop() public format?: (value: any) => string;

  public render() {
    return this.value == null ? (
      <div class="placeholder">
        <div class="line"></div>
      </div>
    ) : (
      <span>{this.format ? this.format(this.value) : this.value}</span>
    );
  }
}
