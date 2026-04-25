// T148 — internal cross-link contract for Pillar 2 ("What is
// Trail Braking and how to measure it"). Per-section tests
// (T142-T146) lock section content; T147 article-level test
// locks vocab/word-count/fluff. T148 specifically locks the
// conversion-funnel surface: the /product/* links that walk a
// converted reader from SEO-acquired article into the LAP
// product surface, plus the cross-pillar /blog/ link.
//
// Pillar 2 outline §"Internal cross-links" plan calls for ALL
// FIVE /product/* pillar pages (bridge, coaching, driver-profile,
// desktop, mobile) — broader coverage than Pillar 1 because the
// drill-progression section (T145) names both capture surfaces.
// Plus /blog/sim-to-real-transfer cross-pillar link in sections
// 03 and 06.
//
// This test mirrors pillar-1-cross-links.test.ts (T138) with two
// extensions: more product pages required cumulatively, and the
// cross-pillar /blog/ link presence locked.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_FILES = [
  'section-02-physics.md',
  'section-03-mistakes.md',
  'section-04-detection.md',
  'section-05-drills.md',
  'section-06-examples.md',
];

const SECTIONS_DIR = join(process.cwd(), 'docs', 'pillar-articles', 'trail-braking');

const loadSection = (file: string): string =>
  readFileSync(join(SECTIONS_DIR, file), 'utf8');

const loadAllSections = (): string =>
  SECTION_FILES.map(loadSection).join('\n\n');

// Match `[anchor text](/product/page)` markdown link syntax.
const PRODUCT_LINK_RE = /\[([^\]]+)\]\(\/product\/([a-z-]+)\)/g;
// Match `[anchor text](/blog/slug)` markdown link syntax.
const BLOG_LINK_RE = /\[([^\]]+)\]\(\/blog\/([a-z0-9-]+)\)/g;

const findProductLinks = (text: string): Array<{ anchor: string; slug: string }> => {
  const out: Array<{ anchor: string; slug: string }> = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(PRODUCT_LINK_RE);
  while ((match = re.exec(text)) !== null) {
    out.push({ anchor: match[1], slug: match[2] });
  }
  return out;
};

const findBlogLinks = (text: string): Array<{ anchor: string; slug: string }> => {
  const out: Array<{ anchor: string; slug: string }> = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(BLOG_LINK_RE);
  while ((match = re.exec(text)) !== null) {
    out.push({ anchor: match[1], slug: match[2] });
  }
  return out;
};

