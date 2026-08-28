# Family Digital Dossier — polish round 1 handoff

## Status

Work order `family-digital-dossier-polish-1` is complete. All findings in `.factory/review-1.md` are closed; there were no earlier review or polish files. The detailed ID-by-ID record is `.factory/polish-1.md`.

The repair preserves the `pwa-offline` static artifact and the original archival-paper, sealed-constellation visual system. No infrastructure, DNS, or billing configuration was changed.

## Delivered

- One-click, prefilled `/demo` and `/?demo=1` experience with a visible sample banner, reset, Start for real, and an isolated `demo:family-digital-dossier` IndexedDB database.
- `.factory/claims.json` with 25 independently runnable claim commands and exactly one matching tag per claim.
- Real app/demo section routes, history and Back support, route focus and announcement, unique titles/canonicals, one H1, and a styled HTTP 404.
- Plain first-screen wording, primary sample action, tested facts, a filled preview, three-step workflow, limits, and full ₹799 one-time Plus disclosure.
- Complete Open Graph/Twitter metadata, original 1200×630 preview art, favicons, touch icon, consistent route chrome, mobile legal links, sitemap, robots, and security/cache policies.
- Rewritten landing/README copy, stable terminology, catalog description, demo documentation, copy audit, image provenance, and this handoff.

Repair commits:

- `9417840369ddb9091b8fb2fb28edaa3584fe4a05` — product, demo, routes, copy, metadata, claims, and tests
- `4d8a556e668cfb4df78932d9c8d5450bf879cefa` — stable offline sample verification
- `030cedbde084d3dd12dd3bab1c3eeff7d95e07c1` — deterministic offline demo reload
- `56d22bde5d51a80122e609ff667085860371635e` — production-target browser verification support

## Verification

From a clean GitHub clone at `030cedbde084d3dd12dd3bab1c3eeff7d95e07c1`:

- `npm ci`: passed, zero vulnerabilities.
- `npm test`: passed type checking, ESLint, 14/14 unit tests, production build, and 19/19 Playwright tests.
- Every one of the 25 commands in `.factory/claims.json`: passed separately from the isolated demo entry point.

The final local tree was then tested again after the production-target test support commit:

- `npm test`: passed; 14/14 unit and 19/19 browser tests.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Build output: app JS 58.93 kB raw / 17.61 kB gzip; CSS 15.12 kB raw / 4.28 kB gzip; `dist/index.html` present.

At <https://family-digital-dossier.sociobot.in> after a cold open:

- Production-target Playwright suite: 19/19 passed. It covers interaction, axe, keyboard, reduced motion, 390px mobile, privacy, offline reload, metadata, routes, focus, legal pages, and 404 behavior.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200 with no errors; one H1, main landmark, language, title, alt text, and button labels all passed.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 0 ms, CLS 0.
- `/`, `/demo`, `/demo/records`, `/records`, `/privacy/`, and `/terms/` returned 200. `/definitely-not-a-real-route` returned 404 with the designed not-found page.
- All internal links passed the crawl. External links are the explicit Sociobot checkout/site links and two `mailto:` contacts.
- Deployed root HTML and hashed application JS exactly matched local `dist/` SHA-256 values.

Local evidence is under ignored `.factory/evidence/polish-1/`, including clean-clone logs, the live browser log, Lighthouse JSON, URL verifier output, and mobile/desktop screenshots. The permanent finding map is `.factory/polish-1.md`.

## Deployment

Deployment ID: `63d621cc-c6b4-4498-a5c2-62363a06369e`

Live URL: <https://family-digital-dossier.sociobot.in>

Artifact: `dist/`, deployed through `/opt/fleet/lib/deploy-static.sh family-digital-dossier dist`

## Run and verify

```sh
npm ci
npm test
npm run test:claims
npm run build
PLAYWRIGHT_BASE_URL=https://family-digital-dossier.sociobot.in npx playwright test
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh https://family-digital-dossier.sociobot.in .factory/evidence/verify-url
```

## Known gaps

None found. No review finding, minor item, stub, or TODO is deferred.
