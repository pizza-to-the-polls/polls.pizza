import { Component, h } from "@stencil/core";

const partners2022 = [
  {
    img: "all-vote-no-play.png",
    name: "All Vote No Play",
    url: "https://www.allvotenoplay.org/",
  },
  {
    img: "andrew-goodman-foundation.png",
    name: "The Andrew Goodman Foundation",
    url: "https://andrewgoodman.org/",
  },
  {
    img: "asian-pacific-islander-american-vote-michigan.jpg",
    name: "AAPI MI",
    url: "https://www.apiavotemi.org/",
  },
  {
    img: "black-girls-vote.png",
    name: "Black Girls Vote",
    url: "https://blackgirlsvote.com/",
  },
  {
    img: "campus-vote-project.png",
    name: "Campus Vote Project",
    url: "https://www.campusvoteproject.org/",
  },
  {
    img: "center-for-new-data.png",
    name: "Center for New Data",
    url: "https://www.newdata.org/",
  },
  {
    img: "chicago-votes.jpg",
    name: "Chicago Votes",
    url: "https://chicagovotes.com/",
  },
  {
    img: "civic-alliance.png",
    name: "Civic Alliance",
    url: "https://www.civicalliance.com/",
  },
  {
    img: "civic-season.png",
    name: "Civic Season",
    url: "https://www.thecivicseason.com/",
  },
  {
    img: "committee-of-70.jpg",
    name: "Committee of 70",
    url: "https://seventy.org/",
  },
  {
    img: "dominos.png",
    name: "Dominos",
    url: "https://www.dominos.com",
  },
  {
    img: "engage-miami.png",
    name: "Engage Miami",
    url: "https://engage.miami/",
  },
  {
    img: "every-vote-counts.jpeg",
    name: "Every Vote Counts",
    url: "https://www.evcnational.org/",
  },
  {
    img: "forward-montana-foundation.png",
    name: "Forward Montana Foundation",
    url: "https://forwardmontana.org/",
  },
  {
    img: "harness.png",
    name: "Harness",
    url: "https://iwillharness.com/",
  },
  {
    img: "headcount.png",
    name: "Headcount",
    url: "https://www.headcount.org/",
  },
  {
    img: "jolt-initiative.png",
    name: "Jolt Initiative",
    url: "http://jolttx.org/",
  },
  {
    img: "joy-to-the-polls.png",
    name: "Joy to the Polls",
    url: "https://linktr.ee/joytothepolls",
  },
  {
    img: "lead-mn.jpg",
    name: "Lead MN",
    url: "https://www.leadmn.org/",
  },
  {
    img: "levis.png",
    name: "Levi's",
    url: "https://www.levi.com/US/en_US/",
  },
  {
    img: "lwvwi.png",
    name: "League of Women Voters of Wisconsin",
    url: "https://my.lwv.org/wisconsin",
  },
  {
    img: "move-texas.png",
    name: "Move Texas",
    url: "https://movetexas.org/",
  },
  {
    img: "naacp-philadelphia.webp",
    name: "NAACP Philadelphia",
    url: "https://naacpphillybranch.org/",
  },
  {
    img: "national-voter-registration-day.png",
    name: "National Voter Registration Day",
    url: "http://nationalvoterregistrationday.org/",
  },
  {
    img: "ncaat.png",
    name: "North Carolina Asian Americans Together",
    url: "http://www.ncaatinaction.org/",
  },
  {
    img: "new-era-colorado.png",
    name: "New Era Colorado",
    url: "https://neweracolorado.org/",
  },
  {
    img: "new-georgia-project.jpg",
    name: "New Georgia Project",
    url: "https://www.newgeorgiaproject.org/",
  },
  {
    img: "new-voters.png",
    name: "New Voters",
    url: "https://www.new-voters.org/",
  },
  {
    img: "proactive-grand-rapids.jpg",
    name: "Proactive Grand Rapids",
    url: "https://proactivegr.us",
  },
  {
    img: "protect-the-sacred-harness.png",
    name: "Protect the Sacred powered by Harness",
    url: "https://iwillharness.com/program/protect-the-sacred/",
  },
  {
    img: "radical-registrars.png",
    name: "Radical Registrars",
    url: "https://radicalregistrars.org/vote/",
  },
  {
    img: "ragtag.png",
    name: "Ragtag",
    url: "https://ragtag.org/",
  },
  {
    img: "slice.png",
    name: "Slice",
    url: "https://slicelife.com/",
  },
  {
    img: "souls-to-the-polls.png",
    name: "Souls to the Polls",
    url: "https://www.soulstothepollswi.org/",
  },
  {
    img: "students-learn-students-vote.png",
    name: "Students Learn Students Vote",
    url: "https://slsvcoalition.org/",
  },
  {
    img: "trek-the-vote.jpg",
    name: "Trek the Vote",
    url: "http://www.trekthe.vote/",
  },
  {
    img: "unidos-us.jpg",
    name: "UnidosUS",
    url: "https://www.unidosus.org/",
  },
  {
    img: "voces.jpg",
    name: "Voces",
    url: "https://www.vocesbc.org/",
  },
  {
    img: "vote-early-day-2022.png",
    name: "Vote Early Day 2022",
    url: "http://www.voteearlyday.org/",
  },
  {
    img: "voters-not-politicians.png",
    name: "Voters Not Politicians",
    url: "https://votersnotpoliticians.com/",
  },
];

const topPartners2020 = [
  {
    img: "ubereats.png",
    name: "Uber Eats",
    url: "https://www.ubereats.com/",
  },
  {
    img: "slice.png",
    name: "Slice",
    url: "https://slicelife.com/",
  },
];

