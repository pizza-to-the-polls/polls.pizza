import { Component, Event, EventEmitter, h, Method, Prop, State } from "@stencil/core";
// @ts-ignore
import {} from "googlemaps";

@Component({
  tag: "ui-single-input",
  styleUrl: "ui-single-input.scss",
  shadow: false,
})
export class UiSingleInput {
  @Prop() public label: string;
  @Prop() public buttonLabel: string;
  @Prop() public type: string;
  @Prop() public name: string;
  @Prop() public placeholder: string;

  @Event() public buttonClicked!: EventEmitter<string>;

  @State() private value: string;

  private id: string;

  constructor() {
    this.label = "";
    this.buttonLabel = "";
    this.placeholder = "";
    this.type = "text";
    this.value = "";

    this.id = "input-" + Math.floor(Math.random() * 1000000);
    this.name = this.id;
  }

  @Method()
  public getInputId(): Promise<string> {
    return Promise.resolve(this.id);
  }

  public render() {
    const handleSubmit = (e: Event) => {
      const evt = this.buttonClicked.emit(this.value);
      if (evt.defaultPrevented) {
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit(e);
      }
    };

    const onInputChange = (e: Event) => {
      this.value = (e.target as HTMLInputElement).value;
    };

    return (
      <div>
        <label htmlFor={this.id}>{this.label}</label>
        <input
          id={this.id}
          type={this.type}
          value={this.value}
          name={this.name}
          class="input input-value"
          placeholder={this.placeholder}
          onKeyUp={onKeyUp}
          onChange={onInputChange}
          autocomplete="on"
          required
        />
        <input type="submit" onClick={handleSubmit} value={this.buttonLabel} class="button submit-button" />
        <slot />
      </div>
    );
  }
}
