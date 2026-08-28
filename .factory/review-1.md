# Adversarial first-read review 1: Family Digital Dossier

**Verdict: FAIL**

Reviewed 2026-08-28 against live production at <https://family-digital-dossier.sociobot.in> and clean commit `fe96fa7b266269c5fdad3e915de9685dc8004793`. There are three blocking findings. The passing build and accessibility checks do not override them.

## Cold first screen

Fresh browser contexts were opened without prior storage at 390×844 and 1440×900 before scrolling.

| Question | 390 px answer | Desktop answer |
|---|---|---|
| What does this do? | It makes a location guide to essential records without copying passwords or documents. | Same. |
| For whom? | An adult preparing for a trusted person to find records during illness or death. This is implied by the sentence rather than named directly. | Same. |
| What should I click first? | “Create my dossier” is the visually primary action, although “Open dossier” competes in the header. | “Create my dossier.” |

The core job is discernible, so this specific gate is not blocking. The copy still fails the required plain-words shape: “Leave a map. Keep the keys.” is a metaphor rather than the job, “Findability” is jargon, the explanation is 25 words, and there is no sample-data action or three-item privacy/offline/price fact strip.

Evidence: `evidence/live-mobile-first-screen.png` and `evidence/live-desktop-first-screen.png` in the review workspace.

## Findings, ordered by severity

### BLOCKING B-01 — There is no demo, and `/demo` writes to real storage

**Quote:** the first screen offers “Create my dossier,” “See what it stores,” and “Open dossier.” It never offers “Try it with sample data.” Direct visits to `/demo` and `/?demo=1` show the ordinary empty setup.

**Why this loses or misleads a first-time visitor:** there is no one-click way to see the product in use. Creating a dossier at `/demo` creates the ordinary empty dossier, writes the `family-digital-dossier` IndexedDB database, and makes `/` show “Unlock your dossier.” Thus a URL that looks like a demo touches the same real namespace. There is no “Demo — sample data, nothing is saved” banner, realistic sample records, “Reset demo,” or “Start for real.” Real-data isolation cannot be confirmed because it does not exist.

**Concrete fix:** add a visible first-screen **Try it with sample data** action linked to `/demo`. Seed realistic records, trusted people, a handoff plan, and review history before the first demo screen renders. Use a separate `demo:` database or key namespace. Keep the required demo banner visible, implement reset, and discard demo data on “Start for real.” Add `.factory/demo.md` and tests proving demo writes never change `vault/primary`.

### BLOCKING B-02 — The claims registry is missing; every public claim is unlisted

**Quote:** `.factory/claims.json` does not exist and `rg "@claim:"` returns no tests.

**Why this loses or misleads a first-time visitor:** the visitor is asked to rely on encryption, offline use, local-only storage, no tracking, exports, imports, credential blocking, and paid-feature statements without the required claim-to-test contract. The ordinary suite contains relevant checks, but none is mapped to a public sentence and none runs through the required demo sandbox.

**Concrete fix:** create `.factory/claims.json`; give each entry exactly one `@claim:<id>` test; run every test from `/demo` in a fresh context. Remove claims that cannot be tested. Each row below is a separate unlisted-claim finding.

