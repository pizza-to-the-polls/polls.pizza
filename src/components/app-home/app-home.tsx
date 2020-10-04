import { Component, h } from "@stencil/core";

@Component({
  tag: "app-home",
  styleUrl: "app-home.scss",
})
export class AppHome {
  public render() {
    return (
      <section class="hero">
        <div class="container">
          <div class="intro">
            <p>
              Waiting in line for hours to vote? Tummies grumblin? Pizza to the Polls is here to help. Send us reports of long lines and we'll send in the delicious reinforcements.
            </p>
            <p>
              <stencil-route-link url="/about">Learn all about it.</stencil-route-link>
            </p>
            .
          </div>
        </div>
      </section>
    );
  }
}
