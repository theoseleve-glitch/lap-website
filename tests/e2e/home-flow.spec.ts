import { expect, test } from '@playwright/test';

test.describe('Home flow · press-and-hold gate', () => {
  test('hold for 5 s + release scrolls past hero', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('[data-hold]');
    await expect(button).toBeVisible();

    // Initial scroll position
    const yBefore = await page.evaluate(() => window.scrollY);

    // Hold for 5.2 s, then release
    const box = await button.boundingBox();
    if (!box) throw new Error('button has no box');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(5200);
    await page.mouse.up();

    // Wait for scroll
    await page.waitForFunction(() => window.scrollY > 200, { timeout: 3000 });
    const yAfter = await page.evaluate(() => window.scrollY);
    expect(yAfter).toBeGreaterThan(yBefore + 100);
  });

  test('release before all 5 lit shows TOO EARLY', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('[data-hold]');
    const status = page.locator('[data-status]');
    const box = await button.boundingBox();
    if (!box) throw new Error('button has no box');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(2000);
    await page.mouse.up();
    await expect(status).toContainText(/TOO EARLY/i);
  });
});
