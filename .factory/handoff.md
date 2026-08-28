# Family Digital Dossier — adversarial review 2 handoff

## Status

Work order `family-digital-dossier-review-2` is complete. Verdict: **FAIL**.

The complete evidence-backed report is `.factory/review-2.md`. No product code, infrastructure, DNS, or billing state was changed.

## Main results

- Cold first-read, one-click demo, demo isolation/reset/exit, offline demo use, route metadata, 404, Back/focus behavior, accessibility, privacy interception, internal links, and the distinct visual identity pass.
- All 25 exact `.factory/claims.json` commands fail from a clean clone because `test:claims` previews a missing `dist/` instead of building first. A diagnostic build followed by the aggregate claim suite passes 8/8.
- The live **Buy Dossier Plus** link returns HTTP 404. UC-15 mocks a license but does not test checkout.
- Review-1 COPY-L17 (“Offline copy ready.”) and COPY-L15 (passive footer disclosure) are not actually closed and are blocking again under the history rule.
- Six additional major/minor findings cover overbroad or unlisted claims, first-screen grammar, and external-link labeling.

## Verification performed

- Fresh contexts at 390×844 and 1440×900, before scroll.
- Live demo edit, reset, exit, real-database marker preservation, database deletion, and request interception.
- Live offline `/demo` and `/demo/records` reload with the seeded record visible.
- Every one of 25 registered claim commands from a `git clone --no-local` at `263cb354297b67351c0104822a5d7d5d705ff888`: 0 passed, 25 failed at the missing-build precondition.
- Diagnostic `npm run build && npm run test:claims`: 8/8 grouped claim scenarios passed.
- `npm test`: passed TypeScript, ESLint, 14/14 unit tests, build, and 19/19 browser tests.
- `PLAYWRIGHT_BASE_URL=https://family-digital-dossier.sociobot.in npx playwright test tests/e2e/app.spec.ts`: 11/11 passed.
- `/opt/fleet/lib/verify-url.sh`: passed with no browser errors or baseline accessibility defects.
- Live crawl: every internal route/asset passed; checkout alone returned 404; the designed unknown route returned its intended 404.
- Local and production `index.html` and hashed app JavaScript SHA-256 values matched exactly.

## Next steps

Repair the four blocking findings first, then the six remaining findings in `.factory/review-2.md`. Run each claim command independently after deleting `dist/`, confirm the real checkout without a mocked license, and repeat the entire cold review.
