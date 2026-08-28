# Adversarial first-read review 2: Family Digital Dossier

**Verdict: FAIL**

Reviewed 2026-08-28 against live production at <https://family-digital-dossier.sociobot.in> and clean commit `263cb354297b67351c0104822a5d7d5d705ff888`. Four findings are blocking. Passing aggregate and live suites do not override 25 claim commands that fail exactly as registered.

## Cold first screen

Fresh browser contexts opened at 390×844 and 1440×900 with no cookies, IndexedDB, local storage, or service-worker state. These answers were recorded before scrolling.

| Question | 390 px | Desktop |
| --- | --- | --- |
| What does this do? | It maps the locations of essential records for a trusted person without storing passwords. | Same. |
| For whom? | An adult preparing family or an executor to find records during illness or death. | Same. |
| What should I click first? | **Try it with sample data.** The next line says it opens a filled sample. | **Try it with sample data.** It is the visually primary action. |

The first-read gate passes. The exact first-screen copy includes “Map essential records for someone you trust,” “For adults preparing family or an executor to find records during illness or death,” **Try it with sample data**, its result sentence, and the three device/offline/price facts. At 390 px all are visible before scrolling. The audience sentence is understandable but awkward; see F-2-9.

## Findings

### BLOCKING F-2-1 / B-02 — Every registered claim command fails from a clean clone

**Location and quote:** all 25 entries in `.factory/claims.json` use a command shaped like `npm run test:claims -- --grep @claim:uc-01`. `package.json` defines `test:claims` as `playwright test tests/e2e/claims.spec.ts`, while Playwright starts `npm run preview` and does not build first.

**Observed result:** a fresh local clone had no `dist/`. Vite Preview returned an empty HTTP 404 at `/?demo=1`. Every UC-01 through UC-25 command failed at `openDemo()` because “Demo — sample data, nothing is saved to your dossier.” could not be found. This reopens review-1 B-02 and every UC finding as blocking: the required clean-clone claim contract is not runnable. Running `npm run build && npm run test:claims` afterward passed all eight grouped scenarios, but that is not any command listed in the registry.

**Why this matters:** a verifier following the published commands cannot prove any public promise. Prior passing runs depended on a build artifact created by an earlier command.

**Concrete fix:** make every registered command self-contained. For example, define `test:claims` as `npm run build && playwright test tests/e2e/claims.spec.ts`, or make Playwright's local web server build before preview. Delete `dist/`, clone afresh, and run each of the 25 registry commands independently in CI.

### BLOCKING F-2-2 — The paid product link is dead and UC-15 does not test checkout

**Location and quote:** landing: “Dossier Plus — ₹799 once,” “Sociobot and Dodo handle checkout,” and **Buy Dossier Plus**. README: “The factory manages hosting, domain setup, billing registration, and checkout.”

**Observed result:** the anchor resolves to `https://api.sociobot.in/api/v1/products/family-digital-dossier/checkout`, which returns HTTP 404 with `{"error":"enabled factory product","status":404}`. UC-15 only checks the displayed price, mocks a verification response, inserts a token directly into local storage, and confirms features appear. It never opens or validates checkout.

**Why this matters:** a visitor is offered a paid tier that cannot be bought. The merchant and factory-checkout statements are both unlisted and contradicted by the live link.

**Concrete fix:** enable this product in the Sociobot billing system, or hide all purchase copy until it is enabled. Add a UC-15 assertion that follows the exact public checkout URL to a usable checkout showing the same one-time ₹799 product and returns safely to the app. Rename the link to **Buy Dossier Plus on Sociobot (opens external)**.

### BLOCKING F-2-3 / COPY-L17 — The unclear offline toast from review 1 is still live

**Location and quote:** live first load and `src/main.ts`: “Offline copy ready.”

**Observed result:** review 1 required “The app is ready to use offline.” Polish 1 says that replacement was made, but the old phrase appears in the current source and appeared over the 390 px and desktop first screens.

**Why this matters:** “copy” does not identify whether an app shell, dossier backup, or user data is ready. It is also a prior finding marked fixed without the stated live change, so the history rule makes it blocking again.

**Concrete fix:** replace it with **The app is ready to use offline.** Verify that exact toast after service-worker installation in a fresh browser.

### BLOCKING F-2-4 / COPY-L15 — The image disclosure remains a passive fragment

