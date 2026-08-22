/**
 * Component chunk load guard.
 *
 * Detects StencilJS component-chunk load failures (the runtime "s.isProxied"
 * TypeError when a lazy-loaded component module fails), reports them with
 * component context, and applies a graceful fallback.
 *
 * Pure helpers are exported for spec testing. The install function wires
 * window-level handlers and must only be called in the browser.
 */

const CHUNK_URL_RE = /(?:^|\/)((?:p|app|index)-[a-f0-9]+(?:\.entry)?\.js)/i;
const CHUNK_URL_EXTRACT_RE = /(https?:\/\/[^\s]*\/build\/(?:p|app|index)-[a-f0-9]+(?:\.entry)?\.js)/i;

const INITIAL_WINDOW_MS = 10_000;
const RETRY_TTL_MS = 30_000;
const RETRY_KEY = "pizza:chunk-retry";

export interface ComponentLoadEvent {
  chunkId: string | null;
  chunkUrl: string;
  tag: string | null;
  route: string;
  domTags: string[];
  message: string;
  timestamp: number;
  fallback: "reload" | "banner";
}

// ---------------------------------------------------------------------------
// Pure helpers (exported for unit testing)
// ---------------------------------------------------------------------------

/**
 * Returns true when `msg` matches the signature of a Stencil component-chunk
 * load failure (TypeError on `isProxied` or a failed dynamic import).
 */
export const isChunkLoadFailure = (msg: string): boolean =>
  /isProxied/.test(msg) || /Failed to fetch dynamically imported module/i.test(msg) || (/dynamically imported/i.test(msg) && CHUNK_URL_RE.test(msg));

/**
 * Extracts a chunk id like `p-188cd4da` or `p-188cd4da.entry` from an error
 * message or URL string.  Returns `null` when no chunk id is recognised.
 */
export const extractChunkId = (input: string): string | null => {
  const match = input.match(CHUNK_URL_RE);
  return match ? match[1] : null;
};

/**
 * Extracts the full chunk URL from a string that may contain it (e.g. a
 * failed-dynamic-import error message).  Returns `null` when no URL is found.
 */
export const extractChunkUrl = (input: string): string | null => {
  const match = input.match(CHUNK_URL_EXTRACT_RE);
  return match ? match[1] : null;
};

/**
 * Pure decision: which fallback strategy should be used?
 *
 * Returns `"reload"` when the failure occurs within the initial window
 * (`elapsedMs < 10 s` — use `performance.now()`) and no retry was recorded
 * in the last 30 s (sessionStorage, checked against `Date.now()`).
 * Otherwise returns `"banner"`.
 */
export const decideFallback = (elapsedMs: number): "reload" | "banner" => {
  if (elapsedMs < INITIAL_WINDOW_MS) {
    try {
      if (typeof sessionStorage !== "undefined") {
        const lastRetry = sessionStorage.getItem(RETRY_KEY);
        if (lastRetry === null || Date.now() - parseInt(lastRetry, 10) >= RETRY_TTL_MS) {
          return "reload";
        }
      } else {
        return "reload";
      }
    } catch {
      return "reload";
    }
  }
  return "banner";
};

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

const log: ComponentLoadEvent[] = [];
const reportedChunks = new Set<string>();

const logEvent = (event: ComponentLoadEvent): void => {
  log.push(event);
  if (typeof window !== "undefined") {
    (window as any).__pizza_component_load_log = log;
  }
};

// ---------------------------------------------------------------------------
// Component identification
// ---------------------------------------------------------------------------

/**
 * Walk the live DOM and return:
 *  1. The first custom (hyphenated) element that is a direct child of <main>
 *     — this is overwhelmingly the route component.
 *  2. A list of *all* hyphenated tags currently in the DOM (covers nested
 *     components whose chunk may have failed).
 */
const gatherDomTags = (): { likelyTag: string | null; domTags: string[] } => {
  const domTags: string[] = [];
  let likelyTag: string | null = null;

  if (typeof document === "undefined") {
    return { likelyTag: null, domTags: [] };
  }

  const all = document.querySelectorAll("*");
  for (let i = 0; i < all.length; i++) {
    const tag = all[i].tagName.toLowerCase();
    if (tag.includes("-")) {
      domTags.push(tag);
    }
  }

  const main = document.querySelector("main");
  if (main !== null) {
    const children = main.children;
    for (let j = 0; j < children.length; j++) {
      const childTag = children[j].tagName.toLowerCase();
      if (childTag.includes("-")) {
        likelyTag = childTag;
        break;
      }
    }
  }

  return { likelyTag, domTags };
};

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

