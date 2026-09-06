# Review 5 — Check a family record handoff

**Verdict: FAIL**

Reviewed 2026-09-06 at <https://family-digital-dossier.sociobot.in>. There is one finding. There are zero untested public claims.

## Product and first action

Family Digital Dossier helps adults leave a record finder for family or an executor during illness or after death. It records where essential records are, who to contact, and what to do first. It does not take passwords or documents.

Fresh Chromium sessions with no browser storage were opened before scrolling at 390×844 and 1440×900. Both showed the same first screen:

| Check | Result |
| --- | --- |
| Job | “Map essential records for someone you trust.” |
| Audience | “For adults helping family or an executor find records during illness or after death.” |
| First action | **Try it with sample data**. The nearby sentence says it opens a filled, private dossier. |
| Plain facts | Saved on this device; works offline after setup; all tools are free. |

The first-read contract passes. The phone page was 390 CSS pixels wide with no horizontal overflow and had no console error. The desktop page had the same clear primary action.

## Finding

### MAJOR F-5-1 — The UC-11 claim command fails on the current date

**Claim:** “The dossier schedules reviews, keeps review history, and runs a three-record location drill.”

**Command:** `npm run test:claims -- --grep @claim:uc-11`

**Evidence:** A clean detached clone at implementation commit `d444081dd43ce3a4f797bba4aca852edaf8226a3` ran the exact command. It failed at `tests/e2e/claims.spec.ts:218` waiting for `/Feb .*2027/`. The current completed-review flow produces the next review in March 2027, as expected from a review completed on 2026-09-06. The test hard-codes February rather than calculating the next six-month date or freezing the clock.

**Why this fails review:** This is a public claim with a declared proof command. The command is not reliable from the documented clean setup on the current date. `npm test` also fails because it includes this Playwright test.

**Required repair:** Make the test independent of the calendar: freeze the test clock, or calculate and assert the six-month next-review date from the review date. Then run every listed claim command and `npm test` again from a clean clone.

## Demo and real-data boundary

The one-click demo passes its user path. A fresh phone session at `/?demo=1` and a fresh direct `/demo` session both opened Asha Mehta’s dossier with ten realistic record locations, three trusted people, instructions, and review history. The persistent banner says “Demo — sample data, nothing is saved to your dossier.” It provides **Reset demo** and **Start for real**.

I wrote a marker only into the fresh browser’s real IndexedDB namespace, entered the sample, opened Records, reset the sample, and left it. The marker stayed unchanged throughout. The sample envelope used `demo:family-digital-dossier`; leaving removed that database. The flow made no cross-origin request and no non-GET request body. A warmed sample reload and Records view also worked offline. This is test-only browser storage, not product-user data.

## Claim commands

`npm ci` succeeded in a new `git clone --no-local`. All 30 exact commands listed in `.factory/claims.json` then ran independently. Logs were kept during review at `/tmp/fdd-review5-claimsfull-CVVBZa/`.

| Claims | Result |
| --- | --- |
| UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10 | PASS |
| UC-11 | **FAIL — F-5-1** |
| UC-12, UC-13, UC-14, UC-16, UC-17, UC-18, UC-19, UC-20, UC-21 | PASS |
| UC-23, UC-24, UC-25, UC-26, UC-27, UC-28, UC-29, UC-30, UC-31, UC-32 | PASS |

The successful commands cover the local-only and encrypted-storage boundaries, credential rejection, normal record/person/export/backup paths, wrong-passphrase recovery, delete behavior, offline operation, no purchase path, cache contents, and the legal scope. No public claim was skipped. `npm test` was run from the same clean clone and failed at the same UC-11 assertion after its typecheck, lint, 14 unit tests, build, and preceding browser checks.

## Live checks

- The live application JavaScript hash matched the clean implementation build: `app-Dfhdc2mw.js`, SHA-256 `6cd013b8f94310d4…`.
- Home, `/demo`, `/demo/records`, `/privacy/`, and `/terms/` returned 200. They each had `lang="en"`, one H1, a main landmark, a route-specific title, and no serious or critical WCAG 2 A/AA axe finding.
- The browser axe integration was run with CSP bypass solely for the audit injection. It found zero serious or critical findings on those routes and the 404 page. `npx @axe-core/cli` was also attempted but its Selenium wrapper could not find a system Chrome binary; the Playwright axe integration supplied the completed accessibility result.
- Keyboard skip navigation, route H1 focus on in-app navigation, visible focus styling, mobile layout, and reduced-motion behavior are covered by the clean browser suite. The live route and title checks agree with the built candidate.
- Every first-party link discovered on home, demo views, legal pages, and the 404 page returned 200, except the deliberate missing route. Mail links and the labelled external Param Factory link are explicit destinations.
- `/not-a-real-route` returned HTTP 404 and the styled “This record route is missing” page with recovery links. The browser reported the expected failed 404 resource; this is not a defect.
- The live CSP, `X-Content-Type-Options`, `Referrer-Policy`, and Permissions Policy are present. The application made no third-party request in the cold landing or sample flow. No backend exists for this static local-first product, so tenant isolation, persistence restart, health, and 429 checks do not apply.

## Earlier findings

All earlier review and verification records were read. Their current disposition is below; this review did not rely only on their labels.

| Earlier items | Current disposition |
| --- | --- |
| Review 1 B-01 | Fixed: the isolated, realistic demo, persistent label, reset/exit behavior, and offline sample path are present. |
| Review 1 B-02 and Review 2 F-2-1 | Fixed except for this new command failure: the registry exists and 29 of 30 exact commands pass. UC-11 is reopened as F-5-1. |
| Review 1 B-03 | Fixed: real demo routes, route titles, focus behavior, and designed HTTP 404 work. |
| Review 1 M-01–M-04 | Fixed: clear first screen, no unavailable paid offer, complete shell/metadata, filled preview, and the three-step workflow are live. |
| Review 1 copy findings and Review 2 F-2-3, F-2-4, F-2-9, F-2-10 | Fixed: current landing and README copy is plain, the offline/art text is clear, the audience sentence is grammatical, and the external link says it opens externally. |
| Review 2 F-2-2 and F-2-5–F-2-8 | Fixed: no billing path, and the relevant scope, record-person, Playwright-pin, and MIT statements have registry coverage. |
| Review 3 F-3-1–F-3-4 | Fixed: untestable hosting/browser-data wording remains removed; deletion, cache boundary, and legal-workflow claims have UC-30/31/32 coverage. |
| Earlier verification P1/P2 | Fixed in the candidate: the tested offline path, credential-like input block, CSP, Permissions Policy, and versioned assets are present. |

## Scope and product fit

The product still covers the useful follow-ons implied by the brief: record locations, trusted people, review history, a three-record drill, encrypted backup/restore, readable export, and the sealed cover. AI would send sensitive estate context and is not needed for the job. Cloud sync would change the stated local-first recovery model. Neither is a missing-feature finding.

## Commits reviewed

- Implementation: `d444081dd43ce3a4f797bba4aca852edaf8226a3` (`test: prove all tools remain free`).
- Documentation/report head: `c3b11d4c0878ba863401ebdb13540376c49aac47` (`docs: add adversarial review four`). The commits after `d444081` change only factory documentation; they do not change the deployed product asset reviewed above.

**Final result: FAIL — 1 major finding, 0 untested public claims.**
