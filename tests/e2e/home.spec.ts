import { test, expect } from '@playwright/test';

test('homepage renders the chosen headline and title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('LAP — Every lap, one step better.');
  await expect(page.locator('h1')).toHaveText('Every lap, one step better.');
});

test('homepage exposes the dual CTA pair', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Start 14-day trial' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'See how it works' })).toBeVisible();
});
