import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-about",
})
export class PageAbout {
  public componentWillLoad() {
    document.title = `About | Pizza to the Polls`
  }
  public render() {
    return (
      <Host>
        <section id="about" class="page about">
          <div class="container">
            <h1>About</h1>
            <div class="photo-grid">
              <img alt="Photo of pizzas at polling places" src="/images/pics/photo_1.jpg" />
              <img alt="Photo of pizzas at polling places" src="/images/pics/photo_2.jpg" />
              <img alt="Photo of pizzas at polling places" src="/images/pics/photo_3.jpg" />
              <img alt="Photo of pizzas at polling places" src="/images/pics/photo_4.jpg" />
            </div>
            <p>Americans are hungry for democracy and are turning out in record numbers to vote. But that means long lines and sometimes empty stomachs.</p>
            <p>
              Fortunately, Pizza to the Polls is here to deliver the one thing that pairs perfectly with freedom: piping hot ’za. We take reports of long lines from folks around
              the country and then find local pizza places to deliver the goods.
            </p>
            <h2>How it got started</h2>
            <p>
              The weekend before the 2016 election, long lines were reported at early voting locations across the country. In response, Pizza to the Polls was born. In a few short
              hours, the co-founders came up with a name, a Twitter handle, a website, and a plan: Give pizza to the people. And give people watching at home a way to help.
            </p>
            <p>
              We collected reports of long lines and sent in delivery pizzas to feed the crowds. The feedback was immediate and immense: it fortified hungry voters in line, cheered
              up beleaguered poll workers, and gave people a way to help out their communities.
            </p>
            <p>
              By the morning of Election Day, we had raised $10,000 and were confronted with the seemingly impossible task of spending it all before the polls closed. We recruited
              and trained a team of over twenty volunteers to order and coordinate the delivery of 2,368 pizzas to 128 polling places across 24 states.
            </p>
            <p>By the time the dust had settled and the ballots were cast, we had raised $43,307 from 1,728 donors, and over 25,000 slices of pizza were consumed!</p>

            <h2>2018</h2>
            <p>
              Two years later Pizza to the Polls was back and bigger than before. With the momentum we gained after the 2016 election, we were able to send 10,820 pizzas to 611
              polling places across 41 states and to raise $426,622 from 10,885 donors.
            </p>

            <h2>FAQ</h2>
            <h3>Is this a charity?</h3>
            <p>
              We are incorporated as a 501(c)(4) nonprofit social welfare organization. Contributions or gifts to Pizza to the Polls are not tax deductible. Our activities are
              501(c)(3) compliant.
            </p>
            <p>
              If you’d like to learn more about how you can contribute or work with us, <a href="/partners">learn more here</a>.
            </p>

            <h3>Who do you give snacks to?</h3>
            <p>
              We send food trucks with snacks and deliver pizza to polling places with long lines. The food is free for anyone there — people in line, their kids, poll volunteers
              and staff, and anyone else hungry for a slice.
            </p>

            <h3>Is this partisan?</h3>
            <p>No. Ain’t nothing partisan about trying to make voting less of a drag.</p>

            <h3>Where do you get your pizzas?</h3>
            <p>We often use Slice to find a pizza place close to each polling location. We love to support local businesses in each city! We’ll also order from larger chains.</p>

            <h3>I have more questions?</h3>
            <p>
              That’s more of a statement - but why don’t you send them to us at <a href="mailto:morequestions@polls.pizza">morequestions@polls.pizza</a>.
            </p>
          </div>
        </section>
      </Host>
    );
  }
}
