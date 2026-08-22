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
  @Prop() public value: any | /*T*/ undefined;
  @Prop() public format?: (value: any /*T*/) => string;

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