const reportComponentLoadFailure = (message: string, chunkUrl: string, tag: string | null): void => {
  const chunkId = extractChunkId(chunkUrl) || extractChunkId(message);

  // Deduplicate per chunk id per page load
  if (chunkId !== null && reportedChunks.has(chunkId)) {
    return;
  }
  if (chunkId !== null) {
    reportedChunks.add(chunkId);
  }

  const elapsed = typeof performance !== "undefined" ? performance.now() : Date.now();
  const fallback = decideFallback(elapsed);
  const route = typeof window !== "undefined" ? window.location.pathname : "";
  const { likelyTag, domTags } = gatherDomTags();
  const resolvedTag = tag || likelyTag;

  const event: ComponentLoadEvent = {
    chunkId,
    chunkUrl,
    tag: resolvedTag,
    route,
    domTags,
    message,
    timestamp: Date.now(),
    fallback,
  };

  logEvent(event);

  // Console (allowed by tslint: error/warn/log)
  console.error(`[pizza] Component chunk load failed: chunk=${chunkId || "unknown"} tag=${resolvedTag || "unknown"} route=${route}`, message);

  // Bugsnag (only when the client was started by app.ts)
  if (typeof window !== "undefined" && (window as any).__pizza_bugsnag_started) {
    try {
      const bugsnag = (window as any).__pizza_bugsnag_client;
      if (bugsnag !== undefined && typeof bugsnag.notify === "function") {
        bugsnag.notify(new Error(message), {
          context: resolvedTag || window.location.pathname,
          metadata: {
            componentLoad: {
              chunkId: chunkId || "unknown",
              chunkUrl,
              domTags,
              route,
              tag: resolvedTag,
              url: window.location.href,
              userAgent: navigator.userAgent,
            },
          },
          severity: "error",
        });
      }
    } catch {
      // Bugsnag failure must never cascade
    }
  }

  // Fallback
  applyFallback(fallback, chunkId);
};

// ---------------------------------------------------------------------------
// Fallback: reload or banner
// ---------------------------------------------------------------------------

const applyFallback = (strategy: "reload" | "banner", chunkId: string | null): void => {
  if (strategy === "reload") {
    const disabled = typeof window !== "undefined" && (window as any).__pizza_disable_auto_reload;
    if (!disabled) {
      try {
        sessionStorage.setItem(RETRY_KEY, String(Date.now()));
      } catch {
        // Privacy mode — ignore
      }
      window.location.reload();
    }
    return;
  }

  showBanner(chunkId);
};

const showBanner = (chunkId: string | null): void => {
  if (typeof document === "undefined") {
    return;
  }

  const id = chunkId !== null ? `pizza-chunk-banner-${chunkId}` : "pizza-chunk-banner";
  if (document.getElementById(id) !== null) {
    return; // already showing for this chunk
  }

  const banner = document.createElement("div");
  banner.id = id;
  banner.setAttribute("role", "alert");
  banner.style.cssText =
    "position:fixed;bottom:0;left:0;right:0;background:#fa442d;color:#fff;" +
    "padding:12px 16px;text-align:center;z-index:99999;font-family:sans-serif;" +
    "font-size:14px;line-height:1.4;";
  banner.textContent = "Some content couldn't load. Please refresh the page.";
  document.body.appendChild(banner);
};

// ---------------------------------------------------------------------------
// Install (entry point)
// ---------------------------------------------------------------------------

/**
 * Installs the component-load guard in the browser.  Safe to call multiple
 * times (idempotent).  No-op when `window` is unavailable (SSR/prerender).
 */
export const installComponentLoadGuard = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  // Guard against double-install in hot-module-reload scenarios
  if ((window as any).__pizza_guard_installed) {
    return;
  }
  (window as any).__pizza_guard_installed = true;

  // --- window.onerror path ---
  // Catches the "s.isProxied" TypeError when it escapes connectedCallback
  // as a synchronous throw.
  window.addEventListener("error", (event: ErrorEvent) => {
    const msg: string = event.message || "";
    if (isChunkLoadFailure(msg)) {
      const chunkUrl: string = event.filename || extractChunkUrl(msg) || "";
      reportComponentLoadFailure(msg, chunkUrl, null);
    }
  });

  // --- unhandledrejection path ---
  // Catches native dynamic-import rejections (the primary failure mode for
  // the "s.isProxied" error, since connectedCallback is async and the
  // rejection escapes as an unhandled promise rejection).
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const reason: any = event.reason;
    const msg: string = typeof reason === "string" ? reason : reason?.message || String(reason);
    if (isChunkLoadFailure(msg)) {
      event.preventDefault();
      const chunkUrl: string = extractChunkUrl(msg) || "";
      reportComponentLoadFailure(msg, chunkUrl, null);
    }
  });
};
