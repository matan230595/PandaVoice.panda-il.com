import { test, expect } from '@playwright/test';

test('health endpoint is ok', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.status).toBe('ok');
});

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Pandavoice/i);
});

test('404 page shows for unknown route', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');
  await expect(page.getByText('404')).toBeVisible();
});
