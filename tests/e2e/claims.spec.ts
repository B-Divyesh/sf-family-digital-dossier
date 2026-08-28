import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const DEMO_PASSPHRASE = 'sample dossier only 2026';
const APP_ORIGIN = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173').origin;

async function openDemo(page: Page): Promise<void> {
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved to your dossier.')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Asha Mehta’s dossier' })).toBeVisible();
}

async function idbValue(page: Page, database: string): Promise<unknown> {
  return page.evaluate(async (name) => new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('vault')) { db.close(); resolve(undefined); return; }
      const transaction = db.transaction('vault', 'readonly');
      const get = transaction.objectStore('vault').get('primary');
      get.onsuccess = () => resolve(get.result);
      get.onerror = () => reject(get.error);
      transaction.oncomplete = () => db.close();
    };
  }), database);
}

async function decryptStored(page: Page, database: string, phrase: string): Promise<string> {
  return page.evaluate(async ({ name, passphrase }) => {
    const envelope = await new Promise<Record<string, string | number>>((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const get = db.transaction('vault', 'readonly').objectStore('vault').get('primary');
        get.onsuccess = () => resolve(get.result as Record<string, string | number>);
        get.onerror = () => reject(get.error);
      };
    });
    const decode = (value: string): Uint8Array => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: decode(String(envelope.salt)) as BufferSource, iterations: Number(envelope.iterations) }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(String(envelope.iv)) as BufferSource, additionalData: new TextEncoder().encode('family-digital-dossier:v1') }, key, decode(String(envelope.ciphertext)) as BufferSource);
    return new TextDecoder().decode(plaintext);
  }, { name: database, passphrase: phrase });
}

test('@claim:uc-01 @claim:uc-02 @claim:uc-05 @claim:uc-07 @claim:uc-21 demo is useful, isolated, local, and tracker-free', async ({ page, context }) => {
  const outbound: Array<{ url: string; method: string; body: string | null }> = [];
  page.on('request', (request) => outbound.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await page.goto('/');
  await page.evaluate(async () => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('family-digital-dossier', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('vault');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('vault', 'readwrite');
      transaction.objectStore('vault').put({ marker: 'untouched-real-dossier' }, 'primary');
      transaction.oncomplete = () => { db.close(); resolve(); };
    };
  }));
  await openDemo(page);
  await expect(page.getByText('10 to the ten-record goal')).toHaveCount(0);
  await page.getByRole('link', { name: 'Records', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Term life insurance policy' })).toBeVisible();
  await page.getByRole('link', { name: 'Handoff plan' }).click();
  await page.locator('#executor-instructions').fill('Call Mira and then call Rao Legal.');
  await page.getByRole('button', { name: 'Save handoff plan' }).click();
  const realBeforeReset = await idbValue(page, 'family-digital-dossier');
  expect(realBeforeReset).toEqual({ marker: 'untouched-real-dossier' });
  expect(JSON.stringify(await idbValue(page, 'demo:family-digital-dossier'))).toContain('ciphertext');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('heading', { name: 'Asha Mehta’s dossier' })).toBeVisible();
  expect(await idbValue(page, 'family-digital-dossier')).toEqual(realBeforeReset);
  expect(await context.cookies()).toEqual([]);
  expect(outbound.filter((item) => new URL(item.url).origin !== APP_ORIGIN)).toEqual([]);
  expect(outbound.filter((item) => item.method !== 'GET' || item.body)).toEqual([]);
  const remoteResources = await page.locator('script[src], link[rel="stylesheet"], link[rel="preload"]').evaluateAll((nodes) => nodes.map((node) => node instanceof HTMLScriptElement ? node.src : (node as HTMLLinkElement).href).filter(Boolean).filter((url) => new URL(url).origin !== location.origin));
  expect(remoteResources).toEqual([]);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(`${APP_ORIGIN}/`);
  expect(await idbValue(page, 'family-digital-dossier')).toEqual(realBeforeReset);
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name));
  expect(databases).not.toContain('demo:family-digital-dossier');
});