| ID | Source and exact claim | Test or copy change required |
|---|---|---|
| UC-01 | Landing: “Give someone you trust a clear route to essential records during illness or death—without putting passwords, documents, or account access in another company’s cloud.” | In demo, intercept the entire flow and assert dossier fields never appear in network requests; split the outcome copy into testable statements. |
| UC-02 | Landing: “Stored only on this device” | Save and reload demo data; assert only the demo IndexedDB namespace changes and no data request leaves the origin. |
| UC-03 | Landing: “Your passphrase encrypts everything before it reaches browser storage.” | Inspect IndexedDB after a demo save; assert known plaintext and the passphrase are absent and the envelope decrypts only with the passphrase. |
| UC-04 | Landing: “We cannot see or recover it.” | Assert no recovery route or remote key call exists and a wrong/lost passphrase cannot decrypt the envelope. |
| UC-05 | Landing: “No tracking.” | Intercept requests, cookies, beacons, and loaded scripts throughout the demo; assert no analytics endpoint or third-party asset. |
| UC-06 | Landing: “Offline copy ready.” | Warm `/demo`, go offline, open a new page, reload, and verify seeded data remains usable. |
| UC-07 | README: “Family Digital Dossier is an encrypted, offline-first locator for essential family records.” | Cover encryption, offline reload, and record location in separately scoped claim entries, or narrow this sentence. |
| UC-08 | README: “It helps an adult tell a trusted person what exists, where to find it, who can help, and what to do first during illness or death—without storing passwords or copying a whole password vault.” | Test every named field and secret rejection with seeded data; remove the unmeasurable “helps” outcome. |
| UC-09 | README: “Encrypts all dossier content locally with AES-256-GCM and a passphrase-derived key.” | Assert algorithm parameters, local execution, round-trip decryption, and absence of plaintext in storage. |
| UC-10 | README: “Maps institutions, record locations, safe reference labels, renewal dates, contacts, and first-hour instructions.” | Seed, display, edit, and reload every named field in demo mode. |
| UC-11 | README: “Creates a six-month review checklist, durable review history, and three-record findability drill.” | Complete a review and three-record drill; assert history and the next date after reload. |
| UC-12 | README: “Prints a sealed cover sheet and exports an encrypted JSON backup or explicitly unencrypted CSV.” | Inspect print output and both downloads; verify encryption and CSV rows, not only button presence. |
| UC-13 | README: “Imports backups, rotates passphrases, works offline after first load, and can be installed as a PWA.” | Add observable import, passphrase rotation, offline, manifest, and service-worker assertions; split this compound claim. |
| UC-14 | README: “Rejects credential-shaped values at entry and import, and blocks readable export/printing if an older dossier still contains one.” | Test entry, import, legacy display, CSV, and print boundaries with representative secrets. |
| UC-15 | README: “Offers a one-time Dossier Plus license for starter templates and full handoff packet printing.” | Use a sandbox license response to verify the one-time tier unlocks both named features. |
| UC-16 | README: “Core safety and data ownership features remain free.” | Name the features and verify each without a license token; otherwise remove the vague sentence. |
| UC-17 | README: “The dossier is stored as one encrypted envelope in browser IndexedDB.” | Inspect the database and assert exactly one encrypted envelope under the documented real-data key. |
| UC-18 | README: “The passphrase is held only in memory while unlocked and is never stored or transmitted.” | Inspect storage and all request payloads before and after lock/reload; assert the passphrase is absent. |
| UC-19 | README: “There is no account and no recovery bypass: losing both the passphrase and a usable unlocked device means the dossier cannot be recovered.” | Assert there is no account/recovery flow and that a wrong passphrase cannot decrypt a copied envelope. |
| UC-20 | README: “Readable CSV exports and printed pages are not encrypted.” | Export and print demo data; assert the known readable values are present after the warning is accepted. |
| UC-21 | README: “The app has no analytics, third-party scripts, or remote fonts.” | Intercept all landing and demo requests and inspect loaded scripts/fonts. |
| UC-22 | README: “License verification is the only product API call, and only occurs when a license token exists.” | Assert zero API calls without a token and only the documented licensing request, at most daily, with one. |
| UC-23 | README: “`npm test` runs type checking, ESLint, unit encryption/safety tests, makes a production build, and runs Playwright interaction, accessibility, response-policy, mobile, keyboard, and offline checks.” | Add a documentation-contract check or keep this verified in CI; the clean-clone run did confirm it manually. |
| UC-24 | README: “The build emits content-hashed assets, a version-matched service worker, and `staticwebapp.config.json` with the response and cache policies used by Azure Static Web Apps.” | Assert these artifacts and their references after `npm run build`. |
| UC-25 | README: “Generated imagery is disclosed in the product footer and documented with its prompt and generator in `.factory/design.md` and `assets/src/`.” | Assert the disclosure and provenance files exist and match the shipped hero asset. |

No listed claim commands could be run because the list is absent. The clean-clone `npm test` result is reported separately and is not a substitute for claim entries.

