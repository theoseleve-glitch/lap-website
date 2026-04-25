// T126 — SEO meta tuning per pillar. Locks per-page title and
// description constraints so each of the six product pages
// (/product overview + the five pillars) targets a distinct
// search-relevant concept inside the SERP truncation band.
//
// Length bands:
//   - Title: 35-70 chars. Google truncates around 60-70px-wide
//     pixel lengths; 35 is the floor below which a title fails
//     to communicate what the page is.
//   - Description: 120-180 chars. Google truncates at ~155-160;
//     under 120 is too thin to differentiate against competitors.
//
// Doctrine guardrail: descriptions must NOT keyword-stuff. Each
// page's required concept anchors are the doctrine vocabulary
// already used in the page body — no new SEO-only phrases. The
// tests lock anchor presence, not phrase exact-match, so future
// editorial polish stays possible.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { describe, expect, test } from 'vitest';
import ProductOverview from '../pages/product.astro';
import Desktop from '../pages/product/desktop.astro';
import Mobile from '../pages/product/mobile.astro';
import Bridge from '../pages/product/bridge.astro';
import Coaching from '../pages/product/coaching.astro';
import DriverProfile from '../pages/product/driver-profile.astro';

interface PageMeta {
  slug: string;
  component: AstroComponentFactory;
  // Doctrine anchors required in the title (any one suffices —
  // lets the title stay short while still naming the pillar).
  titleAnchors: string[];
  // Doctrine anchors required in the description (all must
  // appear — this is what tells search engines what the page
  // actually covers, and prevents silent SEO regression).
  descriptionAnchors: string[];
}

const PAGES: PageMeta[] = [
  {
    slug: 'product',
    component: ProductOverview,
    titleAnchors: ['driver os', 'pillars', 'product'],
    descriptionAnchors: ['sim', 'real', 'pillars'],
  },
  {
    slug: 'desktop',
    component: Desktop,
    titleAnchors: ['desktop'],
    descriptionAnchors: ['sim', 'capture', 'desktop'],
  },
  {
    slug: 'mobile',
    component: Mobile,
    titleAnchors: ['mobile'],
    descriptionAnchors: ['android', 'racebox'],
  },
  {
    slug: 'bridge',
    component: Bridge,
    titleAnchors: ['bridge', 'sim'],
    descriptionAnchors: ['sim', 'real', 'transfer'],
  },
  {
    slug: 'coaching',
    component: Coaching,
    titleAnchors: ['coaching', 'library'],
    descriptionAnchors: ['rule', 'library'],
  },
  {
    slug: 'driver-profile',
    component: DriverProfile,
    titleAnchors: ['driver profile', 'progression'],
    descriptionAnchors: ['progression', 'sim', 'real'],
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

describe('T126: SEO meta tuning per pillar', () => {
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

  test.each(PAGES)('$slug page title carries the LAP brand suffix', async ({ component }) => {
    // Brand suffix is standard SEO practice — helps brand
    // recognition in SERPs once the page ranks. Dropping the
    // brand makes the title look like a third-party blog.
    const html = await renderPage(component);
    const title = extractTitle(html);
    expect(title).toMatch(/LAP/);
  });

  test.each(PAGES)(
    '$slug page title names a per-pillar concept anchor',
    async ({ component, titleAnchors }) => {
      const html = await renderPage(component);
      const title = extractTitle(html).toLowerCase();
      const matched = titleAnchors.some((anchor) => title.includes(anchor.toLowerCase()));
      expect(matched).toBe(true);
    },
  );

  test.each(PAGES)(
    '$slug page description names all per-pillar concept anchors',
    async ({ component, descriptionAnchors }) => {
      // All anchors must appear (vs any-of for title) — this is
      // what tells search engines what the page actually covers.
      // Missing an anchor is a silent SEO regression that would
      // not show up in a copy review.
      const html = await renderPage(component);
      const desc = extractDescription(html).toLowerCase();
      for (const anchor of descriptionAnchors) {
        expect(desc).toContain(anchor.toLowerCase());
      }
    },
  );

  test('all 6 product pages have distinct titles', async () => {
    // Duplicate titles signal "these are the same page" to search
    // engines and collapse rankings. Lock distinctness.
    const titles = await Promise.all(PAGES.map((p) => renderPage(p.component).then(extractTitle)));
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });

  test('all 6 product pages have distinct descriptions', async () => {
    // Same logic as titles — search engines downgrade duplicate
    // descriptions across pages on the same domain.
    const descriptions = await Promise.all(
      PAGES.map((p) => renderPage(p.component).then(extractDescription)),
    );
    const unique = new Set(descriptions);
    expect(unique.size).toBe(descriptions.length);
  });

  test.each(PAGES)(
    '$slug page description contains no double-spaces or stray whitespace',
    async ({ component }) => {
      // Keyword-stuffing detection — descriptions assembled from
      // copy-paste fragments often pick up stray double-spaces
      // or " ," patterns. Cheap signal, but locks editorial care.
      const html = await renderPage(component);
      const desc = extractDescription(html);
      expect(desc).not.toMatch(/ {2}/); // double-space
      expect(desc).not.toMatch(/ ,/); // space-comma
      expect(desc).not.toMatch(/ \./); // space-period
    },
  );
});
