# Family Digital Dossier — review 5 handoff

## Review 5 result

**FAIL.** This review changed reports only; no product code was modified.

- Reviewed live URL: <https://family-digital-dossier.sociobot.in>.
- Implementation reviewed: `d444081dd43ce3a4f797bba4aca852edaf8226a3`.
- Documentation head: `c3b11d4c0878ba863401ebdb13540376c49aac47`.
- Fresh phone and desktop sessions passed the first-read, sample-dossier, reset/exit isolation, privacy, offline, route, 404, link, and accessibility checks.
- Clean clone: `npm ci` passed. Every one of the 30 declared claim commands ran; 29 passed and UC-11 failed. `npm test` failed for the same UC-11 assertion.
- Finding F-5-1: the review-history claim test expects a hard-coded February 2027 date, but on 2026-09-06 the six-month review date is March 2027. The claim command must calculate the date or freeze time before this product can pass.

See `.factory/review-5.md` for all evidence, the previous-finding disposition, and required repair.

## How to verify after repair

```bash
npm ci
npm test
npm run test:claims -- --grep @claim:uc-11
```

Then run every command in `.factory/claims.json` from a clean clone. Open `/?demo=1` or `/demo` to review the isolated sample dossier.

## Review 4 archive

## Review 4 completion

- Performed the required cold, adversarial review without changing product code.
- Wrote `.factory/review-4.md`; verdict: **PASS** with zero findings.
- New clean clone: `/tmp/fdd-review4-S1LTEy`; `npm ci`, every one of the 30 exact `.factory/claims.json` commands, and `npm test` all passed. The full suite passed typecheck, ESLint, 14 unit tests, build, and 26 Playwright checks.
- Live checks confirmed the 390 px and desktop first-read flow, realistic one-click sample dossier, same-origin-only demo traffic, reset/exit storage isolation, offline demo, deep links, Back/focus behavior, metadata, security headers, and the designed 404.
- The verified local build and live site use `app-Dfhdc2mw.js` (15.95 kB gzip).

For the full evidence, copy audit, claim run, and prior-finding reconciliation, see `.factory/review-4.md`.

## Delivered

- Closed every review finding from rounds 1–3. The complete id-to-fix-to-evidence record is in `.factory/polish-3.md`.
- Made legal copy precise and testable: removed the untestable host-log statement and browser-site-data deletion outcome; added coverage for Settings deletion, Cache Storage contents, and the narrow terms scope.
- Added the missing evidence for the landing statement that all tools are free and require neither a purchase nor a license.
- Kept the app’s archival-folio visual system while changing the mobile dossier navigation to a visible, non-clipped six-button grid.
- Preserved direct `/demo` and `?demo=1` sandbox entry, isolated demo storage, banner/reset controls, real routes, titles, legal pages, 404, offline shell, and local-first data handling.

## Commits and deployment

- `ac6ceaa` — closed legal privacy claim gaps.
- `3f6c202` — made mobile dossier navigation fully visible.
- `d444081` — added the evidence-backed free-tools claim.
- All repair commits are pushed to `origin/main`.
- Static deployment: `e0717072-a504-4323-8425-1be3b23fbc3b`.
- Live: https://family-digital-dossier.sociobot.in

## Verification

- Fresh clone at `d444081`: `npm ci`, then every one of the 30 exact commands in `.factory/claims.json` passed independently from clean state.
- Fresh clone: `npm test` passed typecheck, lint, 14 Vitest tests, build, and 26 Playwright tests.
- Live production: `PLAYWRIGHT_BASE_URL=https://family-digital-dossier.sociobot.in npx playwright test` passed all 25 deployed-artifact browser checks.
- Live verifier: `.factory/evidence/polish-3/verify-live-final/verify.json` records title, `lang`, one `h1`, main landmark, alt text, named buttons, and no console errors.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0. Evidence: `.factory/evidence/polish-3/lighthouse-live.json`.
- Reviewed final live screenshots: `.factory/evidence/polish-3/live/home-mobile.png`, `demo-mobile-final.png`, `privacy-desktop.png`, `terms-desktop.png`, and `not-found-desktop.png`.
- Built assets remain within budget: JavaScript 53.03 kB (15.95 kB gzip), CSS 15.37 kB (4.33 kB gzip).

## How to run

```bash
npm ci
npm run dev
npm test
npm run test:claims
npm run build
```

Open `http://localhost:5173/demo` or `http://localhost:5173/?demo=1` for the isolated sample dossier. Demo data uses the `demo:` IndexedDB namespace; Reset demo reseeds only that namespace.

## Known gaps

None.
