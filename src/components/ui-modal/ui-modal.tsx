import { Component, Element, Event, EventEmitter, h, Host, Prop } from "@stencil/core";
import { revealSlottedChildren } from "../../util/revealSlottedChildren";

@Component({
  tag: "ui-modal",
  styleUrl: "ui-modal.scss",
  shadow: false,
})
export class UiModal {
  @Element() private host!: HTMLUiModalElement;
  @Prop() public isActive: boolean = false;
  @Event({ cancelable: false }) public requestClose!: EventEmitter;

  public componentDidLoad() {
    // Undo the Stencil scoped-SSR slot-hide that blanks prerendered content
    // (see src/util/revealSlottedChildren.ts and issue #156).
    revealSlottedChildren(this.host as HTMLElement);
  }

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
