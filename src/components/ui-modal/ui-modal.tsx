import { Component, Event, EventEmitter, h, Host, Prop } from "@stencil/core";

@Component({
  tag: "ui-modal",
  styleUrl: "ui-modal.scss",
  shadow: false,
})
export class UiModal {
  @Prop() public isActive: boolean = false;
  @Event({ cancelable: false }) public requestClose!: EventEmitter;

  public render() {
    const closeModal = () => {
      this.requestClose.emit();
    };

    return (
      <Host class={{ "is-active": this.isActive }}>
        <div class="modal-background" onClick={closeModal}></div>
        <div class="modal-content">
          <ui-card>
            <slot />
          </ui-card>
        </div>
        <button class="modal-close" aria-label="close" onClick={closeModal}></button>
      </Host>
    );
  }
}
