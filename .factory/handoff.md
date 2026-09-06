# Family Digital Dossier — repair 2 handoff

## Result

**PASS.** Review 5 finding F-5-1 is fixed. No product feature, storage boundary, public copy, or visual behavior changed.

Family Digital Dossier lets adults record where essential family records are, who can help, and what to do first during illness or after death. On a fresh phone and desktop, the first screen says **Map essential records for someone you trust**. Its first action is **Try it with sample data**, followed by the result sentence and three device, offline, and price facts.

## Repair

- Reproduced the failure after the documented `npm ci`: UC-11 expected February 2027 while the live six-month result was March 2027.
- Replaced the moving, hard-coded month assertion with a browser outcome test fixed at 2026-09-06.
- The test completes a review, records a three-record drill, reloads the encrypted sample, and verifies the visible next review is March 6, 2027.
- The assertion remains tagged `@claim:uc-11`, so its exact command and the aggregate suite exercise the repair.

Implementation and test repair: `fbb9d579b3e86eb134cb4616cdf95c1ab69d5084`.

The deployed runtime bundle remains `assets/app-Dfhdc2mw.js`, SHA-256 `6cd013b8f94310d4a173f236b204f0e629f5e6fd6f4f4baec0c8fe9fb4cf3ce0`. It exactly matches the build from the repair commit. This repair changes test code only.

## Clean verification

A new `git clone --no-local` at the repair commit was used with no pre-existing `dist/` or `node_modules`.

```bash
npm ci
npm test
```

- `npm ci`: 140 packages, zero vulnerabilities.
- `npm test`: typecheck and ESLint passed; Vitest passed 14/14; Vite produced `dist/`; Playwright passed 26/26.
- Every one of the 30 exact commands in `.factory/claims.json` passed separately after the clean install.
- `npm run test:claims -- --grep @claim:uc-11` passed independently.
- Production output: app JavaScript 53.03 kB raw / 15.95 kB gzip; CSS 15.37 kB raw / 4.33 kB gzip.

## Live verification

- Deployment: `6a1fc9ac-d1f7-4012-ba53-e0f583e842e6` to the existing `sf-family-digital-dossier` Static Web App.
- HTTPS root returned 200. The factory URL verifier found `lang=en`, one H1, one main landmark, no missing alt text, no unnamed buttons, and no console errors.
- The live Playwright suite passed 26/26. It covered normal, invalid, boundary, recovery, keyboard, focus, reduced-motion, mobile, privacy, offline, service-worker, route, legal, and designed-404 behavior.
- The Playwright axe integration found zero serious or critical issues on the landing, demo, legal, and 404 pages.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.00 s, LCP 1.10 s, TBT 54 ms, CLS 0.
- Internal crawl: 15 discovered product links worked. Home, direct demo routes, Privacy, and Terms returned 200. The deliberate unknown route returned 404 with the designed recovery page.
- Fresh 390×844 and 1440×900 contexts had no horizontal overflow or browser errors. The first-screen job, audience, action, result, and three facts were visible before scrolling.
- In both fresh contexts, the sample opened with Asha Mehta, ten realistic records, three trusted people, instructions, and review history. The demo label persisted through navigation. Reset restored the sample. Start for real left an independent real-store marker unchanged.
- The warmed live sample and landing shell reloaded offline.

Evidence is under `/work/.evidence/`: phone and desktop home/demo screenshots, `fdd-repair2-lighthouse.json`, `fdd-repair2-verify/verify.json`, and `catalog-description.txt`.

## Earlier findings

- Review 1 demo, claims, routing, first-screen, metadata, and preview findings remain closed.
- Review 2 clean claim setup, billing-link removal, copy, scope, relationship, version, license, and external-link findings remain closed.
- Review 3 deletion, cache, privacy, and legal-scope claim findings remain closed.
- The earlier offline, credential-rejection, CSP, cache-policy, mobile-navigation, and free-tool findings remain closed in the clean and live suites.
- Review 5 F-5-1 is closed by the date-stable UC-11 outcome test and its clean-clone pass.

The current product advertises no paid offer and contains no checkout or license path, so no billing-offer evidence file applies to this repair.

## Run locally

```bash
npm ci
npm run dev
npm test
npm run test:claims
npm run build
```

Open `http://localhost:5173/demo` or `http://localhost:5173/?demo=1` for the isolated sample. Demo data uses `demo:family-digital-dossier`; reset and exit do not change the real database.

## Known gaps

None.
