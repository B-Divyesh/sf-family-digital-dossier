# Adversarial first-read review 4: Family Digital Dossier

**Verdict: PASS**

Reviewed 2026-08-28 against <https://family-digital-dossier.sociobot.in> and clean commit `71e0af2deaac134929ef349127f157627b1cf1b1`. No blocking, major, minor, copy, unlisted-claim, routing, or history-regression finding remains.

## Cold first screen

Fresh Chromium contexts, with no cookies, IndexedDB, local storage, or service-worker state, were opened at 390×844 and 1440×900 before scrolling.

| Question | 390 px | Desktop |
| --- | --- | --- |
| What does this do? | It maps locations of essential family records without storing passwords or documents. | Same. |
| For whom? | Adults helping family or an executor find records during illness or after death. | Same. |
| What should I click first? | **Try it with sample data**. The adjacent text says it opens a filled private dossier. | Same; this is the visually primary action. |

The decisive copy is visible on the first screen: “Map essential records for someone you trust”; “For adults helping family or an executor find records during illness or after death.”; “Try it with sample data”; and “The sample opens as a filled, private dossier.” The three visible facts are “Saved on this device”, “Works offline after setup”, and “All tools are free”. The first-read gate passes.

## Copy audit

Count method: Unicode word tokens; hyphenated terms count as one. Every landing/README sentence is at most 19 words. The banned-word scan found no `leverage`, `seamless`, `effortless`, `robust`, `powerful`, `intuitive`, `reimagine`, `supercharge`, `delightful`, `journey`, `ecosystem`, or “AI-powered”. No inconsistent core term, contextless heading, or non-result-naming action was found.

### Landing sentences

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

Conditional landing/system messages also pass: “Opening your dossier on this device…” (7); “JavaScript is required to encrypt and use the dossier locally.” (9); “You’re offline.” (2); “Your saved dossier still works on this device.” (8); and “The app is ready to use offline.” (7).

The heading/action review passes: “Help without sharing passwords”, “See the record guide before you start”, “Prepare the handoff in three steps”, “What this dossier does not do”, **Try it with sample data**, **Create encrypted dossier**, **Open the complete sample dossier**, **List record locations**, **Name trusted people**, and **Print or export the handoff** are understandable in isolation and name their destination or result.

### README sentences

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

The terminology is stable: **dossier**, **record**, **trusted person**, **location**, **encrypted backup**, and **spreadsheet**. The technical terms occur only in the technical/privacy explanation and have claim coverage.

## Demo and sandbox

The one-click path `/?demo=1` and `/demo` passes. The first screen is already a working Asha Mehta dossier with ten record locations, three trusted people, a populated first-hour plan, review history, and a 100% record count. It does not use placeholder data.

The persistent banner reads “Demo — sample data, nothing is saved to your dossier.” It exposes **Reset demo** and **Start for real**. Reset returned the initial Asha Mehta overview. The clean-clone UC-01/02 scenario writes an independent real-store marker, edits/resets/exits demo mode, then proves the real marker is unchanged and the `demo:family-digital-dossier` envelope is removed on exit. It also intercepts the whole flow and found no cross-origin or request-body traffic. UC-06 warms the demo, takes the browser offline, reloads `/demo`, and opens Records successfully.

## Claims

All 30 commands listed in `.factory/claims.json` were run independently from `/tmp/fdd-review4-S1LTEy`, a new `git clone --no-local` with `npm ci`. Each command builds its own `dist/`; every result was `0`.

| Claims | Result |
| --- | --- |
| UC-01–UC-14 | PASS |
| UC-16–UC-21 | PASS |
| UC-23–UC-29 | PASS |
| UC-30–UC-32 | PASS |

The 30 registered statements cover the claim-like landing, README, Privacy, and Terms copy: locality/isolation, encryption and recovery, no tracking, offline operation, record fields and secret rejection, review/export/import/print behavior, free tools, metadata/build/provenance, deletion/cache boundaries, and legal-workflow limits. No live claim-like sentence lacks a registry entry. Generic legal cautions in Terms are not product promises.

