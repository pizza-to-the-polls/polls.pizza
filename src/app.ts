import Bugsnag from "@bugsnag/js";
import { Build } from "@stencil/core";

import { installComponentLoadGuard } from "./util/componentLoadGuard";

export default () => {
  if (process.env.BUGSNAG_KEY && Build.isBrowser) {
    Bugsnag.start({
      apiKey: process.env.BUGSNAG_KEY,
      releaseStage: process.env.NODE_ENV,
    });
    if (typeof window !== "undefined") {
      window.__pizza_bugsnag_started = true;
      window.__pizza_bugsnag_client = Bugsnag;
    }
  }
  if (Build.isBrowser) {
    installComponentLoadGuard();
    revealScopedSsrHosts();
  }
};

/**
 * Workaround for a Stencil 4 scoped-SSR hydration bug (present through at
 * least @stencil/core 4.44.1, upstream rewrite in stenciljs/core#6067).
 *
 * When hydrating prerendered markup, the runtime hides the server-rendered
 * children of any component that renders a <slot>, intending to reveal them
 * when slot relocation moves them into place. Children that are ALREADY in
 * their final position are never relocated, so the reveal never fires and
 * component hosts (e.g. <form-report> inside <ui-card>) are left with a
 * stale `hidden` attribute — collapsing whole forms/pages.
 *
 * No component in this app sets `hidden` on its own host element, so once
 * hydration has settled it is always safe to clear `hidden` from custom
 * element hosts. Plain-HTML elements are left untouched because they may
 * legitimately use `hidden` (error hints, step toggles, etc.).
 */
const revealScopedSsrHosts = () => {
  const reveal = () => {
    document.querySelectorAll("[hidden]").forEach(el => {
      if (el.tagName.includes("-") && el.classList.contains("hydrated")) {
        el.removeAttribute("hidden");
      }
    });
  };
  // `appload` fires once every initial component has finished hydrating.
  window.addEventListener("appload", () => {
    reveal();
    // Late-hydrating subtrees (lazy chunk loads) can re-trigger the bug;
    // run a second pass on the next task for good measure.
    setTimeout(reveal, 0);
  });
};
