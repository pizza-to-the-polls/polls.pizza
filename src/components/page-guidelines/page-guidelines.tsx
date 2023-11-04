import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-guidelines",
  styleUrl: "page-guidelines.scss",
})
export class PageGuidelines {
  public componentWillLoad() {
    document.title = `On-Demand Delivery Guidelines | Pizza to the Polls`;
  }

  public render() {
    return (
      <Host>
        <section id="instructions" class="page">
          <div class="container">
            <ui-guidelines />
          </div>
        </section>
      </Host>
    );
  }
}
