import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// T21 — Phase 4 cinematic-scroll homepage axe gate.
// Scans WCAG 2 A + AA in two states the standing `a11y.spec.ts` (T038)
// can't reach: (1) initial load while the FiveRedLights gate is idle
// (`[data-hold]` button visible, lattice un-pressed), and (2) after the
// 5-second press-and-hold fires and the page scrolls past the hero.
// Together with T038 these cover the homepage in three observable
// configurations — pre-gate, post-gate-but-pre-scroll, and post-scroll.

test('homepage has no AA violations on initial load', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('homepage has no AA violations after lights-out (manifest revealed)', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('[data-hold]');
  const box = await button.boundingBox();
  if (!box) throw new Error('button has no box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(5200);
  await page.mouse.up();
  await page.waitForTimeout(800);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