test('@claim:uc-03 @claim:uc-04 @claim:uc-09 @claim:uc-17 @claim:uc-18 @claim:uc-19 encryption and recovery boundaries hold', async ({ page }) => {
  const passphrase = 'orchid river archive lantern';
  const requestBodies: string[] = [];
  page.on('request', (request) => { if (request.postData()) requestBodies.push(request.postData()!); });
  await openDemo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#new-passphrase').fill(passphrase);
  await page.locator('#confirm-passphrase').fill(passphrase);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create encrypted dossier' }).click();
  await expect(page.getByRole('heading', { name: 'Start with what matters most' })).toBeVisible();
  const envelope = await idbValue(page, 'family-digital-dossier') as Record<string, unknown>;
  const stored = JSON.stringify(envelope);
  expect(envelope.format).toBe('family-digital-dossier');
  expect(envelope.kdf).toBe('PBKDF2-SHA-256');
  expect(envelope.iterations).toBe(310000);
  expect(stored).not.toContain(passphrase);
  expect(Object.keys(envelope).sort()).toEqual(['ciphertext', 'format', 'iterations', 'iv', 'kdf', 'salt', 'updatedAt', 'version']);
  expect(await decryptStored(page, 'family-digital-dossier', passphrase)).toContain('"entries":[]');
  await expect(decryptStored(page, 'family-digital-dossier', 'wrong passphrase')).rejects.toThrow();
  expect(JSON.stringify(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } })))).not.toContain(passphrase);
  expect(requestBodies.join('\n')).not.toContain(passphrase);
  await page.getByRole('button', { name: 'Lock' }).click();
  await page.locator('#passphrase').fill('wrong passphrase');
  await page.getByRole('button', { name: 'Unlock dossier' }).click();
  await expect(page.getByRole('alert')).toContainText('did not unlock');
  await expect(page.getByText(/account or recovery reset/i)).toHaveCount(0);
  await expect(page.getByRole('link', { name: /recover|reset/i })).toHaveCount(0);
});

test('@claim:uc-08 @claim:uc-10 @claim:uc-14 fields persist and secret boundaries cover entry, import, display, export, and print', async ({ page }) => {
  test.slow();
  await openDemo(page);
  await page.getByRole('link', { name: 'Records', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Primary bank accounts' }).click();
  await expect(page.locator('#record-institution')).toHaveValue('Sahyadri Bank');
  await expect(page.locator('#record-locator')).toContainText('');
  await expect(page.locator('#record-reference')).toHaveValue('REF-BANK');
  await expect(page.locator('#record-renewal')).toHaveValue('2027-02-15');
  await page.locator('#record-instructions').fill('Ask the estate desk for the current form.');
  await page.getByRole('button', { name: 'Save record' }).click();
  await page.getByRole('link', { name: 'People', exact: true }).click();
  await expect(page.getByText('Sister and executor')).toBeVisible();
  await page.getByRole('link', { name: 'Handoff plan' }).click();
  await expect(page.locator('#executor-instructions')).toContainText('Call Mira first');
  await page.reload();
  await expect(page.locator('#executor-instructions')).toContainText('Call Mira first');
  await page.getByRole('link', { name: 'Records', exact: true }).click();
  await page.getByRole('button', { name: 'Add a record' }).click();
  await page.locator('#record-title').fill('Emergency account');
  await page.locator('#record-locator').fill('password=LegacySecret_42!');
  await page.getByRole('button', { name: 'Add record' }).click();
  await expect(page.locator('#record-error')).toContainText('looks like a password, code, key, or other secret');

  const legacyEnvelope = await page.evaluate(async (passphrase) => {
    const decode = (value: string): Uint8Array => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
    const encode = (bytes: Uint8Array): string => { let binary = ''; for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192)); return btoa(binary); };
    const getEnvelope = await new Promise<Record<string, string | number>>((resolve) => {
      const request = indexedDB.open('demo:family-digital-dossier');
      request.onsuccess = () => { const db = request.result; const get = db.transaction('vault', 'readonly').objectStore('vault').get('primary'); get.onsuccess = () => resolve(get.result as Record<string, string | number>); };
    });
    const derive = async (salt: Uint8Array): Promise<CryptoKey> => {
      const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
      return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: 310000 }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    };
    const oldKey = await derive(decode(String(getEnvelope.salt)));
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(String(getEnvelope.iv)) as BufferSource, additionalData: new TextEncoder().encode('family-digital-dossier:v1') }, oldKey, decode(String(getEnvelope.ciphertext)) as BufferSource);
    const data = JSON.parse(new TextDecoder().decode(plain)) as { entries: Array<{ locator: string }> };
    data.entries[0].locator = 'password=LegacySecret_42!';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await derive(salt);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode('family-digital-dossier:v1') }, key, new TextEncoder().encode(JSON.stringify(data)));
    return { ...getEnvelope, salt: encode(salt), iv: encode(iv), ciphertext: encode(new Uint8Array(ciphertext)) };
  }, DEMO_PASSPHRASE);

  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Import encrypted backup' }).click();
  await page.locator('#backup-file').setInputFiles({ name: 'legacy.encrypted.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacyEnvelope)) });
  await page.locator('#backup-passphrase').fill(DEMO_PASSPHRASE);
  await page.getByRole('button', { name: 'Verify and replace dossier' }).click();
  await expect(page.locator('#import-error')).toContainText('credential-like content');
  await page.getByRole('button', { name: 'Close' }).click();
  await page.evaluate(async (value) => new Promise<void>((resolve) => {
    const request = indexedDB.open('demo:family-digital-dossier');
    request.onsuccess = () => { const db = request.result; const transaction = db.transaction('vault', 'readwrite'); transaction.objectStore('vault').put(value, 'primary'); transaction.oncomplete = () => { db.close(); resolve(); }; };
  }), legacyEnvelope);
  await page.reload();
  await expect(page.getByText('Credential-like content is blocked from print and readable export.')).toBeVisible();
  await expect(page.getByText('password=LegacySecret_42!')).toHaveCount(0);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Export readable CSV' }).click();
  await expect(page.locator('#status')).toContainText('Remove credential-like content');
  await page.getByRole('link', { name: 'Review & print' }).click();
  await page.evaluate(() => { (window as Window & { printCalled?: boolean }).print = () => { (window as Window & { printCalled?: boolean }).printCalled = true; }; });
  await page.getByRole('button', { name: 'Print sealed cover' }).click();
  expect(await page.evaluate(() => (window as Window & { printCalled?: boolean }).printCalled || false)).toBe(false);
});

