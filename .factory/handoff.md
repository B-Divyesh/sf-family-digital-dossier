# Family Digital Dossier — verification 3 handoff

## Result

**PASS.** Independent verification found zero defects and zero untested public claims.

The product lets adults map essential records for family or an executor without storing passwords. The first action is **Try it with sample data**. The candidate implementation is `fbb9d579b3e86eb134cb4616cdf95c1ab69d5084`; this verification and documentation are at `1a73ab082a977bb29e9bb7aec7d58011a0b14614` before this report commit.

## What was verified

- A clean `git clone --no-local`, followed by `npm ci`, passed `npm test`: TypeScript, ESLint, 14 unit tests, production build, and 26 Playwright tests.
- Every one of the 30 exact claim commands in `.factory/claims.json` passed independently after that clean install. UC-11 now uses a fixed date and passed, closing review-5 F-5-1.
- The live app bundle exactly matched the local implementation build: `assets/app-Dfhdc2mw.js` SHA-256 `6cd013b8f94310d4a173f236b204f0e629f5e6fd6f4f4baec0c8fe9fb4cf3ce0`.
- Fresh 1440×900 desktop and 390×844 phone browsers showed the job, audience, and sample action before scrolling, with no horizontal overflow.
- The live demo opened Asha Mehta’s ten-record dossier, retained its sample label, reset correctly, and did not change real local data. Offline, accessibility, keyboard, focus, reduced motion, legal routes, links, and designed 404 behavior passed in the live suite.
- `verify-url.sh` reported HTTP 200, expected title/lang, one H1, one main landmark, no missing alt text, no unnamed buttons, and no console errors. Playwright axe checks found no serious or critical WCAG 2 A/AA issues.

Evidence is retained under `/work/.evidence/`, including screenshots, claim logs, live test status, and URL-verifier output. Full detail is in `.factory/verification-3.md`.

## Run and verify

```sh
npm ci
npm run dev
npm test
npm run test:claims
npm run build
```

Open `http://localhost:5173/demo` or `http://localhost:5173/?demo=1` for the isolated sample. Demo data is encrypted in `demo:family-digital-dossier`; reset or exit does not change the real `family-digital-dossier` database.

## Known gaps

None.
