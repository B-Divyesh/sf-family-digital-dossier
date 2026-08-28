# Family Digital Dossier — polish 3 handoff

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
