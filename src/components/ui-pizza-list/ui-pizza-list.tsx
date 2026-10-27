import { Component, Element, h, Host, Prop } from "@stencil/core";
import { revealSlottedChildren } from "../../util/revealSlottedChildren";

@Component({
  tag: "ui-pizza-list",
  styleUrl: "ui-pizza-list.scss",
  shadow: false,
})
export class UiPizzaList {
  @Element() private host!: HTMLUiPizzaListElement;
  @Prop() public hasIcon: boolean;
  @Prop() public isBordered: boolean;

  constructor() {
    this.hasIcon = true;
    this.isBordered = false;
  }

  public componentDidLoad() {
    // Undo the Stencil scoped-SSR slot-hide that blanks prerendered content
    // (see src/util/revealSlottedChildren.ts and issue #156).
    revealSlottedChildren(this.host as HTMLElement);
  }

  public render() {
    return (
      <Host>
        <ul class={{ "is-bordered": this.isBordered, "has-icon": !!this.hasIcon }}>
          <slot />
        </ul>
      </Host>
    );
  }
}
