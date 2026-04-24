import { test, expect } from '@playwright/test';

test('homepage renders the chosen headline and title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('LAP — Every lap, one step better.');
  await expect(page.locator('h1')).toHaveText('Every lap, one step better.');
});

test('homepage exposes the hero CTA pair and a mirrored final-CTA trial link', async ({ page }) => {
  await page.goto('/');
  // Hero (T025) ships primary + secondary CTAs; the T034 final CTA
  // mirrors the primary text verbatim, so there are TWO "Start 14-day
  // trial" links on the page and ONE "See how it works" (hero only).
  await expect(page.getByRole('link', { name: 'Start 14-day trial' })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'See how it works' })).toHaveCount(1);
});

test('every "Start 14-day trial" CTA honors the T025 /signup contract (href + rel)', async ({
  page,
}) => {
  // Both the hero primary (T025) and the page-close primary (T034)
  // must point at app.lap-coach.racing/signup with rel=noopener —
  // diverging cross-origin wiring between them would fracture the
  // trial-signup attribution and ship two different destinations
  // under the same label.
  await page.goto('/');
  const trialCtas = page.getByRole('link', { name: 'Start 14-day trial' });
  const count = await trialCtas.count();
  expect(count).toBeGreaterThanOrEqual(2);
  for (let i = 0; i < count; i++) {
    await expect(trialCtas.nth(i)).toHaveAttribute('href', 'https://app.lap-coach.racing/signup');
    await expect(trialCtas.nth(i)).toHaveAttribute('rel', 'noopener');
  }
});

test('T026 secondary CTA points at /how-it-works (same-origin, no rel)', async ({ page }) => {
  await page.goto('/');
  const howItWorksCta = page.getByRole('link', { name: 'See how it works' });
  await expect(howItWorksCta).toHaveAttribute('href', '/how-it-works');
  // Same-origin link — rel should NOT be present.
  await expect(howItWorksCta).not.toHaveAttribute('rel', /.*/);
});