**Location and quote:** landing footer: “Original generated artwork · Build polish-1”.

**Observed result:** review 1 asked for the active sentence “We generated the hero image for this product.” Polish 1 says it changed the footer to active voice. The current footer is still a fragment and does not identify who generated the artwork.

**Why this matters:** the provenance disclosure remains less direct than the promised repair. Because this earlier finding is not actually fixed, the history rule makes it blocking again.

**Concrete fix:** use **We generated the original artwork for this product. Build polish-1.** Keep the detailed prompt and generator record linked from the README.

### MAJOR F-2-5 — The negative-scope sentence is broader than its listed test

**Location and quote:** landing: “It does not store passwords, copy documents, access accounts, or replace legal advice.” README: “It does not store passwords, create legal documents, access accounts, or give legal advice.”

**Observed result:** UC-08 and UC-14 cover record fields and likely-secret rejection. No claim entry covers document copying, account access, or legal-advice scope. The free-text notes fields can accept document prose, so “does not store … documents” is not an enforced data boundary.

**Why this matters:** a visitor may rely on this sentence when deciding what sensitive text is safe to enter. The claim is partly unlisted and partly broader than observed behavior.

**Concrete fix:** rewrite both locations to **The app has no document upload or account-access feature. Do not paste passwords or document contents into notes. It does not give legal advice.** Add a claim entry that checks the absence of upload/account integrations, the visible warning, and representative document-content handling, or remove the testable product claim and retain only the advice disclaimer.

### MAJOR F-2-6 — Linking trusted people to records is an unlisted claim

**Location and quote:** landing workflow: “Link family members and professionals who can explain or locate each record.”

**Observed result:** UC-10 says the dossier stores contacts, but no registry claim names record-to-person linking. Its test confirms contact copy exists but never selects `#record-contact`, reloads, and verifies that the relationship is retained and displayed.

**Why this matters:** this is one of three advertised workflow steps, not incidental copy, and it has no outcome test.

**Concrete fix:** add a specific claim entry and test that links a demo record to a trusted person, reloads, verifies the relationship, removes the person, and verifies the record no longer retains a stale link.

### MINOR F-2-7 — The README Playwright-version claim is unlisted

**Location and quote:** README: “Playwright is pinned to 1.58.2.”

**Why this matters:** this is a concrete reproducibility claim, but no `.factory/claims.json` entry names or checks it. UC-23 checks script substrings, not the declared Playwright version.

**Concrete fix:** add a documentation claim that asserts the exact package and lockfile version, or remove the sentence.

### MINOR F-2-8 — The README license claim is unlisted

**Location and quote:** README: “The project uses the MIT license.”

**Why this matters:** licensing is a fact a reuser can rely on. `LICENSE` supports it, but the claim registry does not list the statement.

**Concrete fix:** add a claim that checks `LICENSE` contains the MIT text and the repository/package metadata agrees, or make this a linked `License: MIT` metadata item covered by the documentation claim.

### MINOR F-2-9 — The audience sentence has awkward grammar

**Location and quote:** first screen: “For adults preparing family or an executor to find records during illness or death.”

**Why this matters:** “preparing family” initially reads as preparing people rather than preparing records for them. The intended audience remains recoverable, so this does not fail the cold-read gate.

**Concrete fix:** use **For adults helping family or an executor find records during illness or after death.**

### MINOR F-2-10 — External links do not identify that they leave the product

**Location and quote:** footer link “Built by Param Factory” and CTA “Buy Dossier Plus.”

**Why this matters:** both leave the product origin without saying so, contrary to the site-structure contract. The checkout link is additionally dead under F-2-2.

**Concrete fix:** label them **Built by Param Factory (opens external)** and **Buy Dossier Plus on Sociobot (opens external)**, with an accessible external-link cue.

## Copy audit

Counts use whitespace-delimited words after removing punctuation; hyphenated terms and version strings count as one. No sentence exceeds 22 words and no banned marketing adjective appears. Flags refer to findings above.

### Landing-page sentences and prose units

