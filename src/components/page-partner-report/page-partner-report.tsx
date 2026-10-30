import { Component, h, Host, Prop, State, Watch } from "@stencil/core";
import { RouterHistory } from "@stencil/router";

import { PizzaApi } from "../../api";

/**
 * Private trusted-report page for partner organizations: /partners/report
 *
 * Two states, no passwords:
 *  1. No session token (or an expired one): the partner enters their email;
 *     pizzabase mails them a magic link (24h) back to this page.
 *  2. Valid token in the URL (?token=...) or localStorage: show the
 *     trusted report form (form-partner-report).
 *
 * The token is stored in localStorage so a partner can keep filing reports
 * across reloads until the 24h expiry — when the API rejects it, the form
 * emits sessionExpired and we drop back to the email step.
 */
const TOKEN_STORAGE_KEY = "ptp-partner-token";

@Component({
  tag: "page-partner-report",
  styleUrl: "page-partner-report.scss",
})
export class PagePartnerReport {
  @Prop() public history?: RouterHistory;

  @State() private token: string | null = null;
  @State() private email: string = "";
  @State() private sent: boolean = false;
  @State() private requestError: string | null = null;

  public componentWillLoad() {
    document.title = `Partner Reports | Pizza to the Polls`;
    this.resolveToken();
  }

  // The router may attach the history prop after first render (and the
  // magic link may arrive via URL after hydration) — re-resolve on change.
  @Watch("history")
  public onHistoryChange() {
    this.resolveToken();
  }

  private resolveToken() {
    // Magic link lands as ?token=<jwt> — persist it, then it lives in
    // localStorage for subsequent visits until it expires server-side.
    const queryToken = (this.history?.location?.query as { token?: string } | undefined)?.token;
    if (queryToken) {
      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, queryToken);
      } catch (_e) {
        /* private mode / storage disabled — URL token still works for this visit */
      }
    }

    this.token = (this.readStoredToken() || queryToken || null) as string | null;
  }

  private readStoredToken(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (_e) {
      return null;
    }
  }

  private clearStoredToken(): void {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (_e) {
      /* nothing to clean up */
    }
  }

  private async requestLink(event: Event) {
    event.preventDefault();
    this.requestError = null;
    if (!this.email || this.email.length < 3) {
      this.requestError = "Whoops! Can you enter your email address?";
      return;
    }
    try {
      await PizzaApi.postPartnerSession(this.email);
      this.sent = true;
    } catch (_error) {
      this.requestError = "Whoops! That didn't work. Our servers might be a little stuffed right now.";
    }
  }

  private handleSessionExpired() {
    this.clearStoredToken();
    this.token = null;
    this.sent = false;
  }

  public render() {
    const handleEmailInput = (e: Event) => {
      this.email = (e.target as HTMLInputElement).value;
    };

    return (
      <Host>
        <section id="partner-report" class="page partner-report">
          <ui-main-content pageType="no-bg">
            <ui-card>
              {this.token ? (
                <form-partner-report token={this.token} onSessionExpired={() => this.handleSessionExpired()} />
              ) : this.sent ? (
                <div id="partner-link-sent">
                  <h1 class="is-display">Check your email!</h1>
                  <p>If your address is on the partner list, we've sent you a sign-in link. It's valid for 24 hours — click it to open the report form.</p>
                  <p>
                    <a
                      href="#"
                      class="has-text-teal"
                      onClick={(e: Event) => {
                        e.preventDefault();
                        this.sent = false;
                      }}
                    >
                      Use a different email
                    </a>
                  </p>
                  {this.requestError ? <p class="help has-text-red">{this.requestError}</p> : null}
                </div>
              ) : (
                <div id="partner-sign-in">
                  <h1 class="is-display">Partner Reports</h1>
                  <p>This page is for partner organizations. Enter your email and we'll send you a sign-in link — no password needed.</p>
                  <form id="partner-sign-in-form" onSubmit={(e: Event) => this.requestLink(e)}>
                    <label class="label" htmlFor="partner-email">
                      Your email <span class="required">*</span>
                    </label>
                    <div class="form-item">
                      <input
                        class={"input " + (this.requestError ? "has-error" : "")}
                        type="email"
                        id="partner-email"
                        name="email"
                        onInput={handleEmailInput}
                        autoComplete="email"
                      />
                    </div>
                    <button type="submit" class={"button is-red is-fullwidth " + (!this.email ? "is-disabled" : "")} disabled={!this.email || this.email.length < 3}>
                      Email me a link
                    </button>
                    <p class="help">Links are valid for 24 hours.</p>
                    {this.requestError ? <p class="help has-text-red">{this.requestError}</p> : null}
                  </form>
                </div>
              )}
            </ui-card>
          </ui-main-content>
        </section>
      </Host>
    );
  }
}