### BLOCKING B-03 — Product routing and 404 behavior are broken

**Quote/evidence:** `/records`, `/demo`, and `/definitely-not-a-real-route` all return HTTP 200, the root canonical, the root title, and the landing headline “Leave a map. Keep the keys.” Inside the unlocked app, selecting “Records” and then “People” leaves the URL at `/` and does not add history state. Focus moves to `<main>`, not the new heading. The only `<h1>` becomes the linked wordmark “Family Digital Dossier,” while the screen title is an `<h2>`.

**Why this loses or misleads a first-time visitor:** a copied app URL cannot reopen a section, Back cannot restore the previous section, unknown URLs impersonate a valid page, and assistive-technology users do not receive the required route title/focus announcement.

**Concrete fix:** give app sections real URLs and `pushState` navigation; restore view, scroll, and heading focus on popstate; update the title/canonical per route; make the view headline the single `<h1>`; add the polite route announcement; and serve a designed 404 with a home action and a real not-found status where the host permits it.

### MAJOR M-01 — The first screen violates the required plain-words shape

**Quote:** “FINDABILITY WITHOUT FULL ACCESS”; “Leave a map. Keep the keys.”; the 25-word sentence beginning “Give someone you trust…”; and “Never enter a password or recovery code.” as the only fact line.

**Why this loses a first-time visitor:** the job is carried by a long supporting sentence rather than the headline. “Findability” and the map/keys metaphor require interpretation. The first screen does not present the required privacy, offline, and price facts, and the correct primary action should be the demo.

**Concrete fix:** use **Map essential records for someone you trust**. Follow with: “For adults preparing family or an executor to find records during illness or death.” Make **Try it with sample data** primary and state “Opens a private sample dossier.” Add three short tested facts: “Saved on this device,” “Works offline after setup,” and “Core tools are free; Plus costs ₹799 once.”

### MAJOR M-02 — Paid terms are hidden rather than disclosed on the landing page

**Quote:** README says “Offers a one-time Dossier Plus license…” while only Terms states “The advertised one-time price is ₹799.” The landing page has no paid-tier section.

**Why this misleads a first-time visitor:** the visitor cannot tell from the product page that a paid tier exists, its price, or which printing/template features require it.

**Concrete fix:** add a landing section stating **Dossier Plus — ₹799 once**, the two paid features, what remains free, and the Sociobot billing boundary. Add claim tests for the shown price and unlocks.

### MAJOR M-03 — Required metadata and page chrome are incomplete

**Quote/evidence:** the root has no Open Graph or Twitter metadata, no 1200×630 product image, no SVG favicon, and no apple-touch icon. Legal pages do not link any favicon. Footers differ by route and omit “Built by Param Factory” plus a version/build ID. On mobile, Privacy and Terms are removed from the header.

**Why this loses or misleads a first-time visitor:** shared links lack a trustworthy product-specific preview, installed/bookmarked presentation is incomplete, and navigation/legal provenance changes across routes.

**Concrete fix:** add route-specific OG/Twitter title, description, and original 1200×630 art; SVG and 180 px touch icons on every page; keep the same header/footer skeleton on every route; expose Privacy and Terms at 390 px; include the product one-liner, factory attribution, and build ID.

### MAJOR M-04 — The landing skeleton omits the product preview and real workflow

**Quote:** “Three things your family needs” is followed by three descriptive columns, then the passphrase creation form.

**Why this loses a first-time visitor:** there is no live preview or screenshot of a filled dossier and no three-step verb-led workflow. The illustration communicates visual identity but not what the actual product screen contains.

**Concrete fix:** place an interactive, read-only sample preview after the hero. Add three workflow steps such as **List record locations**, **Name trusted people**, and **Print or export the handoff**, each showing the real interface. Keep the current sealed-constellation identity; it is distinct and does not look like a generic SaaS template.

## Copy audit

Counts use Unicode word tokens; contractions and hyphenated compounds count as one, while an em dash separates words. Every steady-state landing sentence, the static loading/offline sentence, every README sentence, and all headings/actions are listed. “—” means no length, jargon, marketing-adjective, terminology, context, or action-label flag. Claim status is handled separately above.

