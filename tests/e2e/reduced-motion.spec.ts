import { expect, test } from '@playwright/test';

// NOTE on the suppressed test.use({ reducedMotion: 'reduce' }) call:
// Playwright 1.59's bundled .d.ts (playwright/types/test.d.ts) is missing
// `reducedMotion` from PlaywrightTestOptions even though the runtime + CDP
// accept it. To stay TypeScript-clean we drive the media-emulation per-test
// via page.emulateMedia(), which works in the same Playwright build.

test('no GSAP transforms on pinned rooms when reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('[data-sector-id="versus"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  // The coaching card should have no inline transform from GSAP.
  const transformX = await page
    .locator('[data-pin-card="coaching"]')
    .evaluate((el) => getComputedStyle(el).transform);
  // GSAP would set matrix(...); without it, transform is "none" or the
  // initial CSS transform from the Astro template.
  expect(transformX).not.toMatch(/matrix3d/);
});

test('cursor not initialised when reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const cursor = page.locator('[data-magnetic-cursor]');
  await expect(cursor).toHaveCount(0);
});
