# Map essential records for family or executors — PASS

**Verdict: PASS**

- **Implementation candidate:** `fbb9d579b3e86eb134cb4616cdf95c1ab69d5084`
- **Documentation baseline reviewed:** `f89ba3e5df99c444952158a106e05cb140dff6bb`
- **Live URL:** <https://family-digital-dossier.sociobot.in/>
- **Reviewed:** 2026-09-06
- **Findings:** 0
- **Untested public claims:** 0

## Job, audience, and first action

The job is to map locations of essential records for family or an executor. It is for adults helping family or an executor find records during illness or after death. The first action is **Try it with sample data**.

Fresh live desktop and phone checks showed the title, one H1, the job headline, audience sentence, and sample action before scrolling. `verify-url.sh` recorded the desktop check; the live Playwright mobile check used 390 by 844 CSS pixels and found no horizontal overflow. Neither check recorded console errors.

## Clean checkout and claims

A detached clean clone at the documentation baseline was installed with `npm ci`. The clean aggregate command passed:

- `npm test`: TypeScript, ESLint, 14/14 Vitest tests, production build, and 26/26 Playwright tests.
- Built app JavaScript: 53.03 kB raw / 15.95 kB gzip. Built CSS: 15.37 kB raw / 4.33 kB gzip.
- Every one of the 30 exact commands declared in `.factory/claims.json` was then run independently. All 30 exited 0. This includes UC-11, the former date-sensitive schedule proof.

Logs: `/work/.evidence/fdd-review6-npm-ci.log`, `/work/.evidence/fdd-review6-npm-test.log`, `/work/.evidence/fdd-review6-claims-results.tsv`, and the per-claim logs in the directory named by `/work/.evidence/fdd-review6-claim-log-dir`.

The claim commands cover the usable sample and its isolated database; local-only requests and no tracking; encrypted IndexedDB storage and passphrase recovery limits; record, people, review, drill, backup, spreadsheet, print, install, and offline paths; likely-secret prevention; no paid path; build, artwork, license, and toolchain facts; local deletion/cache separation; and the no-legal-document/no-account-authority boundary. I compared landing, README, privacy, and terms copy with the registry and found no unlisted public capability claim.

## Live checks

The live root serves `assets/app-Dfhdc2mw.js`. Its SHA-256 is `6cd013b8f94310d4a173f236b204f0e629f5e6fd6f4f4baec0c8fe9fb4cf3ce0`, exactly matching the clean local build from `fbb9d579`.

The full 26-test Playwright suite passed against the live origin. It exercises normal creation, lock/unlock and editing; invalid secret-like text; wrong-passphrase recovery; mobile operation; keyboard skip navigation and focus; reduced motion; same-origin/no-body privacy behavior; service-worker warm-cache offline reload; routes, history, title, and focus restoration; security/cache headers; and route metadata. It also uses axe-core on landing, demo, privacy, terms, and designed 404 pages; no serious or critical WCAG 2 A/AA violations occurred.

The one-click sample is verified by the live suite from a fresh context: Asha Mehta's dossier opens with ten realistic records, three trusted people, handoff instructions, and review history. The persistent label reads **Demo — sample data, nothing is saved to your dossier.** Reset restores the seed, and leaving the demo removes only `demo:family-digital-dossier`; a real-store marker remains unchanged. This proves the demo cannot alter real data.

`verify-url.sh` passed for the live root: HTTP 200, title `Family Digital Dossier — map essential family records`, `lang=en`, one H1, one main landmark, no missing image alt text, no unnamed button, and no console errors. It measured a 650 ms load in its browser check. Routes `/`, `/demo`, `/privacy/`, and `/terms/` returned 200. `/definitely-not-a-real-route` deliberately returned HTTP 404 with the styled recovery page and route-specific title; that is expected behavior, not a finding. The manifest, robots file, sitemap, and security headers also resolved. Evidence: `/work/.evidence/fdd-review6-verify-url.log`, directory named by `/work/.evidence/fdd-review6-verify-url-dir`, `/work/.evidence/fdd-review6-live-playwright.log`, and `/work/.evidence/fdd-review6-live-home.headers`.

## Earlier findings

| Earlier finding set | Current disposition and proof |
| --- | --- |
| Original verification P1 offline reload and credential-like storage; P2 CSP/cache policy | Closed. Isolated warm-cache offline reload, secret rejection, CSP/permissions policy, and versioned cache checks passed locally and live. |
| Review 1 B-01 through B-03 and M-01 through M-04 | Closed. The isolated filled demo, claim registry, real routes, metadata, responsive first screen, removed unavailable paid offer, and filled product preview all passed. |
| Review 1 copy findings, including COPY-L*, COPY-LU*, COPY-R*, and COPY-RU* | Closed. Current landing and README copy remains plain, names the task and action, uses the corrected audience sentence, and discloses generated art plainly. |
| Review 2 F-2-1 through F-2-10 | Closed. Each claim command now builds from a clean checkout, there is no checkout path, the offline/art wording is clear, scope and record-person behavior are tested, Playwright and MIT facts are tested, and the external footer link is labelled. |
| Review 3 F-3-1 through F-3-4 | Closed. Privacy and scope statements are covered by UC-30, UC-31, and UC-32; no unsupported storage or legal-workflow promise remains. |
| Review 5 F-5-1 | Closed. UC-11 freezes its calendar date and passed independently from the clean checkout on this review date. |

## Decision

**PASS — 0 findings and 0 untested public claims.**