### Landing sentences

| ID | Words | Exact sentence | Flag and proposed rewrite |
|---|---:|---|---|
| L01 | 3 | “Leave a map.” | COPY-L01: metaphor instead of the job. Rewrite with L02 as “Map essential records for someone you trust.” |
| L02 | 3 | “Keep the keys.” | COPY-L02: metaphor and “keys” can suggest credential storage. Use the L01 rewrite. |
| L03 | 25 | “Give someone you trust a clear route to essential records during illness or death—without putting passwords, documents, or account access in another company’s cloud.” | COPY-L03: over 22 words and three ideas. Rewrite: “Help someone you trust find essential records during illness or death. Keep passwords, documents, and account access off company servers.” |
| L04 | 7 | “Never enter a password or recovery code.” | — |
| L05 | 10 | “Record what exists, where it is, and who to contact.” | — |
| L06 | 10 | “List institutions, policies, important online accounts, legal files, and renewals.” | — |
| L07 | 15 | “Point to a safe, filing cabinet, adviser, or vault item—never copy the secret itself.” | — |
| L08 | 13 | “Connect each record to a trusted person or professional and leave calm instructions.” | — |
| L09 | 9 | “Your passphrase encrypts everything before it reaches browser storage.” | COPY-L09: “browser storage” is implementation jargon and “everything” is imprecise. Rewrite: “Your passphrase encrypts the dossier before this browser saves it.” |
| L10 | 6 | “We cannot see or recover it.” | — |
| L11 | 9 | “Use 4–6 unrelated words (at least 12 characters).” | — |
| L12 | 9 | “Store a copy somewhere your executor can eventually access.” | — |
| L13 | 13 | “I understand there is no reset or recovery if I lose this passphrase.” | — |
| L14 | 7 | “A private map, not a password vault.” | COPY-L14: fragment and metaphor. Rewrite: “A record locator that does not store passwords.” |
| L15 | 6 | “Hero imagery generated for this product.” | COPY-L15: passive fragment. Rewrite: “We generated the hero image for this product.” |
| L16 | 2 | “No tracking.” | — |
| L17 | 3 | “Offline copy ready.” | COPY-L17: “copy” does not say what is ready. Rewrite: “The app is ready to use offline.” |
| L18 | 8 | “Opening your encrypted, offline dossier on this device…” | COPY-L18: loading fragment and stacked modifiers. Rewrite: “Opening your dossier on this device…” |
| L19 | 10 | “JavaScript is required to encrypt and use the dossier locally.” | — |
| L20 | 2 | “You’re offline.” | — |
| L21 | 8 | “Your saved dossier still works on this device.” | — |

### Landing headings, labels, and actions

| ID | Words | Exact copy | Flag and proposed rewrite |
|---|---:|---|---|
| LU01 | 4 | “Skip to main content” | — |
| LU02 | 3 | “Family Digital Dossier” | — |
| LU03 | 2 | “Open dossier” | COPY-LU03: on a fresh device it scrolls to creation rather than opening anything. Use “Create a dossier”; show “Unlock dossier” only when one exists. |
| LU04 | 4 | “Findability without full access” | COPY-LU04: “findability” is jargon. Rewrite: “Help without sharing passwords.” |
| LU05 | 3 | “Create my dossier” | COPY-LU05: inconsistent with “Create encrypted dossier.” Use “Create encrypted dossier” for both actions, secondary to the demo. |
| LU06 | 4 | “See what it stores” | COPY-LU06: “it” is vague and the target is a concept list, not stored data. Rewrite: “See dossier details.” |
| LU07 | 4 | “A locator, deliberately limited” | COPY-LU07: “locator” is jargon and the heading is unclear out of context. Rewrite: “What this dossier records.” |
| LU08 | 5 | “Three things your family needs” | — |
| LU09 | 2 | “What exists” | — |
| LU10 | 3 | “Where to look” | — |
| LU11 | 3 | “Who can help” | — |
| LU12 | 5 | “Stored only on this device” | — |
| LU13 | 4 | “Create your encrypted dossier” | — |
| LU14 | 1 | “Passphrase” | — |
| LU15 | 2 | “Confirm passphrase” | — |
| LU16 | 3 | “Create encrypted dossier” | —; this is the clearer version of LU05. |
| LU17 | 1 | “Privacy” | — |
| LU18 | 1 | “Terms” | — |
| LU19 | 3 | “Private continuity record” | COPY-LU19: “continuity record” is jargon in the loading shell. Rewrite: “Private record guide.” |

