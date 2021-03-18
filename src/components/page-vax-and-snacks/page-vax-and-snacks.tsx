import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-vax-and-snacks",
})
export class PageVaxAndSnacks {
  public componentWillLoad() {
    document.title = `Vax and Snacks program | Pizza to the Polls`;
  }

  public render() {
    return (
      <Host>
        <section id="trucks" class="page">
          <div class="container intro">
            <img class="vax-logo" src="/images/vax-and-snacks.png" alt="Vax and Snacks" />
            <h1>Pizza to the Polls Vax and Snacks program</h1>
            <p>
              When long lines during the 2020 Election were set to deter Americans from exercising their right to vote, Pizza to the Polls stepped up to the plate to help people
              perform their civic duties. COVID vaccination lines are no exception. While following all recommended{" "}
              <a href="https://www.cdc.gov/coronavirus/2019-ncov/community/organizations/business-employers/bars-restaurants.html">CDC</a> and state health guidelines, Pizza to the
              Polls will use its technology, expertise, and network of passionate supporters to get food to vaccination locations where it’s needed the most.
            </p>
            <h2>Want to get involved?</h2>
            <h3>Make a donation</h3>
            <p>
              We have the experience to make this type of unprecedented program happen, but we need help. As a small nonprofit, we rely heavily on donations from supporters to do
              this important work. If you are interested in sending some pizza to the frontlines of America’s vaccination efforts, <a href="/donate">please donate here</a>.
            </p>
            <h3>Report long lines</h3>
            <p>
              Are you a healthcare worker at a vaccination site or do you know someone administering vaccines? Let us know how we can help! Email:{" "}
              <a href="mailto:amirah@polls.pizza">amirah@polls.pizza</a> & <a href="mailto:lee@polls.pizza">lee@polls.pizza</a> to coordinate food delivery!
            </p>
            <h3>Help spread the word on social media</h3>
            <p>
              Posting about Pizza to the Polls on social media helps us grow our network and spread the word about our programs! If you’d like to show us some love online and
              follow us on <a href="https://twitter.com/PizzaToThePolls">Twitter</a>, <a href="https://www.facebook.com/pizzatothepolls">Facebook</a>, and{" "}
              <a href="https://www.instagram.com/pizzatothepolls/">Instagram</a> for more updates. Don’t forget to use the hashtag #VaxAndSnacks!
            </p>
            <h2>Contact Info</h2>
            <p>
              For more information on how to partner, contact <a href="mailto:amirah@polls.pizza">amirah@polls.pizza</a>.
            </p>
            <p>
              For press requests, please contact <a href="mailto:press@polls.pizza">press@polls.pizza</a>
            </p>
          </div>
        </section>
      </Host>
    );
  }
}
