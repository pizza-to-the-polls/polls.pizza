/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { MatchResults, RouterHistory } from "@stencil/router";
import { LocationId } from "./api";
export namespace Components {
    interface AppRoot {
    }
    interface FormReport {
    }
    interface PageAbout {
    }
    interface PageActivity {
    }
    interface PageContact {
    }
    interface PageCovid {
    }
    interface PageDeliveries {
        "history": RouterHistory;
        "match": MatchResults;
    }
    interface PageDonate {
        "history"?: RouterHistory;
    }
    interface PageGuidelines {
    }
    interface PageHome {
    }
    interface PageInstructions {
    }
    interface PageOnDemand {
    }
    interface PagePartners {
    }
    interface PagePress {
    }
    interface PagePrivacy {
    }
    interface PageTrucks {
    }
    interface UiAddressInput {
        "buttonLabel": string;
        "label": string;
        "name": string;
        "placeholder": string;
    }
    interface UiCard {
        "headerText"?: string;
        "isActive": boolean;
        "isCollapsible": boolean;
        "isSmall": boolean;
        /**
          * Set an `id` on the card element to allow navigating or scrolling to it
         */
        "scrollId"?: string;
    }
    interface UiDynamicText {
        "format"?: (value: any /*T*/) => string;
        "value": any | /*T*/ undefined;
    }
    interface UiGeoMap {
        "center"?: google.maps.LatLngLiteral;
        "deliveries"?: { coords: google.maps.LatLngLiteral; id: LocationId }[];
        "trucks"?: { coords: google.maps.LatLngLiteral; id: LocationId }[];
        "zoom"?: number;
    }
    interface UiMainContent {
        "background": "yellow" | "cyan" | "teal" | "red" | "none";
        "fullBleed": boolean;
    }
    interface UiModal {
        "isActive": boolean;
    }
    interface UiPizzaList {
        "hasIcon": boolean;
        "isBordered": boolean;
    }
    interface UiScrollToTopButton {
    }
    interface UiSingleInput {
        "buttonLabel": string;
        "getCurrentValue": () => Promise<string>;
        "getInputElement": () => Promise<HTMLInputElement | null>;
        "label": string;
        "name": string;
        "placeholder": string;
        "setValue": (value: string) => Promise<void>;
        "type": string;
    }
}
declare global {
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
    };
    interface HTMLFormReportElement extends Components.FormReport, HTMLStencilElement {
    }
    var HTMLFormReportElement: {
        prototype: HTMLFormReportElement;
        new (): HTMLFormReportElement;
    };
    interface HTMLPageAboutElement extends Components.PageAbout, HTMLStencilElement {
    }
    var HTMLPageAboutElement: {
        prototype: HTMLPageAboutElement;
        new (): HTMLPageAboutElement;
    };
    interface HTMLPageActivityElement extends Components.PageActivity, HTMLStencilElement {
    }
    var HTMLPageActivityElement: {
        prototype: HTMLPageActivityElement;
        new (): HTMLPageActivityElement;
    };
    interface HTMLPageContactElement extends Components.PageContact, HTMLStencilElement {
    }
    var HTMLPageContactElement: {
        prototype: HTMLPageContactElement;
        new (): HTMLPageContactElement;
    };
    interface HTMLPageCovidElement extends Components.PageCovid, HTMLStencilElement {
    }
    var HTMLPageCovidElement: {
        prototype: HTMLPageCovidElement;
        new (): HTMLPageCovidElement;
    };
    interface HTMLPageDeliveriesElement extends Components.PageDeliveries, HTMLStencilElement {
    }
    var HTMLPageDeliveriesElement: {
        prototype: HTMLPageDeliveriesElement;
        new (): HTMLPageDeliveriesElement;
    };
    interface HTMLPageDonateElement extends Components.PageDonate, HTMLStencilElement {
    }
    var HTMLPageDonateElement: {
        prototype: HTMLPageDonateElement;
        new (): HTMLPageDonateElement;
    };
    interface HTMLPageGuidelinesElement extends Components.PageGuidelines, HTMLStencilElement {
    }
    var HTMLPageGuidelinesElement: {
        prototype: HTMLPageGuidelinesElement;
        new (): HTMLPageGuidelinesElement;
    };
    interface HTMLPageHomeElement extends Components.PageHome, HTMLStencilElement {
    }
    var HTMLPageHomeElement: {
        prototype: HTMLPageHomeElement;
        new (): HTMLPageHomeElement;
    };
    interface HTMLPageInstructionsElement extends Components.PageInstructions, HTMLStencilElement {
    }
    var HTMLPageInstructionsElement: {
        prototype: HTMLPageInstructionsElement;
        new (): HTMLPageInstructionsElement;
    };
    interface HTMLPageOnDemandElement extends Components.PageOnDemand, HTMLStencilElement {
    }
    var HTMLPageOnDemandElement: {
        prototype: HTMLPageOnDemandElement;
        new (): HTMLPageOnDemandElement;
    };
    interface HTMLPagePartnersElement extends Components.PagePartners, HTMLStencilElement {
    }
    var HTMLPagePartnersElement: {
        prototype: HTMLPagePartnersElement;
        new (): HTMLPagePartnersElement;
    };
    interface HTMLPagePressElement extends Components.PagePress, HTMLStencilElement {
    }
    var HTMLPagePressElement: {
        prototype: HTMLPagePressElement;
        new (): HTMLPagePressElement;
    };
    interface HTMLPagePrivacyElement extends Components.PagePrivacy, HTMLStencilElement {
    }
    var HTMLPagePrivacyElement: {
        prototype: HTMLPagePrivacyElement;
        new (): HTMLPagePrivacyElement;
    };
    interface HTMLPageTrucksElement extends Components.PageTrucks, HTMLStencilElement {
    }
    var HTMLPageTrucksElement: {
        prototype: HTMLPageTrucksElement;
        new (): HTMLPageTrucksElement;
    };
    interface HTMLUiAddressInputElement extends Components.UiAddressInput, HTMLStencilElement {
    }
    var HTMLUiAddressInputElement: {
        prototype: HTMLUiAddressInputElement;
        new (): HTMLUiAddressInputElement;
    };
    interface HTMLUiCardElement extends Components.UiCard, HTMLStencilElement {
    }
    var HTMLUiCardElement: {
        prototype: HTMLUiCardElement;
        new (): HTMLUiCardElement;
    };
    interface HTMLUiDynamicTextElement extends Components.UiDynamicText, HTMLStencilElement {
    }
    var HTMLUiDynamicTextElement: {
        prototype: HTMLUiDynamicTextElement;
        new (): HTMLUiDynamicTextElement;
    };
    interface HTMLUiGeoMapElement extends Components.UiGeoMap, HTMLStencilElement {
    }
    var HTMLUiGeoMapElement: {
        prototype: HTMLUiGeoMapElement;
        new (): HTMLUiGeoMapElement;
    };
    interface HTMLUiMainContentElement extends Components.UiMainContent, HTMLStencilElement {
    }
    var HTMLUiMainContentElement: {
        prototype: HTMLUiMainContentElement;
        new (): HTMLUiMainContentElement;
    };
    interface HTMLUiModalElement extends Components.UiModal, HTMLStencilElement {
    }
    var HTMLUiModalElement: {
        prototype: HTMLUiModalElement;
        new (): HTMLUiModalElement;
    };
    interface HTMLUiPizzaListElement extends Components.UiPizzaList, HTMLStencilElement {
    }
    var HTMLUiPizzaListElement: {
        prototype: HTMLUiPizzaListElement;
        new (): HTMLUiPizzaListElement;
    };
    interface HTMLUiScrollToTopButtonElement extends Components.UiScrollToTopButton, HTMLStencilElement {
    }
    var HTMLUiScrollToTopButtonElement: {
        prototype: HTMLUiScrollToTopButtonElement;
        new (): HTMLUiScrollToTopButtonElement;
    };
    interface HTMLUiSingleInputElement extends Components.UiSingleInput, HTMLStencilElement {
    }
    var HTMLUiSingleInputElement: {
        prototype: HTMLUiSingleInputElement;
        new (): HTMLUiSingleInputElement;
    };
    interface HTMLElementTagNameMap {
        "app-root": HTMLAppRootElement;
        "form-report": HTMLFormReportElement;
        "page-about": HTMLPageAboutElement;
        "page-activity": HTMLPageActivityElement;
        "page-contact": HTMLPageContactElement;
        "page-covid": HTMLPageCovidElement;
        "page-deliveries": HTMLPageDeliveriesElement;
        "page-donate": HTMLPageDonateElement;
        "page-guidelines": HTMLPageGuidelinesElement;
        "page-home": HTMLPageHomeElement;
        "page-instructions": HTMLPageInstructionsElement;
        "page-on-demand": HTMLPageOnDemandElement;
        "page-partners": HTMLPagePartnersElement;
        "page-press": HTMLPagePressElement;
        "page-privacy": HTMLPagePrivacyElement;
        "page-trucks": HTMLPageTrucksElement;
        "ui-address-input": HTMLUiAddressInputElement;
        "ui-card": HTMLUiCardElement;
        "ui-dynamic-text": HTMLUiDynamicTextElement;
        "ui-geo-map": HTMLUiGeoMapElement;
        "ui-main-content": HTMLUiMainContentElement;
        "ui-modal": HTMLUiModalElement;
        "ui-pizza-list": HTMLUiPizzaListElement;
        "ui-scroll-to-top-button": HTMLUiScrollToTopButtonElement;
        "ui-single-input": HTMLUiSingleInputElement;
    }
}
declare namespace LocalJSX {
    interface AppRoot {
    }
    interface FormReport {
    }
    interface PageAbout {
    }
    interface PageActivity {
    }
    interface PageContact {
    }
    interface PageCovid {
    }
    interface PageDeliveries {
        "history": RouterHistory;
        "match": MatchResults;
    }
    interface PageDonate {
        "history"?: RouterHistory;
    }
    interface PageGuidelines {
    }
    interface PageHome {
    }
    interface PageInstructions {
    }
    interface PageOnDemand {
    }
    interface PagePartners {
    }
    interface PagePress {
    }
    interface PagePrivacy {
    }
    interface PageTrucks {
    }
    interface UiAddressInput {
        "buttonLabel"?: string;
        "label"?: string;
        "name"?: string;
        "onAddressSelected"?: (event: CustomEvent<{ address: string; lat: number; lng: number }>) => void;
        "placeholder"?: string;
    }
    interface UiCard {
        "headerText"?: string;
        "isActive"?: boolean;
        "isCollapsible"?: boolean;
        "isSmall"?: boolean;
        /**
          * Set an `id` on the card element to allow navigating or scrolling to it
         */
        "scrollId"?: string;
    }
    interface UiDynamicText {
        "format"?: (value: any /*T*/) => string;
        "value"?: any | /*T*/ undefined;
    }
    interface UiGeoMap {
        "center"?: google.maps.LatLngLiteral;
        "deliveries"?: { coords: google.maps.LatLngLiteral; id: LocationId }[];
        "onMarkerSelected"?: (event: CustomEvent<{
    type: "pizza" | "truck";
    coords: google.maps.LatLngLiteral;
    location: LocationId;
  }>) => void;
        "trucks"?: { coords: google.maps.LatLngLiteral; id: LocationId }[];
        "zoom"?: number;
    }
    interface UiMainContent {
        "background"?: "yellow" | "cyan" | "teal" | "red" | "none";
        "fullBleed"?: boolean;
    }
    interface UiModal {
        "isActive"?: boolean;
        "onRequestClose"?: (event: CustomEvent<any>) => void;
    }
    interface UiPizzaList {
        "hasIcon"?: boolean;
        "isBordered"?: boolean;
    }
    interface UiScrollToTopButton {
    }
    interface UiSingleInput {
        "buttonLabel"?: string;
        "label"?: string;
        "name"?: string;
        "onButtonClicked"?: (event: CustomEvent<string>) => void;
        "placeholder"?: string;
        "type"?: string;
    }
    interface IntrinsicElements {
        "app-root": AppRoot;
        "form-report": FormReport;
        "page-about": PageAbout;
        "page-activity": PageActivity;
        "page-contact": PageContact;
        "page-covid": PageCovid;
        "page-deliveries": PageDeliveries;
        "page-donate": PageDonate;
        "page-guidelines": PageGuidelines;
        "page-home": PageHome;
        "page-instructions": PageInstructions;
        "page-on-demand": PageOnDemand;
        "page-partners": PagePartners;
        "page-press": PagePress;
        "page-privacy": PagePrivacy;
        "page-trucks": PageTrucks;
        "ui-address-input": UiAddressInput;
        "ui-card": UiCard;
        "ui-dynamic-text": UiDynamicText;
        "ui-geo-map": UiGeoMap;
        "ui-main-content": UiMainContent;
        "ui-modal": UiModal;
        "ui-pizza-list": UiPizzaList;
        "ui-scroll-to-top-button": UiScrollToTopButton;
        "ui-single-input": UiSingleInput;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
            "form-report": LocalJSX.FormReport & JSXBase.HTMLAttributes<HTMLFormReportElement>;
            "page-about": LocalJSX.PageAbout & JSXBase.HTMLAttributes<HTMLPageAboutElement>;
            "page-activity": LocalJSX.PageActivity & JSXBase.HTMLAttributes<HTMLPageActivityElement>;
            "page-contact": LocalJSX.PageContact & JSXBase.HTMLAttributes<HTMLPageContactElement>;
            "page-covid": LocalJSX.PageCovid & JSXBase.HTMLAttributes<HTMLPageCovidElement>;
            "page-deliveries": LocalJSX.PageDeliveries & JSXBase.HTMLAttributes<HTMLPageDeliveriesElement>;
            "page-donate": LocalJSX.PageDonate & JSXBase.HTMLAttributes<HTMLPageDonateElement>;
            "page-guidelines": LocalJSX.PageGuidelines & JSXBase.HTMLAttributes<HTMLPageGuidelinesElement>;
            "page-home": LocalJSX.PageHome & JSXBase.HTMLAttributes<HTMLPageHomeElement>;
            "page-instructions": LocalJSX.PageInstructions & JSXBase.HTMLAttributes<HTMLPageInstructionsElement>;
            "page-on-demand": LocalJSX.PageOnDemand & JSXBase.HTMLAttributes<HTMLPageOnDemandElement>;
            "page-partners": LocalJSX.PagePartners & JSXBase.HTMLAttributes<HTMLPagePartnersElement>;
            "page-press": LocalJSX.PagePress & JSXBase.HTMLAttributes<HTMLPagePressElement>;
            "page-privacy": LocalJSX.PagePrivacy & JSXBase.HTMLAttributes<HTMLPagePrivacyElement>;
            "page-trucks": LocalJSX.PageTrucks & JSXBase.HTMLAttributes<HTMLPageTrucksElement>;
            "ui-address-input": LocalJSX.UiAddressInput & JSXBase.HTMLAttributes<HTMLUiAddressInputElement>;
            "ui-card": LocalJSX.UiCard & JSXBase.HTMLAttributes<HTMLUiCardElement>;
            "ui-dynamic-text": LocalJSX.UiDynamicText & JSXBase.HTMLAttributes<HTMLUiDynamicTextElement>;
            "ui-geo-map": LocalJSX.UiGeoMap & JSXBase.HTMLAttributes<HTMLUiGeoMapElement>;
            "ui-main-content": LocalJSX.UiMainContent & JSXBase.HTMLAttributes<HTMLUiMainContentElement>;
            "ui-modal": LocalJSX.UiModal & JSXBase.HTMLAttributes<HTMLUiModalElement>;
            "ui-pizza-list": LocalJSX.UiPizzaList & JSXBase.HTMLAttributes<HTMLUiPizzaListElement>;
            "ui-scroll-to-top-button": LocalJSX.UiScrollToTopButton & JSXBase.HTMLAttributes<HTMLUiScrollToTopButtonElement>;
            "ui-single-input": LocalJSX.UiSingleInput & JSXBase.HTMLAttributes<HTMLUiSingleInputElement>;
        }
    }
}