All buttons use verbs and name a result except the misleading fresh-device “Open dossier” behavior and the vague pronoun in “See what it stores.”

### README sentences

| ID | Words | Exact sentence | Flag and proposed rewrite |
|---|---:|---|---|
| R01 | 12 | “Family Digital Dossier is an encrypted, offline-first locator for essential family records.” | COPY-R01: “offline-first locator” is jargon. Rewrite: “Family Digital Dossier stores an encrypted guide to essential family records on your device and works offline.” |
| R02 | 35 | “It helps an adult tell a trusted person what exists, where to find it, who can help, and what to do first during illness or death—without storing passwords or copying a whole password vault.” | COPY-R02: over 22 words. Rewrite: “It helps an adult prepare record locations and instructions for someone they trust. It does not copy passwords or a password vault.” |
| R03 | 16 | “It is for people preparing a practical handoff to family, an executor, or another trusted contact.” | COPY-R03: “practical handoff” is jargon. Rewrite: “It is for adults preparing records for family, an executor, or another trusted person.” |
| R04 | 18 | “It is not a password manager, will, power of attorney, automated account-access service, or source of legal advice.” | COPY-R04: “automated account-access service” is dense. Rewrite: “It does not store passwords, create legal documents, access accounts, or give legal advice.” |
| R05 | 11 | “Encrypts all dossier content locally with AES-256-GCM and a passphrase-derived key.” | COPY-R05: algorithm and key-derivation jargon in the feature list. Rewrite: “Encrypts dossier content on this device with a key created from your passphrase.” Put the algorithm in a technical note. |
| R06 | 13 | “Maps institutions, record locations, safe reference labels, renewal dates, contacts, and first-hour instructions.” | COPY-R06: “safe reference labels” and “first-hour instructions” are product jargon. Rewrite: “Records institutions, document locations, reference names, renewal dates, contacts, and what family should do first.” |
| R07 | 12 | “Creates a six-month review checklist, durable review history, and three-record findability drill.” | COPY-R07: “durable” is promotional and “findability drill” is jargon. Rewrite: “Schedules a review every six months, keeps past reviews, and checks whether someone can find three records.” |
| R08 | 15 | “Prints a sealed cover sheet and exports an encrypted JSON backup or explicitly unencrypted CSV.” | COPY-R08: “JSON” and “CSV” are unexplained formats. Rewrite: “Prints a sealed cover sheet. Exports an encrypted backup or a readable spreadsheet.” |
| R09 | 16 | “Imports backups, rotates passphrases, works offline after first load, and can be installed as a PWA.” | COPY-R09: “rotates” and “PWA” are jargon. Rewrite: “Restores backups, changes passphrases, works offline after the first visit, and can be installed on a device.” |
| R10 | 19 | “Rejects credential-shaped values at entry and import, and blocks readable export/printing if an older dossier still contains one.” | COPY-R10: “credential-shaped” and “readable export/printing” are jargon. Rewrite: “Rejects text that resembles a password or recovery code. Blocks readable exports until detected secrets are removed.” |
| R11 | 14 | “Offers a one-time Dossier Plus license for starter templates and full handoff packet printing.” | COPY-R11: “handoff packet” is unexplained. Rewrite: “Dossier Plus adds starter checklists and prints every handoff page at once.” |
| R12 | 8 | “Core safety and data ownership features remain free.” | COPY-R12: “core” and “data ownership features” are vague. Rewrite: “Encryption, reviews, printing, and exports remain free.” |
| R13 | 11 | “The dossier is stored as one encrypted envelope in browser IndexedDB.” | COPY-R13: “encrypted envelope” and “IndexedDB” are implementation jargon. Rewrite: “The browser stores one encrypted copy of the dossier on this device.” |
| R14 | 15 | “The passphrase is held only in memory while unlocked and is never stored or transmitted.” | — |
| R15 | 23 | “There is no account and no recovery bypass: losing both the passphrase and a usable unlocked device means the dossier cannot be recovered.” | COPY-R15: over 22 words; “recovery bypass” and “usable unlocked device” are dense. Rewrite: “There is no account or recovery reset. If you lose the passphrase and every unlocked device, you lose the dossier.” |
| R16 | 19 | “Keep an encrypted backup and arrange for the right person to receive the passphrase separately at the right time.” | — |
| R17 | 9 | “Readable CSV exports and printed pages are not encrypted.” | COPY-R17: “CSV” is unexplained. Rewrite: “Spreadsheet exports and printed pages are readable and not encrypted.” |
| R18 | 7 | “Users control their storage and physical security.” | COPY-R18: abstract responsibility language. Rewrite: “You must protect exported files and printed pages.” |
| R19 | 10 | “The app has no analytics, third-party scripts, or remote fonts.” | — |
| R20 | 16 | “License verification is the only product API call, and only occurs when a license token exists.” | COPY-R20: “product API call” and “license token” are jargon. Rewrite: “The app contacts the Sociobot licensing service only after you add a license.” |
| R21 | 6 | “Requires Node.js 20 or newer.” | — |
| R22 | 25 | “`npm test` runs type checking, ESLint, unit encryption/safety tests, makes a production build, and runs Playwright interaction, accessibility, response-policy, mobile, keyboard, and offline checks.” | COPY-R22: over 22 words and overloaded. Rewrite: “`npm test` runs type checks, linting, unit tests, and a production build. It then runs browser, accessibility, mobile, keyboard, policy, and offline checks.” |
| R23 | 7 | “Playwright is pinned to 1.58.2.” | — |
| R24 | 21 | “Individual gates are also available as `npm run typecheck`, `npm run lint`, `npm run test:unit`, and `npm run test:e2e`.” | COPY-R24: “gates” is jargon. Rewrite: “Run each check separately with `npm run typecheck`, `npm run lint`, `npm run test:unit`, or `npm run test:e2e`.” |
| R25 | 6 | “The exact production build command is:” | — |
| R26 | 12 | “Static output lands in `dist/` with `dist/index.html` at its root.” | — |
| R27 | 6 | “Preview it with `npm run preview`.” | — |
| R28 | 25 | “The build emits content-hashed assets, a version-matched service worker, and `staticwebapp.config.json` with the response and cache policies used by Azure Static Web Apps.” | COPY-R28: over 22 words and several unexplained build terms. Rewrite: “The build creates versioned assets and a matching offline worker. It also copies the Azure Static Web Apps response and cache configuration.” |
| R29 | 18 | “Deploy the contents of `dist/`; infrastructure, DNS, billing product registration, and checkout configuration are managed by the factory.” | COPY-R29: dense deployment jargon. Rewrite: “Deploy the contents of `dist/`. The factory manages hosting, domain setup, billing registration, and checkout.” |
| R30 | 2 | “MIT licensed.” | — |
| R31 | 22 | “Generated imagery is disclosed in the product footer and documented with its prompt and generator in `.factory/design.md` and `assets/src/`.” | — |

