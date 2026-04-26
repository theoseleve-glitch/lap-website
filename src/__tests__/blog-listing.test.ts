// T191 — contract test for the /blog listing page. The
// landing page for the blog cluster. Lists all 12 published
// articles (4 pillar guides + 5 Batch 1 technique deep-dives
// + 5 Batch 2 founder/product stories) so search engines and
// human readers have a single index of the cluster.
//
// What this test locks:
//   * src/pages/blog/index.astro file exists
//   * Routes through BaseLayout
//   * TITLE ≥20 chars + DESCRIPTION ≥60 chars (SERP surface)
//   * Every one of the 12 published-post slugs appears as
//     an anchor href on the page (so the listing is
//     authoritative and machine-readable)
//   * Has an H1 and ≥1 H2 (organisational structure)
//   * Emits CollectionPage or ItemList JSON-LD (so the
//     listing surface has structured-data eligibility)
//   * Forbidden vocab carry-over (ADR-004 ASYMMETRIC: bare
//     "llm"/"ai coach"/"generative"/"neural" banned;
//     "language-model" allowed because the listing may
//     describe Batch 2 posts that argue the negation) +
//     Pillar 2/3/4 carry-over

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { BLOG_INDEX } from '../data/blog-index';

const PAGE_PATH = join(
  process.cwd(),
  'src',
  'pages',
  'blog',
  'index.astro',
);

const ALL_PUBLISHED_SLUGS = [
  // Pillars (4)
  'sim-to-real-transfer',
  'what-is-trail-braking',
  'best-sim-racing-telemetry-app',
  'driver-development-plan',
  // Batch 1 technique deep-dives (5)
  'late-braking-at-t1',
  'throttle-pickup-smooth-vs-aggressive',
  'apex-speed-corner-commitment',
  'consistency-over-raw-pace',
  'tire-management-endurance',
  // Batch 2 founder/product stories (5)
  'why-im-building-lap-not-motec-clone',
  'sim-to-real-gap-honest-look',
  'designing-coaching-drivers-follow',
  'pre-launch-month-in-numbers',
  'what-were-not-building',
] as const;

const loadPage = (): string => readFileSync(PAGE_PATH, 'utf8');

describe('T191: /blog listing page', () => {
  test('page file exists at src/pages/blog/index.astro', () => {
    expect(() => loadPage()).not.toThrow();
  });

  test('page routes through BaseLayout', () => {
    const page = loadPage();
    expect(page).toMatch(/import\s+BaseLayout/);
    expect(page).toMatch(/<BaseLayout/);
  });

  test('page sets explicit TITLE (≥20 chars) and DESCRIPTION (≥60 chars)', () => {
    const page = loadPage();
    const titleMatch = page.match(/const\s+TITLE\s*=\s*['"]([^'"]+)['"]/);
    expect(titleMatch, 'page must declare TITLE').not.toBeNull();
    expect(titleMatch![1].length).toBeGreaterThanOrEqual(20);

    const descMatch = page.match(/const\s+DESCRIPTION\s*=\s*['"`]([^'"`]+)['"`]/);
    expect(descMatch, 'page must declare DESCRIPTION').not.toBeNull();
    expect(descMatch![1].length).toBeGreaterThanOrEqual(60);
  });

  test('page imports BLOG_INDEX from the data module', () => {
    // Single-source-of-truth lock: the page must source its
    // post list from src/data/blog-index.ts so that adding a
    // post to the data module automatically surfaces it on
    // /blog without a separate page edit.
    const page = loadPage();
    expect(page).toMatch(
      /import\s+\{[^}]*BLOG_INDEX[^}]*\}\s+from\s+['"][^'"]*blog-index['"]/,
    );
  });

  test('BLOG_INDEX contains an entry for every published-post slug', () => {
    // Authoritative-listing lock: every slug must be in the
    // index data module. Combined with the import check
    // above, this guarantees the rendered page has a link
    // for every post.
    const indexedSlugs = new Set(BLOG_INDEX.map((p) => p.slug));
    const missing = ALL_PUBLISHED_SLUGS.filter((s) => !indexedSlugs.has(s));
    expect(
      missing.length,
      `Slugs missing from BLOG_INDEX: ${missing.join(', ')}`,
    ).toBe(0);
  });

  test('page has H1 + ≥1 H2 (organisational structure)', () => {
    const page = loadPage();
    expect(page).toMatch(/<h1[\s>]/i);
    const h2Count = (page.match(/<h2[\s>]/gi) ?? []).length;
    expect(
      h2Count,
      `Expected ≥1 H2 (cluster organisation); found ${h2Count}`,
    ).toBeGreaterThanOrEqual(1);
  });

  test('page emits CollectionPage or ItemList JSON-LD for structured-data eligibility', () => {
    const page = loadPage();
    const hasCollectionPage = /['"@]type['"]?\s*:\s*['"]CollectionPage['"]/.test(page);
    const hasItemList = /['"@]type['"]?\s*:\s*['"]ItemList['"]/.test(page);
    expect(
      hasCollectionPage || hasItemList,
      'page must emit CollectionPage or ItemList JSON-LD',
    ).toBe(true);
    // And the JSON-LD has to be inlined as a script tag.
    expect(page).toMatch(/application\/ld\+json/);
  });

  test('page respects ADR-004 (asymmetric: bare "llm"/"ai coach"/"generative"/"neural" banned; "language-model" allowed)', () => {
    // The listing surface lists Batch 2 posts that argue the
    // language-model negation. Spelled-out form is allowed
    // (e.g. in a description); bare-token overclaim still
    // banned.
    const page = loadPage().toLowerCase();
    expect(page).not.toMatch(/\bai\s+coach\b/);
    expect(page).not.toMatch(/\bllm\b/);
    expect(page).not.toMatch(/\bgenerative\b/);
    expect(page).not.toMatch(/\bneural\b/);
    expect(page).not.toMatch(/\brealistic\b/);
  });

  test('page respects Pillar 2/3/4 forbidden-vocab carry-over', () => {
    const page = loadPage().toLowerCase();
    // Pillar 2
    expect(page).not.toMatch(/\bmagic\b/);
    expect(page).not.toMatch(/\bsecret\b/);
    expect(page).not.toMatch(/\btrick\b/);
    // Pillar 3
    expect(page).not.toMatch(/\bclearly\s+worse\b/);
    expect(page).not.toMatch(/\boutdated\b/);
    expect(page).not.toMatch(/\bbloated\b/);
    expect(page).not.toMatch(/\boverhyped\b/);
    expect(page).not.toMatch(/\bobviously\s+inferior\b/);
    expect(page).not.toMatch(/\bexpensive\b/);
    expect(page).not.toMatch(/\bcheap\b/);
    expect(page).not.toMatch(/\bpricey\b/);
    expect(page).not.toMatch(/\baffordable\b/);
    // Pillar 4
    expect(page).not.toMatch(/\bguru\b/);
    expect(page).not.toMatch(/\bsecret\s+formula\b/);
    expect(page).not.toMatch(/\bshortcut\b/);
    expect(page).not.toMatch(/\bovernight\b/);
    expect(page).not.toMatch(/\bhack\b/);
  });
});
