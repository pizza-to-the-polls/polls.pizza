import { Component, h, Host } from "@stencil/core";

const scrollPageToTop = () => {
  if (window) {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

@Component({
  tag: "page-about",
  styleUrl: "page-about.scss",
})
export class PageAbout {
  public componentWillLoad() {
    document.title = `About | Pizza to the Polls`;
  }

  public componentDidLoad() {
    if (!window.location.hash) {
      scrollPageToTop();
    }
  }

  public render() {
    // Expand/collapse section
    const toggleCollapse = (e?: Event) => {
      e?.preventDefault();
      const header = e?.target as HTMLInputElement;
      const contentId = header.getAttribute("data-section");
      if (contentId) {
        const content = document.getElementById(contentId) as HTMLElement;
        if (content.classList.contains("is-active")) {
          content.style.maxHeight = "";
        } else {
          content.style.maxHeight = content.scrollHeight + 500 + "px"; // Add 500 to account for changing viewport size
        }
        content.classList.toggle("is-active");
        header.classList.toggle("is-active");
        header.setAttribute("aria-expanded", header.classList.contains("is-active") ? "true" : "false");
      }
    };

    return (
      <Host>
        <section id="about" class="page about">
          <div class="container">
            <div class="about-info">
              <h1>About Pizza to the Polls</h1>
              <ul class="toc-list">
                <li>
                  <a href="#how-it-got-started" class="has-text-teal">
                    How it got started
                  </a>
                </li>
                <li>
                  <a href="#how-we-do-it" class="has-text-teal">
                    How we do it
                  </a>
                </li>
                <li>
                  <a href="#covid-safety" class="has-text-teal">
                    COVID Safety
                  </a>
                </li>
                <li>
                  <a href="#faq" class="has-text-teal">
                    FAQ
                  </a>
                </li>
              </ul>

              <hr />

              <div class="content">
                <p>Americans are hungry for democracy and are turning out in record numbers to vote. But that means long lines and sometimes empty stomachs.</p>
                <p>
                  Fortunately, Pizza to the Polls is here to deliver the one thing that pairs perfectly with freedom: piping hot ’za. We take reports of long lines from folks
                  around the country and then find local pizza places to deliver the goods.
                </p>
              </div>

              <div class="box">
                <a href="#" class="expand-section-link is-active" onClick={toggleCollapse} data-section="how-it-got-started" aria-expanded="true">
                  How it got started
                </a>
                <div id="how-it-got-started" class="expand-section is-active">
                  <div class="expand-content">
                    <p>
                      The weekend before the 2016 election, long lines were reported at early voting locations across the country. In response, Pizza to the Polls was born. In a
                      few short hours, the co-founders came up with a name, a Twitter handle, a website, and a plan: Give pizza to the people. And give people watching at home a
                      way to help.
                    </p>

                    <p>
                      We collected reports of long lines and sent in delivery pizzas to feed the crowds. The feedback was immediate and immense: it fortified hungry voters in line,
                      cheered up beleaguered poll workers, and gave people a way to help out their communities.
                    </p>

                    <p>
                      By the morning of Election Day, we had raised $10,000 and were confronted with the seemingly impossible task of spending it all before the polls closed. We
                      recruited and trained a team of over twenty volunteers to order and coordinate the delivery of 2,368 pizzas to 128 polling places across 24 states.
                    </p>

                    <p>By the time the dust had settled and the ballots were cast, we had raised $43,307 from 1,728 donors, and over 25,000 slices of pizza were consumed!</p>

                    <ul class="pizza-list is-marginless">
                      <li>
                        <h3>2018</h3>
                        <p>
                          Two years later Pizza to the Polls was back and bigger than before. With the momentum we gained after the 2016 election, we were able to send 10,820
                          pizzas to 611 polling places across 41 states and to raise $426,622 from 10,885 donors.
                        </p>
                      </li>
                      <li>
                        <h3>2020</h3>
                        <p>
                          This year, we’re delivering pizzas across the country and sending food trucks with snacks to lines in 25 cities. Help us make this our biggest year yet by{" "}
                          <stencil-route-link url="/donate" anchorClass="has-text-teal">
                            donating
                          </stencil-route-link>{" "}
                          and{" "}
                          <stencil-route-link url="/report" anchorClass="has-text-teal">
                            reporting long lines
                          </stencil-route-link>
                          !
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="box">
                <a href="#" class="expand-section-link" onClick={toggleCollapse} data-section="how-we-do-it" aria-expanded="false">
                  How we do it
                </a>
                <div id="how-we-do-it" class="expand-section">
                  <div class="expand-content">
                    <img src="/images/truck.jpg" alt="Democracy is Delicious food truck" class="image" />
                    <h3>Food trucks</h3>
                    <p>
                      For the 2020 election season, we’re launching a food truck program in 25 cities around the country for early voting and election day.
                      <br />
                      <stencil-route-link url="/trucks" anchorClass="has-text-teal">
                        Learn more
                      </stencil-route-link>
                    </p>
                    <p class="has-text-red">IMAGE_PLACEHOLDER</p>
                    <h3>On-Demand</h3>
                    <p>
                      Our signature program is back! We need you to help by reporting crowded polling places and sticking around to ensure food gets delivered safely.
                      <br />
                      <stencil-route-link url="/on-demand" anchorClass="has-text-teal">
                        Learn more
                      </stencil-route-link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="covid-safety">
            <div class="container">
              <div class="box">
                <h2 id="covid-safety" class="is-display is-scroll-to">
                  COVID Safety
                </h2>
                <p>
                  <strong>
                    COVID-19 is a serious illness. Pizza to the Polls values the health and safety of our communities, and will be working to mitigate risk of disease transmission.
                    Everyone visiting their polling location in person should take{" "}
                    <a href="https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/prevention.html" target="_blank" rel="noopener noreferrer">
                      extra precautions
                    </a>{" "}
                    this year:
                  </strong>
                </p>
                <ul class="pizza-list">
                  <li>
                    <a href="https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/diy-cloth-face-coverings.html" target="_blank" rel="noopener noreferrer">
                      Wear a mask.
                    </a>
                  </li>
                  <li>
                    Practice{" "}
                    <a href="https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/social-distancing.html" target="_blank" rel="noopener noreferrer">
                      social distancing
                    </a>{" "}
                    and stay at least 6 feet apart from others.
                  </li>
                  <li>
                    <a href="https://www.cdc.gov/handwashing/when-how-handwashing.html" target="_blank" rel="noopener noreferrer">
                      Wash hands
                    </a>{" "}
                    frequently or use hand sanitizer that contains at least 60% alcohol.
                  </li>
                  <li>
                    Be aware of the{" "}
                    <a href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html" target="_blank" rel="noopener noreferrer">
                      signs and symptoms
                    </a>
                    .
                  </li>
                  <li>Stay home if you are sick, experiencing any symptoms, or after recent close contact with a person with COVID-19.</li>
                  <li>Make sure to comply with local guidance and COVID-19 protocols put in place by your city or election officials.</li>
                </ul>
                <p>
                  <stencil-route-link url="/covid" anchorClass="has-text-teal">
                    Learn more about best practices and guidelines
                  </stencil-route-link>
                </p>
              </div>
            </div>
          </div>
          <div class="faq">
            <div class="container">
              <h2 id="faq" class="is-display is-scroll-to">
                FAQ
              </h2>

              {/* Question */}
              <div class="box">
                <a href="#" class="expand-section-link is-active" onClick={toggleCollapse} data-section="is-this-a-charity" aria-expanded="true">
                  Is this a charity?
                </a>
                <div id="is-this-a-charity" class="expand-section is-active">
                  <div class="expand-content">
                    <p>
                      We are incorporated as a 501(c)(4) nonprofit social welfare organization. Contributions or gifts to Pizza to the Polls are not tax deductible. Our activities
                      are 501(c)(3) compliant. If you’d like to learn more about how you can contribute or work with us,{" "}
                      <stencil-route-link url="/partners" anchorClass="has-text-teal">
                        learn more here
                      </stencil-route-link>
                      .
                    </p>
                  </div>
                </div>
              </div>
              {/* Question */}
              <div class="box">
                <a href="#" class="expand-section-link" onClick={toggleCollapse} data-section="how-do-i-report-a-line" aria-expanded="false">
                  How do I report a line?
                </a>
                <div id="how-do-i-report-a-line" class="expand-section">
                  <div class="expand-content">
                    <p>
                      You can submit a report of a long line through our{" "}
                      <stencil-route-link url="/report" anchorClass="has-text-teal">
                        submission form
                      </stencil-route-link>
                      . We’ll ask for a delivery address, photo or link to a social media post to verify the line, an estimate of the line’s wait time, and your phone number. Once
                      you submit a report, our volunteers will review to verify the line, and then ship pizzas or snacks your way.
                    </p>
                  </div>
                </div>
              </div>
              {/* Question */}
              <div class="box">
                <a href="#" class="expand-section-link" onClick={toggleCollapse} data-section="who-do-you-give-snacks-to" aria-expanded="false">
                  Who do you give snacks to?
                </a>
                <div id="who-do-you-give-snacks-to" class="expand-section">
                  <div class="expand-content">
                    <p>
                      We send food trucks with snacks and deliver pizza to polling places with long lines. The food is free for anyone there — people in line, their kids, poll
                      volunteers and staff, and anyone else hungry for a slice.
                    </p>
                  </div>
                </div>
              </div>
              {/* Question */}
              <div class="box">
                <a href="#" class="expand-section-link" onClick={toggleCollapse} data-section="covid-19-precautions" aria-expanded="false">
                  What precautions is Pizza to the Polls taking as a result of COVID&#8209;19?
                </a>
                <div id="covid-19-precautions" class="expand-section">
                  <div class="expand-content">
                    <p>Pizza to the Polls values the health and safety of our communities, and will be working to mitigate risk of disease transmission:</p>
                    <ul class="pizza-list">
                      <li>
                        Our{" "}
                        <stencil-route-link url="/trucks" anchorClass="has-text-teal">
                          food truck program
                        </stencil-route-link>{" "}
                        will be staffed by professionals who’ve been trained in food safety and policies to help reduce the spread of COVID-19, but please keep in mind that it
                        isn’t possible to eliminate the risk of exposure.
                      </li>
                      <li>
                        For{" "}
                        <stencil-route-link url="/on-demand" anchorClass="has-text-teal">
                          on-demand
                        </stencil-route-link>{" "}
                        pizza deliveries, we will be supporting local pizzerias with our pizza delivery partners at Slice. We plan to share{" "}
                        <a
                          href="https://www.cdc.gov/coronavirus/2019-ncov/community/organizations/business-employers/bars-restaurants.html"
                          class="has-text-teal"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          safety recommendations
                        </a>{" "}
                        with delivery drivers and restaurants, but it’s up to each person to consider their own personal risks.
                      </li>
                    </ul>
                    <p>
                      You can learn more about safety precautions you can take to stay safe at the polls{" "}
                      <stencil-route-link url="/covid" anchorClass="has-text-teal">
                        here
                      </stencil-route-link>
                      .
                    </p>
                  </div>
                </div>
              </div>
              {/* Question */}
              <div class="box">
                <a href="#" class="expand-section-link" onClick={toggleCollapse} data-section="can-i-help-distribute-pizzas" aria-expanded="false">
                  Can I help distribute pizzas?
                </a>
                <div id="can-i-help-distribute-pizzas" class="expand-section">
                  <div class="expand-content">
                    <p>
                      Yes! When you report a line, let us know that you can receive an order on behalf of Pizza to the Polls. One of our volunteers will reach out to you to verify
                      timing for delivery. Pizzas usually take around 90 minutes to be delivered after an order is placed. Please be sure to{" "}
                      <stencil-route-link url="/guidelines" anchorClass="has-text-teal">
                        read our guidelines
                      </stencil-route-link>{" "}
                      to learn how to help out safely.
                    </p>
                  </div>
                </div>
              </div>
              {/* Question */}
              <div class="box">
                <a href="#" class="expand-section-link" onClick={toggleCollapse} data-section="can-you-send-other-items" aria-expanded="false">
                  Can you send water, chairs, umbrellas, or other items besides pizza to people in lines?
                </a>
                <div id="can-you-send-other-items" class="expand-section">
                  <div class="expand-content">
                    <p>Unfortunately, we’re only able to support sending pizzas or food trucks to lines at this time.</p>
                  </div>
                </div>
              </div>
              {/* Question */}
              <div class="box">
                <a href="#" class="expand-section-link" onClick={toggleCollapse} data-section="is-this-partisan" aria-expanded="false">
                  Is this partisan?
                </a>
                <div id="is-this-partisan" class="expand-section">
                  <div class="expand-content">
                    <p>No. Ain’t nothing partisan about trying to make voting less of a drag.</p>
                  </div>
                </div>
              </div>
              {/* Question */}
              <div class="box">
                <a href="#" class="expand-section-link" onClick={toggleCollapse} data-section="where-do-you-get-your-pizzas" aria-expanded="false">
                  Where do you get your pizzas?
                </a>
                <div id="where-do-you-get-your-pizzas" class="expand-section">
                  <div class="expand-content">
                    <p>
                      We often use Slice to find a pizza place close to each polling location. We love to support local businesses in each city! We’ll also order from larger
                      chains.
                    </p>
                  </div>
                </div>
              </div>
              {/* Question */}
              <div class="box">
                <a href="#" class="expand-section-link" onClick={toggleCollapse} data-section="more-questions" aria-expanded="false">
                  I have more questions?
                </a>
                <div id="more-questions" class="expand-section">
                  <div class="expand-content">
                    <p>
                      That’s more of a statement - but why don’t you send them to us at{" "}
                      <a href="mailto:morequestions@polls.pizza" class="has-text-teal" target="_blank" rel="noopener noreferrer">
                        morequestions@polls.pizza
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
