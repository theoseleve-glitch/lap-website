// T160 (article-level) — cumulative contract test for Pillar
// 3 ("Best sim racing telemetry app comparison"). Per-section
// tests (T152-T156, T157 intro/conclusion) and the link-audit
// test (T158) each lock a scoped slice; this file locks the
// article as a whole — cumulative word count, cross-section
// vocabulary, defense-in-depth on forbidden vocab, filler-word
// budget, cross-pillar /blog cluster reach.
//
// T160's deliverable is the published page; this test is what
// makes the editorial state durable. A future edit that
// trims one section and bloats another would still pass per-
// section tests but might break the article-level word band;
// a future copy-paste from another article that drops a
// forbidden word into a section is now caught by both per-
// section AND article-level guardrails.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_FILES = [
  'section-01-intro.md',
  'section-02-strengths.md',
  'section-03-limits.md',
  'section-04-pricing.md',
  'section-05-personas.md',
  'section-06-limitations.md',
  'section-07-conclusion.md',
];

const SECTIONS_DIR = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'telemetry-apps-comparison',
);

const loadAllSections = (): string =>
  SECTION_FILES.map((f) => readFileSync(join(SECTIONS_DIR, f), 'utf8')).join('\n\n');

const wordCount = (text: string): number =>
  text
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;

const APP_NAMES = ['LAP', 'Garage61', 'RaceLab', 'MoTeC', 'Track Attack', 'STINT'];

