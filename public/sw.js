/**
 * Service-worker kill switch.
 *
 * Stencil used to generate a default workbox service worker for this site
 * (precaching the app shell) and injected a registration snippet into every
 * page. That snippet crashed in browsers that stub out service-worker
 * registration (`navigator.serviceWorker.register()` returning `undefined`
 * instead of a promise — see the Bugsnag TypeError "Cannot read properties of
 * undefined (reading 'then')" on /contact), and nothing in the app relied on
 * the worker, so registration is now disabled entirely.
 *
 * Clients that installed the old worker keep checking /sw.js for updates on
 * navigation. This file replaces it: when fetched, it takes over, unregisters
 * itself, and deletes every cache, so stale precached content can never be
 * served again.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      await self.registration.unregister();
      await self.clients.claim();
    })(),
  );
});