test('@claim:uc-11 review schedule, history, and three-record drill persist', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('link', { name: 'Review & print' }).click();
  await expect(page.getByRole('heading', { name: 'Review history' })).toBeVisible();
  const before = await page.locator('.timeline-item').count();
  await page.getByRole('button', { name: 'Complete today’s review' }).click();
  await expect(page.locator('.timeline-item')).toHaveCount(before + 1);
  await page.getByRole('button', { name: 'Run 3-record drill' }).click();
  await expect(page.getByRole('dialog').locator('li')).toHaveCount(3);
  await page.getByRole('button', { name: 'All three locations worked' }).click();
  await expect(page.getByText('Three-record location drill passed')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Three-record location drill passed')).toBeVisible();
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(page.getByText(/Feb .*2027/)).toBeVisible();
});

test('@claim:uc-12 @claim:uc-20 encrypted backup, readable spreadsheet, and sealed-cover print contain the promised output', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const backupEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export encrypted backup' }).click();
  const backup = await backupEvent;
  const backupText = readFileSync((await backup.path())!, 'utf8');
  expect(backupText).toContain('"ciphertext"');
  expect(backupText).not.toContain('Asha Mehta');
  page.once('dialog', (dialog) => void dialog.accept());
  const csvEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export readable CSV' }).click();
  const csv = await csvEvent;
  const csvText = readFileSync((await csv.path())!, 'utf8');
  expect(csvText).toContain('"Title","Category","Institution","Location"');
  expect(csvText).toContain('"Term life insurance policy"');
  expect(csvText.trim().split('\n')).toHaveLength(11);
  await page.getByRole('link', { name: 'Review & print' }).click();
  await expect(page.locator('.cover-preview')).toContainText('Asha Mehta');
  await expect(page.locator('.cover-preview')).toContainText('Sealed envelope in the study safe');
  await page.evaluate(() => { (window as Window & { printCalled?: boolean }).print = () => { (window as Window & { printCalled?: boolean }).printCalled = true; }; });
  await page.getByRole('button', { name: 'Print sealed cover' }).click();
  expect(await page.evaluate(() => (window as Window & { printCalled?: boolean }).printCalled)).toBe(true);
});

