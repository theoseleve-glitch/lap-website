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

test('T025 primary CTA points at the app.lap-coach.racing /signup route', async ({ page }) => {
  await page.goto('/');
  const trialCta = page.getByRole('link', { name: 'Start 14-day trial' });
  await expect(trialCta).toHaveAttribute('href', 'https://app.lap-coach.racing/signup');
  await expect(trialCta).toHaveAttribute('rel', 'noopener');
});

test('T026 secondary CTA points at /how-it-works (same-origin, no rel)', async ({ page }) => {
  await page.goto('/');
  const howItWorksCta = page.getByRole('link', { name: 'See how it works' });
  await expect(howItWorksCta).toHaveAttribute('href', '/how-it-works');
  // Same-origin link — rel should NOT be present.
  await expect(howItWorksCta).not.toHaveAttribute('rel', /.*/);
});
