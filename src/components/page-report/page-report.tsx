import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-report",
  styleUrl: "page-report.scss",
})
export class PageDonate {
  public componentWillLoad() {
    document.title = `Report | Pizza to the Polls`
  }
  public render() {
    return (
      <Host>
        <div id="report" class="report">
          <div class="container">
            <h1>Report a line</h1>
            <p id="submit_message" class="message" hidden></p>
            <form id="form">
              <div class="form-item">
                <label htmlFor="social-link">Link to a report on social media</label>
                <input id="social-link" type="text" name="social_link" />
                <span class="help">
                  <strong>Required:</strong> We'll make sure there's really a line.
                </span>
              </div>
              <div class="form-item">
                <label htmlFor="address">Polling place address</label>
                <input type="text" id="autocomplete" name="full_place" />
                <span class="help">
                  <strong>Required:</strong> Search by the name of the place ("St. John's Library") or street address.
                </span>
              </div>
              <div id="address" class="form-item" hidden>
                <table>
                  <tr>
                    <td class="label">Place</td>
                    <td colSpan={4}>
                      <input id="premise" disabled={true} />
                    </td>
                  </tr>
                  <tr>
                    <td class="label">Street address</td>
                    <td class="slimField">
                      <input name="street_number" class="field" id="street_number" disabled={true} />
                    </td>
                    <td class="wideField" colSpan={2}>
                      <input class="field" name="route" id="route" disabled={true} />
                    </td>
                  </tr>
                  <tr>
                    <td class="label">City</td>
                    <td class="wideField" colSpan={3}>
                      <input name="locality" class="field" id="locality" disabled={true} />
                    </td>
                  </tr>
                  <tr>
                    <td class="label">State</td>
                    <td class="slimField">
                      <input name="state" class="field" id="administrative_area_level_1" disabled={true} />
                    </td>
                    <td class="label">Zip code</td>
                    <td class="wideField">
                      <input name="zip" class="field" id="postal_code" disabled={true} />
                    </td>
                    <input type="hidden" name="formatted_address" id="formatted_address" />
                  </tr>
                </table>
              </div>
              <div class="form-item">
                <label htmlFor="address">Your phone number or email address</label>
                <input type="text" name="contact" />
                <br />
                <span class="help">Optional: So we can follow up when the pizza is inbound</span>
              </div>
              <button class="submit" type="button">
                Submit report. Feed democracy
              </button>
            </form>
          </div>
        </div>
      </Host>
    );
  }
}