| ID | Words | Exact copy | Result |
| --- | ---: | --- | --- |
| L01 | 7 | Map essential records for someone you trust | Pass; job headline. |
| L02 | 14 | For adults preparing family or an executor to find records during illness or death. | F-2-9. |
| L03 | 8 | The sample opens as a filled, private dossier. | Pass. |
| L04 | 4 | Saved on this device | Pass; UC-02. |
| L05 | 4 | Works offline after setup | Pass; UC-06. |
| L06 | 8 | Core tools are free; Plus costs ₹799 once | Pass; UC-15/16, but checkout fails under F-2-2. |
| L07 | 7 | Never enter a password or recovery code. | Pass. |
| L08 | 10 | Record what exists, where it is, and who to contact. | Pass. |
| L09 | 13 | Preview locations, trusted people, review dates, and first steps without entering personal details. | Pass. |
| L10 | 9 | Name each record and point to its safe location. | Pass. |
| L11 | 4 | Keep every secret elsewhere. | Pass. |
| L12 | 12 | Link family members and professionals who can explain or locate each record. | F-2-6. |
| L13 | 12 | Review the dossier, then print a cover or save an encrypted backup. | Pass; UC-12. |
| L14 | 13 | It does not store passwords, copy documents, access accounts, or replace legal advice. | F-2-5. |
| L15 | 10 | Your passphrase encrypts the dossier before this browser saves it. | Pass; UC-03. |
| L16 | 7 | There is no account or recovery reset. | Pass; UC-19. |
| L17 | 11 | Plus adds starter checklists and prints every handoff page at once. | Pass; UC-15, subject to F-2-2. |
| L18 | 8 | Encryption, reviews, cover printing, and exports remain free. | Pass; UC-16. |
| L19 | 5 | Sociobot and Dodo handle checkout. | F-2-2. |
| L20 | 6 | Your dossier stays on this device. | Pass; UC-01/02. |
| L21 | 10 | Your passphrase encrypts the dossier before this browser saves it. | Pass; UC-03. |
| L22 | 6 | We cannot see or recover it. | Pass; UC-04. |
| L23 | 9 | Use 4–6 unrelated words (at least 12 characters). | Pass. |
| L24 | 9 | Store a copy somewhere your executor can eventually access. | Pass. |
| L25 | 13 | I understand there is no reset or recovery if I lose this passphrase. | Pass. |
| L26 | 7 | A private guide to essential family records. | Pass. |
| L27 | 6 | Opening your dossier on this device… | Pass. |
| L28 | 10 | JavaScript is required to encrypt and use the dossier locally. | Pass. |
| L29 | 2 | You’re offline. | Pass. |
| L30 | 8 | Your saved dossier still works on this device. | Pass; UC-06. |
| L31 | 3 | Offline copy ready. | F-2-3 / COPY-L17. |
| L32 | 5 | Original generated artwork · Build polish-1 | F-2-4 / COPY-L15. |

### Landing headings, labels, and actions

| Words | Exact copy | Result |
| ---: | --- | --- |
| 4 | Skip to main content | Pass. |
| 3 | Family Digital Dossier | Pass; wordmark. |
| 1 | Demo | Pass; route link. |
| 1 | Privacy | Pass; route link. |
| 1 | Terms | Pass; route link. |
| 3 | Create a dossier | Pass; result-naming action. |
| 4 | Help without sharing passwords | Pass. |
| 5 | Try it with sample data | Pass; primary result-naming action. |
| 3 | Create encrypted dossier | Pass. |
| 6 | A filled dossier at a glance | Pass. |
| 7 | See the record guide before you start | Pass. |
| 5 | Open the complete sample dossier | Pass. |
| 3 | How it works | Pass. |
| 6 | Prepare the handoff in three steps | Pass. |
| 3 | List record locations | Pass. |
| 3 | Name trusted people | Pass. |
| 5 | Print or export the handoff | Pass. |
| 2 | Deliberately limited | Pass as an eyebrow paired with the next heading. |
| 6 | What this dossier does not do | Pass. |
| 3 | Optional one-time purchase | Pass. |
| 4 | Dossier Plus — ₹799 once | Pass as copy; live purchase fails under F-2-2. |
| 3 | Buy Dossier Plus | Result-naming verb; F-2-2 and F-2-10. |
| 5 | Stored only on this device | Pass. |
| 4 | Create your encrypted dossier | Pass. |
| 1 | Passphrase | Pass. |
| 2 | Confirm passphrase | Pass. |
| 4 | Built by Param Factory | F-2-10. |

### README sentences

