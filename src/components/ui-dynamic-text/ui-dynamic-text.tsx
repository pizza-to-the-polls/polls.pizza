import { Build, Component, h, Prop } from "@stencil/core";

/**
 * Displays a provided `value` or a loading bar if `null`-like
 */
@Component({
  tag: "ui-dynamic-text",
  styleUrl: "ui-dynamic-text.scss",
  shadow: false,
})
export class UiDynamicText {
  @Prop() public value: any | undefined;
  @Prop() public format?: (value: any) => string;

  public render() {
    return this.value == null || !Build.isBrowser ? (
      <div class="placeholder">
        <div class="line"></div>
      </div>
    ) : (
      <span>{this.format ? this.format(this.value) : this.value}</span>
    );
  }
}
