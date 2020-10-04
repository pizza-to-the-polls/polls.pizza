/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';
export namespace Components {
  interface AppHome {}
  interface AppRoot {}
  interface PageAbout {}
}
declare global {
  interface HTMLAppHomeElement extends Components.AppHome, HTMLStencilElement {}
  var HTMLAppHomeElement: {
    prototype: HTMLAppHomeElement;
    new (): HTMLAppHomeElement;
  };
  interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {}
  var HTMLAppRootElement: {
    prototype: HTMLAppRootElement;
    new (): HTMLAppRootElement;
  };
  interface HTMLPageAboutElement extends Components.PageAbout, HTMLStencilElement {}
  var HTMLPageAboutElement: {
    prototype: HTMLPageAboutElement;
    new (): HTMLPageAboutElement;
  };
  interface HTMLElementTagNameMap {
    'app-home': HTMLAppHomeElement;
    'app-root': HTMLAppRootElement;
    'page-about': HTMLPageAboutElement;
  }
}
declare namespace LocalJSX {
  interface AppHome {}
  interface AppRoot {}
  interface PageAbout {}
  interface IntrinsicElements {
    'app-home': AppHome;
    'app-root': AppRoot;
    'page-about': PageAbout;
  }
}
export { LocalJSX as JSX };
declare module '@stencil/core' {
  export namespace JSX {
    interface IntrinsicElements {
      'app-home': LocalJSX.AppHome & JSXBase.HTMLAttributes<HTMLAppHomeElement>;
      'app-root': LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
      'page-about': LocalJSX.PageAbout & JSXBase.HTMLAttributes<HTMLPageAboutElement>;
    }
  }
}
