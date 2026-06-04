// SEO meta lock for the consolidated /product page (June-8 rebuild —
// the five pillar pages were folded into one anchored page). Locks the
// title/description SERP bands + doctrine concept anchors so a future
// edit cannot silently regress them.
//
// Length bands:
//   - Title: 35-70 chars.
//   - Description: 120-180 chars.
// Doctrine guardrail: anchors must come from the page's own vocabulary
// (no SEO-only phrases). Tests lock anchor presence, not exact match.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { describe, expect, test } from 'vitest';
import ProductOverview from '../pages/product.astro';

interface PageMeta {
  slug: string;
  component: AstroComponentFactory;
  // Any one title anchor suffices (keeps the title short).
  titleAnchors: string[];
  // All description anchors must appear.
  descriptionAnchors: string[];
}

const PAGES: PageMeta[] = [
  {
    slug: 'product',
    component: ProductOverview,
    titleAnchors: ['product', 'driver'],
    descriptionAnchors: ['sim', 'real'],
  },
];

const renderPage = async (component: AstroComponentFactory): Promise<string> => {
  const container = await AstroContainer.create();
  return container.renderToString(component);
};

const extractTitle = (html: string): string => {
  const match = html.match(/<title>([^<]+)<\/title>/);
  return match ? match[1] : '';
};

const extractDescription = (html: string): string => {
  const match = html.match(/<meta name="description" content="([^"]+)"/);
  return match ? match[1] : '';
};

describe('SEO meta — /product', () => {
  test.each(PAGES)('$slug page title length is 35-70 chars (SERP band)', async ({ component }) => {
    const html = await renderPage(component);
    const title = extractTitle(html);
    expect(title.length).toBeGreaterThanOrEqual(35);
    expect(title.length).toBeLessThanOrEqual(70);
  });

  test.each(PAGES)(
    '$slug page description length is 120-180 chars (SERP band)',
    async ({ component }) => {
      const html = await renderPage(component);
      const desc = extractDescription(html);
      expect(desc.length).toBeGreaterThanOrEqual(120);
      expect(desc.length).toBeLessThanOrEqual(180);
    },
  );

  test.each(PAGES)('$slug page title carries the LAP brand', async ({ component }) => {
    const html = await renderPage(component);
    expect(extractTitle(html)).toMatch(/LAP/);
  });

  test.each(PAGES)(
    '$slug page title names a concept anchor',
    async ({ component, titleAnchors }) => {
      const html = await renderPage(component);
      const title = extractTitle(html).toLowerCase();
      expect(titleAnchors.some((anchor) => title.includes(anchor.toLowerCase()))).toBe(true);
    },
  );

  test.each(PAGES)(
    '$slug page description names all concept anchors',
    async ({ component, descriptionAnchors }) => {
      const html = await renderPage(component);
      const desc = extractDescription(html).toLowerCase();
      for (const anchor of descriptionAnchors) {
        expect(desc).toContain(anchor.toLowerCase());
      }
    },
  );

  test.each(PAGES)(
    '$slug page description contains no double-spaces or stray whitespace',
    async ({ component }) => {
      const html = await renderPage(component);
      const desc = extractDescription(html);
      expect(desc).not.toMatch(/ {2}/);
      expect(desc).not.toMatch(/ ,/);
      expect(desc).not.toMatch(/ \./);
    },
  );
});
