import { Component, h, Listen, State } from "@stencil/core";

import { debounce, scrollPageToTop } from "../../util";

/**
 * Navigation element that displays a button in the lower-right of the screen when the user
 * scrolls, which scrolls to the top of the screen on click.
 */
@Component({
  tag: "ui-scroll-to-top-button",
  styleUrl: "ui-scroll-to-top-button.scss",
  shadow: true,
})
export class UiScrollToTopButton {
  public static readonly LONG_PAGE_THRESHOLD: number = 2000;
  public static readonly SCROLL_TOP_THRESHOLD: number = 500;

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
    return <span onClick={this.scrolltoTop} class={{ "is-active": showBackToTop }} title="Back to top"></span>;
  }

  private scrolltoTop(e?: Event) {
    e?.preventDefault();
    (e?.target as HTMLElement)?.blur();
    scrollPageToTop();
  }

  private recalculateScrollTop() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    // determine if long page
    const pageHeight = Math.max(document.body.scrollHeight || 0, document.documentElement.scrollTop || 0);
    this.showBackToTop = scrollTop > UiScrollToTopButton.SCROLL_TOP_THRESHOLD && pageHeight > UiScrollToTopButton.LONG_PAGE_THRESHOLD;
  }
}
