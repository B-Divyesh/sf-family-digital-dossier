# Family Digital Dossier

Family Digital Dossier stores an encrypted guide to essential family records on your device. It works offline after the first visit.

Open the [live app](https://family-digital-dossier.sociobot.in) or [try the sample dossier](https://family-digital-dossier.sociobot.in/?demo=1).

## Who it is for

It is for adults preparing records for family, an executor, or another trusted person. The app has no document upload or account-access feature. Do not paste passwords or document contents into notes. It does not give legal advice.

## What it does

- Encrypts dossier content on this device with a key created from your passphrase. The technical method is AES-256-GCM with PBKDF2-SHA-256.
- Records institutions, document locations, reference names, renewal dates, contacts, and what family should do first.
- Schedules a review every six months, keeps past reviews, and checks whether someone can find three records.
- Prints a sealed cover sheet. Exports an encrypted backup or a readable spreadsheet.
- Restores backups, changes passphrases, works offline after the first visit, and can be installed on a device.
- Rejects text that resembles a password or recovery code. Blocks readable exports until detected secrets are removed.

## Privacy and lost passphrases

The browser stores one encrypted copy of the dossier in an IndexedDB database on this device. Demo data uses a separate `demo:family-digital-dossier` database.

The passphrase stays in memory only while the dossier is open. It is never stored or sent. There is no account or recovery reset. If you lose every usable passphrase copy, you lose the dossier.

Keep an encrypted backup. Arrange for the right person to receive the passphrase separately. Spreadsheet exports and printed pages are readable and not encrypted. Protect exported files and printed pages.

The app has no analytics, third-party scripts, or remote fonts.

## Develop and verify

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test
```

`npm test` runs type checks, linting, unit tests, and a production build. It then runs browser, accessibility, mobile, keyboard, privacy, and offline checks.

Playwright is pinned to 1.58.2. Run checks separately with `npm run typecheck`, `npm run lint`, `npm run test:unit`, or `npm run test:e2e`.

Run all public claim checks with:

```sh
npm run test:claims
```

The production command is `npm run build`. Static output lands in `dist/`, with `dist/index.html` at its root.

The build creates versioned assets and a matching offline worker. It also copies the Azure Static Web Apps response and cache configuration.

Deploy the contents of `dist/`. The factory manages hosting, domain setup, and release configuration.

## Project references

- [Product brief](.factory/brief.json)
- [Sample dossier contract](.factory/demo.md)
- [Tested public claims](.factory/claims.json)
- [Visual design and image sources](.factory/design.md)
- [Privacy policy](privacy/index.html)
- [Terms](terms/index.html)

The project uses the MIT license. The footer discloses generated imagery. Its prompt and generator are recorded in `.factory/design.md` and `assets/src/`.
