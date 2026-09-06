# Independent verification 3 — PASS

**Verdict: PASS**

- **Implementation candidate:** `fbb9d579b3e86eb134cb4616cdf95c1ab69d5084`
- **Documentation candidate:** `1a73ab082a977bb29e9bb7aec7d58011a0b14614`
- **Live URL:** <https://family-digital-dossier.sociobot.in/>
- **Verified:** 2026-09-06
- **Findings:** 0
- **Untested public claims:** 0

## Job, audience, and first action

The job is to map essential records for family or an executor. It is for adults preparing a trusted handoff during illness or after death. The first action is **Try it with sample data**.

Fresh 1440×900 desktop and 390×844 phone contexts showed the headline, audience sentence, and action before scrolling. Both widths had no horizontal overflow. Evidence: `/work/.evidence/fdd-verify3-desktop-home.png`, `/work/.evidence/fdd-verify3-phone-home.png`.

## Clean-clone quality gates

A new `git clone --no-local` was made from the requested repository state, then `npm ci` was run in that clone. It installed 140 packages and reported zero vulnerabilities.

`npm test` passed in that clone:

- TypeScript and ESLint passed.
- Vitest passed 14/14 tests.
- Vite built `dist/` with `dist/index.html` at its root.
- Playwright passed 26/26 browser tests.
- The production app JS was 53.03 kB raw / 15.95 kB gzip; CSS was 15.37 kB raw / 4.33 kB gzip.

## Declared public claims

All 30 exact commands in `.factory/claims.json` were invoked independently after the clean install. Every command passed. Their retained outputs are in `/work/.evidence/fdd-verify3-claim-logs/`.

| Claim commands | Result | Observable coverage |
| --- | --- | --- |
| UC-01, UC-02, UC-05, UC-07, UC-21 | PASS | Useful sample, separate demo storage, local-only requests, and no tracking or remote resources. |
| UC-03, UC-04, UC-09, UC-17, UC-18, UC-19 | PASS | AES-GCM/PBKDF2 encrypted envelope, passphrase memory boundary, wrong-passphrase recovery boundary. |
| UC-08, UC-10, UC-14 | PASS | Locator fields persist; likely secrets are rejected in entry, import, display, export, and print. |
| UC-11 | PASS | Fixed-clock review schedule, persisted history, and three-record drill. The former calendar-dependent failure is closed. |
| UC-12, UC-20 | PASS | Encrypted backup, readable spreadsheet, and sealed-cover output. |
| UC-06, UC-13 | PASS | Offline demo reload, backup restore, passphrase change, and install metadata. |
| UC-16 | PASS | Every tool is free; no purchase or license path. |
| UC-23, UC-24, UC-25 | PASS | Test command composition, versioned build/worker/policies, and artwork provenance. |
| UC-26, UC-27 | PASS | No upload or account-access workflow; record-to-person link and deletion clearing. |
| UC-28, UC-29 | PASS | Exact Playwright pin and MIT license. |
| UC-30, UC-31, UC-32 | PASS | Local deletion, cache/data separation, and no legal-document or authority workflow. |

I also reviewed the live landing, demo, privacy, terms, and 404 copy against the registry. Product and privacy assertions have claim coverage; legal advice, warranty, and jurisdiction text are terms/disclaimers rather than product-capability claims. No unlisted public capability claim was found.

## Live product check

The deployed `assets/app-Dfhdc2mw.js` SHA-256 is `6cd013b8f94310d4a173f236b204f0e629f5e6fd6f4f4baec0c8fe9fb4cf3ce0`, exactly matching the clean build from implementation candidate `fbb9d579`.

The full live Playwright suite passed 26/26, including normal, invalid, boundary, recovery, keyboard, focus, reduced-motion, mobile, accessibility, privacy, route, 404, service-worker, and offline paths. Retained status: `/work/.evidence/fdd-verify3-live-playwright-last-run.json`.

Manual fresh-browser checks also confirmed:

- The one-click sample opens Asha Mehta’s realistic ten-record dossier; a persistent **Demo — sample data, nothing is saved to your dossier.** label is present. Records include Term life insurance policy. Evidence: `/work/.evidence/fdd-verify3-desktop-demo.png`, `/work/.evidence/fdd-verify3-phone-demo.png`.
- **Reset demo** restores the sample. The live suite additionally wrote a real-store marker, edited/reset/exited demo, and proved the real encrypted store was unchanged.
- The warmed PWA shell and demo reload offline; the installed shell test passed live.
- `verify-url.sh` returned HTTP 200 in 786 ms with the expected title, `lang=en`, one H1, one main landmark, no missing image alt text, no unnamed buttons, and no console errors. Evidence: `/work/.evidence/fdd-verify3-url/`.
- Playwright axe WCAG 2 A/AA checks found no serious or critical issues on the landing, demo, privacy, terms, and designed 404 pages. The Playwright axe integration is used because it is already pinned and exercised by the live suite.
- `/privacy/`, `/terms/`, and `/definitely-not-a-real-route` have route-specific titles. The last returned deliberate HTTP 404 and the designed recovery page; it is expected behavior, not a defect.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Original verification P1 offline reload | Closed: clean and live isolated warm-cache offline reload passed. |
| Original verification P1 credential-like storage | Closed: entry/import/output safety paths pass. |
| Original verification P2 headers/cache policy | Closed: CSP, permissions policy, versioned assets, worker, and cache checks pass. |
| Review 1 demo, claims, routing, metadata, 404, mobile, and first-screen findings | Closed: isolated sample, 30-command registry, real routes, titles/focus, designed 404, metadata, and responsive checks pass. |
| Review 2 F-2-1–F-2-10 | Closed: self-building claim commands, no paid path, clear copy, scope/relationship coverage, pin/license coverage, corrected audience, and labelled external link remain present. |
| Review 3 F-3-1–F-3-4 | Closed: unsupported privacy statements stay removed; deletion, cache boundary, and legal-workflow limits are tested by UC-30–UC-32. |
| Review 5 F-5-1 | Closed: UC-11 freezes the date at 2026-09-06 and independently passed. |

## Decision

**PASS — 0 findings and 0 untested public claims.**
