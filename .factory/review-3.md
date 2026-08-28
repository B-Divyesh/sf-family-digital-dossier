# Adversarial first-read review 3: Family Digital Dossier

**Verdict: FAIL**

Reviewed 2026-08-28 against <https://family-digital-dossier.sociobot.in> and clean commit `513252f5de8c1ef4bf9c0ceeb17643718800f14f`. The first-read, demo, functional claims, routing, and visual checks pass. The verdict remains FAIL because four concrete privacy/scope statements on the live legal routes have no `.factory/claims.json` entry or sandbox test. The public-claims rule applies to those routes too.

## Cold first screen

Fresh Chromium contexts with no cookies, IndexedDB, local storage, or service-worker state were opened at 390×844 and 1440×900 before scrolling. No console errors were emitted.

| Question | 390 px | Desktop |
| --- | --- | --- |
| What does it do? | It maps locations of essential family records without storing passwords. | Same. |
| For whom? | Adults helping family or an executor find records during illness or after death. | Same. |
| What should I click first? | **Try it with sample data**; the next line says it opens a filled private dossier. | Same; it is the primary action. |

The gate passes. The exact above-the-fold copy is “Map essential records for someone you trust,” “For adults helping family or an executor find records during illness or after death.”, “Try it with sample data,” and “The sample opens as a filled, private dossier.” The three plain facts are visible at 390 px: “Saved on this device,” “Works offline after setup,” and “All tools are free.”

## Findings

### MAJOR F-3-1 — Privacy policy makes an unlisted hosting-log claim

**Location and quote:** `/privacy/`, “The static hosting provider may retain ordinary server access logs such as IP address, URL, and browser information for security and reliability.”

**Why this matters:** this tells a visitor what another party may retain about their use of a sensitive estate-record product. None of the 26 claim entries names hosting logs or has a test that verifies the applicable hosting policy. UC-01/05/21 prove the app does not transmit dossier data, tracking, or third-party assets; they do not prove this retention statement.

**Concrete fix:** remove this unverified provider-policy statement, or add a `hosting-log-disclosure` claim that links the exact hosting policy and a reviewable fixture/evidence check. Do not imply a retention practice that the sandbox cannot establish.

### MAJOR F-3-2 — Privacy policy makes two unlisted deletion claims

**Location and quote:** `/privacy/`, “Settings → Delete this dossier removes the encrypted local copy. Clearing browser site data also removes it.”

**Why this matters:** a visitor can reasonably rely on both statements when removing a dossier from a shared or replaced device. No claim entry covers the delete control, removal of `vault/primary`, or the browser-site-data outcome. UC-02 covers demo isolation, not real-data deletion.

**Concrete fix:** add separate claims/tests from a clean real-data fixture: one must create and delete an encrypted envelope through Settings and assert the real IndexedDB record is absent; the other must clear site data and assert the database is absent. If the latter cannot be made portable across browser runners, remove that sentence.

### MAJOR F-3-3 — Privacy policy makes unlisted cache-content claims

**Location and quote:** `/privacy/`, “The service worker stores the application shell and illustration so the app opens without a connection. It does not place your dossier records in the cache.”

**Why this matters:** the visitor is asked to trust exactly what an offline PWA persists. UC-06 proves an offline reload, but its registered claim is only “The app works offline after the first visit”; it does not name or assert the illustration cache contents or the absence of dossier content in Cache Storage.

**Concrete fix:** add `offline-cache-contents` to `claims.json` and a demo test that enumerates Cache Storage after use, asserts the documented shell/illustration resources, and asserts neither known sample values nor the encrypted IndexedDB envelope appear there. Otherwise narrow the sentence to the existing tested offline claim.

### MAJOR F-3-4 — Terms make an unlisted legal-document/authority scope claim

**Location and quote:** `/terms/`, “The app does not create a will, trust, power of attorney, beneficiary designation, or authority to access an account.”

**Why this matters:** this is an important scope boundary for someone choosing a tool for an executor. UC-26 verifies no upload or account-access feature and a sensitive-paste warning, but it does not test that the product has no will, trust, power-of-attorney, or beneficiary-generation path.

