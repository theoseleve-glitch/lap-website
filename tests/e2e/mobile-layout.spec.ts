import { test, expect } from '@playwright/test';

// T039 — homepage must render single-column and be horizontally
// overflow-free at 360 px, which is the width Google references as
// the narrow end of modern small-phone devices (iPhone SE 1st gen
// is 320, but 360 is the reasonable floor for a production marketing
// site in 2026). A horizontal scrollbar at this width is the single
// most common mobile regression — usually an unrestricted max-width
// image, an escaped flex-row, or a word too long to wrap.

test.use({ viewport: { width: 360, height: 800 } });

test('T039: homepage has no horizontal overflow at 360 px', async ({ page }) => {
  await page.goto('/');
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `document.documentElement.scrollWidth (${scrollWidth}) exceeds clientWidth (${clientWidth}) ` +
      `— some element renders wider than the 360 px viewport.`,
  ).toBeLessThanOrEqual(clientWidth);
});

// Each entry here maps to a homepage section that ships a
// multi-column grid at md+ breakpoint. At 360 px, every card must
// stack vertically (top coordinate strictly increases item-by-item).
const MULTI_COLUMN_SECTIONS = [
  {
    label: 'T029 After every session',
    locator: 'section[aria-labelledby="after-every-session-heading"] article',
    minItems: 3,
  },
  {
    label: 'T030 Sim and real',
    locator: 'section[aria-labelledby="sim-and-real-heading"] article',
    minItems: 2,
  },
  {
    label: 'T032 Tool comparison',
    locator: 'section[aria-labelledby="tool-comparison-heading"] article',
    minItems: 3,
  },
  {
    label: 'T033 Not for you if',
    locator: 'section[aria-labelledby="not-for-you-if-heading"] li',
    minItems: 4,
  },
  {
    label: 'T035 Social proof',
    locator: 'section[aria-labelledby="social-proof-heading"] li',
    minItems: 3,
  },
];

for (const section of MULTI_COLUMN_SECTIONS) {
  test(`T039: "${section.label}" cards stack vertically at 360 px`, async ({ page }) => {
    await page.goto('/');
    const boxes = await page.locator(section.locator).evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, height: r.height };
      }),
    );
    expect(boxes.length).toBeGreaterThanOrEqual(section.minItems);

    // Each subsequent card must start strictly below the previous —
    // allow a small fudge (1 px) for sub-pixel rendering. If two
    // cards share a top coord they're side-by-side, which is the
    // side-by-side failure mode we're gating against.
    for (let i = 1; i < boxes.length; i++) {
      expect(
        boxes[i].top,
        `card[${i}].top (${boxes[i].top}) must be strictly below card[${i - 1}].top (${boxes[i - 1].top}) in ${section.label}`,
      ).toBeGreaterThan(boxes[i - 1].top + 1);
    }
  });
}
