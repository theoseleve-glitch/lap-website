import { expect, test } from '@playwright/test';

test('magnetic cursor renders inside hero zone, hides outside', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1280, height: 800 });

  const heroBox = await page.locator('[data-magnetic-zone]').boundingBox();
  if (!heroBox) throw new Error('hero zone missing');

  await page.mouse.move(heroBox.x + heroBox.width / 2, heroBox.y + heroBox.height / 2);
  await page.waitForTimeout(300);
  const cursor = page.locator('[data-magnetic-cursor]');
  await expect(cursor).toHaveCSS('opacity', '1');

  // Move outside: scroll first then move pointer to far-away coords.
  await page.locator('[data-sector-id="session-proof"]').scrollIntoViewIfNeeded();
  await page.mouse.move(10, 10);
  await page.waitForTimeout(300);
  await expect(cursor).toHaveCSS('opacity', '0');
});

test('coarse pointer device gets no custom cursor', async ({ browser }) => {
  const ctx = await browser.newContext({ hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('/');
  const cursor = page.locator('[data-magnetic-cursor]');
  await expect(cursor).toHaveCount(0);
  await ctx.close();
});
