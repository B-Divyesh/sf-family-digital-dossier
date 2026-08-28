# Family Digital Dossier

Family Digital Dossier is an encrypted, offline-first locator for essential family records. It helps an adult tell a trusted person what exists, where to find it, who can help, and what to do first during illness or death—without storing passwords or copying a whole password vault.

Live: <https://family-digital-dossier.sociobot.in>

## Who it is for

It is for people preparing a practical handoff to family, an executor, or another trusted contact. It is not a password manager, will, power of attorney, automated account-access service, or source of legal advice.

## What it does

- Encrypts all dossier content locally with AES-256-GCM and a passphrase-derived key.
- Maps institutions, record locations, safe reference labels, renewal dates, contacts, and first-hour instructions.
- Creates a six-month review checklist, durable review history, and three-record findability drill.
- Prints a sealed cover sheet and exports an encrypted JSON backup or explicitly unencrypted CSV.
- Imports backups, rotates passphrases, works offline after first load, and can be installed as a PWA.
- Offers a one-time Dossier Plus license for starter templates and full handoff packet printing. Core safety and data ownership features remain free.

## Privacy and recovery model

The dossier is stored as one encrypted envelope in browser IndexedDB. The passphrase is held only in memory while unlocked and is never stored or transmitted. There is no account and no recovery bypass: losing both the passphrase and a usable unlocked device means the dossier cannot be recovered. Keep an encrypted backup and arrange for the right person to receive the passphrase separately at the right time.

Readable CSV exports and printed pages are not encrypted. Users control their storage and physical security. The app has no analytics, third-party scripts, or remote fonts. License verification is the only product API call, and only occurs when a license token exists.

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test
```

`npm test` runs unit encryption tests, makes a production build, and runs Playwright interaction, accessibility, and offline checks. Playwright is pinned to 1.58.2.

The exact production build command is:

```sh
npm run build
```

Static output lands in `dist/` with `dist/index.html` at its root. Preview it with `npm run preview`. Deploy the contents of `dist/`; infrastructure, DNS, billing product registration, and checkout configuration are managed by the factory.

## Project references

- [Product brief](.factory/brief.json)
- [Visual system and asset provenance](.factory/design.md)
- [Privacy policy](privacy/index.html)
- [Terms](terms/index.html)

MIT licensed. Generated imagery is disclosed in the product footer and documented with its prompt and generator in `.factory/design.md` and `assets/src/`.