test('@claim:uc-06 @claim:uc-13 backup restore, passphrase change, install metadata, and offline demo work', async ({ page, context, request }) => {
  test.slow();
  await openDemo(page);
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({ sizes: '192x192' }), expect.objectContaining({ sizes: '512x512' }), expect.objectContaining({ purpose: 'maskable' })]));
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const backupEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export encrypted backup' }).click();
  const backupPath = (await (await backupEvent).path())!;
  await page.locator('#change-passphrase').click();
  await page.locator('#current-pass').fill(DEMO_PASSPHRASE);
  await page.locator('#next-pass').fill('new sample passphrase 2026');
  await page.locator('#next-confirm').fill('new sample passphrase 2026');
  await page.getByRole('dialog').getByRole('button', { name: 'Change passphrase' }).click();
  await page.getByRole('button', { name: 'Import encrypted backup' }).click();
  await page.locator('#backup-file').setInputFiles(backupPath);
  await page.locator('#backup-passphrase').fill(DEMO_PASSPHRASE);
  await page.getByRole('button', { name: 'Verify and replace dossier' }).click();
  await expect(page.getByRole('heading', { name: 'Asha Mehta’s dossier' })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  const offlinePage = await context.newPage();
  await offlinePage.goto('/demo', { waitUntil: 'domcontentloaded' });
  await expect(offlinePage.getByRole('heading', { level: 1, name: 'Asha Mehta’s dossier' })).toBeVisible({ timeout: 7_000 });
  await context.setOffline(true);
  await offlinePage.reload({ waitUntil: 'domcontentloaded' });
  await expect(offlinePage.getByRole('heading', { level: 1, name: 'Asha Mehta’s dossier' })).toBeVisible({ timeout: 7_000 });
  await expect(offlinePage.getByText('10', { exact: true }).first()).toBeVisible();
  await offlinePage.getByRole('link', { name: 'Records', exact: true }).click();
  await expect(offlinePage.getByText('Term life insurance policy')).toBeVisible();
  await offlinePage.reload({ waitUntil: 'domcontentloaded' });
  await expect(offlinePage.getByText('Demo — sample data, nothing is saved to your dossier.')).toBeVisible();
});

test('@claim:uc-26 the app has no upload or account-access feature and warns about sensitive pasted content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('The app has no document upload or account-access feature.')).toBeVisible();
  await expect(page.getByText('Do not paste passwords or document contents into notes.')).toBeVisible();
  expect(await page.locator('input[type="file"]').count()).toBe(0);
  expect(await page.locator('a[href*="account"], button').allTextContents()).not.toContain('Access account');
  await openDemo(page);
  await page.getByRole('link', { name: 'Records', exact: true }).click();
  await page.getByRole('button', { name: 'Add a record' }).click();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await expect(page.locator('#record-instructions')).toBeVisible();
});

test('@claim:uc-27 record-to-person links persist and clear when the person is deleted', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('link', { name: 'Records', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Term life insurance policy' }).click();
  await page.locator('#record-contact').selectOption({ label: 'Mira Mehta' });
  await page.getByRole('button', { name: 'Save record' }).click();
  await expect(page.getByText('Contact: Mira Mehta').first()).toBeVisible();
  await page.reload();
  await expect(page.getByText('Contact: Mira Mehta').first()).toBeVisible();
  await page.getByRole('link', { name: 'People', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Mira Mehta' }).click();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Delete person' }).click();
  await page.getByRole('link', { name: 'Records', exact: true }).click();
  await expect(page.getByText('Contact: Mira Mehta')).toHaveCount(0);
});

test('@claim:uc-23 @claim:uc-24 @claim:uc-25 documentation, build outputs, policies, and artwork provenance match the product', async ({ page }) => {
  await openDemo(page);
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };
  expect(packageJson.scripts.test).toContain('typecheck');
  expect(packageJson.scripts.test).toContain('lint');
  expect(packageJson.scripts.test).toContain('vitest run');
  expect(packageJson.scripts.test).toContain('npm run build');
  expect(packageJson.scripts.test).toContain('playwright test');
  const builtIndex = readFileSync('dist/index.html', 'utf8');
  const worker = readFileSync('dist/sw.js', 'utf8');
  expect(builtIndex).toMatch(/assets\/app-[\w-]+\.js/);
  expect(builtIndex).toMatch(/assets\/app-[\w-]+\.css/);
  expect(worker).toMatch(/dossier-shell-[a-f0-9]{12}/);
  const config = JSON.parse(readFileSync('dist/staticwebapp.config.json', 'utf8')) as { routes: Array<{ route: string; headers?: Record<string, string> }>; globalHeaders: Record<string, string>; responseOverrides: Record<string, { statusCode: number }> };
  expect(config.routes).toContainEqual(expect.objectContaining({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }));
  expect(config.globalHeaders['Content-Security-Policy']).toContain("script-src 'self'");
  expect(config.responseOverrides['404'].statusCode).toBe(404);
  await expect(page.getByText('We generated the original artwork for this product. Build polish-3.')).toBeVisible();
  expect(readFileSync('.factory/design.md', 'utf8')).toContain('exact prompt above');
  expect(readFileSync('assets/src/hero-archive.json', 'utf8')).toContain('factory-image');
});

test('@claim:uc-28 the documented Playwright version is pinned in package and lock files', async ({ page }) => {
  await openDemo(page);
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { devDependencies: Record<string, string> };
  expect(packageJson.devDependencies['@playwright/test']).toBe('1.58.2');
  expect(readFileSync('package-lock.json', 'utf8')).toContain('"@playwright/test": "1.58.2"');
  expect(readFileSync('README.md', 'utf8')).toContain('Playwright is pinned to 1.58.2.');
});

