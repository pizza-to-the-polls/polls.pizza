/**
 * GA4 funnel-event helper.
 *
 * Emits a gtag "event" call with the given name and optional params.
 * Safe no-op when gtag is absent (SSR/prerender, adblock) or when
 * `window` itself is undefined. Reuses the guard pattern from
 * app-root.tsx's history monkey-patch.
 *
 * Params must never contain PII or user-typed values — only step names,
 * field names, and booleans.
 */
export const trackEvent = (name: string, params?: Record<string, string | number | boolean>): void => {
  if (typeof window !== "undefined" && typeof (window as any).gtag !== "undefined") {
    (window as any).gtag("event", name, params || {});
  }
};
