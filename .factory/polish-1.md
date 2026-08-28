# Polish round 1 — finding closure

Date: 2026-08-28  
Work order: `family-digital-dossier-polish-1`  
Reviewed candidate: `fe96fa7b266269c5fdad3e915de9685dc8004793`  
Repair implementation: `9417840369ddb9091b8fb2fb28edaa3584fe4a05` through `56d22bde5d51a80122e609ff667085860371635e`  
Live site: <https://family-digital-dossier.sociobot.in>

Only `.factory/review-1.md` existed at the start of this round. There were no earlier polish reports. Every finding below is closed.

## Review findings

| ID | Change made | Evidence |
| --- | --- | --- |
| B-01 | Added one-click `/?demo=1` and `/demo`, a prefilled Asha Mehta dossier, persistent demo banner, Reset demo, Start for real, and the separate `demo:family-digital-dossier` database. Leaving demo deletes that database and never reads or writes the real database. Documented the sandbox in `.factory/demo.md`. | Playwright: `demo is useful, isolated, local, and tracker-free`; live `/demo` and `/?demo=1`; `.factory/evidence/polish-1/live-mobile-demo.png`; `.factory/evidence/polish-1/live-desktop-demo.png`. |
| B-02 | Added `.factory/claims.json` with 25 claims and exactly one matching `@claim:uc-NN` tag per claim. Tests exercise outcomes through a clean demo, including storage, crypto, exports, offline behavior, privacy, paid unlocks, build output, and provenance. | All 25 listed commands passed separately in the clean clone; `.factory/evidence/polish-1/clean-clone-claim-tests.log`; the live browser suite passed 19/19 in `.factory/evidence/polish-1/live-browser-suite.log`. |
| B-03 | Added real app and demo section URLs, `pushState` and `popstate`, scroll restoration, route-specific titles/canonicals, one view `<h1>`, heading focus, a polite announcement, explicit host rewrites, and a styled HTTP 404. | Playwright: `uses real routes, titles, focus restoration, and a designed not-found screen`; live `/records`, `/demo/records`, and `/definitely-not-a-real-route` returned 200, 200, and 404; `.factory/evidence/polish-1/live-mobile-404.png`. |
| M-01 | Replaced metaphorical first-screen copy with the seven-word job headline, a 14-word audience sentence, the sample action and outcome, plus tested device/offline/price facts. | `.factory/copy-audit.md`; Playwright mobile layout test; live `/`; `.factory/evidence/polish-1/live-mobile-home.png`. |
| M-02 | Added “Dossier Plus — ₹799 once,” both paid features, named free features, billing boundary, checkout link, and the same clear terms in settings and `/terms/`. | Playwright: `Plus terms, free tools, and daily license verification behave as stated`; live `/` and `/terms/`; desktop home screenshot. |
| M-03 | Added route metadata, 1200×630 social art, SVG favicon, 180px touch icon, shared route chrome, visible mobile legal links, factory credit, build ID, security headers, robots, and sitemap. | Playwright: `ships complete route metadata and accessible demo, legal, and not-found pages` and `keeps legal navigation and layout usable at 390px`; live assets all returned 200; Lighthouse SEO 100. |
| M-04 | Added a filled read-only dossier preview and the verb-led List, Name, Print/export workflow while retaining the sealed-constellation identity. | Live `/`; `.factory/evidence/polish-1/live-mobile-home.png` and `live-desktop-home.png`; Playwright mobile layout test. |

## Claim findings

Every row uses the matching command in `.factory/claims.json`. The clean-clone command log is `.factory/evidence/polish-1/clean-clone-claim-tests.log`. The same tests also passed against the cold live site.

