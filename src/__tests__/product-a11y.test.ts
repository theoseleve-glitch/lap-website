// A11y audit-lock for the consolidated /product page (June-8 rebuild —
// the five pillar pages were folded into one anchored page). Locks
// structural a11y patterns not covered by the per-page contract tests:
//
//   - exactly one <h1>
//   - no skipped heading levels (each new heading at most prev+1)
//   - every aria-labelledby ref resolves to an existing id on the page
//   - all heading ids are unique on the page
//   - every anchor link has visible text or an accessible alternative
//
// Responsive is handled by Tailwind tokens + sm:/md: prefixes; viewport
// testing is the job of e2e/Playwright, not vitest.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { describe, expect, test } from 'vitest';
import ProductOverview from '../pages/product.astro';

interface ProductPage {
  slug: string;
  component: AstroComponentFactory;
}

const PAGES: ProductPage[] = [{ slug: 'product', component: ProductOverview }];

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
  return matches.flatMap((m) => m[1].split(/\s+/).filter(Boolean));
}

describe('a11y structural audit — /product', () => {
  test.each(PAGES)('$slug page has exactly one h1', async ({ component }) => {
    const html = await renderPage(component);
    const headings = getHeadingsInOrder(html);
    const h1Count = headings.filter((h) => h.level === 1).length;
    expect(h1Count).toBe(1);
  });

  test.each(PAGES)(
    '$slug page heading hierarchy has no level skips (each new heading at most prev+1)',
    async ({ component }) => {
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
      const html = await renderPage(component);
      const ids = getHeadingIds(html);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    },
  );

  test.each(PAGES)(
    '$slug page every anchor link has visible text or aria-label',
    async ({ component }) => {
      const html = await renderPage(component);
      const anchors = [...html.matchAll(/<a\s[^>]*>([\s\S]*?)<\/a>/gi)];
      for (const [full, inner] of anchors) {
        const visibleText = inner.replace(/<[^>]+>/g, '').trim();
        if (visibleText.length === 0) {
          const hasAriaLabel = /\baria-label="[^"]+"/i.test(full);
          const hasAriaLabelledBy = /\baria-labelledby="[^"]+"/i.test(full);
          expect(hasAriaLabel || hasAriaLabelledBy).toBe(true);
        }
      }
    },
  );
});
