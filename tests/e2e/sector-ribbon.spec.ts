import { expect, test } from '@playwright/test';

test('sector ribbon active segment matches scrolled-into-view room', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  // Scroll to each room and verify the active ribbon segment matches.
  // We center each room in the viewport explicitly because some rooms
  // (pipeline) use GSAP scroll-pinning, where scrollIntoViewIfNeeded
  // alone may stop at the pin boundary before the section reaches the
  // 50 % intersection threshold the active-sector observer requires.
  const sectors = [
    { id: 'session-proof', code: '02' },
    { id: 'the-pain', code: '03' },
    { id: 'versus', code: '04' },
    { id: 'pipeline', code: '05' },
    { id: 'garage', code: '06' },
    { id: 'podium', code: '07' },
  ];

  for (const s of sectors) {
    await page.evaluate((id) => {
      const el = document.querySelector<HTMLElement>(`[data-sector-id="${id}"]`);
      if (!el) throw new Error(`missing sector ${id}`);
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
      window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
    }, s.id);
    // Polling absorbs IO debounce + animation frame jitter that flakes a
    // fixed 800 ms wait under CI load. Caps at 4 s with progressively
    // longer intervals so the happy path returns near-instantly.
    await expect
      .poll(
        () =>
          page.locator(`[data-segment-code="${s.code}"][data-state="active"]`).count(),
        { timeout: 4000, intervals: [200, 400, 600, 800] },
      )
      .toBe(1);
  }
});
