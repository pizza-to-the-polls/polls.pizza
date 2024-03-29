import { Component, h, Host, Prop, State } from "@stencil/core";
import { MatchResults } from "@stencil/router";

import { PizzaApi } from "../../api";

@Component({
  tag: "page-session",
  styleUrl: "page-session.scss",
})
export class PageSession {
  @State() private token?: string | null;
  @State() private email?: string | null;
  @State() private error?: string | null;
  @State() private sent: boolean = false;
  @Prop() public match!: MatchResults;

  public componentWillLoad() {
    document.title = `Sign In | Pizza to the Polls`;

    this.token = this.match.params?.token ? decodeURI(this.match.params.token) : null;

    if (this.token) {
      this.signIn();
    }
  }

  public async signIn() {
    this.error = null;
    if (!this.token) {
      return false;
    }
    try {
      const { redirect } = await PizzaApi.putSession(this.token);
      window.location.href = redirect;
    } catch ({ errors }) {
      this.showError(errors?.token || "Whoops! That didn't work. Our servers might be a little stuffed right now.");
    }
  }

  public async sendEmail() {
    this.error = null;
    if (!this.email) {
      return false;
    }
    try {
      await PizzaApi.postSession(this.email);
      this.sent = true;
    } catch ({ errors }) {
      this.token = null;
      this.showError(errors?.token || "Whoops! That link doesn't work.");
    }
  }

  public showError(error: string) {
    this.error = error;
  }

  public render() {
    const handleChange = () => {
      const emailInput = document.querySelector("input[name=email]") as HTMLInputElement;
      this.email = emailInput.value;
    };
    const handleSubmit = (e: Event) => {
      this.sendEmail();
      e.preventDefault();
    };
    return (
      <Host>
        <ui-main-content>
          <ui-card>
            {!this.token && !this.sent ? (
              <form id="sign-in-form" onChange={handleChange} onSubmit={handleSubmit}>
                <h1>Sign in to Crust Club</h1>
                <label class="label">
                  Crust Club Email <span class="required">*</span>
                </label>
                <div class="form-item-group">
                  <div class="form-item">
                    <input class="is-fullwidth input" onChange={handleChange} onInput={handleChange} type="email" id="email" name="email" value="" />
                  </div>
                </div>
                <button onClick={handleSubmit} class={"button is-red is-fullwidth " + (!this.email ? "is-disabled" : "")} disabled={!this.email || (this.email || "").length < 1}>
                  Email me a link
                </button>
                <p>Links are valid for 15 minutes.</p>
              </form>
            ) : this.token ? (
              <h1>Signing you in...</h1>
            ) : (
              <h1>Check your email!</h1>
            )}
            <p>{this.error}</p>
          </ui-card>
        </ui-main-content>
      </Host>
    );
  }
}
