# Family Digital Dossier — polish round 2 handoff

## Delivered

Repair commit `58adcc5c7ca66d9468d3c9c0dc2c951c994cfc3e` closes every finding in review rounds 1 and 2. The live site is <https://family-digital-dossier.sociobot.in>.

- The demo remains a one-click, realistic, isolated `demo:family-digital-dossier` sample with reset, exit, and offline use.
- Claim commands now build for themselves; all 26 current registry commands pass from a clean clone.
- The dead paid checkout and its billing client were removed. The app has no paid tier and all tools are free.
- Copy, footer disclosure, legal pages, scope, external-link labels, record-person links, MIT text, catalog description, and claims were corrected.
- The distinct sealed-constellation folio system, PWA class, metadata, routes, 404, keyboard/focus behavior, and mobile layout remain intact.

## Verification

- `npm test` passed: typecheck, lint, 14 unit tests, build, 22 Playwright browser/accessibility/mobile/privacy/offline tests.
- `npm run test:claims` passed 11/11 tagged scenarios.
- A fresh `git clone --no-local` plus `npm ci` ran all 26 exact `.factory/claims.json` commands independently; all passed.
- Live `PLAYWRIGHT_BASE_URL=https://family-digital-dossier.sociobot.in npx playwright test` passed 22/22.
- Live `verify-url.sh` passed; evidence is `.factory/evidence/polish-2/verify-live/verify.json`.
- Lighthouse live: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.0 s, TBT 0 ms, CLS 0.
- Deployment `5c8588f1-6598-4473-95a7-f3865dfaa173` completed successfully. The live root returned 200; the unknown route returned the intended HTTP 404.

## How to run

```sh
npm ci
npm test
npm run test:claims
npm run build
```

Deploy `dist/` as a static PWA. The detailed finding map and evidence are in `.factory/polish-2.md`.

## Known gaps

None. The standalone `@axe-core/cli` could not start ChromeDriver in this container, but the equivalent Playwright axe checks passed locally and against production.
