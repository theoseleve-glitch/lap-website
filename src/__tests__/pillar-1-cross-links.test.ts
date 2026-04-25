// T138 — internal cross-link contract for Pillar 1 ("Sim to
// Real-Life Racing Transfer"). Per-section tests lock section
// content; the T137 article-level test locks vocab/word-count/
// fluff. T138 specifically locks the conversion-funnel surface:
// the /product/* links that walk a converted reader from
// SEO-acquired article into the LAP product surface.
//
// The T131 outline cross-link plan called for /product/bridge,
// /product/coaching, /product/driver-profile, /product/desktop,
// /product/mobile. Sections drafted in this sprint (02-06) cover
// the first three product surfaces. /product/desktop and
// /product/mobile per outline live in section 9 ("tools and
// platforms"), which is not part of this sprint's drafted
// sections — so this test does NOT enforce them. When a future
// sprint drafts that section, extend this test rather than
// loosen it.
//
// "Other pillar" cross-links (per sprint task wording) are
// deferred until pillars 2-4 exist (T141+); linking to
// pages that don't exist would 404. This test does not enforce
// other-pillar links yet.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_FILES = [
  'section-02-what-transfers.md',
  'section-03-shape-vs-intensity.md',
  'section-04-track-geometry.md',
  'section-05-case-studies.md',
  'section-06-measure-yourself.md',
];

const SECTIONS_DIR = join(process.cwd(), 'docs', 'pillar-articles', 'sim-to-real-transfer');

const loadSection = (file: string): string =>
  readFileSync(join(SECTIONS_DIR, file), 'utf8');

const loadAllSections = (): string =>
  SECTION_FILES.map(loadSection).join('\n\n');

// Match `[anchor text](/product/page)` markdown link syntax.
// Captures the anchor text (group 1) and product slug (group 2).
const PRODUCT_LINK_RE = /\[([^\]]+)\]\(\/product\/([a-z-]+)\)/g;

const findProductLinks = (text: string): Array<{ anchor: string; slug: string }> => {
  const out: Array<{ anchor: string; slug: string }> = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(PRODUCT_LINK_RE);
  while ((match = re.exec(text)) !== null) {
    out.push({ anchor: match[1], slug: match[2] });
  }
  return out;
};

describe('T138: Pillar 1 internal cross-links (conversion funnel)', () => {
  test('each drafted section has ≥1 /product/* internal link', async () => {
    // Floor — each section should walk readers at least once
    // toward the product surface. Without this, a section reader
    // can finish a 400-word piece without seeing the conversion
    // funnel.
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
    // The bridge is the operational realisation of the
    // shape-vs-intensity framework (T131 outline anchor + ADR-005
    // §5.5 TransferLink). The article is built around this
    // doctrine, so /product/bridge MUST be linked.
    const article = loadAllSections();
    const links = findProductLinks(article);
    const slugs = new Set(links.map((l) => l.slug));
    expect(slugs.has('bridge')).toBe(true);
  });

  test('article cumulatively links /product/coaching', async () => {
    // The coaching library is where shapes-as-rules become
    // operational drills (ADR-013). Article references "rules",
    // "drills", "prescriptions" extensively; cross-link is the
    // bridge between the article framing and the codified
    // library.
    const article = loadAllSections();
    const links = findProductLinks(article);
    const slugs = new Set(links.map((l) => l.slug));
    expect(slugs.has('coaching')).toBe(true);
  });

  test('article cumulatively links /product/driver-profile', async () => {
    // Driver profile is the cross-platform progression surface
    // (ADR-005 §5.1 DriverProgressSnapshot). Article's case for
    // "treat sim and real as one progression" lands on the driver
    // profile as the artifact realising it.
    const article = loadAllSections();
    const links = findProductLinks(article);
    const slugs = new Set(links.map((l) => l.slug));
    expect(slugs.has('driver-profile')).toBe(true);
  });

  test('article has ≥5 cumulative /product/* links across all sections', async () => {
    // Distribution floor. ≥1 per section × 5 sections = 5
    // minimum. Catches a future edit that drops a section's
    // cross-link without removing the section.
    const article = loadAllSections();
    const links = findProductLinks(article);
    expect(links.length).toBeGreaterThanOrEqual(5);
  });

  test('every /product/* link has descriptive anchor text (≥2 words)', async () => {
    // Anchor-text quality lock. SEO + accessibility both require
    // descriptive anchors — "click here" or single-word generic
    // anchors are anti-patterns. Two-word minimum forces real
    // descriptive phrasing ("the bridge", "your driver profile").
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
    // Defense-in-depth on anchor quality. A future edit that
    // reaches for "click here" or "this page" gets caught here
    // even if word count check passes.
    const article = loadAllSections();
    const links = findProductLinks(article);
    const FORBIDDEN_ANCHORS = [/^click here$/i, /^this page$/i, /^here$/i, /^learn more$/i, /^read more$/i];
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
    // Catches `[](/product/bridge)` or `[bridge]()` typos that
    // pass cumulative count but break the click-through. Markdown
    // renders empty-anchor links as invisible.
    const article = loadAllSections();
    // Look for common malformed patterns
    expect(article).not.toMatch(/\[\]\(\/product\//);
    expect(article).not.toMatch(/\[[^\]]+\]\(\/product\/\)/);
  });
});
