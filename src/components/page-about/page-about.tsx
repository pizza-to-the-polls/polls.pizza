import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "page-about",
  styleUrl: "page-about.css",
})
export class PageAbout {
  public render() {
    return (
      <Host>
        <section id="about" class="page about">
          <div class="container">
            <h1>About</h1>
            <p>Americans are hungry for democracy and are turning out in record numbers to vote. But that means long lines and sometimes empty stomachs.</p>
            <p>
              Fortunately, Pizza to the Polls is here to deliver the one thing that pairs perfectly with freedom: piping hot ‘za. We take reports of long lines from folks around
              the country and then find local pizza places to deliver the goods.
            </p>
          </div>
        </section>
      </Host>
    );
  }
}
