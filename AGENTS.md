# Agent Notes for polls.pizza

> **Note:** This file is aspirational documentation and may drift over time.
> Always verify against the actual source of truth (package.json, tsconfig.json,
> and existing tests) before relying on conventions listed here.

This file contains pointers for coding agents working in this repo.

## Tech Stack

- **StencilJS** (`@stencil/core`) — web component compiler
- **TypeScript** — strict mode enabled
- **Puppeteer** — E2E tests via `@stencil/core/testing`
- **Prettier** — formatting
- **tslint** — legacy linting (this project predates ESLint adoption)
- **Jest** — spec tests (used sparingly)
- **Sass** — styles, injected globals from `styles/include/`
- **Stripe** — payments (redirect-to-checkout flow, no elements)

## Important Conventions

1. **Always run `npm run fix` before committing.**
   This runs prettier + tslint --fix. The `npm run ci` command enforces both.

2. **E2E tests are the primary test style.**
   Use `newE2EPage()` from `@stencil/core/testing`. Spec tests with `newSpecPage` exist but are rare.

3. **Mock `fetch` and `Stripe` in E2E tests.**
   The shared helper at `src/testing.ts` provides `mockFetchScript()` for intercepting API calls and mocking Stripe checkout. Import it rather than inlining mocks.

4. **Pages are stateful Stencil components.**
   Most pages use `@Prop() history` from `@stencil/router` and read query params in `componentWillLoad()`. Tests should set the history prop via `page.evaluate()` or pass query data through `setContent` + direct prop injection.

5. **API lives in `src/api/PizzaApi.ts`.**
   All backend communication goes through the `PizzaApi` singleton. Key endpoints:

   - `getTotals()`, `getOrders()`, `getTrucks()`, `getLocationStatus()`
   - `postReport()`, `postDonation()`, `postUpload()`, `postSession()`, `putSession()`

6. **Donation flow redirects to Stripe.**
   `postDonation` never shows a confirmation inline; it calls `Stripe().redirectToCheckout({ sessionId })`. E2E tests should mock `window.Stripe` and assert the fetch payload.

7. **Images / static assets live in `public/` and are copied to `dist/www` at build time.**

8. **Environment variables** (in `stencil.config.ts`):

   - `PIZZA_BASE_DOMAIN` — backend API base URL
   - `STRIPE_PUBLIC_KEY` — Stripe publishable key
   - `BUGSNAG_KEY` — optional error tracking

9. **Default base domain fallback is `https://base-next.polls.pizza`.**

## CI

```bash
npm run ci   # prettier + lint + test (spec + e2e)
```

Note: E2E tests require a working Puppeteer/Chrome installation. On Apple Silicon this may need Rosetta or a compatible Chromium binary.