describe('T148: Pillar 2 internal cross-links (conversion funnel + cross-pillar hub)', () => {
  test('each drafted section has ≥1 /product/* internal link', async () => {
    // Per-section floor — same lock as T138 for Pillar 1. Each
    // section walks readers at least once toward the product
    // surface; without the floor, a 400-word section can ship
    // without seeing the conversion funnel at all.
    for (const file of SECTION_FILES) {
      const section = loadSection(file);
      const links = findProductLinks(section);
      expect(
        links.length,
        `${file} must contain at least one /product/* link`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  test('article cumulatively links /product/bridge', async () => {
    // The bridge is the technical artifact that runs the
    // detector (T144 cross-link). Outline cross-link plan also
    // calls for it as a cross-platform consistency anchor.
    const article = loadAllSections();
    const slugs = new Set(findProductLinks(article).map((l) => l.slug));
    expect(slugs.has('bridge')).toBe(true);
  });

  test('article cumulatively links /product/coaching', async () => {
    // The coaching library is where rules live (ADR-013) +
    // where drills surface as ActionPrescription rows (ADR-005
    // §5.3). Outline puts it in sections 04 (T144 detection)
    // and 05 (T145 drills).
    const article = loadAllSections();
    const slugs = new Set(findProductLinks(article).map((l) => l.slug));
    expect(slugs.has('coaching')).toBe(true);
  });

  test('article cumulatively links /product/driver-profile', async () => {
    // Where weakness episodes surface for the actual driver
    // (ADR-005 §5.2 + §5.4). Outline puts it in sections 05
    // (quarterly framing) and 06 (examples surface here).
    const article = loadAllSections();
    const slugs = new Set(findProductLinks(article).map((l) => l.slug));
    expect(slugs.has('driver-profile')).toBe(true);
  });

  test('article cumulatively links /product/desktop (sim capture)', async () => {
    // Outline §5 calls for desktop link as sim-side capture
    // surface for the drill progression. Pillar 2 reaches
    // desktop where Pillar 1 didn't — the drill-progression
    // section names the capture pipeline directly.
    const article = loadAllSections();
    const slugs = new Set(findProductLinks(article).map((l) => l.slug));
    expect(slugs.has('desktop')).toBe(true);
  });

  test('article cumulatively links /product/mobile (real-world capture)', async () => {
    // Outline §5 calls for mobile link as real-side capture
    // surface for the drill progression. Pairs with desktop —
    // both halves of the cross-platform capture story land in
    // the same section.
    const article = loadAllSections();
    const slugs = new Set(findProductLinks(article).map((l) => l.slug));
    expect(slugs.has('mobile')).toBe(true);
  });

  test('article has ≥7 cumulative /product/* links across all sections', async () => {
    // Distribution floor. Five product pages × 1 minimum link
    // each + per-section floor pressure (5 sections × ≥1 = 5)
    // means cumulative count is ≥7 once the per-section floor
    // and product-page coverage are both satisfied. Catches a
    // future edit that drops one section's link without
    // removing the section.
    const article = loadAllSections();
    const links = findProductLinks(article);
    expect(links.length).toBeGreaterThanOrEqual(7);
  });

  test('article links /blog/sim-to-real-transfer (cross-pillar hub)', async () => {
    // The four-pillar cluster acts as a hub only if pillars
    // cross-link. Pillar 2 links back to Pillar 1 for the
    // shape-vs-intensity framework reference. Outline puts the
    // link in sections 03 and 06.
    const article = loadAllSections();
    const blogLinks = findBlogLinks(article);
    const slugs = new Set(blogLinks.map((l) => l.slug));
    expect(slugs.has('sim-to-real-transfer')).toBe(true);
  });

  test('every /product/* link has descriptive anchor text (≥2 words)', async () => {
    // SEO + accessibility lock. "click here" or single-word
    // generic anchors are anti-patterns. Two-word minimum
    // forces real descriptive phrasing.
    const article = loadAllSections();
    const links = findProductLinks(article);
    for (const link of links) {
      const wordCount = link.anchor.trim().split(/\s+/).filter(Boolean).length;
      expect(
        wordCount,
        `Anchor text "${link.anchor}" → /product/${link.slug} should have ≥2 words`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  test('no /product/* link uses generic placeholder anchor text', async () => {
    const article = loadAllSections();
    const links = findProductLinks(article);
    const FORBIDDEN_ANCHORS = [
      /^click here$/i,
      /^this page$/i,
      /^here$/i,
      /^learn more$/i,
      /^read more$/i,
    ];
    for (const link of links) {
      const anchor = link.anchor.trim();
      for (const forbidden of FORBIDDEN_ANCHORS) {
        expect(
          forbidden.test(anchor),
          `Anchor "${anchor}" is generic/placeholder — use descriptive text instead`,
        ).toBe(false);
      }
    }
  });

  test('no malformed link — empty anchor or empty slug', async () => {
    const article = loadAllSections();
    expect(article).not.toMatch(/\[\]\(\/product\//);
    expect(article).not.toMatch(/\[[^\]]+\]\(\/product\/\)/);
    expect(article).not.toMatch(/\[\]\(\/blog\//);
    expect(article).not.toMatch(/\[[^\]]+\]\(\/blog\/\)/);
  });
});
