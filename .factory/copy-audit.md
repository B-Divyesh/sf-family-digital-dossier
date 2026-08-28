# Copy audit — polish round 3

Count method: Unicode word tokens; hyphenated terms count as one. The banned-word scan covers `leverage`, `seamless`, `effortless`, `robust`, `powerful`, `intuitive`, `reimagine`, `supercharge`, `delightful`, `journey`, `ecosystem`, and `AI-powered`.

## Landing page sentences

| ID | Words | Copy |
| --- | ---: | --- |
| L01 | 7 | Map essential records for someone you trust |
| L02 | 14 | For adults helping family or an executor find records during illness or after death. |
| L03 | 8 | The sample opens as a filled, private dossier. |
| L04 | 4 | Saved on this device |
| L05 | 4 | Works offline after setup |
| L06 | 4 | All tools are free |
| L07 | 7 | Never enter a password or recovery code. |
| L08 | 10 | Record what exists, where it is, and who to contact. |
| L09 | 13 | Preview locations, trusted people, review dates, and first steps without entering personal details. |
| L10 | 9 | Name each record and point to its safe location. |
| L11 | 4 | Keep every secret elsewhere. |
| L12 | 13 | Link a family member or professional to each record when they can help. |
| L13 | 12 | Review the dossier, then print a cover or save an encrypted backup. |
| L14 | 9 | The app has no document upload or account-access feature. |
| L15 | 9 | Do not paste passwords or document contents into notes. |
| L16 | 6 | It does not give legal advice. |
| L17 | 10 | Your passphrase encrypts the dossier before this browser saves it. |
| L18 | 7 | There is no account or recovery reset. |
| L19 | 10 | Your passphrase encrypts the dossier before this browser saves it. |
| L20 | 6 | We cannot see or recover it. |
| L21 | 9 | Use 4–6 unrelated words (at least 12 characters). |
| L22 | 9 | Store a copy somewhere your executor can eventually access. |
| L23 | 13 | I understand there is no reset or recovery if I lose this passphrase. |
| L24 | 7 | A private guide to essential family records. |

All landing sentences are 14 words or fewer. None contains a banned marketing word. “Unlock” appears only for the literal action of opening an encrypted dossier.

## Landing headings and actions

| Copy | Result |
| --- | --- |
| Help without sharing passwords | Plain context; no jargon. |
| Map essential records for someone you trust | Seven-word, verb-first job headline. |
| Try it with sample data | Primary action; opens `/?demo=1`. |
| Create encrypted dossier | Secondary real-data action. |
| See the record guide before you start | Names the preview. |
| Prepare the handoff in three steps | Introduces three verb-led steps. |
| List record locations / Name trusted people / Print or export the handoff | Stable terms and concrete actions. |
| What this dossier does not do | Names limits directly. |
| All tools are free | States no purchase is required; UC-16 proves it. |

## README sentences

Every README prose sentence is at most 17 words. The longest are the review, restore, and separate-check commands, at 17 words each. The banned-word scan has no result except literal “unlock” terminology in source UI. The README uses only the terms below for product concepts.

## Terminology

| Concept | Required word |
| --- | --- |
| The complete saved artifact | dossier |
| One listed item | record |
| A recipient or helper | trusted person |
| Where an item can be found | location |
| Protected portable file | encrypted backup |
| Readable tabular file | spreadsheet |
| Payment tier | none |

Implementation names such as IndexedDB, AES-256-GCM, and PBKDF2-SHA-256 appear only in technical or privacy explanations.

## Legal-route changes in round 3

| Route | Words | Copy | Claim coverage |
| --- | ---: | --- | --- |
| Privacy | 14 | Settings → Delete this dossier removes the encrypted local copy. | UC-30 |
| Privacy | 17 | The service worker caches application resources, including the illustration, so the app opens without a connection. | UC-31 |
| Privacy | 9 | Your dossier records are not placed in the cache. | UC-31 |
| Terms | 18 | The app has no workflow that creates a will, trust, power of attorney, beneficiary designation, or account authority. | UC-32 |

The untestable hosting-log statement and browser-site-data deletion statement were removed. The legal-route additions are below 22 words and use no banned marketing terms.
