/**
 * Global augmentations for properties injected onto `window` at runtime.
 *
 * These replace the previous `(window as any)` escape hatches so that all
 * access is type-checked.
 */
import type { ComponentLoadEvent } from "./util/componentLoadGuard";

declare global {
  interface Window {
    /** Stripe.js — loaded via <script> tag (see PizzaApi.postDonation) */
    Stripe?: (key: string) => {
      redirectToCheckout: (options: { sessionId: string }) => Promise<{ error?: { message?: string } }>;
    };
    /** GA4 gtag — loaded via tag manager (see app-root analytics patch) */
    gtag?: (...args: unknown[]) => void;
    /** Google Maps JS API */
    google?: typeof google;
    /** e2e fetch mock — see src/testing.ts */
    __fetchCalls?: Array<{ url: string; opts: { body?: string } }>;
    __mockResponses?: Record<string, { status?: number; body: string }>;
    /** e2e helper: captured router history object */
    __history?: unknown;
    /** component chunk-load guard — see src/util/componentLoadGuard.ts */
    __pizza_bugsnag_started?: boolean;
    __pizza_bugsnag_client?: unknown;
    __pizza_disable_auto_reload?: boolean;
    __pizza_guard_installed?: boolean;
    __pizza_component_load_log?: ComponentLoadEvent[];
  }
}

export {};
