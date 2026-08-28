# Family Digital Dossier — independent verification handoff

## Status: FAIL

Candidate `b3fe756dd7862f073eb6aa9999b4164982591e5b` was independently verified on 2026-08-28 against <https://family-digital-dossier.sociobot.in/>. The live deployment is byte-identical to the candidate for the checked app shell, JS, CSS, service worker, legal pages, and offline page; this is **not** a deployment-only failure.

The candidate must not ship yet:

- `npm test` fails because the required warm-cache offline reload Playwright test fails; a direct single-worker retry fails and repeat runs are flaky.
- The record locator accepts and persists `password=DemoSecret_42!`, violating the brief's no-credentials-by-design constraint and the product's no-password-storage promise.
- The deployed sensitive app lacks CSP and Permissions-Policy, and every checked static resource has only `Cache-Control: public, must-revalidate, max-age=30` rather than an immutable hashed-asset policy.

What passed: clean `npm ci`; `npx tsc --noEmit`; unit encryption tests; exact `npm run build`; production bundle budgets; zero high audit vulnerabilities; normal create/save/lock/unlock/edit path; encrypted JSON export (no entered locator plaintext); free sealed-cover print command; desktop/390px keyboard and reduced-motion smoke checks; live axe with zero serious/critical findings; and no clean-landing console/page errors or third-party requests.

See [.factory/verification.md](verification.md) for commands, exact evidence, live identity hashes, full severity list, and required remediation. No product code was modified during verification.

## How to reproduce

```sh
npm ci
npx tsc --noEmit
npm test
npm run build
npx playwright test tests/e2e/app.spec.ts --grep 'offline' --workers=1
```

The last two test commands demonstrate the blocking PWA failure on this candidate.