const partners2020 = [
  {
    img: "&pizza.png",
    name: "&Pizza",
    url: "https://andpizza.com/",
  },
  {
    img: "cox.png",
    name: "Cox",
    url: "https://www.cox.com/",
  },
  {
    img: "daybreaker.png",
    name: "Daybreaker",
    url: "https://www.daybreaker.com/",
  },
  {
    img: "detroit-votes-2022.png",
    name: "Detroit Votes 2022",
    url: "https://detroitvotes.org/",
  },
  {
    img: "ezcater.png",
    name: "EZCater",
    url: "https://www.ezcater.com/",
  },
  {
    img: "hattiebs.png",
    name: "Hattie B's Chicken",
    url: "https://hattieb.com/",
  },
  {
    img: "just.png",
    name: "Just Goods, Inc.",
    url: "https://justwater.com/",
  },
  {
    img: "kind.png",
    name: "KIND Snacks",
    url: "https://www.kindsnacks.com/",
  },
  {
    img: "lacolombe.jpg",
    name: "La Colombe Coffee",
    url: "https://www.lacolombe.com/",
  },
  {
    img: "lemonade.png",
    name: "Lemonade",
    url: "https://www.lemonade.com/",
  },
  {
    img: "levis.png",
    name: "Levi Strauss & Co.",
    url: "https://levi.com",
  },
  {
    img: "nuchas.jpg",
    name: "Nuchas",
    url: "https://nuchas.com/",
  },
  {
    img: "pipcorn.png",
    name: "Pipcorn",
    url: "https://www.pipsnacks.com/",
  },
  {
    img: "planet-fitness.jpg",
    name: "Planet Fitness",
    url: "https://www.planetfitness.com/",
  },
  {
    img: "sftp.jpg",
    name: "Somebody Feed the People",
    url: "https://www.somebodyfeedthepeople.org/",
  },
  {
    img: "scf.png",
    name: "Social Change Fund",
    url: "https://www.thesocialchangefund.org/",
  },
  {
    img: "stickys.png",
    name: "Sticky's Finger Joint",
    url: "https://www.stickys.com/",
  },
  {
    img: "symphony.png",
    name: "Symphony Potato Chips",
    url: "https://symphonychips.com/",
  },
  {
    img: "ap.png",
    name: "The Advancement Project",
    url: "https://advancementproject.org/",
  },
  {
    img: "gato.png",
    name: "The Great American Takeout",
    url: "https://thegreatamericantakeout.com/",
  },
  {
    img: "lcef.png",
    name: "The Leadership Conference Education Fund",
    url: "https://civilrights.org/edfund/",
  },
  {
    img: "thesalty.png",
    name: "The Salty",
    url: "https://www.saltydonut.com/",
  },
  {
    img: "tonys-chocolonely.png",
    name: "Tony's Chocolonely",
    url: "https://tonyschocolonely.com/",
  },
  {
    img: "usa.png",
    name: "United Sodas of America",
    url: "https://unitedsodas.com/",
  },
  {
    img: "voodoo.jpg",
    name: "Voodoo Doughnut",
    url: "https://www.voodoodoughnut.com/",
  },
  {
    img: "wetzels.jpg",
    name: "Wetzel's Pretzels",
    url: "https://www.wetzels.com/",
  },
  {
    img: "wishful.png",
    name: "Wishful Roasting Co.",
    url: "https://wishfulroasting.com/",
  },
  {
    img: "zendesk.png",
    name: "Zendesk",
    url: "https://zendesk.com/",
  },
];

@Component({
  tag: "page-partners",
  styleUrl: "page-partners.scss",
})
export class PagePartners {
  public componentWillLoad() {
    document.title = `Partners | Pizza to the Polls`;
  }

  public render() {
    return (
      <ui-main-content id="partners" class="page" background="cyan">
        <ui-card>
          <h2>2022 Partners</h2>
          <ul class="partners">
            {partners2022.map(l => {
              return (
                <li>
                  <a href={l.url} target="blank">
                    <img src={`/images/logos/${l.img}`} alt={l.name} />
                  </a>
                </li>
              );
            })}
          </ul>

          <h2>2020 Partners</h2>
          <ul class="partners">
            {topPartners2020.map(l => {
              return (
                <li>
                  <a href={l.url} target="blank">
                    <img src={`/images/logos/${l.img}`} alt={l.name} />
                  </a>
                </li>
              );
            })}
          </ul>
          <ul class="partners">
            {partners2020.map(l => {
              return (
                <li>
                  <a href={l.url} target="blank">
                    <img src={`/images/logos/${l.img}`} alt={l.name} />
                  </a>
                </li>
              );
            })}
          </ul>
        </ui-card>
        <ui-card>
          <h2>Become a partner</h2>
          <p>We’re looking for partners who can:</p>
          <ui-pizza-list>
            <li>
              <strong>Promote @PizzatothePolls:</strong> Help spread the word by creating or sharing content across social media so people know they can report a line or promote a
              partnered event
            </li>
            <li>
              <strong>Feed Hungry Folks:</strong> Donate snacks or beverages to be delivered to polling locations
            </li>
            <li>
              <strong>Raise Dough:</strong> Share our fundraising link with your supporters
            </li>
            <li>
              <strong>Join our pizza pre-order program:</strong> Submit a request for your upcoming event
            </li>
          </ui-pizza-list>
          <p>
            If you’re interested in becoming a partner,email{" "}
            <a href="mailto:partners@polls.pizza" class="has-text-teal" target="_blank">
              partners@polls.pizza
            </a>
            .
          </p>
        </ui-card>
      </ui-main-content>
    );
  }
}
