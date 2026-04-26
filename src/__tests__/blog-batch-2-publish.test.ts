// T189 — collection-level publish contract for Batch 2
// (T181-T190). Same shape as T179 (Batch 1 publish contract):
// per-page invariants iterated across all 5 slugs via
// test.each + collection-level invariants for distinct
// TITLE/DESCRIPTION.
//
// The duplicate-content avoidance is the linchpin: each
// page must call batch2PostFaqJsonLd with its OWN slug,
// otherwise the per-post-filtering at T188 was wasted.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SLUGS = [
  'why-im-building-lap-not-motec-clone',
  'sim-to-real-gap-honest-look',
  'designing-coaching-drivers-follow',
  'pre-launch-month-in-numbers',
  'what-were-not-building',
] as const;

const pagePath = (slug: string): string =>
  join(process.cwd(), 'src', 'pages', 'blog', `${slug}.astro`);

const loadPage = (slug: string): string => readFileSync(pagePath(slug), 'utf8');

describe('T189: Batch 2 publish — per-page contract (iterated across all 5)', () => {
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
    'page %s imports batch2PostFaqJsonLd + batch2PostFaqs from the batch FAQ module',
    (slug) => {
      const page = loadPage(slug);
      expect(page).toMatch(
        /import\s+\{[^}]*batch2PostFaqJsonLd[^}]*\}\s+from\s+['"][^'"]*blog-batch-2-faq['"]/,
      );
      expect(page).toMatch(
        /import\s+\{[^}]*batch2PostFaqs[^}]*\}\s+from\s+['"][^'"]*blog-batch-2-faq['"]/,
      );
    },
  );

  test.each(SLUGS)(
    'page %s calls batch2PostFaqJsonLd with its OWN slug (per-post filtering)',
    (slug) => {
      const page = loadPage(slug);
      const expectedCall = new RegExp(
        `batch2PostFaqJsonLd\\(\\s*['"]${slug}['"]\\s*\\)`,
      );
      expect(
        page,
        `Page must call batch2PostFaqJsonLd('${slug}'), not another post's slug`,
      ).toMatch(expectedCall);
    },
  );

  test.each(SLUGS)(
    'page %s renders FAQ accordion via batch2PostFaqs(slug).map',
    (slug) => {
      const page = loadPage(slug);
      const expectedMap = new RegExp(
        `batch2PostFaqs\\(\\s*['"]${slug}['"]\\s*\\)\\.map`,
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

describe('T189: Batch 2 publish — collection-level invariants', () => {
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