| ID | Words | Exact sentence | Result |
| --- | ---: | --- | --- |
| R01 | 14 | Family Digital Dossier stores an encrypted guide to essential family records on your device. | Pass; UC-07. |
| R02 | 7 | It works offline after the first visit. | Pass; UC-06. |
| R03 | 9 | Open the live app or try the sample dossier. | Pass. |
| R04 | 14 | It is for adults preparing records for family, an executor, or another trusted person. | Pass. |
| R05 | 14 | It does not store passwords, create legal documents, access accounts, or give legal advice. | F-2-5. |
| R06 | 13 | Encrypts dossier content on this device with a key created from your passphrase. | Pass; UC-03. |
| R07 | 7 | The technical method is AES-256-GCM with PBKDF2-SHA-256. | Pass in the technical list; UC-09. |
| R08 | 15 | Records institutions, document locations, reference names, renewal dates, contacts, and what family should do first. | Pass; UC-10. |
| R09 | 17 | Schedules a review every six months, keeps past reviews, and checks whether someone can find three records. | Pass; UC-11. |
| R10 | 5 | Prints a sealed cover sheet. | Pass; UC-12. |
| R11 | 8 | Exports an encrypted backup or a readable spreadsheet. | Pass; UC-12. |
| R12 | 17 | Restores backups, changes passphrases, works offline after the first visit, and can be installed on a device. | Pass; UC-13. |
| R13 | 9 | Rejects text that resembles a password or recovery code. | Pass; UC-14. |
| R14 | 8 | Blocks readable exports until detected secrets are removed. | Pass; UC-14. |
| R15 | 6 | Offers Dossier Plus for ₹799 once. | Copy is plain; F-2-2 makes the live offer unavailable. |
| R16 | 11 | Plus adds starter checklists and prints every handoff page at once. | Pass; UC-15. |
| R17 | 9 | Keeps encryption, reviews, cover printing, and both exports free. | Pass; UC-16. |
| R18 | 16 | The browser stores one encrypted copy of the dossier in an IndexedDB database on this device. | Pass in the privacy section; UC-17. |
| R19 | 7 | Demo data uses a separate `demo:family-digital-dossier` database. | Pass in the privacy section; UC-02. |
| R20 | 11 | The passphrase stays in memory only while the dossier is open. | Pass; UC-18. |
| R21 | 6 | It is never stored or sent. | Pass; UC-18. |
| R22 | 7 | There is no account or recovery reset. | Pass; UC-19. |
| R23 | 11 | If you lose every usable passphrase copy, you lose the dossier. | Pass; UC-19. |
| R24 | 4 | Keep an encrypted backup. | Pass. |
| R25 | 10 | Arrange for the right person to receive the passphrase separately. | Pass. |
| R26 | 10 | Spreadsheet exports and printed pages are readable and not encrypted. | Pass; UC-20. |
| R27 | 6 | Protect exported files and printed pages. | Pass. |
| R28 | 10 | The app has no analytics, third-party scripts, or remote fonts. | Pass; UC-21. |
| R29 | 12 | It contacts the Sociobot licensing service only after you add a license. | Pass; UC-22. |
| R30 | 8 | That check happens at most once per day. | Pass; UC-22. |
| R31 | 5 | Use Node.js 20 or newer. | Pass. |
| R32 | 12 | `npm test` runs type checks, linting, unit tests, and a production build. | Pass; UC-23 and observed. |
| R33 | 11 | It then runs browser, accessibility, mobile, keyboard, privacy, and offline checks. | Pass; UC-23 and observed. |
| R34 | 5 | Playwright is pinned to 1.58.2. | F-2-7. |
| R35 | 17 | Run checks separately with `npm run typecheck`, `npm run lint`, `npm run test:unit`, or `npm run test:e2e`. | Pass. |
| R36 | 6 | Run all public claim checks with: | Copy is clear; the command fails clean under F-2-1. |
| R37 | 7 | The production command is `npm run build`. | Pass. |
| R38 | 10 | Static output lands in `dist/`, with `dist/index.html` at its root. | Pass; UC-24. |
| R39 | 10 | The build creates versioned assets and a matching offline worker. | Pass; UC-24. |
| R40 | 12 | It also copies the Azure Static Web Apps response and cache configuration. | Appropriate developer terminology; UC-24. |
| R41 | 5 | Deploy the contents of `dist/`. | Pass. |
| R42 | 10 | The factory manages hosting, domain setup, billing registration, and checkout. | F-2-2. |
| R43 | 6 | The project uses the MIT license. | F-2-8. |
| R44 | 5 | The footer discloses generated imagery. | Copy is plain; disclosure quality fails under F-2-4. |
| R45 | 10 | Its prompt and generator are recorded in `.factory/design.md` and `assets/src/`. | Pass; UC-25. |