| ID | Change made | Test and live check |
| --- | --- | --- |
| UC-01 | Split the outcome into a local-data statement and intercepted the entire demo flow. | `demo is useful, isolated, local, and tracker-free`; live `/demo`. |
| UC-02 | Proved reload persistence and that only the `demo:` database changes. | `demo is useful, isolated, local, and tracker-free`; live `/demo`. |
| UC-03 | Inspected the encrypted envelope and decrypted it only with the sample passphrase. | `encryption and recovery boundaries hold`; live `/demo`. |
| UC-04 | Proved a wrong passphrase fails and no recovery or remote-key path exists. | `encryption and recovery boundaries hold`; live `/demo`. |
| UC-05 | Asserted no cookies, beacons, analytics, third-party assets, or outbound data flow. | `demo is useful, isolated, local, and tracker-free`; live `/demo`. |
| UC-06 | Warmed the service worker, disabled networking, reloaded a new demo page, and used the sample. | `backup restore, passphrase change, install metadata, and offline demo work`; live `/demo`. |
| UC-07 | Narrowed README wording and proved encryption, sample records, and offline reload. | `demo is useful, isolated, local, and tracker-free`; live `/demo`. |
| UC-08 | Asserted location, trusted-person, and first-step fields plus secret rejection. | `fields persist and secret boundaries cover entry, import, display, export, and print`; live `/demo/records`. |
| UC-09 | Asserted AES-256-GCM, PBKDF2-SHA-256 parameters, local round trip, and no plaintext. | `encryption and recovery boundaries hold`; live `/demo`. |
| UC-10 | Seeded, displayed, edited, and reloaded every named record field. | `fields persist and secret boundaries cover entry, import, display, export, and print`; live `/demo/records`. |
| UC-11 | Completed a review and three-record drill, then checked history and the next date after reload. | `review schedule, history, and three-record drill persist`; live `/demo/review`. |
| UC-12 | Parsed both downloads and captured print output to verify their contents. | `encrypted backup, readable spreadsheet, and sealed-cover print contain the promised output`; live `/demo/settings`. |
| UC-13 | Restored a backup, changed the passphrase, checked manifest/service worker, and reloaded offline. | `backup restore, passphrase change, install metadata, and offline demo work`; live `/demo/settings`. |
| UC-14 | Tested likely secrets at entry/import and in legacy display, spreadsheet, and print paths. | `fields persist and secret boundaries cover entry, import, display, export, and print`; live `/demo/records`. |
| UC-15 | Mocked a valid Sociobot license, verified ₹799 once, and unlocked both Plus features. | `Plus terms, free tools, and daily license verification behave as stated`; live `/` and `/terms/`. |
| UC-16 | Verified encryption, reviews, cover printing, and exports with no license. | `Plus terms, free tools, and daily license verification behave as stated`; live `/demo/settings`. |
| UC-17 | Asserted one encrypted envelope in the documented IndexedDB store. | `encryption and recovery boundaries hold`; live `/demo`. |
| UC-18 | Inspected storage and request bodies before and after lock; the passphrase is absent. | `encryption and recovery boundaries hold`; live `/demo`. |
| UC-19 | Proved no account/recovery route and that a copied envelope rejects a wrong passphrase. | `encryption and recovery boundaries hold`; live `/demo`. |
| UC-20 | Asserted known readable values in the spreadsheet and printed page after warnings. | `encrypted backup, readable spreadsheet, and sealed-cover print contain the promised output`; live `/demo/settings`. |
| UC-21 | Inspected landing/demo scripts, styles, fonts, requests, and cookies. | `demo is useful, isolated, local, and tracker-free`; live `/` and `/demo`. |
| UC-22 | Proved zero product API calls without a token and one documented license call per day with one. | `Plus terms, free tools, and daily license verification behave as stated`; live `/demo/settings`. |
| UC-23 | Added a documentation-contract test and ran the documented suite. | `documentation, build outputs, policies, and artwork provenance match the product`; clean-clone `npm test`. |
| UC-24 | Asserted hashed assets, matching service worker references, and Azure response/cache policies. | `documentation, build outputs, policies, and artwork provenance match the product`; live hashed JS/CSS checks. |
| UC-25 | Asserted footer disclosure, design provenance, prompt sidecar, and shipped hero match. | `documentation, build outputs, policies, and artwork provenance match the product`; live `/`. |

## Copy findings

All replacement sentences and their word counts are recorded in `.factory/copy-audit.md`. The landing copy is visible in the live home screenshots; README findings are checked by UC-23.

