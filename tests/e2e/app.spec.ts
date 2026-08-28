import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test('creates, locks, unlocks, and edits a private dossier', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.locator('#new-passphrase').fill('orchid river archive lantern');
  await page.locator('#confirm-passphrase').fill('orchid river archive lantern');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create encrypted dossier' }).click();
  await expect(page.getByRole('heading', { name: 'Start with what matters most' })).toBeVisible();
  await page.getByRole('button', { name: 'Add a record' }).click();
  await page.locator('#record-title').fill('Life insurance');
  await page.locator('#record-locator').fill('Fire safe, blue folder');
  await page.getByRole('button', { name: 'Add record' }).click();
  await page.getByRole('link', { name: 'Records', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Life insurance' })).toBeVisible();
  await page.getByRole('button', { name: 'Lock' }).click();
  await page.locator('#passphrase').fill('orchid river archive lantern');
  await page.getByRole('button', { name: 'Unlock dossier' }).click();
  await expect(page.getByRole('heading', { name: 'Life insurance' })).toBeVisible();
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => (window as unknown as Window & { axe: typeof axe }).axe.run());
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
});

test('has no serious accessibility violations on first load', async ({ page }) => {
  const consoleErrors: string[] = [];
  const thirdPartyRequests: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') thirdPartyRequests.push(request.url()); });
  await page.goto('/');
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => {
    const runner = (window as unknown as Window & { axe: typeof axe }).axe;
    return runner.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
  });
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(thirdPartyRequests).toEqual([]);
});

test('fits and operates at the 390px mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.locator('#new-passphrase').fill('mobile orchid archive lantern');
  await page.locator('#confirm-passphrase').fill('mobile orchid archive lantern');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create encrypted dossier' }).click();
  await page.getByRole('button', { name: 'Add a record' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('supports keyboard skip navigation', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('removes interface motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const duration = await page.getByRole('link', { name: 'Try it with sample data' }).first().evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(duration).toBeLessThanOrEqual(0.00001);
});

test('blocks credential-like locator text before it is persisted', async ({ page }) => {
  await page.goto('/');
  await page.locator('#new-passphrase').fill('orchid river archive lantern');
  await page.locator('#confirm-passphrase').fill('orchid river archive lantern');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create encrypted dossier' }).click();
  await page.getByRole('button', { name: 'Add a record' }).click();
  await page.locator('#record-title').fill('Life insurance');
  await page.locator('#record-locator').fill('password=DemoSecret_42!');
  await page.getByRole('button', { name: 'Add record' }).click();
  await expect(page.getByRole('alert')).toContainText('looks like a password, code, key, or other secret');
  await expect(page.locator('#record-locator')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('#record-locator').fill('Fire safe, blue folder');
  await page.getByRole('button', { name: 'Add record' }).click();
  await page.getByRole('link', { name: 'Records', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Life insurance' })).toBeVisible();
  await expect(page.getByText('password=DemoSecret_42!')).toHaveCount(0);
});

test('ships browser security and static cache policies', async ({ page, request }) => {
  const response = await request.get('/');
  expect(response.headers()['content-security-policy']).toContain("script-src 'self'");
  expect(response.headers()['permissions-policy']).toContain('camera=()');
  await page.goto('/');
  const assetUrls = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src') || node.getAttribute('href')));
  expect(assetUrls.some((url) => /\/assets\/app-[\w-]+\.js$/.test(url || ''))).toBe(true);
  expect(assetUrls.some((url) => /\/assets\/app-[\w-]+\.css$/.test(url || ''))).toBe(true);
  const deploymentConfig = await (await request.get('/staticwebapp.config.json')).json();
  expect(deploymentConfig.routes).toContainEqual(expect.objectContaining({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }));
});

test('loads the installed shell offline after a warm visit', async ({ page, context, request }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await page.waitForFunction(async () => {
    const key = (await caches.keys()).find((name) => name.startsWith('dossier-shell-'));
    if (!key) return false;
    const requests = await (await caches.open(key)).keys();
    const urls = requests.map((request) => new URL(request.url).pathname);
    return urls.includes('/') && urls.some((url) => /\/assets\/app-[\w-]+\.js$/.test(url)) && urls.some((url) => /\/assets\/app-[\w-]+\.css$/.test(url));
  });
  const workerSource = await (await request.get('/sw.js')).text();
  expect(workerSource).toMatch(/dossier-shell-[a-f0-9]{12}/);
  expect(workerSource).toContain('self.skipWaiting()');
  expect(workerSource).toContain('self.clients.claim()');
  await context.setOffline(true);
  await expect.poll(() => page.evaluate(async () => (await fetch('/manifest.webmanifest')).ok)).toBe(true);
  const offlinePage = await context.newPage();
  await offlinePage.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(offlinePage.getByRole('heading', { name: 'Map essential records for someone you trust' })).toBeVisible({ timeout: 5_000 });
  await expect(offlinePage.getByText(/You’re offline/)).toBeVisible({ timeout: 5_000 });
  await offlinePage.reload({ waitUntil: 'domcontentloaded' });
  await expect(offlinePage.getByRole('heading', { name: 'Map essential records for someone you trust' })).toBeVisible({ timeout: 5_000 });
});

test('uses real routes, titles, focus restoration, and a designed not-found screen', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByRole('link', { name: 'Records', exact: true }).click();
  await expect(page).toHaveURL(/\/demo\/records$/);
  await expect(page).toHaveTitle('Records — Family Digital Dossier');
  await expect(page.getByRole('heading', { level: 1, name: 'Essential records' })).toBeFocused();
  await page.getByRole('link', { name: 'People', exact: true }).click();
  await expect(page).toHaveURL(/\/demo\/people$/);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Essential records' })).toBeFocused();
  await page.goto('/definitely-not-a-real-route');
  await expect(page.getByRole('heading', { level: 1, name: 'This record route is missing' })).toBeVisible();
  await expect(page).toHaveTitle('Page not found — Family Digital Dossier');
});

test('keeps legal navigation and layout usable at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Site' });
  await expect(nav.getByRole('link', { name: 'Privacy' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Terms' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('ships complete route metadata and accessible demo, legal, and not-found pages', async ({ page }) => {
  for (const route of ['/?demo=1', '/privacy/', '/terms/', '/definitely-not-a-real-route']) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await page.addScriptTag({ content: axe.source });
    const results = await page.evaluate(async () => (window as unknown as Window & { axe: typeof axe }).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } }));
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || '')), route).toEqual([]);
  }
});