### README headings and other copy units

| ID | Words | Exact copy | Flag and proposed rewrite |
|---|---:|---|---|
| RU01 | 3 | “Family Digital Dossier” | — |
| RU02 | 4 | “Who it is for” | — |
| RU03 | 3 | “What it does” | — |
| RU04 | 4 | “Privacy and recovery model” | COPY-RU04: “recovery model” is jargon. Rewrite: “Privacy and what happens if you lose the passphrase.” |
| RU05 | 3 | “Develop and verify” | — |
| RU06 | 2 | “Project references” | — |
| RU07 | 1 | “Live” | COPY-RU07: unclear out of context. Rewrite: “Open the live app.” |
| RU08 | 2 | “Product brief” | — |
| RU09 | 5 | “Visual system and asset provenance” | COPY-RU09: “asset provenance” is jargon. Rewrite: “Visual design and image sources.” |
| RU10 | 2 | “Privacy policy” | — |
| RU11 | 1 | “Terms” | — |

Terminology is not stable. The same core artifact is called “dossier,” “locator,” “map,” “continuity record,” “handoff,” “handoff packet,” and “encrypted envelope.” Use **dossier** for the product data, **record** for an item, **trusted person** for the recipient, **location** for where an item is found, and **encrypted backup** for the export. Reserve implementation terms such as IndexedDB and AES-256-GCM for a technical section.

