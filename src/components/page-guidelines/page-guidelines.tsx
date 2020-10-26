import { Component, h, Host } from "@stencil/core";
import { scrollPageToTop } from "../../lib/base";

@Component({
  tag: "page-guidelines",
  styleUrl: "page-guidelines.css",
})
export class PageGuidelines {
  public componentWillLoad() {
    document.title = `On-Demand Delivery Guidelines | Pizza to the Polls`;
  }

  public componentDidLoad() {
    if (!window.location.hash) {
      scrollPageToTop();
    }
  }

  public render() {
    return (
      <Host>
        <section id="instructions" class="page">
          <div class="container">
            <h1>On-Demand Delivery Guidelines</h1>
            <p>
              Below are guidelines for restaurant partners, food delivery people, and volunteers helping hand out food at polling locations to abide by.{" "}
              <strong>Please review carefully and feel free to call our hotline at (971) 407-1829 if you have questions.</strong>
            </p>
            <h2>Give Free Food to ALL - No Strings Attached</h2>
            <ul>
              <li>
                Food and drink must be offered to anyone and everyone at a given polling location, whether or not they are going to vote, have voted, who they intend to vote for,
                or their political affiliation. Everyone loves pizza and pizza is for everyone.
              </li>
              <li>
                Do not ask for anything in exchange for providing pizza, do not provide pizza as an inducement to vote or vote in a particular way, and do not engage in any
                behavior that suggests that receiving food or drink is dependent upon voting status.
                <ul>
                  <li>
                    <strong>Do say:</strong> “Would you like some pizza?” and/or “Are you thirsty?”{" "}
                  </li>
                  <li>
                    <strong>DO NOT SAY:</strong> “I’ll give you some pizza if you vote,” “If you vote for Candidate X, you can have some water,” or even “Are you voting today?” or
                    “Please stay in line to vote.”
                  </li>
                </ul>
              </li>
              <li>
                Make food and drink available for anyone, but do not provide more than a de minimis value of items to any one person. For example, you might provide one slice of
                pizza and/or one water battle to a person near your polling place.{" "}
              </li>
            </ul>
            <h2>Use Solely Non-Partisan Messaging, No “Electioneering”</h2>
            <ul>
              <li>
                Remain politically neutral in your verbal communication, behavior, or dress. Do not advocate for or against or discuss any candidates, political parties, or
                movements at any time while distributing pizza to people at your polling locations.
              </li>
            </ul>
            <h2>Stay Safe and COVID-19 Compliant</h2>
            <ul>
              <li>Wear a mask when providing food and drink, social distance as much as possible, and follow state and local COVID-19 protocols.</li>
              <li>Distribute food in a way that minimises crowding around the food</li>
              <li>
                Try not to distribute food directly, if distributing food always wear a mask and keep the food covered when not being accessed by the public (e.g. no open pizza
                boxes being passed around).{" "}
              </li>
              <li>
                Wash or sanitize your hands (with sanitizer containing at least 60% alcohol) prior to handling food at the polling location. If possible, put on gloves after
                sanitizing and prior to handling food.{" "}
              </li>
              <li>Be sure to dispose of food waste in trash cans, and encourage people consuming food to do the same.</li>
              <li>If you feel unsafe at any point, leave the area.</li>
              <li>If there are protests or unrest at or around a polling place, keep your distance and do not engage while distributing pizza to people in the area. </li>
            </ul>
            <h2>Follow Polling Place Rules and Instructions</h2>
            <ul>
              <li>
                Stay outside of the polling place restricted zone. This area is typically marked with a sign. If you have questions about the restricted zone around your local
                polling place, you can ask a poll worker for more information.{" "}
              </li>
              <li>
                If you are asked to leave the area or given other instructions by a poll worker, police officer, or other official, please promptly comply with their request
                without protest.
              </li>
              <li>Follow any state-specific guidance you have received.</li>
            </ul>
          </div>
        </section>
      </Host>
    );
  }
}
