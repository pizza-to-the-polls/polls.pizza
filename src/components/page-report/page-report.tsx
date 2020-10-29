import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-report",
  styleUrl: "page-report.scss",
})
export class PageReport {
  public componentWillLoad() {
    document.title = `Report | Pizza to the Polls`;
  }

  public render() {
    return (
      <Host>
        <div id="report" class="report">
          <div class="container">
            <div class="box">
              <form-report></form-report>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