## Claim-test and clean-clone execution

| Check | Result | Evidence |
|---|---|---|
| Read `.factory/claims.json` | **BLOCKED/FAIL** | File is absent. |
| Run every listed claim command | No commands existed | This is not a pass; the required registry and `@claim:` tests are absent. |
| Clean clone | PASS | Cloned GitHub `main`; HEAD exactly `fe96fa7b266269c5fdad3e915de9685dc8004793`. |
| `npm ci` | PASS | 140 packages; 0 vulnerabilities reported by install. |
| `npm test` | PASS | TypeScript and ESLint passed; Vitest 14/14; build passed; Playwright 8/8. |
| Production build budget | PASS | App JS 49.16 kB raw / 14.60 kB gzip; CSS 11.90 kB raw / 3.62 kB gzip. |

## Demo, storage, offline, and privacy exercise

- Fresh `/demo`: no sample data, banner, reset, or start-real control.
- Created a dossier at `/demo`: IndexedDB reported `family-digital-dossier`; navigating to `/` showed the same dossier unlock form. This confirms the route is not isolated.
- Fresh real-data context: created “Term life insurance policy,” saved the location “Fire safe, blue estate folder,” warmed the service worker, went offline, reloaded, unlocked, and confirmed the record remained visible. The offline behavior itself passed.
- Network interception across create, edit, offline reload, and unlock observed only same-origin GET requests and no request bodies. This manually supports the current local-only behavior, but there is no demo-based claim test.

## Structure and accessibility checklist

| Check | Result |
|---|---|
| Root title pattern, ≤60 characters | PASS: “Family Digital Dossier — a map for the people you trust” is 55 characters, although “map” is metaphorical. |
| Privacy/Terms route titles | PASS: route-specific titles. |
| `lang`, main landmark, one landing H1, image alt | PASS on the landing page. |
| Meta description and canonical | PASS on `/`, `/privacy/`, and `/terms/`; wrong root canonical is inherited by fallback routes. |
| OG/Twitter/social image | FAIL: absent. |
| SVG/favicon/apple-touch set | FAIL: one PNG icon on `/`; no linked icon on legal routes; `/favicon.ico` is 404. |
| Designed 404 | **BLOCKING FAIL**: unknown paths return the landing page with 200. |
| Deep links and Back for app views | **BLOCKING FAIL**: no view URLs or history entries. |
| Route focus/announcement | FAIL: focus moves to `<main>`, not the new heading; no route-title announcement. |
| App H1 | FAIL: the wordmark is H1; the current screen title is H2. |
| Link crawl | PASS: every linked HTTP(S) target on `/`, `/privacy/`, and `/terms/` returned 200; two `mailto:` links were exempt. |
| Header/footer consistency | FAIL: legal and root footers differ; required factory attribution and build ID are absent; mobile header hides legal links. |
| Visual identity | PASS: archival paper, clipped forms, seal motif, and original envelope illustration are product-specific rather than generic SaaS styling. |
| Factory `verify-url.sh` | PASS: HTTP 200, no console errors, title/lang/main present, one H1, no missing alt or unlabeled buttons. |
| axe CLI 4.10.3 | PASS: 0 violations on the live landing page. A matching temporary Chrome 145/ChromeDriver 145 pair was used. |
| Keyboard/reduced motion | PASS in the clean Playwright suite. |

## Final decision

**FAIL.** Acceptance requires zero blocking findings. This review found three: no isolated one-click demo, no claims registry or claim-tagged tests, and broken route/404/history behavior. Re-review only after those are fixed and the full claim matrix passes from a fresh demo sandbox.
