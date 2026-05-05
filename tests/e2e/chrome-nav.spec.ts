import { test, expect } from '@playwright/test';

const PRIMARY_PAGES = [
  '/',
  '/pricing',
  '/how-it-works',
  '/demo',
  '/blog',
  '/for-schools',
];

test.describe('chrome navigation', () => {
  for (const path of PRIMARY_PAGES) {
    test(`${path} renders header + footer + timecode strip`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('header[role="banner"]')).toBeVisible();
      await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
      // The TimecodeCounter is decorative — toBeAttached, not toBeVisible
      // (mobile layouts may hide it, and we don't fail e2e on that).
      await expect(page.locator('aside[aria-hidden="true"][class*="fixed"]')).toBeAttached();
    });
  }

  test('SectorTabs Pricing link navigates to /pricing', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: /pricing/i })
      .click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('SectorTabs marks /pricing as aria-current="page" when on /pricing', async ({ page }) => {
    await page.goto('/pricing');
    const currentLink = page
      .getByRole('navigation', { name: 'Primary' })
      .locator('a[aria-current="page"]');
    await expect(currentLink).toContainText(/pricing/i);
  });

  test('LapWordmark click returns to home', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('link', { name: /LAP — home/i }).click();
    await expect(page).toHaveURL(/\/$|^\/$/);
  });

  test('SectorTabs Blog tab is highlighted on /blog/<slug> pages (path-prefix match)', async ({ page }) => {
    // "consistency-over-raw-pace" exists in src/pages/blog/
    await page.goto('/blog/consistency-over-raw-pace');
    const currentLink = page
      .getByRole('navigation', { name: 'Primary' })
      .locator('a[aria-current="page"]');
    await expect(currentLink).toContainText(/blog/i);
  });
});
