# Independent verification 2 — PASS

**Candidate:** `ff501ce5046036a8b6420c1a70f5296210e0471f`  
**Live URL:** <https://family-digital-dossier.sociobot.in/>  
**Verified:** 2026-08-28  
**Method:** clean working tree at the requested candidate; no product code was changed.

## Decision

**PASS.** The prior verification failure at `b3fe756` is not present in this candidate. The live deployment matches the candidate bytes checked below and met the brief's encrypted, local-first locator workflow and PWA acceptance checks.

## Quality gates

| Check | Fresh result |
| --- | --- |
| Clean install and dependency audit | `npm ci` installed 140 packages; `npm audit --audit-level=high` reported 0 vulnerabilities. |
| Type/lint/unit/build/E2E | `npm test` passed: TypeScript, ESLint (zero warnings), Vitest 14/14, exact `vite build`, and Playwright 8/8. The direct Playwright rerun also passed 8/8. |
| Offline stability | The repository offline test repeated 10 isolated times: 10/10 passed. A separate live warm-cache check passed both offline fresh navigation and offline reload. |
| Production artifact | `npm run build` produced `dist/`, including hashed app/CSS assets and `sw.js`. |
| Bundle budgets | app JS 49,158 B raw / 14,495 B gzip; CSS 11,896 B raw / 3,642 B gzip; AVIF hero 27,421 B; all within the 200 KB / 50 KB / 300 KB budgets. `dist` totals 273,957 B. |
| Lighthouse, live mobile | Performance 97, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.2 s, TBT 200 ms, CLS 0. |

## Product and safety exercise

Independent live Chromium exercise covered creating an encrypted dossier, adding a trusted executor, writing jurisdiction-aware first-hour instructions, adding banking/insurance/legal locator records, record search, six-month review, the three-record findability drill, encrypted-backup download, explicitly confirmed readable CSV export, wrong-current-passphrase recovery, passphrase rotation, lock/unlock, and persistence after closing a tab and reopening it. The persisted record was recovered after unlock.

Invalid/recovery checks passed:

- Native 12-character passphrase constraint and mismatched-passphrase path are present.
- `password=DemoSecret_42!` is rejected before save, announced in the dialog, marked `aria-invalid`, and focus remains in the locator field; a safe replacement saves.
- The encrypted backup did not contain entered locator plaintext and contains a ciphertext envelope.
- Invalid import, wrong unlock/passphrase, and explicit `DELETE` confirmation paths are covered by the shipped workflow/tests.

The product meets the actual job: it holds institutions, document locations, renewal dates, contacts, and instructions while expressly excluding credentials; it provides a review checklist, findability drill, printable sealed cover, and encrypted portability.

## PWA, privacy, accessibility, and browser policy

- Live service worker controlled the page and exposed `dossier-shell-778e3c41e93e`, containing 15 shell entries including `/` and the hashed app bundle. Its source has versioned cache cleanup, `skipWaiting`, `clients.claim`, cached shell navigation, and offline fallback. Chrome CDP returned `installabilityErrors: []`.
- Live axe WCAG A/AA scans at 1440px and 390px returned zero violations, including zero serious/critical. At 390px, `scrollWidth` was exactly 390.
- Keyboard-only smoke test: first Tab reached the visible skip link with a solid 3px `rgb(10, 111, 154)` focus outline; Enter focused `#main`. Under reduced motion the tested transition duration was `0.00001s`.
- Fresh live browser visits had zero console errors, zero page errors, and zero third-party requests. Source inspection found no analytics or CDN assets. The only external runtime endpoint is the documented Sociobot license verification API, and only when a license token is stored.
- Data is encrypted in IndexedDB; license token/verdict are the documented localStorage exceptions. Privacy and terms pages are live, and MIT `LICENSE` is present.
- Live root has CSP, Permissions-Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and HSTS. Root HTML uses immediate revalidation; hashed assets are `public, max-age=31536000, immutable`; worker is `no-cache, no-store, must-revalidate` with root scope.
- `/opt/fleet/lib/verify-url.sh` against live returned HTTP 200 in 1,013 ms, expected title and `lang=en`, one H1, one main, no missing image alt text, no unlabeled buttons, and no console errors.

Visual review of live desktop and 390px mobile found the implemented sealed-constellation visual system clear, legible, responsive, and consistent with `.factory/design.md`.

## Deployment identity

`origin/main` resolves to the candidate SHA. Fresh local production outputs exactly matched live SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `index.html` | `33321418e601204e03295a4b6bcacb6e4909c81fa3060a7a249a3c4e612a7a11` |
| `assets/app-CFErsdTi.js` | `3c4d1b94a885ca6fe0c099906849659525d63ae84fb3d74169acd7a1d9d89388` |
| `assets/app-C5OnWK1D.css` | `c8275447d4a7400b444a52ede56f3d58c4bb536bbd7aca8543fdb48b2ceb8da4` |
| `sw.js` | `383d46afd062a4da8143f4e0bf4046d2d169a8be2b2a47ab60ad2cef04f8402f` |

## Defects

No P0, P1, P2, or P3 defects found in this verification.

## Reproduce

```sh
npm ci
npm audit --audit-level=high
npm test
npx playwright test tests/e2e/app.spec.ts --grep 'loads the installed shell offline' --workers=1 --repeat-each=10
CHROME_PATH=/opt/pw-browsers/chromium-1208/chrome-linux64/chrome npx lighthouse@12.8.2 https://family-digital-dossier.sociobot.in/ --chrome-flags='--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu --no-zygote'
mkdir -p /tmp/family-dossier-verify-url
/opt/fleet/lib/verify-url.sh https://family-digital-dossier.sociobot.in/ /tmp/family-dossier-verify-url
```