README headings and link labels are: “Family Digital Dossier” (3), “Who it is for” (4), “What it does” (3), “Privacy and lost passphrases” (4), “Develop and verify” (3), “Project references” (2), “Product brief” (2), “Sample dossier contract” (3), “Tested public claims” (3), “Visual design and image sources” (5), “Privacy policy” (2), and “Terms” (1). All make sense out of context. README has no buttons.

## Demo and sandbox

- One click from the cold first screen opens `/demo` with the persistent “Demo — sample data, nothing is saved to your dossier.” banner, **Reset demo**, and **Start for real**.
- The first rendered product screen already contains Asha Mehta, 10 realistic record locations, three trusted people, instructions, a future review, and prior review history.
- An independent probe created `{marker: "real-isolation-proof"}` in `family-digital-dossier`, edited the demo handoff, reset the demo, and exited. The marker remained byte-for-byte unchanged. Exit removed `demo:family-digital-dossier` and returned to `/`.
- Reset restored the original sample. Start for real discarded the sample database.
- No third-party or body-carrying requests occurred during the demo probe. There were no cookies.
- After a warm visit, a new `/demo` page opened offline, navigated to Records, displayed “Term life insurance policy,” and reloaded `/demo/records` with the banner and record intact.

The demo gate passes. Review-1 B-01 is fixed in both live behavior and `src/db.ts`/`src/demo.ts`.

## Claims

The required run used a new `git clone --no-local` at commit `263cb35`, followed only by `npm ci` before invoking each exact registry command. All commands failed for the same precondition defect described in F-2-1.

| Claim | Result | Direct evidence |
| --- | --- | --- |
| UC-01 | FAIL | Exact command reached empty preview 404; demo banner absent. |
| UC-02 | FAIL | Same. |
| UC-03 | FAIL | Same. |
| UC-04 | FAIL | Same. |
| UC-05 | FAIL | Same. |
| UC-06 | FAIL | Same. |
| UC-07 | FAIL | Same. |
| UC-08 | FAIL | Same. |
| UC-09 | FAIL | Same. |
| UC-10 | FAIL | Same. |
| UC-11 | FAIL | Same. |
| UC-12 | FAIL | Same. |
| UC-13 | FAIL | Same. |
| UC-14 | FAIL | Same. |
| UC-15 | FAIL | Same; checkout also fails live under F-2-2. |
| UC-16 | FAIL | Same. |
| UC-17 | FAIL | Same. |
| UC-18 | FAIL | Same. |
| UC-19 | FAIL | Same. |
| UC-20 | FAIL | Same. |
| UC-21 | FAIL | Same. |
| UC-22 | FAIL | Same. |
| UC-23 | FAIL | Same. |
| UC-24 | FAIL | Same. |
| UC-25 | FAIL | Same. |

Diagnostic only: after explicitly running `npm run build`, the aggregate `npm run test:claims` passed 8/8 grouped scenarios in 17.1 seconds. This confirms the common bootstrap cause but does not turn any listed clean-clone command into a pass.

Unlisted public claims are identified in F-2-2 and F-2-5 through F-2-8. No other landing or README capability statement lacked a reasonable registry mapping.

## Earlier-finding verification

### Primary review-1 findings

| Earlier ID | Result now | Evidence |
| --- | --- | --- |
| B-01 | Fixed | One-click filled demo, banner, reset, exit, isolated database, and offline sample all independently exercised. |
| B-02 | **Regressed / BLOCKING** | Registry now exists, but every exact clean-clone command fails; see F-2-1 and UC table. |
| B-03 | Fixed | Live deep links, route titles/canonicals, Back, heading focus, polite route status, and HTTP 404 pass. |
| M-01 | Fixed | Required first-screen shape is present at 390 px and desktop; F-2-9 is a smaller grammar issue. |
| M-02 | Fixed as disclosure; purchase broken separately | Price, paid features, and free features are visible. F-2-2 covers the dead purchase path. |
| M-03 | Fixed | Metadata, social image, favicon, touch icon, mobile legal links, shared chrome, build ID, and security headers are live. |
| M-04 | Fixed | Filled preview and three verb-led workflow steps are on the landing page. |

