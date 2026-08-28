# Polish round 2 — finding closure

Date: 2026-08-28  
Work order: `family-digital-dossier-polish-2`  
Reviewed candidate: `263cb354297b67351c0104822a5d7d5d705ff888`  
Repair commit: `58adcc5c7ca66d9468d3c9c0dc2c951c994cfc3e`  
Live site: <https://family-digital-dossier.sociobot.in>

The repair keeps the sealed-constellation folio identity. It removes the unavailable Plus offer rather than advertising a checkout that returned 404. The product is now entirely free and local-first.

## Review-2 findings

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| F-2-1 / B-02 | Made `test:claims` build before running Playwright. Every registry command is now self-contained. | Fresh `git clone --no-local`, `npm ci`, then all 26 commands in `.factory/claims.json` passed independently. `npm run test:claims` passed 11/11. |
| F-2-2 | Removed the dead checkout, all Plus copy, the billing client, license storage, and verification calls. | Live landing, Settings, Privacy, and Terms have no purchase link. Live 22/22 browser suite passed; no external product request was observed. |
| F-2-3 / COPY-L17 | Replaced the service-worker toast with “The app is ready to use offline.” | `loads the installed shell offline after a warm visit`; live mobile screenshot `evidence/polish-2/verify-live/screenshot-mobile.png`. |
| F-2-4 / COPY-L15 | Replaced the footer fragment with “We generated the original artwork for this product. Build polish-2.” | `@claim:uc-25`; live `/`, `/privacy/`, `/terms/`, and 404 screenshots. |
| F-2-5 | Rewrote the scope statement: no document upload or account-access feature; do not paste passwords or document contents; no legal advice. Added a scoped outcome claim. | `@claim:uc-26`; live `/` and README checked. |
| F-2-6 | Added an explicit persisted record-to-person relationship claim; the test also proves deletion clears the stale link. | `@claim:uc-27`; live `/demo/records` and `/demo/people`. |
| F-2-7 | Added the exact package and lockfile Playwright-version claim. | `@claim:uc-28`. |
| F-2-8 | Added an MIT-license claim and normalized `LICENSE` with its MIT heading. | `@claim:uc-29`. |
| F-2-9 | Rewrote the first-screen audience sentence as “For adults helping family or an executor find records during illness or after death.” | Cold live mobile screenshot and `copy-audit.md` L02. |
| F-2-10 | Marked the Param Factory footer link “(opens external)” with an accessible name on all static and SPA routes. | Live `/`, `/privacy/`, `/terms/`, and 404; browser route/accessibility test. |

## Review-1 product findings

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| B-01 | Retained the one-click, seeded `/demo` and `?demo=1` sandbox with a persistent banner, reset, exit, separate `demo:` IndexedDB database, and offline sample. | `@claim:uc-01`, `uc-02`, `uc-06`; live `/demo`; `verify-live/screenshot-mobile.png`. |
| B-02 / UC-01–UC-25 | Retained claims registry and tests; removed obsolete paid/licensing claims UC-15, UC-16, and UC-22 with the unavailable offer. Added UC-26–UC-29 for new public facts. | Every currently listed command passed individually from a fresh clone; `npm run test:claims` 11/11. |
| B-03 | Retained real demo/app routes, route titles/canonicals, Back/focus/announcement behavior, and styled HTTP 404. | `uses real routes, titles, focus restoration, and a designed not-found screen`; live unknown URL returned HTTP 404. |
| M-01 | Retained the verb-first headline, visible sample CTA/result, and three plain facts; clarified the audience grammar and replaced price with “All tools are free.” | Cold live 390 px screenshot; `copy-audit.md`. |
| M-02 | Removed the non-purchasable paid tier fully. | Live landing/Settings/Terms crawl has no paid offer or checkout link. |
| M-03 | Retained route metadata, social card, favicon/touch icon, consistent legal chrome, mobile links, security headers, and build ID. | Live `verify-url.sh`; browser metadata/mobile test; Lighthouse SEO 100. |
| M-04 | Retained filled dossier preview and three-step workflow. | Cold live screenshot; live `/demo`. |

## Earlier copy and claim findings

| Finding ID(s) | Change made | Evidence |
| --- | --- | --- |
| COPY-L01, COPY-L02, COPY-L03, COPY-L09, COPY-L14, COPY-L18 | Previous plain-language replacements remain present. | `copy-audit.md`; cold live landing. |
| COPY-L15, COPY-L17 | Repaired the two prior false closures with the exact active artwork disclosure and clear offline toast. | `@claim:uc-25`; offline browser test; live screenshot. |
| COPY-LU03, COPY-LU04, COPY-LU05, COPY-LU06, COPY-LU07, COPY-LU19 | Previous clear action/heading replacements remain present. | Browser interaction and mobile tests; live landing. |
| COPY-R01, COPY-R02, COPY-R03, COPY-R04, COPY-R05, COPY-R06, COPY-R07, COPY-R08, COPY-R09, COPY-R10, COPY-R11, COPY-R12, COPY-R13, COPY-R15, COPY-R17, COPY-R18, COPY-R20, COPY-R22, COPY-R24, COPY-R28, COPY-R29, COPY-RU04, COPY-RU07, COPY-RU09 | README remains plain-language; paid/licensing statements were removed and the scope statement is now accurate. | `@claim:uc-23`, `uc-24`, `uc-25`, `uc-28`, `uc-29`; README audit. |
| UC-01, UC-02, UC-05, UC-07, UC-21 | Demo locality, isolation, no tracking, and no third-party assets remain tested. | Grouped tagged test passed in fresh clone and live suite. |
| UC-03, UC-04, UC-09, UC-17, UC-18, UC-19 | Encryption, wrong-passphrase, no recovery, envelope, and passphrase-memory boundaries remain tested. | Grouped tagged test passed in fresh clone and live suite. |
| UC-06, UC-08, UC-10–UC-14, UC-17–UC-21, UC-23–UC-25 | Offline, fields, safety boundaries, review, export, install, build-policy, and provenance checks remain tested. | Each exact tagged command passed in the fresh clone; full claim suite 11/11. |
| UC-15, UC-16, UC-22 | Removed because the now-removed paid tier/license service made those promises unavailable. | No offer, billing link, license client, or API request remains in the built app. |
| UC-26, UC-27, UC-28, UC-29 | Added for scope/no-upload, record-person linking, pinned Playwright, and MIT license facts. | Exact fresh-clone commands and live suite passed. |

## Final evidence

- `npm test`: passed — TypeScript, ESLint, 14 unit tests, production build, and 22 browser tests.
- `npm run test:claims`: passed 11 tagged scenarios. All 26 registered commands passed separately from a new clone without an existing `dist/` directory.
- Live browser run: `PLAYWRIGHT_BASE_URL=https://family-digital-dossier.sociobot.in npx playwright test` passed 22/22.
- Live `/opt/fleet/lib/verify-url.sh`: title, `lang=en`, one h1, main, image alt text, unlabeled-button check, and console error check all passed. Evidence: `evidence/polish-2/verify-live/verify.json`.
- Playwright axe integration passed the site’s WCAG A/AA checks. The standalone axe CLI could not create a ChromeDriver session in this container; the Playwright axe test is the authoritative recorded run.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.0 s, TBT 0 ms, CLS 0. Evidence: `evidence/polish-2/lighthouse-live.json`.
- Deployment: `5c8588f1-6598-4473-95a7-f3865dfaa173`; production returned 200 and designed unknown routes returned 404.
