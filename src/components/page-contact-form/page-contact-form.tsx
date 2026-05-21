import { Component, h } from "@stencil/core";

@Component({
  tag: "page-contact-form",
  styleUrl: "page-contact-form.scss",
})
export class PageContact {
  public componentWillLoad() {
    document.title = `Contact Form | Pizza to the Polls`;
  }

  public render() {
    const handleSubmit = (e: Event) => {
      const checked = document.querySelector("input[id=consentCheckbox]:checked") as HTMLInputElement;

      if (!checked) {
        e.preventDefault();
      }
    };

    return (
      <ui-main-content class="page contact-form">
        <ui-card>
          <div class="container">
            <div class="has-text-blue">
              <h1>Sign-Up</h1>
              <p>Keep up to date with what we've got cooking.</p>
            </div>
            <form
              action="https://pizza.us14.list-manage.com/subscribe/post?u=ff4b828d01c30e7ef1de2e24b&id=a2d940b77b&f_id=00198ae0f0"
              method="post"
              target="_blank"
              onSubmit={handleSubmit}
            >
              <input required type="email" name="EMAIL" autoComplete="email" class="input input-value" placeholder="Your email" />
              <input
                required
                type="tel"
                name="PHONE"
                autoComplete="tel-national"
                class="input input-value"
                placeholder="Your cell phone number"
                pattern="(?=(?:\D*\d){9,10}\D*$)[0-9.-]+"
                title="XXX-XXX-XXXX"
              />
              <label class="has-text-blue" style={{ fontSize: "0.75em", margin: "2em 0" }}>
                <input type="checkbox" id="consentCheckbox" required />
                &nbsp; By selecting this checkbox, you consent to receive Emails and SMS text messages from Pizza to the Polls (PttP) at the phone number provided, including
                updates, event invitations, donation requests, and voting reminders. Consent is not a condition of purchase. Message frequency varies. Message and data rates may
                apply. Text STOP to unsubscribe.&nbsp;
                <stencil-route-link class="" url="/privacy-policy">
                  Privacy Policy
                </stencil-route-link>
              </label>
              <input type="submit" value="Stay in touch" class="button is-cyan submit-button" />
              <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
                <input type="text" name="b_ff4b828d01c30e7ef1de2e24b_a2d940b77b" tabindex="-1" value="" />
              </div>
            </form>
          </div>
        </ui-card>
      </ui-main-content>
    );
  }
}