**Concrete fix:** add a scoped `no-legal-document-generation` claim and a source/UI test asserting that no route, control, export, or generated output creates the named legal instruments or account authority. Alternatively replace the statement with the already tested “The app has no document upload or account-access feature. It does not give legal advice.”

## Copy audit

Counts use Unicode word tokens; hyphenated terms and version strings count as one. The audit covers every landing/README prose sentence, including steady-state status copy. No audited sentence exceeds 22 words. No banned marketing term occurs. No heading is unclear out of context, and every button/link action names its result.

### Landing page

| ID | Words | Sentence |
| --- | ---: | --- |
| L01 | 7 | Map essential records for someone you trust |
| L02 | 14 | For adults helping family or an executor find records during illness or after death. |
| L03 | 8 | The sample opens as a filled, private dossier. |
| L04 | 4 | Saved on this device |
| L05 | 4 | Works offline after setup |
| L06 | 4 | All tools are free |
| L07 | 7 | Never enter a password or recovery code. |
| L08 | 10 | Record what exists, where it is, and who to contact. |
| L09 | 13 | Preview locations, trusted people, review dates, and first steps without entering personal details. |
| L10 | 9 | Name each record and point to its safe location. |
| L11 | 4 | Keep every secret elsewhere. |
| L12 | 13 | Link a family member or professional to each record when they can help. |
| L13 | 12 | Review the dossier, then print a cover or save an encrypted backup. |
| L14 | 9 | The app has no document upload or account-access feature. |
| L15 | 9 | Do not paste passwords or document contents into notes. |
| L16 | 6 | It does not give legal advice. |
| L17 | 10 | Your passphrase encrypts the dossier before this browser saves it. |
| L18 | 7 | There is no account or recovery reset. |
| L19 | 10 | Your passphrase encrypts the dossier before this browser saves it. |
| L20 | 6 | We cannot see or recover it. |
| L21 | 9 | Use 4–6 unrelated words (at least 12 characters). |
| L22 | 9 | Store a copy somewhere your executor can eventually access. |
| L23 | 13 | I understand there is no reset or recovery if I lose this passphrase. |
| L24 | 7 | A private guide to essential family records. |
| L25 | 7 | Opening your dossier on this device… |
| L26 | 9 | JavaScript is required to encrypt and use the dossier locally. |
| L27 | 2 | You’re offline. |
| L28 | 8 | Your saved dossier still works on this device. |
| L29 | 7 | The app is ready to use offline. |

Headings/actions checked: “Help without sharing passwords,” “Try it with sample data,” “Create encrypted dossier,” “See the record guide before you start,” “Prepare the handoff in three steps,” “List record locations,” “Name trusted people,” “Print or export the handoff,” and “What this dossier does not do.” They are clear and use stable terms: dossier, record, trusted person, location, encrypted backup, and spreadsheet.

### README

