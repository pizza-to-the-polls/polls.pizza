import { Component, h, Host, Prop, State } from "@stencil/core";

@Component({
  tag: "ui-card",
  styleUrl: "ui-card.scss",
  shadow: false,
})
export class UiCard {
  @Prop() public isSmall: boolean;
  // Collapse Props
  @Prop() public isCollapsible: boolean;
  @Prop() public isActive: boolean;
  @Prop() public scrollId: string;
  @Prop() public headerText: string;
  @State() private maxHeight: { [key: string]: string } = {};

  constructor() {
    this.isSmall = false;
    // Collapse Props
    this.isCollapsible = false;
    this.isActive = false;
    this.scrollId = "";
    this.headerText = "";
  }

  public render() {
    // Expand/collapse section
    const toggleCollapse = (e?: Event) => {
      e?.preventDefault();
      const header = e?.target as HTMLInputElement;
      const expandContent = header.parentNode?.querySelector(".expand-section") as HTMLElement;
      if (this.isActive) {
        this.maxHeight = {
          "max-height": "",
        };
      } else {
        this.maxHeight = {
          "max-height": (expandContent ? expandContent.scrollHeight + 500 + "px" : "10000px"),
        };
      }
      this.isActive = !this.isActive;
      header.blur();
    };

    return (
      <Host class={{ "is-small": this.isSmall }}>
        {/* Default */}
        {!this.isCollapsible && <slot />}
        {/* Exapand/collapse */}
        {this.isCollapsible && (
          <div>
            <a href="#" class={"expand-section-link is-header " + (this.isActive ? "is-active" : "")} onClick={toggleCollapse} aria-expanded={this.isActive ? "true" : "false"}>
              {this.headerText || <span>&nbsp;</span>}
            </a>
            <div id={this.scrollId} class={"expand-section " + (this.isActive ? "is-active" : "")} style={this.maxHeight}>
              <div class="expand-content">
                <slot />
              </div>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
