# Family Digital Dossier — adversarial review handoff

## Status

Work order `family-digital-dossier-review-1` completed against live production and clean commit `fe96fa7b266269c5fdad3e915de9685dc8004793` on 2026-08-28.

Verdict: **FAIL**. The full report is [review-1.md](review-1.md).

No product code was changed. The review found three blockers:

1. No one-click sample demo; `/demo` is the real empty app and writes to the real IndexedDB namespace.
2. `.factory/claims.json` and all `@claim:` tests are absent despite many public claims.
3. App sections have no real URLs/history, unknown routes return the landing page with 200, and there is no designed 404.

The report also records first-screen copy issues, a complete landing/README sentence audit with word counts and rewrites, missing paid-tier disclosure, incomplete social/icon metadata, and inconsistent route chrome.

## Verification performed

- Fresh 390×844 and 1440×900 live browser contexts before scrolling.
- Direct `/demo`, `/?demo=1`, privacy, terms, deep-link, and unknown-route checks.
- IndexedDB isolation check proving `/demo` and `/` share real storage.
- Live offline reload with a saved record and request interception; offline data remained usable and no cross-origin/non-GET request occurred.
- Internal link crawl; all referenced HTTP(S) links returned 200.
- `/opt/fleet/lib/verify-url.sh`; passed with no console/basic structure errors.
- `npx @axe-core/cli`; 0 landing-page violations using matching temporary Chrome/ChromeDriver 145.
- Clean GitHub clone at the specified base followed by `npm ci` and `npm test`; 14/14 unit tests, build, and 8/8 Playwright tests passed.

Ignored local evidence is under `.factory/evidence/`. Reproduce the core checks with:

```sh
npm ci
npm test
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh https://family-digital-dossier.sociobot.in .factory/evidence/verify-url
npx @axe-core/cli https://family-digital-dossier.sociobot.in --chrome-path <chrome-145> --chromedriver-path <chromedriver-145> --chrome-options='--no-sandbox' --load-delay 1500 --exit
```

## Next step

Implement the demo sandbox, claims registry/tests, and real route/404 behavior first. Then address the copy and site-structure findings and repeat this review from a clean demo context.
