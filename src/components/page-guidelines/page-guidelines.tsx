import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-guidelines",
  styleUrl: "page-guidelines.scss",
})
export class PageGuidelines {
  public componentWillLoad() {
    document.title = `On-Demand Delivery Guidelines | Pizza to the Polls`;
  }

  public render() {
    return (
      <Host>
        <section id="instructions" class="page">
          <div class="container">
            <h1>On-Demand Delivery Guidelines</h1>
            <p>
              Below are the requirements for restaurant partners, food delivery people, and volunteers helping to hand out food provided by Pizza to the Polls around polling places
              or at other locations.{" "}
              <strong>
                Please review carefully and feel free to call our hotline at{" "}
                <a href="tel:+1-971-407-1829" target="_blank" rel="noreferrer nofollow" aria-label="Pizza to the Polls hotline phone number">
                  (971) 407-1829
                </a>{" "}
                if you have questions.
              </strong>
            </p>
            <h2>Give Free Food to ALL - No Strings Attached</h2>
            <ul>
              <li>
                Food and drink must be offered to anyone and everyone at a given polling location or other location where we are sending items, whether or not they are going to
                vote, have voted, who they intend to vote for, have or have not engaged in a particular civic activity, or their political affiliation. Everyone loves pizza and
                pizza is for everyone.
              </li>
              <li>
                Do not ask for anything in exchange for providing pizza or other items from Pizza to the Polls, do not provide pizza as an inducement to vote, vote in a particular
                way, or take any particular action, and do not engage in any behavior that suggests that receiving food or drink is dependent upon voting status.
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
                pizza and/or one water battle to a person near your polling place but do not give five pizzas to one person.{" "}
              </li>
            </ul>
            <h2>Use Solely Non-Partisan Messaging, No “Electioneering”</h2>
            <ul>
              <li>
                Remain politically neutral in your verbal communication and behavior. Do not advocate for or against or discuss any candidates, political parties, or movements at
                any time while distributing items from Pizza to the Polls.
              </li>
            </ul>
            <h2>Stay Safe and COVID-19 Compliant</h2>
            <ul>
              <li>If you feel unsafe at any point, leave the area.</li>
              <li>
                If there are protests or unrest at or around a polling place or other location, keep your distance and do not engage while distributing pizza to people in the area.
              </li>
              <li>Be sure to dispose of food waste in trash cans, and encourage people consuming food to do the same.</li>
              <li>
                Follow{" "}
                <a href="https://www.cdc.gov/coronavirus/2019-nCoV/index.html" target="_blank" rel="noreferrer nofollow">
                  CDC Guidelines
                </a>{" "}
                state and local COVID-19 protocols.
              </li>
            </ul>
            <h2>Follow Polling Place Rules and Instructions</h2>
            <ul>
              <li>
                Stay outside of polling place restricted zones. These areas are typically marked with a sign. If you have questions about the restricted zone around your local
                polling place, you can ask a poll worker for more information.{" "}
              </li>
              <li>
                If you are asked to leave the area or given other instructions by a poll worker, police officer, or other official, please promptly comply with their request
                without protest.
              </li>
              <li>Follow any other rules and policies in place at your location.</li>
            </ul>
          </div>
        </section>
      </Host>
    );
  }
}
