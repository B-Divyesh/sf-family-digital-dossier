# Sample dossier

- URL: <https://family-digital-dossier.sociobot.in/?demo=1>. `/demo` opens the same sandbox directly.
- Sample: Asha Mehta’s ten record locations, three trusted people, handoff instructions, and two review events.
- Storage: encrypted under `vault/primary` in the separate IndexedDB database `demo:family-digital-dossier`.
- Isolation: demo code never reads or writes the real `family-digital-dossier` database.
- Reset: **Reset demo** deletes the demo database and recreates the original sample.
- Exit: **Start for real** deletes the demo database before returning to `/`.
- Offline: visit the demo once while online. The service worker then opens the app shell and sample database offline.