| ID | Words | Sentence |
| --- | ---: | --- |
| R01 | 14 | Family Digital Dossier stores an encrypted guide to essential family records on your device. |
| R02 | 7 | It works offline after the first visit. |
| R03 | 9 | Open the live app or try the sample dossier. |
| R04 | 14 | It is for adults preparing records for family, an executor, or another trusted person. |
| R05 | 9 | The app has no document upload or account-access feature. |
| R06 | 9 | Do not paste passwords or document contents into notes. |
| R07 | 6 | It does not give legal advice. |
| R08 | 13 | Encrypts dossier content on this device with a key created from your passphrase. |
| R09 | 7 | The technical method is AES-256-GCM with PBKDF2-SHA-256. |
| R10 | 15 | Records institutions, document locations, reference names, renewal dates, contacts, and what family should do first. |
| R11 | 17 | Schedules a review every six months, keeps past reviews, and checks whether someone can find three records. |
| R12 | 5 | Prints a sealed cover sheet. |
| R13 | 8 | Exports an encrypted backup or a readable spreadsheet. |
| R14 | 17 | Restores backups, changes passphrases, works offline after the first visit, and can be installed on a device. |
| R15 | 9 | Rejects text that resembles a password or recovery code. |
| R16 | 8 | Blocks readable exports until detected secrets are removed. |
| R17 | 16 | The browser stores one encrypted copy of the dossier in an IndexedDB database on this device. |
| R18 | 8 | Demo data uses a separate `demo:family-digital-dossier` database. |
| R19 | 11 | The passphrase stays in memory only while the dossier is open. |
| R20 | 6 | It is never stored or sent. |
| R21 | 7 | There is no account or recovery reset. |
| R22 | 11 | If you lose every usable passphrase copy, you lose the dossier. |
| R23 | 4 | Keep an encrypted backup. |
| R24 | 10 | Arrange for the right person to receive the passphrase separately. |
| R25 | 10 | Spreadsheet exports and printed pages are readable and not encrypted. |
| R26 | 6 | Protect exported files and printed pages. |
| R27 | 10 | The app has no analytics, third-party scripts, or remote fonts. |
| R28 | 6 | Use Node.js 20 or newer. |
| R29 | 12 | `npm test` runs type checks, linting, unit tests, and a production build. |
| R30 | 11 | It then runs browser, accessibility, mobile, keyboard, privacy, and offline checks. |
| R31 | 7 | Playwright is pinned to 1.58.2. |
| R32 | 19 | Run checks separately with `npm run typecheck`, `npm run lint`, `npm run test:unit`, or `npm run test:e2e`. |
| R33 | 6 | Run all public claim checks with: |
| R34 | 7 | The production command is `npm run build`. |
| R35 | 12 | Static output lands in `dist/`, with `dist/index.html` at its root. |
| R36 | 10 | The build creates versioned assets and a matching offline worker. |
| R37 | 12 | It also copies the Azure Static Web Apps response and cache configuration. |
| R38 | 5 | Deploy the contents of `dist/`. |
| R39 | 9 | The factory manages hosting, domain setup, and release configuration. |
| R40 | 6 | The project uses the MIT license. |
| R41 | 5 | The footer discloses generated imagery. |
| R42 | 13 | Its prompt and generator are recorded in `.factory/design.md` and `assets/src/`. |

## Demo and sandbox

The one-click demo passes. `/?demo=1` and `/demo` immediately show the heading “Asha Mehta’s dossier,” ten realistic record locations, three trusted people, instructions, and review history. The persistent banner reads “Demo — sample data, nothing is saved to your dossier.” and includes **Reset demo** and **Start for real**.

A fresh live-context probe created `{marker: "review-3-real"}` in `family-digital-dossier`, entered/reset the demo, then inspected both databases. The real marker was unchanged; `demo:family-digital-dossier` held an encrypted ciphertext envelope; no external request occurred. The dedicated UC-01/02 test additionally verifies reset and exit remove demo storage. UC-06 warms `/demo`, disables networking, reloads it, opens Records, and finds “Term life insurance policy.”

## Claims

From a new `git clone --no-local` plus `npm ci`, every exact command in the current registry passed independently. The commands build their own `dist/`, closing review-2 F-2-1/B-02.

| Claims | Result |
| --- | --- |
| UC-01 through UC-14 | PASS |
| UC-17 through UC-21 | PASS |
| UC-23 through UC-29 | PASS |

There are 26 current entries; UC-15, UC-16, and UC-22 were deliberately removed with the unavailable paid tier. The functional claims are covered by 11 grouped tagged Playwright scenarios, but every registry command was invoked separately. No listed claim test failed.

## Earlier-finding verification

Every earlier finding was checked live and in the current source/tests rather than accepted from the polish reports.

