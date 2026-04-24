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

// T053 mirrors the same gates on /how-it-works. Every loop-step
// section (Capture/Brain/Plan/Improve) plus the Honesty comparison
// uses `grid grid-cols-1 md:grid-cols-N` — at 360 px the md: prefix
// drops out and the sections must stack top-to-bottom.
test('T053: /how-it-works has no horizontal overflow at 360 px', async ({ page }) => {
  await page.goto('/how-it-works');
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `document.documentElement.scrollWidth (${scrollWidth}) exceeds clientWidth (${clientWidth}) ` +
      `— some element on /how-it-works renders wider than the 360 px viewport.`,
  ).toBeLessThanOrEqual(clientWidth);
});

const HOW_IT_WORKS_MULTI_COLUMN_SECTIONS = [
  {
    label: 'T045 Capture',
    locator: 'section[aria-labelledby="how-it-works-capture-heading"] article',
    minItems: 2,
  },
  {
    label: 'T046 Brain',
    locator: 'section[aria-labelledby="how-it-works-brain-heading"] article',
    minItems: 3,
  },
  {
    label: 'T047 Plan',
    locator: 'section[aria-labelledby="how-it-works-plan-heading"] article',
    minItems: 2,
  },
  {
    label: 'T048 Improve',
    locator: 'section[aria-labelledby="how-it-works-improve-heading"] article',
    minItems: 2,
  },
  {
    label: 'T049 Honesty',
    locator: 'section[aria-labelledby="how-it-works-honesty-heading"] article',
    minItems: 2,
  },
];

for (const section of HOW_IT_WORKS_MULTI_COLUMN_SECTIONS) {
  test(`T053: "${section.label}" cards stack vertically at 360 px`, async ({ page }) => {
    await page.goto('/how-it-works');
    const boxes = await page.locator(section.locator).evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, height: r.height };
      }),
    );
    expect(boxes.length).toBeGreaterThanOrEqual(section.minItems);
    for (let i = 1; i < boxes.length; i++) {
      expect(
        boxes[i].top,
        `card[${i}].top (${boxes[i].top}) must be strictly below card[${i - 1}].top (${boxes[i - 1].top}) in ${section.label}`,
      ).toBeGreaterThan(boxes[i - 1].top + 1);
    }
  });
}

// T068 mirrors T039/T053 on /pricing: no horizontal overflow at
// 360 px, and every multi-column grid must stack. Covers the
// T058 tier-card inner grid (monthly/yearly prices), the T059
// 12-bullet checklist, and the FAQ is inherently stacked so
// doesn't need a separate check.
test('T068: /pricing has no horizontal overflow at 360 px', async ({ page }) => {
  await page.goto('/pricing');
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `document.documentElement.scrollWidth (${scrollWidth}) exceeds clientWidth (${clientWidth}) ` +
      `— some element on /pricing renders wider than the 360 px viewport.`,
  ).toBeLessThanOrEqual(clientWidth);
});

const PRICING_MULTI_COLUMN_SECTIONS = [
  {
    label: 'T058 tier card price grid',
    locator: 'section[aria-labelledby="pricing-tier-heading"] article > div > div',
    minItems: 2,
  },
  {
    label: 'T059 included checklist',
    locator: 'section[aria-labelledby="pricing-included-heading"] li',
    minItems: 12,
  },
];

for (const section of PRICING_MULTI_COLUMN_SECTIONS) {
  test(`T068: "${section.label}" cards stack vertically at 360 px`, async ({ page }) => {
    await page.goto('/pricing');
    const boxes = await page.locator(section.locator).evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, height: r.height };
      }),
    );
    expect(boxes.length).toBeGreaterThanOrEqual(section.minItems);
    for (let i = 1; i < boxes.length; i++) {
      expect(
        boxes[i].top,
        `card[${i}].top (${boxes[i].top}) must be strictly below card[${i - 1}].top (${boxes[i - 1].top}) in ${section.label}`,
      ).toBeGreaterThan(boxes[i - 1].top + 1);
    }
  });
}
