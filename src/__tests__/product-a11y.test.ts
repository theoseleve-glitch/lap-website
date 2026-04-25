// T125 — A11y audit-lock across the six product pages (/product
// overview + the five pillar pages). Locks structural a11y
// patterns that aren't covered by the per-page contract tests so
// a future edit cannot silently regress them:
//
//   - exactly one <h1> per page
//   - no skipped heading levels (h2 only after h1, h3 only
//     after h2, etc.) — fails screen-reader landmark navigation
//   - every aria-labelledby ref resolves to an existing id on
//     the same page (broken refs degrade landmark naming)
//   - all heading ids are unique on the page (duplicates make
//     aria-labelledby ambiguous)
//   - every anchor link carries either visible text or an
//     accessible alternative (aria-label / aria-labelledby) —
//     empty links are unreachable to keyboard + assistive tech
//
// Responsive: handled by Tailwind tokens + sm:/md: prefixes
// throughout; this file does not viewport-test (vitest is not a
// browser). Visual responsive verification is the job of
// e2e/Playwright with viewport emulation, scoped to T127's
// performance pass.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { describe, expect, test } from 'vitest';
import ProductOverview from '../pages/product.astro';
import Desktop from '../pages/product/desktop.astro';
import Mobile from '../pages/product/mobile.astro';
import Bridge from '../pages/product/bridge.astro';
import Coaching from '../pages/product/coaching.astro';
import DriverProfile from '../pages/product/driver-profile.astro';

interface ProductPage {
  slug: string;
  component: AstroComponentFactory;
}

const PAGES: ProductPage[] = [
  { slug: 'product', component: ProductOverview },
  { slug: 'desktop', component: Desktop },
  { slug: 'mobile', component: Mobile },
  { slug: 'bridge', component: Bridge },
  { slug: 'coaching', component: Coaching },
  { slug: 'driver-profile', component: DriverProfile },
];

const renderPage = async (component: AstroComponentFactory): Promise<string> => {
  const container = await AstroContainer.create();
  return container.renderToString(component);
};

function getHeadingsInOrder(html: string): { level: number; index: number }[] {
  const matches = [...html.matchAll(/<h([1-6])(?=[\s>])/gi)];
  return matches.map((m) => ({ level: parseInt(m[1], 10), index: m.index ?? 0 }));
}

function getHeadingIds(html: string): string[] {
  const matches = [...html.matchAll(/<h[1-6][^>]*\sid="([^"]+)"/gi)];
  return matches.map((m) => m[1]);
}

function getAriaLabelledByRefs(html: string): string[] {
  const matches = [...html.matchAll(/aria-labelledby="([^"]+)"/gi)];
  // aria-labelledby may carry multiple ids separated by spaces
  return matches.flatMap((m) => m[1].split(/\s+/).filter(Boolean));
}

describe('T125: a11y structural audit across product pages', () => {
  test.each(PAGES)('$slug page has exactly one h1', async ({ component }) => {
    const html = await renderPage(component);
    const headings = getHeadingsInOrder(html);
    const h1Count = headings.filter((h) => h.level === 1).length;
    expect(h1Count).toBe(1);
  });

  test.each(PAGES)(
    '$slug page heading hierarchy has no level skips (each new heading at most prev+1)',
    async ({ component }) => {
      // Screen readers navigate by heading levels. A jump from
      // h2 to h4 silently skips the h3 outline rung — a reader
      // who lands on h4 has no way to know they missed a level.
      // This rule allows arbitrary upward jumps (h4 → h2 to
      // start a new section is fine) but caps downward jumps to
      // exactly +1.
      const html = await renderPage(component);
      const headings = getHeadingsInOrder(html);
      expect(headings.length).toBeGreaterThan(0);
      let lastLevel = 0;
      for (const { level } of headings) {
        if (lastLevel === 0) {
          expect(level).toBe(1);
        } else {
          expect(level).toBeLessThanOrEqual(lastLevel + 1);
        }
        lastLevel = level;
      }
    },
  );

  test.each(PAGES)(
    '$slug page aria-labelledby refs all resolve to existing heading ids',
    async ({ component }) => {
      // A broken aria-labelledby leaves the section unnamed for
      // a screen reader. Lock both directions: every ref points
      // to a heading id we actually emit.
      const html = await renderPage(component);
      const refs = getAriaLabelledByRefs(html);
      const ids = new Set(getHeadingIds(html));
      for (const ref of refs) {
        expect(ids).toContain(ref);
      }
    },
  );

  test.each(PAGES)(
    '$slug page heading ids are unique (no duplicate id collisions)',
    async ({ component }) => {
      // Duplicate ids make aria-labelledby ambiguous (UA picks
      // the first; the second heading is silently orphaned).
      // Particularly important on /product overview which
      // generates pillar-<slug>-heading ids in a loop, and on
      // pages that use the shared ProductPillarFooter which
      // emits its own see-also-heading id.
      const html = await renderPage(component);
      const ids = getHeadingIds(html);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    },
  );

  test.each(PAGES)(
    '$slug page every anchor link has visible text or aria-label',
    async ({ component }) => {
      // An <a> with no text and no aria-label has no accessible
      // name — keyboard + screen-reader users land on it and
      // hear nothing. Lock the rule across all anchors.
      const html = await renderPage(component);
      const anchors = [...html.matchAll(/<a\s[^>]*>([\s\S]*?)<\/a>/gi)];
      for (const [full, inner] of anchors) {
        const visibleText = inner.replace(/<[^>]+>/g, '').trim();
        if (visibleText.length === 0) {
          // Accept only if the anchor declares an accessible
          // name some other way.
          const hasAriaLabel = /\baria-label="[^"]+"/i.test(full);
          const hasAriaLabelledBy = /\baria-labelledby="[^"]+"/i.test(full);
          expect(hasAriaLabel || hasAriaLabelledBy).toBe(true);
        }
      }
    },
  );
});
