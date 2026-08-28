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
  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Life insurance' })).toBeVisible();
  await page.getByRole('button', { name: 'Lock' }).click();
  await page.locator('#passphrase').fill('orchid river archive lantern');
  await page.getByRole('button', { name: 'Unlock dossier' }).click();
  await expect(page.getByRole('heading', { name: 'Life insurance' })).toBeVisible();
});

test('has no serious accessibility violations on first load', async ({ page }) => {
  await page.goto('/');
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => {
    const runner = (window as unknown as Window & { axe: typeof axe }).axe;
    return runner.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
  });
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
});

test('loads the installed shell offline after a warm visit', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await page.waitForFunction(async () => {
    const cache = await caches.open('dossier-shell-v2');
    return Boolean((await cache.match('/assets/app.js')) && (await cache.match('/assets/styles.js')) && (await cache.match('/assets/app.css')));
  });
  await context.setOffline(true);
  await expect.poll(() => page.evaluate(async () => (await fetch('/assets/app.js')).ok)).toBe(true);
  const offlinePage = await context.newPage();
  await offlinePage.goto('/');
  await expect(offlinePage.getByRole('heading', { name: 'Leave a map. Keep the keys.' })).toBeVisible();
  await expect(offlinePage.getByText(/You’re offline/)).toBeVisible();
});