### Review-1 copy findings

| Earlier IDs | Result now |
| --- | --- |
| COPY-L01, COPY-L02, COPY-L03, COPY-L09, COPY-L14, COPY-L18 | Fixed in live copy and source. |
| COPY-L15 | **Not fixed / BLOCKING**; see F-2-4. |
| COPY-L17 | **Regressed / BLOCKING**; see F-2-3. |
| COPY-LU03, COPY-LU04, COPY-LU05, COPY-LU06, COPY-LU07, COPY-LU19 | Fixed in live copy and source. |
| COPY-R01, COPY-R02, COPY-R03, COPY-R04, COPY-R05, COPY-R06, COPY-R07, COPY-R08, COPY-R09, COPY-R10, COPY-R11, COPY-R12, COPY-R13, COPY-R15, COPY-R17, COPY-R18, COPY-R20, COPY-R22, COPY-R24, COPY-R28, COPY-R29, COPY-RU04, COPY-RU07, COPY-RU09 | Fixed in README. |

All prior UC-01 through UC-25 findings are reopened as blocking because their registered commands fail, even though the grouped assertions pass after a manual build.

The older verification failures for unreliable offline reload, credential-like storage, CSP, and cache policy remain fixed: the current local `npm test` passed 14 unit and 19 browser tests; the live suite passed 11/11; the independent offline demo reload and secret-boundary flow passed; and live headers include CSP, Permissions-Policy, immutable assets, and no-referrer policy.

## Structure, accessibility, links, and identity

- Root title is “Family Digital Dossier — map essential family records.” Demo, records, people, plan, review, settings, privacy, terms, and 404 have route-specific titles, descriptions, canonicals, one H1, OG/Twitter image metadata, and icons.
- `/definitely-not-a-real-route` returns HTTP 404 with the designed “This record route is missing” screen and two recovery actions.
- Demo deep links reload correctly. Back restores the previous route and focuses its H1. The polite route announcement is present.
- Internal crawl: `/`, `/?demo=1`, `/demo`, five demo section routes, `/privacy/`, `/terms/`, robots, sitemap, favicon, touch icon, and social card return 200. The unknown route returns the expected 404. The only dead public link is the paid checkout in F-2-2.
- Header and footer remain consistent across checked routes and retain Privacy and Terms at 390 px.
- Live Playwright route/accessibility/offline suite: 11/11 passed. Factory URL verifier: HTTP 200, no console errors, `lang=en`, one H1, one main, no missing alt text, and no unlabeled buttons. The landing and demo emitted no third-party requests.
- Local `npm test`: TypeScript, ESLint, 14/14 unit tests, production build, and 19/19 browser tests passed. App JavaScript is 17.61 kB gzip. Local built HTML and app JavaScript hashes exactly match production.
- The warm folio palette, clipped paper shapes, seal motif, editorial typography, and original connected-envelope art match `.factory/design.md`. This is visually distinct from a centered generic SaaS template.

F-2-10 is the only remaining link-affordance issue; F-2-2 is the only dead link.

## Missed leverage and AI check

No additional feature finding is justified. The product already supports encrypted backup restore, readable spreadsheet export, cover/full-packet printing, review history, and a three-record drill. Cloud sync would conflict with the brief's local-first recovery model unless it introduced a substantially larger encrypted-sync design. AI would handle highly sensitive estate context without being necessary for the core locator job; no decorative AI, provider key, Azure endpoint, or unexplained model feature is present.

## What would make this perfect

Nothing may remain for PASS. A perfect next candidate must:

1. Make every claims-registry command pass independently from a clone with no `dist/`.
2. Enable and test the real Sociobot ₹799 checkout, or remove the unavailable offer.
3. Close COPY-L17 and COPY-L15 with the exact clear, active wording and fresh-browser tests.
4. Register and test the scope, record-to-person linking, Playwright-version, and MIT-license claims.
5. Replace the awkward audience sentence and mark both external links clearly.
6. Re-run this entire review from a cold phone and desktop context, not only the changed checks.
