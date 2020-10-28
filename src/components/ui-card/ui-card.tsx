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
  @Prop() public headerText: string;
  @State() private maxHeight: string;

  constructor() {
    this.isSmall = false;
    // Collapse Props
    this.isCollapsible = false;
    this.isActive = false;
    this.headerText = "";
    this.maxHeight = "";
  }

  public render() {
    // Expand/collapse section
    const toggleCollapse = (e?: Event) => {
      e?.preventDefault();
      const header = e?.target as HTMLInputElement;
      const expandContent = header.parentNode?.querySelector(".expand-section") as HTMLElement;
      this.isActive = !this.isActive;
      if (this.isActive) {
        this.maxHeight = expandContent ? expandContent.scrollHeight + 500 + "px" : "10000px";
      } else {
        this.maxHeight = "";
      }
      header.blur();
    };

    return (
      <Host class={{ "is-small": this.isSmall }}>
        {this.isCollapsible ? (
          <div>
            <a href="#" class={"expand-section-link is-header " + (this.isActive ? "is-active" : "")} onClick={toggleCollapse} aria-expanded={this.isActive ? "true" : "false"}>
              {this.headerText || <span>&nbsp;</span>}
            </a>
            <div class={{ "expand-section": true, "is-active": this.isActive }} style={{ maxHeight: this.maxHeight }}>
              <div class="expand-content">
                <slot />
              </div>
            </div>
          </div>
        ) : (
          <slot />
        )}
      </Host>
    );
  }
}
