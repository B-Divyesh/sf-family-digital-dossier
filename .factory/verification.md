# Independent verification — FAIL

**Candidate:** `b3fe756dd7862f073eb6aa9999b4164982591e5b`  
**Live URL:** <https://family-digital-dossier.sociobot.in/>  
**Verified:** 2026-08-28  
**Method:** clean detached clone at this exact commit; no product code was changed. Temporary verification tests were removed before handoff.

## Decision

**FAIL. Do not release this candidate as the acceptance contract requires an actually working offline PWA, passing local quality gates, and no credential collection by design.** The previously reported failure is not deployment-only: it reproduces locally from the exact production build, and the deployed bytes match this candidate.

## Blocking defects

### P1 — Offline reload test fails from the production build

`npm test` failed in the clean checkout: 3 Playwright tests passed and `loads the installed shell offline after a warm visit` failed. After a warm visit, worker control, and `context.setOffline(true)`, the fresh page did not expose the landing H1 within the test's 5-second requirement. The direct retry below failed identically; a five-run repeat had 2 failures and 3 passes, so it is flaky at best and cannot satisfy the required gate.

```text
npx playwright test tests/e2e/app.spec.ts --grep 'offline' --workers=1
1 failed — expected heading "Leave a map. Keep the keys." to be visible
```

This contradicts the PWA/offline requirement and makes `npm test` non-passing. `sw.js` has a versioned shell cache and `skipWaiting`/`clientsClaim`, but its required end-to-end offline navigation is not reliable.

### P1 — The app stores credential-like data despite its core safety boundary

The brief says the product must collect **no credentials by design** and calls password storage a non-goal. The record form accepts arbitrary text in the locator field; there is a warning but no validation or confirmation boundary. A focused browser proof created a dossier, entered `password=DemoSecret_42!` as a locator, saved it, and verified the exact text was displayed in Records. The test passed.

That string is encrypted at rest, but it is still being collected, persisted, exported, and potentially printed by a product that promises not to store credentials. Copy alone is insufficient for this safety-critical product claim.

## Other defects / release risks

### P2 — Sensitive deployed app lacks browser hardening and asset-cache policy

Live responses include HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`, but omit both `Content-Security-Policy` and `Permissions-Policy`. Root, JS, CSS, service worker, and AVIF all return:

```text
Cache-Control: public, must-revalidate, max-age=30
```

There are no hashed asset filenames or long-lived immutable cache headers. This misses the PWA performance/cache policy for a sensitive offline application and weakens defense in depth against script injection.

## Evidence that passed

| Area | Result |
| --- | --- |
| Clean install | `npm ci` passed; 57 packages installed. |
| Type check | `npx tsc --noEmit` passed. No lint script is defined in `package.json`. |
| Unit tests | `vitest run`: 2/2 encryption tests passed. |
| Exact production build | `npm run build` passed and produced `dist/`. |
| Dependency audit | `npm audit --audit-level=high`: 0 vulnerabilities. |
| Core normal path | Authored Playwright flow passed: create encrypted dossier, add record, lock, unlock, edit; it also passed axe on the unlocked screen. |
| Invalid/recovery paths | Mismatched setup passphrases show the expected alert; the passphrase field has native 12-character validation; authored test successfully locks then unlocks after normal recovery. |
| Encrypted export | Focused browser proof passed: an entered locator was absent from exported JSON plaintext; envelope identifies PBKDF2-SHA-256. |
| Printing | Focused browser proof passed: free **Print sealed cover** invokes the print command. |
| Accessibility / semantics | Live Chromium + axe WCAG A/AA: 0 serious/critical findings; title, `lang=en`, exactly one H1, and `main` present. |
| Keyboard / motion | At 390×844, `scrollWidth` equals 390; Tab reaches the visible skip link with a 3px `#0a6f9a` focus outline; Enter targets `#main`; reduced-motion CSS yields a `0.01ms` transition. |
| Live browser errors / normal outbound traffic | None observed on a clean landing-page visit: no console/page errors and no third-party requests. Source review finds the only intended external fetch is license verification to `api.sociobot.in` when a stored license token exists. |
| Bundle budget | `app.js` 43,826 B raw / 12,844 B gzip; CSS 11,607 B raw / 3,533 B gzip; AVIF hero 27,421 B. All are within stated static budgets. |
| Legal/privacy presence | `/privacy/`, `/terms/`, and MIT `LICENSE` exist; copy accurately explains local encryption, no recovery, readable CSV/print risk, and jurisdictional limitations. |

Lighthouse 12.8.2 was attempted independently against the live site, using the installed Playwright Chromium executable, but Chrome crashed before producing a report. No Lighthouse score is claimed in this verification.

## Deployment identity

`origin/main` resolves to the candidate SHA. Live and locally built files have identical SHA-256 content for the following checked files:

| File | SHA-256 prefix |
| --- | --- |
| `/` / `dist/index.html` | `1c1e2cb02e6c778f` |
| `/assets/app.js` | `42f8aa998fa5457f` |
| `/assets/app.css` | `f2b9c4e986927892` |
| `/assets/styles.js` | `d2a32840421496e8` |
| `/sw.js` | `9e41d14814f8fd54` |
| `/privacy/`, `/terms/`, `/offline.html` | exact body matches also confirmed |

## Required next steps

1. Make offline warm-cache navigation deterministic and keep an automated passing offline-reload/update test; then rerun `npm test` from a clean checkout.
2. Enforce the no-credential boundary in data entry (and consider imported data), not just in helper text. Ensure credential-like values cannot silently become CSV/print content.
3. Configure an appropriate CSP and Permissions-Policy at deployment, hash static filenames, and serve immutable asset cache headers while retaining a short-revalidated HTML/service-worker policy.
4. Re-run full verification, including a successful independent Lighthouse run, after the fixes.
