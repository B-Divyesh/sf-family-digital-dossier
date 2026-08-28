# Family Digital Dossier — review 3 handoff

## Delivered

Completed the requested adversarial review without changing product code. Added `.factory/review-3.md` and committed the review documents.

## Verification performed

- Cold live Chromium checks at 390×844 and 1440×900, with fresh storage; first-read gate passed and no console errors occurred.
- Live demo probe confirmed the filled Asha Mehta sample, persistent banner, reset/exit actions, separate encrypted `demo:family-digital-dossier` storage, unchanged real marker, and no external request.
- Live offline, route/title/canonical/H1/focus/back/404/metadata, response-header, asset, and link-crawl checks were run.
- Created a clean `git clone --no-local`, ran `npm ci`, then ran all 26 exact `.factory/claims.json` commands independently. All passed.
- Ran `npm test` in that clean clone through typecheck, lint, 14 unit tests, build, and browser-test execution.

## Result and remaining work

Review verdict: **FAIL**. Product behavior and all registered claims passed. Four concrete statements on the live Privacy/Terms routes are not registered or sandbox-tested: hosting-log retention, two deletion statements, exact offline-cache contents, and legal-document/account-authority scope. See `F-3-1` through `F-3-4` in `.factory/review-3.md` for required copy or test changes.

## How to repeat

```sh
npm ci
npm test
npm run test:claims
```

For strict registry verification, run each `test` value in `.factory/claims.json` separately from a new clone with no `dist/` directory.
