import { Component, h, Host } from "@stencil/core";

import { scrollPageToTop } from "../../lib/base";

@Component({
  tag: "page-report",
  styleUrl: "page-report.scss",
})
export class PageDonate {
  public componentWillLoad() {
    document.title = `Report | Pizza to the Polls`;
  }

  public componentDidLoad() {
    if (!window.location.hash) {
      scrollPageToTop();
    }
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