## Structure, accessibility, links, and visual identity

- Live route checks returned 200 for `/`, `/demo`, `/demo/records`, `/privacy/`, `/terms/`, robots, sitemap, favicon, touch icon, and social card. An unknown route returned a real 404 with the designed “This record route is missing” screen and recovery links.
- Home, demo, section, legal, and 404 screens have route-specific titles, descriptions, canonical URLs, OG/Twitter data, favicon/touch icon, one H1, and a main landmark. The home title is “Family Digital Dossier — map essential family records”.
- Demo navigation changed to `/demo/records`, changed the title, focused the destination H1, announced the route, and Back restored the overview route and H1 focus. Direct deep links load the expected screen.
- Header/footer retain the wordmark, Demo, Privacy, Terms, skip link, one-line purpose, external-link label, generated-art disclosure, and build identifier at 390 px and desktop. No dead product link was found.
- The full clean-clone `npm test` passed: typecheck, ESLint, 14 Vitest tests, production build, and 26 Playwright browser/accessibility/mobile/keyboard/offline/security checks. The built `app-Dfhdc2mw.js` asset matches the live application asset; it is 15.95 kB gzip. No console error occurred in the fresh live checks.
- The live CSP permits only same-origin product assets (with an unused, constrained Sociobot connect allowance); headers include `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and a restrictive Permissions Policy.
- The warm paper folio, clipped-envelope geometry, vermilion seal, editorial type pairing, and original connected-envelope art match the sealed-constellation design record. This is not a generic SaaS template.

## Earlier findings: confirmation

All earlier review, polish, and handoff records were read. These checks were repeated against live production and the current source/tests rather than accepted from a status label.

| Earlier finding IDs | Current confirmation |
| --- | --- |
| Review 1 B-01 | The seeded, one-click, isolated demo; banner; reset/exit; and offline operation are live and covered by UC-01/02/06. |
| Review 1 B-02 and UC-01–UC-25 | The registry exists; every current public claim is tagged; all 30 exact self-building commands pass independently. Removed paid/API claims are absent from public copy. |
| Review 1 B-03 | Real routes, titles, canonical paths, Back/focus/announcement behavior, and a designed HTTP 404 pass. |
| Review 1 M-01–M-04 | The clear first screen, no unavailable paid tier, complete metadata/chrome, filled preview, and three-step workflow are live. |
| Review 1 COPY-L01/L02/L03/L09/L14/L15/L17/L18 and COPY-LU03/LU04/LU05/LU06/LU07/LU19 | Every recorded landing replacement is present in the audit and live UI. |
| Review 1 COPY-R01/R02/R03/R04/R05/R06/R07/R08/R09/R10/R11/R12/R13/R15/R17/R18/R20/R22/R24/R28/R29/RU04/RU07/RU09 | The current README is plain-language, technically scoped, and free of the removed paid-tier wording. |
| Review 2 F-2-1–F-2-10 | Self-building claim commands, no checkout, clear offline/art language, scope and record-person tests, pinned Playwright/MIT tests, corrected audience sentence, and labelled external link all pass. |
| Review 3 F-3-1–F-3-4 | The untestable host/browser-data statements remain removed; real deletion, cache contents, and legal-workflow boundaries have UC-30/31/32 coverage. |
| Polish 1–3 and prior handoff extras | The visible mobile dossier navigation, free-tools proof, legal copy, generated-art provenance, and build label remain present and tested. |

## Missed leverage and AI check

No missing feature finding is justified. The brief’s immediately expected extensions—encrypted backup/restore, readable export, sealed cover printing, review history, a location drill, and links between records and trusted people—are present. Encrypted sync would materially conflict with the stated local-first recovery model. AI would receive sensitive estate context and is not needed to complete the locator job; no decorative AI, provider key, Azure endpoint, or unexplained model behavior is present.

## What would make this perfect

Nothing is currently outstanding. Maintain the same independent clean-clone claim run, cold mobile demo check, and live route/404 crawl for each future release; a new untested public statement or a changed storage/network boundary should reopen this review.
