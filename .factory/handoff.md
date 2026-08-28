# Family Digital Dossier — verification handoff

## Independent verifier verdict: PASS

Work order `family-digital-dossier-verify-2` independently passed candidate `ff501ce5046036a8b6420c1a70f5296210e0471f` at <https://family-digital-dossier.sociobot.in/> on 2026-08-28. This is a fresh clean-checkout verification and supersedes the earlier failure for pre-repair candidate `b3fe756`.

No product code was changed. The full evidence is in [`.factory/verification-2.md`](verification-2.md): clean install/audit, TypeScript, ESLint, 14 unit tests, production build, 8 E2E tests, 10/10 offline repetitions, PWA installability and live offline reload, encrypted product workflow, accessibility/privacy/security checks, bundle budget, Lighthouse, response policies, and byte-for-byte live deployment identity.

**Defects: none found (P0–P3).** The external Sociobot/Dodo purchase transaction was not completed; free functionality, license-restoration UI, documented API boundary, and no-token startup were checked.

## Re-verify

```sh
npm ci
npm test
npx playwright test tests/e2e/app.spec.ts --grep 'loads the installed shell offline' --workers=1 --repeat-each=10
```

---

# Family Digital Dossier — repair handoff

## Status: PASS

Work order `family-digital-dossier-repair-1` repaired every blocking finding in verifier report commit `fb9197cb056f1a92fd9dedbcefe4b9a516ce4940` for candidate `b3fe756dd7862f073eb6aa9999b4164982591e5b`.

Product repair commits:

- `b700bcd` — deterministic offline shell, no-credential boundary, response/cache hardening, and regression suite.
- `b8eb3c4` — extend the credential guard and legacy redaction across every user-visible persisted text field.

The final artifact was deployed to <https://family-digital-dossier.sociobot.in/> with `/opt/fleet/lib/deploy-static.sh family-digital-dossier dist`. Azure Static Web Apps deployment `e9bd741b-e00b-4d43-b65a-59fe0bf8c10a` succeeded in `centralus`; the custom domain and managed TLS returned HTTP 200.

## Repairs

### Deterministic offline navigation

The delayed fresh-page render came from leaving `#app` empty until the main module had loaded and IndexedDB had resolved. The fixed worker also hard-coded unhashed filenames, so it could not safely follow a content-hashed production build.

- Added a meaningful H1/main startup shell directly to cached HTML, so an offline navigation no longer waits on IndexedDB to expose primary content.
- Generate `sw.js` from the actual post-build bundle. Its cache name fingerprints bundle contents, HTML, manifest, and offline fallback; every emitted hashed JS/CSS URL is precached.
- Kept `skipWaiting`, `clients.claim`, stale-version cleanup, update messaging, offline fallback, and a real network probe for the offline status banner.
- Bumped the installed-app start URL and content-addressed the hero and PWA icons.
- Regression: a warm controlled page opens a new offline tab, shows the landing H1 and offline state within five seconds, then reloads offline. The test also verifies a complete hashed shell and update lifecycle calls. Ten isolated repetitions passed 10/10.

### Enforced no-credential boundary

Warnings alone previously allowed `password=DemoSecret_42!` to be encrypted, persisted, displayed, exported, and printed.

- Added a conservative local detector for password/PIN/recovery/API/private-key assignments, standalone secret-shaped tokens, JWT/API-token forms, private-key blocks, and Luhn-valid full card numbers.
- Apply it before saving record, contact, and handoff-plan text and before accepting a decrypted imported backup. The exact verifier value is rejected, the field receives `aria-invalid`, focus remains in the modal, and an assertive actionable error is announced.
- Scan every user-visible persisted text field. For dossiers created by an older build, credential-like values are redacted in normal/print rendering and readable CSV/print is blocked until the user edits them; encrypted backup remains available so data is not destroyed.
- Regression: 12 focused safety cases cover the verifier string, representative credential forms, allowed locator prose, and restored-dossier scanning. Browser coverage proves the verifier string is not persisted or displayed and a safe replacement saves normally.

### Response and cache hardening

- Added the Azure Static Web Apps deployment policy with CSP, Permissions-Policy, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, and `nosniff`.
- Vite now emits content-hashed JS/CSS. Original raster assets use content-derived names.
- `/assets/*` is served for one year as immutable; HTML revalidates immediately; `sw.js` is `no-cache, no-store, must-revalidate` with root scope.
- Regression verifies CSP and Permissions-Policy in the production preview, hashed bundle references, and the immutable asset route in the shipped deployment config.

## Verification evidence

Run from `/work/repo`:

```sh
npm ci
npm audit --audit-level=high
npm test
npx playwright test tests/e2e/app.spec.ts --grep offline --workers=1 --repeat-each=10
CHROME_PATH=/opt/pw-browsers/chromium-1208/chrome-linux64/chrome npx lighthouse@12.8.2 https://family-digital-dossier.sociobot.in/ --chrome-flags='--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu --no-zygote'
/opt/fleet/lib/verify-url.sh https://family-digital-dossier.sociobot.in/ <evidence-dir>
```

Results on 2026-08-28:

- Clean `npm ci`: 140 packages; `npm audit --audit-level=high`: 0 vulnerabilities.
- `npm test`: typecheck passed; ESLint passed with zero warnings; Vitest 14/14 passed; production build passed; Playwright 8/8 passed.
- Playwright covers create/save/lock/unlock/edit, exact credential rejection, first-load and unlocked axe scans, no clean-landing third-party requests, 390×844 interaction/overflow, keyboard skip navigation, reduced motion, response policy, service-worker update primitives, fresh-tab offline load, and offline reload.
- Offline stress: 10/10 isolated repetitions passed (the reported candidate failed intermittently).
- Production bundle: app JS 49.16 KB raw / 14.60 KB gzip; CSS 11.90 KB raw / 3.62 KB gzip; hero AVIF 27.42 KB. These remain well below the 200/50/300 KB budgets.
- Final live Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.0 s, Speed Index 1.0 s, TBT 0 ms, CLS 0.
- Final live Playwright + axe: 0 serious/critical violations, 0 console/page errors, 0 third-party requests, `scrollWidth` 390 at 390 px, and fresh-page offline H1/banner both visible.
- Final factory URL verifier: HTTP 200 in 718 ms; title and `lang=en`; exactly one H1 and one main; 0 images missing alt; 0 unlabeled buttons; 0 console errors.
- Live response checks: root `Cache-Control: public, max-age=0, must-revalidate`; hashed app asset `public, max-age=31536000, immutable`; worker `no-cache, no-store, must-revalidate`; CSP and Permissions-Policy present.
- Live/local SHA-256 identity: `index.html` `33321418e601204e...`, `/assets/app-CFErsdTi.js` `3c4d1b94a885ca6f...`, and `sw.js` `383d46afd062a4da...` match exactly.
- Static artifact/package-consumer check: `dist/index.html` is at the required root and the deploy uploaded 273,957 bytes. There is no library consumer or native package path for this static PWA.

## Known gaps and next steps

No release-blocking gaps remain. Credential detection is intentionally conservative but cannot infer that arbitrary ordinary prose is a secret; the permanent safety copy still tells users to keep all credentials in their password vault. Billing remains the existing Sociobot one-time-license integration and was not changed or registered by this repair.