test('@claim:uc-29 the project license is MIT', async ({ page }) => {
  await openDemo(page);
  expect(readFileSync('LICENSE', 'utf8')).toContain('MIT License');
  expect(readFileSync('README.md', 'utf8')).toContain('The project uses the MIT license.');
});

test('@claim:uc-30 deleting a real dossier removes its encrypted local envelope', async ({ page }) => {
  const phrase = 'delete local archive meadow';
  await openDemo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#new-passphrase').fill(phrase);
  await page.locator('#confirm-passphrase').fill(phrase);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create encrypted dossier' }).click();
  await expect.poll(() => idbValue(page, 'family-digital-dossier')).toEqual(expect.objectContaining({ ciphertext: expect.any(String) }));
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Delete this dossier' }).click();
  await page.getByLabel('Type DELETE to confirm').fill('DELETE');
  await page.getByRole('button', { name: 'Permanently delete dossier' }).click();
  await expect(page.getByRole('heading', { name: 'Map essential records for someone you trust' })).toBeVisible();
  await expect.poll(() => idbValue(page, 'family-digital-dossier')).toBeUndefined();
});

test('@claim:uc-31 the offline cache contains application resources but never a dossier', async ({ page }) => {
  const phrase = 'cache boundary wildflower hill';
  const marker = `cache-boundary-${Date.now()}`;
  await openDemo(page);
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#new-passphrase').fill(phrase);
  await page.locator('#confirm-passphrase').fill(phrase);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create encrypted dossier' }).click();
  await page.getByRole('button', { name: 'Add a record' }).click();
  await page.locator('#record-title').fill(marker);
  await page.locator('#record-locator').fill('Study safe, lower drawer');
  await page.getByRole('button', { name: 'Add record' }).click();
  await expect.poll(() => idbValue(page, 'family-digital-dossier')).toEqual(expect.objectContaining({ ciphertext: expect.any(String) }));
  const envelope = JSON.stringify(await idbValue(page, 'family-digital-dossier'));
  const cache = await page.evaluate(async () => {
    const name = (await caches.keys()).find((item) => item.startsWith('dossier-shell-'));
    if (!name) throw new Error('Offline application cache was not created.');
    const store = await caches.open(name);
    const requests = await store.keys();
    const entries = await Promise.all(requests.map(async (request) => {
      const response = await store.match(request);
      const contentType = response?.headers.get('content-type') || '';
      return {
        url: request.url,
        body: response && /(?:javascript|json|css|html|svg|text)/.test(contentType) ? await response.text() : '',
      };
    }));
    return { urls: entries.map((entry) => entry.url), text: entries.map((entry) => entry.body).join('\n') };
  });
  expect(cache.urls.some((url) => new URL(url).pathname === '/')).toBe(true);
  expect(cache.urls.some((url) => /\/assets\/hero-archive\.[\w-]+\.avif$/.test(new URL(url).pathname))).toBe(true);
  expect(cache.urls).not.toContain(expect.stringContaining('family-digital-dossier'));
  expect(cache.text).not.toContain(marker);
  expect(cache.text).not.toContain(envelope);
});

test('@claim:uc-32 the dossier offers no workflow for legal documents or account authority', async ({ page }) => {
  await openDemo(page);
  const prohibited = /(?:create|make|generate|grant).*(?:will|trust|power of attorney|beneficiary|authority|access account)|(?:will|trust|power of attorney|beneficiary|authority|access account).*(?:create|make|generate|grant)/i;
  for (const linkName of ['Overview', 'Records', 'People', 'Handoff plan', 'Review & print', 'Settings']) {
    await page.getByRole('link', { name: linkName, exact: true }).click();
    const controlText = (await page.locator('main a, main button, main input[type="submit"]').allTextContents()).join(' ');
    expect(controlText).not.toMatch(prohibited);
  }
  await page.getByRole('link', { name: 'Review & print', exact: true }).click();
  await expect(page.locator('.cover-preview')).toContainText('This dossier does not grant authority');
  const source = readFileSync('src/main.ts', 'utf8');
  expect(source).not.toMatch(/function\s+(?:createWill|createTrust|createPowerOfAttorney|createBeneficiaryDesignation|grantAccountAuthority)\b/);
  expect(source).toContain('family-dossier-${today()}.encrypted.json');
  expect(source).toContain('family-dossier-${today()}.csv');
});
