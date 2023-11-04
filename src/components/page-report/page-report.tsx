import { Component, h, Host, Prop } from "@stencil/core";
import { RouterHistory } from "@stencil/router";

@Component({
  tag: "page-report",
  styleUrl: "page-report.scss",
})
export class PageReport {
  @Prop() public history?: RouterHistory;

  public componentWillLoad() {
    document.title = `Report | Pizza to the Polls`;
  }

  public render() {
    return (
      <Host>
        <ui-main-content>
          <ui-card>
            <form-report formattedAddress={this.history?.location?.query?.q} />
          </ui-card>
        </ui-main-content>
      </Host>
    );
  }
}