| ID | Change made | Evidence |
| --- | --- | --- |
| COPY-L01 | Replaced “Leave a map.” with the job headline. | Copy audit L01; live `/`. |
| COPY-L02 | Removed “Keep the keys.” and its credential ambiguity. | Copy audit L01; live `/`. |
| COPY-L03 | Replaced the 25-word sentence with the 14-word audience sentence. | Copy audit L02; live `/`. |
| COPY-L09 | Changed the storage claim to “Your passphrase encrypts the dossier before this browser saves it.” | Copy audit L15; UC-03. |
| COPY-L14 | Replaced the metaphor with “A private guide to essential family records.” | Copy audit L26; live `/`. |
| COPY-L15 | Rewrote the image disclosure in active voice. | Footer on live `/`; UC-25. |
| COPY-L17 | Replaced the fragment with a clear offline-ready status. | Live `/`; offline Playwright test. |
| COPY-L18 | Simplified the loading message to “Opening your dossier on this device…”. | Source copy audit and live cold load. |
| COPY-LU03 | Fresh devices show “Create a dossier”; saved devices show the literal “Unlock dossier.” | Live `/`; core interaction test. |
| COPY-LU04 | Replaced “Findability” with “Help without sharing passwords.” | Copy audit actions; live `/`. |
| COPY-LU05 | Standardized on “Create encrypted dossier.” | Copy audit actions; live `/`. |
| COPY-LU06 | Replaced the vague pronoun action with “See the record guide before you start.” | Copy audit actions; live `/`. |
| COPY-LU07 | Replaced the jargon heading with “What this dossier does not do.” | Copy audit actions; live `/`. |
| COPY-LU19 | Replaced “continuity record” with “private guide to essential family records.” | Copy audit terminology; live loading shell. |
| COPY-R01 | Replaced “offline-first locator” with an encrypted guide that works offline. | README opening; UC-07. |
| COPY-R02 | Split the 35-word sentence and removed password-vault metaphor. | README Who it is for; UC-08. |
| COPY-R03 | Replaced “practical handoff” with preparing records for a trusted person. | README Who it is for; UC-23. |
| COPY-R04 | Replaced implementation-heavy encryption prose with plain device wording and a separate technical sentence. | README What it does; UC-09. |
| COPY-R05 | Replaced “Maps” with “Records” and concrete field names. | README What it does; UC-10. |
| COPY-R06 | Replaced “findability drill” with a direct three-record check description. | README What it does; UC-11. |
| COPY-R07 | Split and simplified the entry/import/export secret rule. | README What it does; UC-14. |
| COPY-R08 | Explained JSON/CSV as encrypted backup and readable spreadsheet. | README What it does; UC-12. |
| COPY-R09 | Replaced “rotates” and “PWA” with changes passphrases and installs on a device. | README What it does; UC-13. |
| COPY-R10 | Replaced “credential-shaped” and “readable export” jargon with direct secret language. | README What it does; UC-14. |
| COPY-R11 | Explained both Plus features and stated ₹799 once. | README What it does; UC-15. |
| COPY-R12 | Named encryption, reviews, cover printing, and both exports as free. | README What it does; UC-16. |
| COPY-R13 | Replaced “encrypted envelope in browser IndexedDB” with a plain sentence, retaining details separately. | README privacy section; UC-17. |
| COPY-R15 | Split and simplified the no-recovery warning. | README privacy section; UC-19. |
| COPY-R17 | Replaced unexplained CSV with “spreadsheet exports.” | README privacy section; UC-20. |
| COPY-R18 | Replaced abstract responsibility wording with “Protect exported files and printed pages.” | README privacy section; UC-23. |
| COPY-R20 | Named the Sociobot licensing service and the condition for contact. | README privacy section; UC-22. |
| COPY-R22 | Split the overloaded test-suite sentence into two short sentences. | README Develop and verify; UC-23. |
| COPY-R24 | Replaced “gates” with “checks.” | README Develop and verify; UC-23. |
| COPY-R28 | Split and explained versioned assets, offline worker, and Azure configuration. | README Develop and verify; UC-24. |
| COPY-R29 | Split deployment instructions and replaced infrastructure jargon. | README Develop and verify; UC-23. |
| COPY-RU04 | Changed the heading to “Privacy and lost passphrases.” | README; UC-23. |
| COPY-RU07 | Replaced the unclear “Live” label with linked “live app” prose. | README opening; UC-23. |
| COPY-RU09 | Changed “asset provenance” to “Visual design and image sources.” | README references; UC-25. |

## Verification evidence

- Clean clone at implementation commit `030cedbde084d3dd12dd3bab1c3eeff7d95e07c1`: `npm ci` reported zero vulnerabilities; `npm test` passed 14 unit and 19 browser tests.
- All 25 claim commands from `.factory/claims.json` passed separately in that clean clone.
- Final local tree through `56d22bde5d51a80122e609ff667085860371635e`: `npm test` passed again, including 19/19 Playwright tests.
- Final live browser run: 19/19 passed, including axe, keyboard, reduced motion, mobile, privacy, offline, metadata, route, and 404 checks.
- Factory URL verification: HTTP 200, no console errors, title/lang/main present, one H1, no missing alt, and no unlabeled buttons.
- Live Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 0 ms, CLS 0.
- Live internal crawl: all documented internal routes returned 200; the unknown route returned the intended 404.
- Production artifact: JS 58.93 kB raw / 17.61 kB gzip; CSS 15.12 kB raw / 4.28 kB gzip; social image 111.6 kB.
- Deployment `63d621cc-c6b4-4498-a5c2-62363a06369e`; the deployed HTML and JS hashes match the local `dist/` files.

There are no unresolved findings or deferred minor items.
