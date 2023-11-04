import { Component, h, Host, Prop } from "@stencil/core";
import { RouterHistory } from "@stencil/router";

@Component({
  tag: "page-donate",
  styleUrl: "page-donate.scss",
})
export class PageDonate {
  @Prop() public history?: RouterHistory;

  public componentWillLoad() {
    document.title = `Donate | Pizza to the Polls`;
  }

  public render() {
    const amountDonatedUsd = this.history?.location?.query?.amount_usd ? parseFloat(this.history?.location?.query?.amount_usd as string) : null;

    return (
      <Host>
        <ui-main-content background="red" fullBleed={true}>
          <div class="donation-intro">
            <p>Waiting in line is a bummer. Waiting in line with pizza is a little less of a bummer.</p>
            <p>
              Keep our locations of civic engagement joyful and welcoming places where no one has an empty stomach by setting up a monthly donation. Become one of our biggest
              supporters today by joining Crust Club!
            </p>
          </div>

          <ui-card>
            <form-donate
              referral={this.history?.location?.query?.referral}
              showConfirmation={!!(amountDonatedUsd && !!this.history?.location?.query?.success)}
              initialDonationType={this.history?.location?.query?.type}
              initialAmount={amountDonatedUsd}
            />
          </ui-card>
        </ui-main-content>
      </Host>
    );
  }
}
