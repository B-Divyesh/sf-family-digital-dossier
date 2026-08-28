# Polish round 3 — complete finding closure

Date: 2026-08-28  
Work order: `family-digital-dossier-polish-3`  
Reviewed candidate: `513252f5de8c1ef4bf9c0ceeb17643718800f14f`  
Repair commits: `ac6ceaa`, `3f6c202`, `d444081`  
Live site: <https://family-digital-dossier.sociobot.in>

The sealed-constellation folio identity remains intact. This round closes all four review-3 legal-route gaps, restores a test for the landing's free-tools fact, and makes every dossier section visible at 390 px without horizontal navigation clipping.

## Product and routing findings

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| B-01 | Retained direct `?demo=1`/`/demo`, filled Asha Mehta sample, isolated `demo:family-digital-dossier` store, persistent banner, reset, exit, and offline sample. | `@claim:uc-01`, `uc-02`, `uc-06`; [live demo](https://family-digital-dossier.sociobot.in/?demo=1); `evidence/polish-3/live/demo-mobile-final.png`. |
| B-02 | Kept the claim registry and made every public fact, including legal/free-tools facts, have exactly one tagged sandbox test. | Final clean clone: 30 exact commands; `claim-tag-contract=30`. |
| B-03 | Retained real History API routes, route title/canonical/focus/announcement behavior, and designed 404. | `uses real routes, titles, focus restoration, and a designed not-found screen`; live [/not-a-real-route](https://family-digital-dossier.sociobot.in/not-a-real-route) returns 404. |
| M-01 | Retained verb-first job headline, concise audience, demo CTA/result, and three verified facts. | `evidence/polish-3/live/home-mobile.png`; live landing suite. |
| M-02 | Retained no-paid-tier decision and added a direct test for “All tools are free.” | `@claim:uc-16`; live landing. |
| M-03 | Retained metadata, social card, consistent chrome, icons, mobile legal links, security headers, build ID, and 404. | Metadata/mobile browser test; `verify-url.sh`; Lighthouse SEO 100. |
| M-04 | Retained filled dossier preview and three concrete workflow steps. | Live landing/demo; `evidence/polish-3/live/home-mobile.png`. |

## Public-claim findings

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| UC-01 | Demo flow has no outbound dossier-data request. | `@claim:uc-01`; final clean clone and live suite. |
| UC-02 | Demo uses a separate encrypted store; reset/exit leave real data untouched. | `@claim:uc-02`; live demo. |
| UC-03 | Encryption happens before browser storage. | `@claim:uc-03`. |
| UC-04 | Wrong-passphrase and no-recovery boundaries remain checked. | `@claim:uc-04`. |
| UC-05 | No-tracking/network boundary remains checked. | `@claim:uc-05`. |
| UC-06 | Warmed demo reload works offline. | `@claim:uc-06`; live offline test. |
| UC-07 | Encrypted offline-guide wording remains covered. | `@claim:uc-07`. |
| UC-08 | Records locations, people, first steps, and rejects passwords. | `@claim:uc-08`. |
| UC-09 | AES-256-GCM/PBKDF2-SHA-256 parameters remain asserted. | `@claim:uc-09`. |
| UC-10 | Advertised record fields seed, display, edit, and reload. | `@claim:uc-10`. |
| UC-11 | Review schedule/history and three-record drill persist. | `@claim:uc-11`. |
| UC-12 | Backup, spreadsheet, and cover-print outcomes remain inspected. | `@claim:uc-12`. |
| UC-13 | Restore, passphrase change, install, and offline behavior remain inspected. | `@claim:uc-13`. |
| UC-14 | Entry/import/readable-output secret boundaries remain checked. | `@claim:uc-14`. |
| UC-15 | Removed with the unavailable paid tier; no price, checkout, or paid feature remains. | Live crawl; UC-16 payment-path check. |
| UC-16 | Reinstated as a precise free-tools claim: Settings and print tools are usable without a token; no billing path exists. | `@claim:uc-16`; final clean clone. |
| UC-17 | One encrypted IndexedDB envelope remains asserted. | `@claim:uc-17`. |
| UC-18 | Passphrase remains memory-only and absent from requests/storage. | `@claim:uc-18`. |
| UC-19 | No account/reset path and wrong-passphrase rejection remain asserted. | `@claim:uc-19`. |
| UC-20 | Readable print/spreadsheet boundaries remain asserted. | `@claim:uc-20`. |
| UC-21 | No analytics, third-party scripts, or remote fonts remain asserted. | `@claim:uc-21`; live suite. |
| UC-22 | Removed with licensing service; product has no product API call. | UC-16 source/UI payment-path check. |
| UC-23 | Test-command documentation remains asserted. | `@claim:uc-23`. |
| UC-24 | Hashed assets, worker versioning, and response policy remain asserted. | `@claim:uc-24`. |
| UC-25 | Artwork disclosure/provenance remain asserted with the new build label. | `@claim:uc-25`. |
| UC-26 | Scope/no-upload/account-access warning remains asserted. | `@claim:uc-26`. |
| UC-27 | Trusted-person links persist and clear after deletion. | `@claim:uc-27`. |
| UC-28 | Playwright package and lockfile version remain asserted. | `@claim:uc-28`. |
| UC-29 | MIT license fact remains asserted. | `@claim:uc-29`. |
| UC-30 | Added a real-data deletion test: create, confirm-delete, then inspect absent `vault/primary`. | `@claim:uc-30`; [live Privacy](https://family-digital-dossier.sociobot.in/privacy/). |
| UC-31 | Added cache-boundary test: shell/original illustration are cached, while a unique real record and its encrypted envelope are absent. | `@claim:uc-31`; live Privacy. |
| UC-32 | Added legal-scope test over product sections, controls, cover, downloads, and implementation. | `@claim:uc-32`; [live Terms](https://family-digital-dossier.sociobot.in/terms/). |

## Copy findings

| Finding ID(s) | Change made | Evidence |
| --- | --- | --- |
| COPY-L01, COPY-L02 | Retained “Map essential records for someone you trust”; removed the map/keys metaphor. | `copy-audit.md`; live home screenshot. |
| COPY-L03 | Retained the 14-word audience sentence. | `copy-audit.md` L02; live landing. |
| COPY-L09 | Retained precise local-encryption sentence. | UC-03; live landing. |
| COPY-L14 | Retained “A private guide to essential family records.” | `copy-audit.md`; live footer. |
| COPY-L15 | Retained active generated-art disclosure, updated to Build polish-3. | UC-25; live legal screenshots. |
| COPY-L17 | Retained clear offline-ready toast. | Offline browser test; live screenshots. |
| COPY-L18 | Retained simplified opening status. | Cold-load browser test. |
| COPY-LU03, COPY-LU04, COPY-LU05, COPY-LU06, COPY-LU07, COPY-LU19 | Retained clear result-naming actions and plain headings. | Mobile/browser interaction tests; `copy-audit.md`. |
| COPY-R01, COPY-R02, COPY-R03, COPY-R04, COPY-R05, COPY-R06, COPY-R07, COPY-R08, COPY-R09, COPY-R10, COPY-R11, COPY-R12, COPY-R13, COPY-R15, COPY-R17, COPY-R18, COPY-R20, COPY-R22, COPY-R24, COPY-R28, COPY-R29, COPY-RU04, COPY-RU07, COPY-RU09 | Retained plain-language README replacements and removed obsolete paid-tier wording. | `copy-audit.md`; UC-23/24/25/28/29. |

## Review-2 findings

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Each registry command still builds its own dist from a no-dist clone. | Final clean clone: all 30 exact commands passed. |
| F-2-2 | Dead checkout/billing client remain removed. | UC-16; live crawl. |
| F-2-3 | Clear offline-ready toast remains live. | Offline test; screenshots. |
| F-2-4 | Active generated-art disclosure remains live. | UC-25; live legal screenshots. |
| F-2-5 | Scope warning remains specific and tested. | UC-26. |
| F-2-6 | Record-to-person relationship remains tested end to end. | UC-27. |
| F-2-7 | Playwright pin remains tested. | UC-28. |
| F-2-8 | MIT license remains tested. | UC-29. |
| F-2-9 | Audience grammar remains corrected. | `copy-audit.md` L02; live landing. |
| F-2-10 | Param Factory link remains labelled as external. | Browser accessibility test; live footer. |

## Review-3 findings

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Removed untestable hosting-log-retention statement. | [Live Privacy](https://family-digital-dossier.sociobot.in/privacy/); `evidence/polish-3/live/privacy-desktop.png`. |
| F-3-2 | Removed unportable browser-site-data promise and added real Settings deletion proof. | UC-30; live Privacy. |
| F-3-3 | Narrowed cache wording and added cache-content/no-dossier test. | UC-31; live Privacy. |
| F-3-4 | Kept necessary legal boundary, stated as no workflow, and added control/output/source test. | UC-32; live Terms and `evidence/polish-3/live/terms-desktop.png`. |

## Additional final polish

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| P3-MOBILE-01 | Replaced scroll-clipped mobile dossier navigation with a two-row, three-column grid. | `keeps legal navigation and layout usable at 390px`; `evidence/polish-3/live/demo-mobile-final.png`. |
| P3-CLAIM-01 | Added explicit proof for landing’s “All tools are free” fact. | UC-16; final clean clone. |

## Verification and deployment

- Final clean clone at `d444081`: `npm ci`; all 30 exact `.factory/claims.json` commands passed independently with no pre-existing `dist/`.
- Final clean-clone `npm test`: TypeScript, ESLint, 14 unit tests, production build, and 26 browser tests passed.
- Live final browser run: `PLAYWRIGHT_BASE_URL=https://family-digital-dossier.sociobot.in npx playwright test` passed 25/25 against the deployed product artifact.
- Final `verify-url.sh`: title, `lang=en`, one H1, main, alt text, button labels, and console checks passed. Evidence: `evidence/polish-3/verify-live-final/verify.json`.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 40 ms, CLS 0. Evidence: `evidence/polish-3/lighthouse-live.json`.
- Deployed product artifact: `3f6c202`, Azure Static Web Apps deployment `e0717072-a504-4323-8425-1be3b23fbc3b`; verified at <https://family-digital-dossier.sociobot.in>.
