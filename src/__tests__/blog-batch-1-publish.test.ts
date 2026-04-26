// T179 — collection-level publish contract for Batch 1
// (T171-T180). Where pillar publish tests are per-page (T140/
// T150/T160/T170), Batch 1 publishes 5 pages in one task —
// the contract is iterated across all 5 to keep the test file
// from ballooning to 5×8=40 separate test cases.
//
// Per-page contract (iterated):
//   * Page file exists at expected blog slug
//   * Imports the corresponding markdown from docs/blog-posts/
//   * Imports batchPostFaqJsonLd + batchPostFaqs from the
//     batch FAQ module
//   * Calls the FAQ factory with its OWN slug (per-post
//     filtering correctness)
//   * Emits Article JSON-LD (headline + datePublished)
//   * Routes through BaseLayout
//   * Renders FAQ accordion via batchPostFaqs(slug).map
//   * TITLE ≥20 chars + DESCRIPTION ≥60 chars (SERP surface)
//
// Plus collection-level invariants:
//   * All 5 page files exist
//   * TITLEs are distinct (no copy-paste collision across
//     pages)
//   * DESCRIPTIONs are distinct
//
// The duplicate-content avoidance is the linchpin: each page
// must use its own slug in the FAQ factory call, otherwise
// the per-post filtering at T178 was wasted and Google sees
// 5 identical FAQPages on 5 different URLs.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SLUGS = [
  'late-braking-at-t1',
  'throttle-pickup-smooth-vs-aggressive',
  'apex-speed-corner-commitment',
  'consistency-over-raw-pace',
  'tire-management-endurance',
] as const;

const pagePath = (slug: string): string =>
  join(process.cwd(), 'src', 'pages', 'blog', `${slug}.astro`);

const loadPage = (slug: string): string => readFileSync(pagePath(slug), 'utf8');

describe('T179: Batch 1 publish — per-page contract (iterated across all 5)', () => {
  test.each(SLUGS)('page %s exists at the expected blog slug', (slug) => {
    expect(() => loadPage(slug)).not.toThrow();
  });

  test.each(SLUGS)(
    'page %s imports its corresponding markdown file from docs/blog-posts/',
    (slug) => {
      const page = loadPage(slug);
      const expectedImport = new RegExp(
        `from\\s+['"]\\.\\./\\.\\./\\.\\./docs/blog-posts/${slug}\\.md['"]`,
      );
      expect(page).toMatch(expectedImport);
    },
  );

  test.each(SLUGS)(
    'page %s imports batchPostFaqJsonLd + batchPostFaqs from the batch FAQ module',
    (slug) => {
      const page = loadPage(slug);
      expect(page).toMatch(
        /import\s+\{[^}]*batchPostFaqJsonLd[^}]*\}\s+from\s+['"][^'"]*blog-batch-1-faq['"]/,
      );
      expect(page).toMatch(
        /import\s+\{[^}]*batchPostFaqs[^}]*\}\s+from\s+['"][^'"]*blog-batch-1-faq['"]/,
      );
    },
  );

  test.each(SLUGS)(
    'page %s calls batchPostFaqJsonLd with its OWN slug (per-post filtering)',
    (slug) => {
      // The duplicate-content avoidance test. Each page must
      // pass its own slug to the factory; passing a literal
      // string from another post would emit that post's FAQ
      // here, defeating the per-post-filtering design from
      // T178.
      const page = loadPage(slug);
      const expectedCall = new RegExp(
        `batchPostFaqJsonLd\\(\\s*['"]${slug}['"]\\s*\\)`,
      );
      expect(
        page,
        `Page must call batchPostFaqJsonLd('${slug}'), not another post's slug`,
      ).toMatch(expectedCall);
    },
  );

  test.each(SLUGS)(
    'page %s renders FAQ accordion via batchPostFaqs(slug).map',
    (slug) => {
      const page = loadPage(slug);
      const expectedMap = new RegExp(
        `batchPostFaqs\\(\\s*['"]${slug}['"]\\s*\\)\\.map`,
      );
      expect(page).toMatch(expectedMap);
      expect(page).toMatch(/<details/);
      expect(page).toMatch(/<summary/);
    },
  );

  test.each(SLUGS)('page %s emits Article JSON-LD', (slug) => {
    const page = loadPage(slug);
    expect(page).toMatch(/['"@]type['"]?:\s*['"]Article['"]/);
    expect(page).toMatch(/datePublished/);
    expect(page).toMatch(/headline/);
  });

  test.each(SLUGS)('page %s routes through BaseLayout', (slug) => {
    const page = loadPage(slug);
    expect(page).toMatch(/import\s+BaseLayout/);
    expect(page).toMatch(/<BaseLayout/);
  });

  test.each(SLUGS)(
    'page %s sets explicit TITLE (≥20 chars) and DESCRIPTION (≥60 chars)',
    (slug) => {
      const page = loadPage(slug);
      const titleMatch = page.match(/const\s+TITLE\s*=\s*['"]([^'"]+)['"]/);
      expect(titleMatch, `Page ${slug} must declare TITLE`).not.toBeNull();
      expect(titleMatch![1].length).toBeGreaterThanOrEqual(20);

      const descMatch = page.match(
        /const\s+DESCRIPTION\s*=\s*['"`]([^'"`]+)['"`]/,
      );
      expect(descMatch, `Page ${slug} must declare DESCRIPTION`).not.toBeNull();
      expect(descMatch![1].length).toBeGreaterThanOrEqual(60);
    },
  );
});

describe('T179: Batch 1 publish — collection-level invariants', () => {
  test('all 5 page files exist', () => {
    for (const slug of SLUGS) {
      expect(() => loadPage(slug)).not.toThrow();
    }
  });

  test('all 5 pages have distinct TITLE values (no copy-paste collision)', () => {
    const titles = new Set<string>();
    for (const slug of SLUGS) {
      const page = loadPage(slug);
      const m = page.match(/const\s+TITLE\s*=\s*['"]([^'"]+)['"]/);
      expect(m).not.toBeNull();
      titles.add(m![1]);
    }
    expect(
      titles.size,
      `Expected 5 distinct TITLE values; got ${titles.size}`,
    ).toBe(SLUGS.length);
  });

  test('all 5 pages have distinct DESCRIPTION values', () => {
    const descs = new Set<string>();
    for (const slug of SLUGS) {
      const page = loadPage(slug);
      const m = page.match(/const\s+DESCRIPTION\s*=\s*['"`]([^'"`]+)['"`]/);
      expect(m).not.toBeNull();
      descs.add(m![1]);
    }
    expect(
      descs.size,
      `Expected 5 distinct DESCRIPTION values; got ${descs.size}`,
    ).toBe(SLUGS.length);
  });
});