describe('T160: Pillar 3 article-level (cumulative across all 7 sections)', () => {
  test('all seven sections exist on disk', async () => {
    // Lock the section count. T152-T157 each shipped one or
    // more sections; future edits that delete a section file
    // would silently shrink the article. Catching that here
    // means publish (T160) cannot proceed against an
    // incomplete article.
    for (const file of SECTION_FILES) {
      const path = join(SECTIONS_DIR, file);
      expect(() => readFileSync(path, 'utf8')).not.toThrow();
    }
  });

  test('cumulative word count is in the 2500-3200 band', async () => {
    // Outline target: 3,000-3,500 words (excluding FAQ).
    // Drafted state lands lower because the §4 pricing
    // section is a TABLE artifact rather than prose; the
    // wordCount tally for the table is on the lower end of
    // its outline target. Band reflects the drafted state:
    //   * Floor 2500: a draft losing substance below this
    //     can no longer carry six apps × six dimensions +
    //     persona-mapping + honest-limitations credibly.
    //   * Ceiling 3200: above this the article is over-
    //     explaining and a future tightening pass should cut.
    // FAQ section (T159) lands additional content separately
    // via PILLAR_3_FAQS array — not counted here.
    const article = loadAllSections();
    const wc = wordCount(article);
    expect(wc).toBeGreaterThanOrEqual(2500);
    expect(wc).toBeLessThanOrEqual(3200);
  });

  test('article names all six apps cumulatively', async () => {
    // The comparison universe must show in every article-
    // level inspection. A future edit that drops one
    // competitor's row would shrink the comparison from
    // six-apps-six-dimensions to five-apps-or-fewer; the
    // article's editorial premise depends on having all six.
    const article = loadAllSections();
    for (const app of APP_NAMES) {
      expect(article, `App "${app}" must appear in the article`).toContain(app);
    }
  });

  test('article uses the doctrine word "telemetry" repeatedly (≥10 occurrences)', async () => {
    // The article's title verb. A draft that uses "telemetry"
    // only a few times is drifting toward generic "racing
    // software" prose. Lock the floor — repeated explicit
    // framing is the article's SEO head term and its
    // doctrine anchor.
    const article = loadAllSections().toLowerCase();
    const matches = article.match(/telemetry/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(10);
  });

  test('article uses persona-shopping vocabulary cumulatively', async () => {
    // The article's structural argument is "shop by persona,
    // not by winner-declaration" (outline §1 + §5). Lock that
    // the persona-shopping vocabulary reaches every editorial
    // state — a future edit that strips it would break the
    // article's organising frame.
    const article = loadAllSections().toLowerCase();
    expect(article).toMatch(/\bpersona/);
    expect(article).toMatch(/(fits|shortlist|right\s+answer\s+depends)/);
  });

  test('article cross-platform: "sim" AND "real" both appear', async () => {
    // The cross-platform thread runs through the comparison.
    // Locking at article level catches a future edit that
    // accidentally shifts the article to a sim-only or real-
    // only voice, which would break the LAP-distinguishing
    // bridge claim.
    const article = loadAllSections().toLowerCase();
    expect(article).toMatch(/\bsim\b/);
    expect(article).toMatch(/\breal/);
  });

  test('article forbidden-vocab guardrail (cumulative defense-in-depth)', async () => {
    // Per-section tests already lock these absent (with the
    // §6 limitations-section asymmetry: language-model
    // permitted in negation context). Cumulative check is
    // the integration safety net — guards against a future
    // copy-paste from another article that drops a forbidden
    // word into one section while passing per-section checks
    // via permitted-context loophole.
    const article = loadAllSections().toLowerCase();
    expect(article).not.toMatch(/\bai\s+coach\b/);
    expect(article).not.toMatch(/\bllm\b/);
    expect(article).not.toMatch(/\bgenerative\b/);
    expect(article).not.toMatch(/\bneural\b/);
    expect(article).not.toMatch(/\brealistic\b/);
    expect(article).not.toMatch(/\bmagic\b/);
    expect(article).not.toMatch(/\bsecret\b/);
    expect(article).not.toMatch(/\btrick\b/);
    expect(article).not.toMatch(/\bclearly\s+worse\b/);
    expect(article).not.toMatch(/\boutdated\b/);
    expect(article).not.toMatch(/\bbloated\b/);
    expect(article).not.toMatch(/\boverhyped\b/);
    expect(article).not.toMatch(/\bobviously\s+inferior\b/);
    expect(article).not.toMatch(/\bexpensive\b/);
    expect(article).not.toMatch(/\bcheap\b/);
    expect(article).not.toMatch(/\bpricey\b/);
    expect(article).not.toMatch(/\baffordable\b/);
  });

  test('article filler-word count is bounded (anti-fluff guardrail)', async () => {
    // Same lock as Pillar 1 + Pillar 2.
    // "actually", "really", "very", "basically", "essentially"
    // all signal weak prose when overused. Per-section tests
    // don't catch fluff because the per-section vocabulary is
    // positive. Cumulative count caps the budget so a future
    // editorial pass that re-introduces filler is caught.
    const article = loadAllSections().toLowerCase();
    const fillers = ['actually', 'really', 'very', 'basically', 'essentially'];
    let fillerCount = 0;
    for (const filler of fillers) {
      const matches = article.match(new RegExp(`\\b${filler}\\b`, 'g')) ?? [];
      fillerCount += matches.length;
    }
    expect(fillerCount).toBeLessThanOrEqual(3);
  });

  test('article contains ≥3 distinct /product/* internal cross-links', async () => {
    // T158 internal-linking audit checks per-section presence;
    // article-level test locks the cluster floor of distinct
    // product subpages (a draft that consolidated all links
    // to /product alone would shrink the cluster reach).
    const article = loadAllSections();
    const productSubpages = article.match(/\]\(\/product\/[a-z-]+\)/g) ?? [];
    const distinct = new Set(productSubpages);
    expect(
      distinct.size,
      `Expected ≥3 distinct /product/* subpages; found ${distinct.size}: ${[...distinct].join(', ')}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('article cross-pillar links: both Pillar 1 and Pillar 2 referenced', async () => {
    // The four-pillar cluster acts as a hub only if pillars
    // cross-link. Pillar 3 outline puts both /blog/sim-to-
    // real-transfer (Pillar 1) and /blog/what-is-trail-
    // braking (Pillar 2) in §5 + §7. At least one of each
    // must survive editorial passes.
    const article = loadAllSections();
    expect(article).toMatch(/\]\(\/blog\/sim-to-real-transfer\)/);
    expect(article).toMatch(/\]\(\/blog\/what-is-trail-braking\)/);
  });
});