| Earlier finding(s) | Result and evidence |
| --- | --- |
| Review-1 B-01 | Fixed: visible seeded demo, isolated `demo:family-digital-dossier`, reset/exit, and offline demo all verified. |
| Review-1 B-02; review-2 F-2-1 | Fixed: registry exists and all 26 exact clean-clone commands pass independently. |
| Review-1 B-03 | Fixed: live demo deep links, route titles, canonical URLs, Back, focused H1, live route status, and HTTP 404 all pass. |
| Review-1 M-01, M-02, M-03, M-04 | Fixed: first-screen shape, removed paid offer, complete metadata/shared chrome, filled preview, and three-step workflow are live. |
| Review-1 COPY-L01, COPY-L02, COPY-L03, COPY-L09, COPY-L14, COPY-L15, COPY-L17, COPY-L18 | Fixed: each replacement is present in current source and live copy. |
| Review-1 COPY-LU03, COPY-LU04, COPY-LU05, COPY-LU06, COPY-LU07, COPY-LU19 | Fixed: fresh-device actions and all named headings use the recorded clear wording. |
| Review-1 COPY-R01, COPY-R02, COPY-R03, COPY-R04, COPY-R05, COPY-R06, COPY-R07, COPY-R08, COPY-R09, COPY-R10, COPY-R11, COPY-R12, COPY-R13, COPY-R15, COPY-R17, COPY-R18, COPY-R20, COPY-R22, COPY-R24, COPY-R28, COPY-R29, COPY-RU04, COPY-RU07, COPY-RU09 | Fixed: the current README matches the audited plain-language replacements; removed paid-tier copy is absent. |
| Review-2 F-2-2 | Fixed: no paid copy, billing client, or checkout link remains. |
| Review-2 F-2-3 / COPY-L17 | Fixed: current source and live toast say “The app is ready to use offline.” |
| Review-2 F-2-4 / COPY-L15 | Fixed: current source and live footer say “We generated the original artwork for this product. Build polish-2.” |
| Review-2 F-2-5 | Fixed: scope copy is covered by UC-26 and its tagged test. |
| Review-2 F-2-6 | Fixed: record-person linking is covered by UC-27 and its tagged test. |
| Review-2 F-2-7 | Fixed: UC-28 checks the exact Playwright package and lockfile version. |
| Review-2 F-2-8 | Fixed: UC-29 checks the MIT license. |
| Review-2 F-2-9 | Fixed: the live audience sentence says “For adults helping family or an executor…” |
| Review-2 F-2-10 | Fixed: the only external link says “Built by Param Factory (opens external).” |

The four new legal-route registry gaps above are not regressions of a prior closed finding; they are newly identified unlisted claims.

## Structure, links, accessibility, and identity

- Titles, one H1, descriptions, canonical URLs, OG image, favicon, and touch icon were checked on home, demo, all six demo views, Privacy, Terms, and the 404 page. Titles use the required product/title pattern.
- `/not-a-real-route` returns HTTP 404 and the designed “This record route is missing” recovery screen. Demo navigation to Records changes the URL to `/demo/records`, sets “Records — Family Digital Dossier,” focuses “Essential records,” announces “Records loaded,” and Back restores the overview H1/focus.
- A live crawl found working first-party navigation, assets, `mailto:` contacts, and the labelled external Param Factory link. The 404 page’s skip fragment resolves within the current designed 404 rather than a product route; it is not a dead visitor action.
- The local full suite completed its typecheck, lint, 14 unit tests, build, and browser checks; the claim runs above are the authoritative independent claim evidence.
- The warm folio palette, clipped-sheet shapes, editorial serif/sans pairing, original envelope art, and vermilion seal are distinct from a generic SaaS template and match `.factory/design.md`. No runtime AI feature or embedded provider key was found.

## Missed leverage

No additional feature finding is justified. The brief’s obvious follow-ons—backup/restore, readable export, sealed cover printing, review history, and a three-record drill—are present. Encrypted cloud sync would expand the local-first recovery model materially. AI would receive sensitive estate context without being necessary to the locator job.

## What would make this perfect

1. Remove or register/test F-3-1 through F-3-4 exactly as described.
2. Re-run every registry command from a no-`dist/` clone and repeat the live cold/demo/privacy checks.
3. Return PASS only after the legal routes contain no untested factual privacy or scope promise.
