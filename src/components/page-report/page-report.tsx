import { Component, h } from "@stencil/core";

@Component({
  tag: "page-report",
  styleUrl: "page-report.scss",
})
export class PageDonate {
  public componentWillLoad() {
    document.title = `Report | Pizza to the Polls`;
  }

  public render() {
    return <stencil-router-redirect url="/"></stencil-router-redirect>;
  }
}
