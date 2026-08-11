# Security Audit Report — Pizza to the Polls

**Date:** 2026-08-11  
**Scope:** polls.pizza (frontend) + pizzabase (backend + infrastructure)  
**Methodology:** Read-only static analysis + dependency audit (npm audit)

---

## Summary

| Severity | Count | 
|----------|-------|
| Critical | 1     |
| High     | 2     |
| Medium   | 4     |
| Low      | 3     |

---

## Critical

### 1. Hardcoded JWT Secret Fallback (pizzabase)

**Location:** `src/lib/jwt.ts:3`
```typescript
const secret = process.env.JWT_SECRET || "shhhh";
```

If `JWT_SECRET` is not set in production, **all JWTs are signed with the string `"shhhh"`**, allowing anyone to forge valid session tokens. Since PTP uses JWTs for admin session authentication (`/session` routes), this would grant unauthorized admin access.

**Fix:** Remove the fallback. Crash at startup if `JWT_SECRET` is not set:
```typescript
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET environment variable is required");
```

---

## High

### 2. Dependency Vulnerabilities — polls.pizza

**npm audit result:** 60 total (3 critical, 30 high, 22 moderate, 5 low)

The critical/high vulnerabilities come primarily from:
- `puppeteer@^13.1.3` — several Chromium RCE vulnerabilities since resolved in newer versions
- Various transitive dependencies of `@stencil/core@2.1.1`

**Fix:** 
- Upgrade puppeteer to latest (`npx npm-check-updates -u puppeteer`)
- Upgrade `@stencil/core` to v4.x (may require migration work)
- Run `npm audit fix` for auto-fixable issues
- Set up Dependabot / Renovate for automated updates (the recent Dependabot PR #102 addresses this)

### 3. Dependency Vulnerabilities — pizzabase

**npm audit result:** 23 total (0 critical, 6 high, 13 moderate, 4 low)

High vulnerabilities concentrated in build tooling and test dependencies. Less impactful than frontend since these are dev-only in many cases.

**Fix:** 
- Run `npm audit fix`
- Upgrade `typescript` and dev tooling

---

## Medium

### 4. No Rate Limiting on Public Endpoints

**Location:** pizzabase `src/app.ts`, `src/routes.ts`

The following public endpoints have no rate limiting:
- `POST /report` — could be spammed to create fake reports
- `POST /upload` — uploads controller has rate limiting on S3 presigned URL generation, but it's app-level, not infrastructure-level
- `GET /orders`, `GET /totals`, `GET /trucks` — no rate limiting on these read endpoints

There is **no `express-rate-limit` or similar middleware** in the Express app. The only rate limiting is implemented manually in `UploadsController.ts` (line 63).

**Fix:** Add `express-rate-limit` middleware globally with generous limits for read endpoints and stricter limits for POST endpoints. Consider using API Gateway throttling at the AWS level.

### 5. No Content Security Policy (CSP) Headers

**Location:** polls.pizza (no CSP headers configured)

The frontend does not set any Content-Security-Policy headers. This leaves the site vulnerable to XSS attacks even if the codebase is otherwise clean. The site loads:
- Google Maps API (third-party script, necessary)
- Stripe.js (third-party script, necessary for payments)
- Inline scripts for initial state

**Fix:** Add a CSP header that allows known third-party sources:
```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://js.stripe.com; 
  frame-src https://js.stripe.com; 
  connect-src 'self' https://base-next.polls.pizza https://api.stripe.com
```

**Note:** `'unsafe-inline'` for scripts may be required due to Stencil's runtime. Evaluate whether Stencil v4 supports strict-dynamic or nonce-based CSP.

### 6. Session Tokens in URL Parameters

**Location:** polls.pizza `src/components/page-session/page-session.tsx`

Session tokens are passed via URL route parameters (`/session/:token`). This means:
- Tokens appear in browser history
- Tokens are logged in server access logs
- Tokens can be leaked via `Referer` headers

**Fix:** Consider using a POST-based flow where the token is submitted in a form body rather than a GET parameter. Alternatively, set a short expiry (currently 15 minutes via JWT `expiresIn: 60 * 15`) as defense-in-depth.

### 7. CORS Configuration — Permissive in Production?

**Location:** pizzabase `src/app.ts:21`

The CORS middleware configuration needs verification. Check that the allowed origins are restricted to `https://polls.pizza` in production, not `*`.

**Fix:** Verify `src/app.ts` reads allowed origins from environment:
```typescript
cors({ origin: process.env.CORS_ORIGIN || "https://polls.pizza" })
```

---

## Low

### 8. Stripe Test Key in .env.example

**Location:** polls.pizza `.env.example`
```
STRIPE_PUBLIC_KEY=pk_test_YCa5It9RFIu9vLPZSmRcTKYD
```

This is a Stripe **test** key (`pk_test_`), which is acceptable in an example file. However, it's tied to a real Stripe account and could be used for test charges. Consider rotating it.

**Fix:** Replace with a placeholder: `pk_test_YOUR_STRIPE_TEST_KEY`

### 9. File Upload Hash Collision Risk

**Location:** pizzabase `src/entity/Upload.ts:44-45`

File deduplication uses `fileHash` (SHA-256) as a unique constraint. While SHA-256 collision is practically impossible today, the unique constraint in the database would reject uploads with colliding hashes. This is defense-in-depth but could cause confusing errors.

**Verified safe:** S3 presigned URLs have expiration (pattern: `presigned` references in codebase), TypeORM uses parameterized queries preventing SQL injection.

### 10. Google Maps API Key Exposure

The Google Maps API key is loaded client-side for the Places Autocomplete. This is necessary for the feature to work and the key should be restricted to the polls.pizza domain in the Google Cloud Console.

---

## Verified Safe Patterns

These were checked and found to be secure:

- ✅ TypeORM uses parameterized queries throughout — no raw SQL concatenation found
- ✅ Stripe integration uses Stripe.js (`redirectToCheckout`) — card data never touches PTP servers
- ✅ Stripe webhook secret verified in `src/lib/stripe.ts` via environment variable
- ✅ AWS Aurora credentials retrieved via Secrets Manager (`secretArn`)
- ✅ SightEngine API secret loaded from environment, not hardcoded
- ✅ File upload hashing (SHA-256) prevents duplicate uploads
- ✅ No `innerHTML`, `dangerouslySetInnerHTML`, or `unsafeHTML` found in polls.pizza frontend code
- ✅ CORS is explicitly configured (not default allow-all)
- ✅ User-facing PII: email address is the only PII collected, used for session magic links

---

## Recommendations by Priority

1. **Immediate (this week):**
   - Fix JWT secret fallback (Critical #1) — 5 minute fix
   - Run `npm audit fix` on both repos

2. **Short-term (this sprint):**
   - Add `express-rate-limit` to pizzabase
   - Add CSP headers to polls.pizza
   - Verify production CORS origins

3. **Medium-term (next sprint):**
   - Upgrade puppeteer and @stencil/core on frontend
   - Replace session tokens in URLs with POST-based flow
   - Rotate Stripe test key
   - Set up automated dependency updates (Dependabot/Renovate)

4. **Long-term:**
   - Consider API Gateway-level WAF rules for rate limiting and bot protection
   - Set up automated security scanning in CI (Snyk, npm audit, etc.)
   - Regular penetration testing of the full stack