import { Component, h, Host, Prop, State } from "@stencil/core";
import { MatchResults } from "@stencil/router";

import { PizzaApi } from "../../api";

@Component({
  tag: "page-session",
})
export class PageSession {
  @State() private token?: string | null;
  @State() private email?: string | null;
  @State() private error?: string | null;
  @Prop() public match!: MatchResults;

  public componentWillLoad() {
    document.title = `Sign In | Pizza to the Polls`;
    console.log(this.match.params);
    this.token = this.match.params.token;
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
    } catch (e) {
      this.showError(e?.errors?.token || "Whoops! That didn't work. Our servers might be a little stuffed right now.");
    }
  }

  public async sendEmail() {
    this.error = null;
    if (!this.email) {
      return false;
    }
    try {
      await PizzaApi.postSession(this.email);
    } catch (e) {
      this.token = null;
      this.showError(e?.errors?.token || "Whoops! That link doesn't work.");
    }
  }

  public showError(error: string) {
    this.error = error;
  }

  public render() {
    const handleChange = () => {
      const emailInput = document.querySelector("input[name=email]") as HTMLInputElement;
      this.email = emailInput.value;
      console.log(this.email);
    };
    const handleSubmit = (e: Event) => {
      this.sendEmail();
      e.preventDefault();
    };
    return (
      <Host>
        <ui-main-content background="red">
          <ui-card>
            {!this.token ? (
              <form id="sign-in-form" onChange={handleChange} onSubmit={handleSubmit}>
                <h1>Sign in to Crust Club</h1>
                <label class="label">
                  Crust Club Email <span class="required">*</span>
                </label>
                <input onChange={handleChange} type="email" id="email" name="email" value="" />
                <button
                  onClick={handleSubmit}
                  class={"button is-red is-fullwidth-mobile " + (!this.email ? "is-disabled" : "")}
                  disabled={!this.email || (this.email || "").length < 1}
                >
                  Sign in
                </button>
                <p>We'll email you a link to sigin in.</p>
              </form>
            ) : (
              <h1>Signing you in...</h1>
            )}
            <p>{this.error}</p>
          </ui-card>
        </ui-main-content>
      </Host>
    );
  }
}
