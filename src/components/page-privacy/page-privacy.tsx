import { Component, h, Host } from "@stencil/core";

import { scrollPageToTop } from "../../util";

@Component({
  tag: "page-privacy",
})
export class PagePrivacy {
  public componentWillLoad() {
    document.title = `Privacy Policy | Pizza to the Polls`;
  }

  public componentDidLoad() {
    if (!window.location.hash) {
      scrollPageToTop();
    }
  }

  public render() {
    return (
      <Host>
        <section id="about" class="page about">
          <div class="container">
            <h1>Privacy Policy</h1>

            <p>
              Pizza to the Polls created this privacy notice to explain how we use information that you may provide while visiting our website and to demonstrate our firm
              commitment to Internet privacy.
            </p>
            <p>Pizza to the Polls may modify this policy from time to time, so we encourage you to check this page when revisiting this website.</p>

            <h3>How We Use Your Information</h3>
            <p>Pizza to the Polls is committed to protecting your privacy online.</p>
            <p>
              When you register, contribute, sign up to serve or volunteer, or take any other action on our site, we may ask you to give us contact information, including your
              name, address, telephone number and/or e-mail address. We may obtain information about you from outside sources and add it to or combine it with the information we
              collect through this site. We use this information to operate this site, send news and information to you about Pizza to the Polls & to solicit your participation in
              Pizza to the Polls programs, events, and activities, and obtain and confirm RSVPs to events and programs. We use your e-mail address to send such information by
              e-mail and may use your telephone number to call you for these purposes.
            </p>
            <p>
              We will only provide your information to third parties for purposes related to civic engagement. We will never provide your e-mail address or any of your personal
              information to any other person or organization, for any other purpose. If you decide to purchase tickets to an event or to make a contribution online, we may also
              ask for your credit card number and its expiration date. That information is used solely for processing your contribution; is not maintained by our organization; and
              is never disclosed to anyone, for any other purpose other than for processing your contribution, under any circumstances.
            </p>

            <h3>How We Protect Information You Provide</h3>
            <p>
              Pizza to the Polls uses industry standard security measures to protect against the loss, misuse, or alteration of the information under our control. Our server is
              located in a locked, secure environment. Permission to access your information is granted only to you and Pizza to the Polls employees or contractors who need to know
              that information to provide services to you. Although we make good faith efforts to store information collected by this website in a secure operating environment, we
              cannot guarantee complete security.
            </p>

            <h3>Links to Other Websites</h3>
            <p>
              This privacy policy covers this website and its subdomains. These sites may link to third-party websites. We are not responsible for the content or privacy policies
              of these third-party sites. We encourage you to read the privacy policies and review the practices of all websites you visit.
            </p>

            <h3>Other Disclosure of Your Information</h3>
            <p>
              Though we make every effort to preserve user privacy, we may need to disclose personal information when we have a good-faith belief release is appropriate to comply
              with the law (for example, a lawful subpoena), to protect our rights or property, or to protect our donors, artists and supporters from fraudulent, abusive, or
              unlawful conduct, or if we reasonably believe that an emergency involving immediate danger of death or serious physical injury to any person requires disclosure of
              communications or justifies disclosure of records without delay.
            </p>

            <h3>SPECIAL NOTICE FOR PARENTS:</h3>
            <p>
              We want to help you guard your children’s privacy. We encourage you to talk to your children about safe and responsible use of their personal information while using
              the Internet. Pizza to the Polls does not knowingly collect, use, or distribute children’s personally identifiable information to any third parties. If you have any
              reservations, questions, or concerns about your child’s access to this site or how information that your child provides is used by us, please contact us.
            </p>

            <h3>About Cookies, IP Addresses and Log File Data Cookies</h3>
            <p>A cookie is a piece of data stored on the user’s hard drive containing information about the user.</p>
            <p>
              The Pizza to the Polls website uses a cookie for measuring aggregate web statistics, including number of monthly visitors, number of repeat visitors, most popular
              webpages, and other information. Pizza to the Polls will also use cookies to facilitate your online visit by maintaining data that you provide for online activism
              activities so that you will not need to resubmit certain information.
            </p>
            <p>
              We may also use third-party services such as Google Analytics. This helps us understand traffic patterns and know if there are problems with our Site. We may also use
              embedded images in emails to track open rates for our mailings, so that we can tell which mailings appeal most to our supporters.
            </p>

            <h3>Advertising</h3>
            <p>
              We may place online advertising with third-party vendors, including Google, which will be shown on other Sites on the Internet. In some cases, those third-party
              vendors may decide which ads to show you based on your prior visits to the Site. At no time will you be personally identified to those third-party vendors, nor will
              any of the information you share with us be shared with those third-party vendors. If you prefer to opt out of the use of these third-party cookies on the Site, you
              can do so by visiting the Network Advertising Initiative opt out page.
            </p>

            <h3>Server Log Files</h3>
            <p>
              We log standard technical information, such as your IP address and the kind of browser you use. We log this information for troubleshooting purposes and to track
              which pages people visit in order to improve the site. We do not use log files to track a particular individual’s use of the website.
            </p>

            <h3>How to Unsubscribe or Opt Out</h3>
            <p>
              People who subscribe to e-mail lists via this website will receive periodic updates from Pizza to the Polls by regular mail, fax, and/or e-mail. You may opt out of
              receiving future information via e-mail by using the unsubscribe procedure specified on the e-mail message.
            </p>

            <h3>How We Notify You About Privacy Policy Changes</h3>
            <p>
              We may revise and update this Privacy Policy if we change our practices, add new site features, or change existing site features. We will notify registered users by
              email and post notice to this site of any substantive changes to our Privacy Policy. Your use of this site following such changes constitutes your agreement with
              regard to information collected from you in the past and in the future.
            </p>

            <h3>Uploaded Photos</h3>
            <p>
              By uploading a photo to Pizza to the Polls to report a line you grant for the use of the photograph(s) or electronic media in any presentation of any and all kind
              whatsoever. I understand that I may revoke this authorization at any time by notifying us in writing. The revocation will not affect any actions taken before the
              receipt of this written notification. Images may be distributed to the general public without identifying you unless prior permission is received.
            </p>

            <h3>How To Contact Us</h3>
            <p>Questions regarding this Privacy Policy should be emailed to morequestions@polls.pizza.</p>
          </div>
        </section>
      </Host>
    );
  }
}
