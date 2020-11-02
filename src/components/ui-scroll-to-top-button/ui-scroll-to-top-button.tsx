import { Component, h, Listen, State } from "@stencil/core";

import { debounce, scrollPageToTop } from "../../util";

@Component({
  tag: "ui-scroll-to-top-button",
  styleUrl: "ui-scroll-to-top-button.scss",
  shadow: true,
})
export class UiScrollToTopButton {
  public static readonly LONG_PAGE_THRESHOLD: number = 2200;
  public static readonly SCROLL_TOP_THRESHOLD: number = 300;

  @State() private showBackToTop: boolean;

  constructor() {
    this.showBackToTop = false;
    this.recalculateScrollTop = debounce(this.recalculateScrollTop.bind(this), 50);
  }

  @Listen("scroll", { target: "window" })
  public onScroll(_: Event) {
    this.recalculateScrollTop();
  }

  public render() {
    const { showBackToTop } = this;
    return <span onClick={e => this.scrolltoTop(e)} class={`back-to-top${showBackToTop ? " is-active" : ""}`} title="Back to top"></span>;
  }

  private scrolltoTop(e?: Event) {
    e?.preventDefault();
    (e?.target as HTMLElement)?.blur();
    scrollPageToTop();
  }

  private recalculateScrollTop() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const pageHeight = Math.max(document.body.scrollHeight || 0, document.documentElement.scrollTop || 0);
    // Determine if long page
    this.showBackToTop = scrollTop > UiScrollToTopButton.SCROLL_TOP_THRESHOLD && pageHeight > UiScrollToTopButton.LONG_PAGE_THRESHOLD;
  }
}
