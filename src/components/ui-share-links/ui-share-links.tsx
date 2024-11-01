import { Build, Component, h, Host, Prop, State } from "@stencil/core";

@Component({
  tag: "ui-share-links",
  styleUrl: "ui-share-links.scss",
  shadow: false,
})
export class UiShareLinks {
  @Prop() public shareText: string;
  @Prop() public shareUrl: string;
  @Prop() public additionalLinks: HTMLLinkElement;

  @State() private canNativeShare: boolean = false;

  constructor() {
    this.shareText = "";
    this.shareUrl = "";
    this.additionalLinks = <div></div>;

    if (Build.isBrowser) {
      // Determine if `navigator.share` is supported in browser (native device sharing)
      this.canNativeShare = navigator && navigator.share ? true : false;
    }
  }

  public render() {
    // Native sharing on device via `navigator.share` - supported on mobile, tablets, and some browsers
    const nativeShare = async () => {
      if (!navigator || !navigator.share) {
        this.canNativeShare = false;
        return;
      }

      try {
        await navigator.share({
          title: this.shareText,
          text: this.shareText,
          url: this.shareUrl,
        });
      } catch (error) {
        console.log("Sharing failed", error);
      }
    };

    // Fallback if native sharing is not available
    let metaDescription = document.querySelector("meta[name='description']");
    let shareDescription = "";
    if (metaDescription) {
      shareDescription = metaDescription.getAttribute("content") || "";
    }

    const shareXLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.shareText)}&url=${this.shareUrl}&via=PizzaToThePolls`;
    const shareBlueskyLink = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${this.shareText} ${this.shareUrl}`)}`;

    const shareFacebookLink = `https://www.facebook.com/sharer/sharer.php?u=${this.shareUrl}&title=${encodeURIComponent(this.shareText)}&description=${encodeURIComponent(
      shareDescription,
    )}&quote=${encodeURIComponent(this.shareText)}`;
    const shareThreadsLink = `https://www.threads.net/intent/post?url=${this.shareUrl}&text=${this.shareText}`;

    const openSharePopup = (e: Event) => {
      e.preventDefault();
      const linkTarget = e.target as HTMLLinkElement;
      const targetURL = linkTarget.getAttribute("href");
      if (!targetURL) {
        return;
      }
      window.open(targetURL, "popup", "width=600,height=600");
      return;
    };

    return (
      <Host>
        <div id="donate-confirmation">
          <slot />

          {this.canNativeShare && (
            <button id="share-donation" onClick={nativeShare} class="button is-blue is-fullwidth-mobile">
              <img class="icon" alt="Share" src="/images/icons/share.svg" />
              <span>Share your donation!</span>
            </button>
          )}

          <div class={"share-donation-link-container " + (this.canNativeShare ? "can-native-share" : "")}>
            <ul class="share-links">
              <li>
                <a
                  class="share-donation-link button is-x is-fullwidth-mobile"
                  href={shareXLink}
                  rel="noopener noreferrer"
                  target="popup"
                  onClick={openSharePopup}
                  title="Share to X"
                >
                  <img class="icon" alt="X" src="/images/icons/social/x.svg" />
                  <span>Share on X</span>
                </a>
              </li>
              <li>
                <a
                  class="share-donation-link button is-bluesky is-fullwidth-mobile"
                  href={shareBlueskyLink}
                  rel="noopener noreferrer"
                  target="popup"
                  onClick={openSharePopup}
                  title="Share to Bluesky"
                >
                  <img class="icon" alt="Bluesky" src="/images/icons/social/bluesky.svg" />
                  <span>Share on Bluesky</span>
                </a>
              </li>
              <li>
                <a
                  class="share-donation-link button is-facebook is-fullwidth-mobile"
                  href={shareFacebookLink}
                  rel="noopener noreferrer"
                  target="popup"
                  onClick={openSharePopup}
                  title="Share to Facebook"
                >
                  <img class="icon" alt="Facebook" src="/images/icons/social/facebook.svg" />
                  <span>Share on Facebook</span>
                </a>
              </li>
              <li>
                <a
                  class="share-donation-link button is-threads is-fullwidth-mobile"
                  href={shareThreadsLink}
                  rel="noopener noreferrer"
                  target="popup"
                  onClick={openSharePopup}
                  title="Share to Facebook"
                >
                  <img class="icon" alt="Facebook" src="/images/icons/social/threads.svg" />
                  <span>Share on Threads</span>
                </a>
              </li>
              {this.additionalLinks}
            </ul>
          </div>
        </div>
      </Host>
    );
  }
}
