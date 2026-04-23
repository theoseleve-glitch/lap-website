import { test, expect } from '@playwright/test';

test('homepage serves the LAP heading', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('LAP');
  await expect(page.locator('h1')).toHaveText('LAP');
});
