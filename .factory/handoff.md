# Family Digital Dossier — build handoff

## What shipped

- A responsive, installable offline PWA for creating a practical family record locator rather than a password vault.
- AES-256-GCM client-side encryption with PBKDF2-SHA-256 (310,000 iterations), a no-recovery passphrase model, and one encrypted IndexedDB envelope.
- Record, renewal, safe-reference, contact, jurisdiction, document-location, and first-hour instruction workflows with useful empty and error states.
- A completion map, configurable review interval, visible review history, and three-record findability drill aligned to the success measure.
- Free encrypted JSON backup/import, readable CSV export with a security warning, passphrase rotation, confirmed local deletion, and sealed-cover printing.
- One-time Dossier Plus integration at `https://api.sociobot.in/api/v1/products/family-digital-dossier/...`: hosted checkout, query-token capture, daily verification cache, offline cached verdict, paste-to-restore, revoked-license handling, starter templates, and full-packet printing. No product ID is hardcoded.
- `/privacy/` and `/terms/`, MIT license, manifest, maskable icon, service worker with versioned precache/update notice, and a dedicated offline fallback.
- A product-specific “sealed constellation” design system and an original generated paper-archive hero. Source, exact prompt, generator, review notes, and optimized AVIF/WebP/JPEG derivatives are retained.

## How to run and verify

```sh
npm ci
npm test
npm run build
```

The exact deployment build command is `npm run build`. Output lands in `dist/`, with `dist/index.html` at its root.

Automated verification on 2026-08-28:

- `npx tsc --noEmit`: passed.
- `npm test`: passed (unit encryption tests, production build, four Chromium checks).
- Playwright 1.58.2: encrypted create/save/lock/unlock and persistence passed; axe found zero serious/critical WCAG A/AA violations on landing and unlocked record screens; 390px had no horizontal overflow; offline warm-cache navigation passed with `context.setOffline(true)`.
- `npm audit`: zero vulnerabilities.
- Production bundle: initial app JavaScript 43.83 KB raw / 12.92 KB gzip; CSS 11.61 KB raw / 3.53 KB gzip. No runtime fonts. Hero is 27 KB AVIF, 57 KB WebP, 71 KB JPEG.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.3 s, CLS 0, TBT 0 ms, total transfer 52 KiB.
- Lighthouse 12.8.2 desktop: Performance 100, Accessibility 100, Best Practices 100, SEO 100 after canonical/robots additions; measured LCP 0.3 s, CLS 0, TBT 0 ms.
- Manual 390 × 844 visual inspection: readable, stacked controls, no horizontal overflow, and safe spacing around the sticky-free layout.

## Privacy and security notes

- No dossier content, passphrase, analytics, third-party font, or tracking script leaves the device.
- The passphrase lives in JavaScript memory only while unlocked. There is intentionally no reset, escrow, or vendor recovery route.
- CSV and print are deliberately readable exports; warnings put their storage and physical security under user control.
- The only product API traffic is license verification when a token exists. Payment details stay with the Sociobot / Dodo hosted checkout.

## Known gaps and next steps

- The factory must register the billing product, price/return URL, and production checkout before paid unlock can complete. The UI currently states the chosen one-time ₹799 price.
- There is intentionally no cloud sync, multi-device merge, scheduled notification service, or remote recovery. Transfer uses an encrypted backup.
- The app explains that laws differ but does not automate jurisdiction-specific legal advice. Local professional review remains the user’s responsibility.
- Browser storage can be cleared by the user or OS; onboarding and Settings therefore emphasize encrypted backups.
- Run a real family recipient usability session against the “locate three records” measure after deployment, then refine copy without weakening the no-credentials boundary.
