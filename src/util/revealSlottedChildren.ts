/**
 * Workaround for a Stencil 4 scoped-SSR hydration bug.
 *
 * When hydrating prerendered markup, the runtime hides the server-rendered
 * children of any component that renders a `<slot />`, intending to reveal
 * them once slot relocation moves them into place. Children that are already
 * in their final position are never relocated, so the reveal never fires and
 * they keep a stale `hidden` attribute — collapsing whole pages (see #156:
 * the `/partners` grid rendered 88 logos that stayed `hidden` and 0×0).
 *
 * The existing `revealScopedSsrHosts()` in `src/app.ts` only clears `hidden`
 * from *custom element hosts* (hyphenated tags). It cannot help here because
 * the hidden slotted children are plain HTML (`<ul class="partners">`,
 * `<h2>`, `<p>`), so that filter skips them.
 *
 * Clearing `hidden` from a slot component's *direct* children is safe for any
 * component that never sets `hidden` on its own rendered output: those direct
 * children can only be slotted light-DOM content. Components that do set
 * `hidden` on their own children (e.g. `form-report`) must NOT call this.
 *
 * Call from `componentDidLoad()`.
 */
export const revealSlottedChildren = (host: HTMLElement | null | undefined): void => {
  if (host == null || typeof host.querySelectorAll !== "function") {
    return;
  }
  const children = host.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.hasAttribute("hidden")) {
      child.removeAttribute("hidden");
    }
  }
};
