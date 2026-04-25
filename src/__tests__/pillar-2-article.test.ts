// T147 — article-level contract test for Pillar 2 ("What is
// Trail Braking and how to measure it"). The per-section tests
// (T142-T146) each lock their own section's contract; this file
// locks the article as a whole — cumulative word count,
// cross-section vocabulary consistency, defense-in-depth on
// forbidden vocab, filler-word budget, cross-pillar link
// presence.
//
// T147's deliverable was the editing pass tightening prose; this
// test is what makes the editorial state durable. A future edit
// that bloats one section while trimming another would still
// pass per-section tests but might break the article-level
// word-count band; a future copy edit that adds a forbidden
// word in one section is now caught by both per-section AND
// article-level guardrails.

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

describe('T147: Pillar 2 article-level (cumulative across drafted sections)', () => {
  test('all five drafted sections exist on disk', async () => {
    // Lock the section count. T142-T146 each shipped one
    // section; future edits that delete a section file would
    // silently shrink the article. Catching that here means
    // assembly (post-T150) cannot proceed against an incomplete
    // article.
    for (const file of SECTION_FILES) {
      const path = join(SECTIONS_DIR, file);
      expect(() => readFileSync(path, 'utf8')).not.toThrow();
    }
  });

  test('cumulative word count is in the 2000-2400 band', async () => {
    // Body-prose-only state across sections 02-06. The 5-section
    // draft target is roughly 2,250 words (sum of outline target
    // word counts: 450+600+400+400+450=2,300). Band:
    //   * Floor 2000: a draft losing substance below this can
    //     no longer carry the framework + mistakes + detection +
    //     drills + examples credibly.
    //   * Ceiling 2400: above this the article is over-
    //     explaining and a future tightening pass should cut.
    // FAQ section (T149) and intro/closing (assembly post-T150)
    // land additional content separately; this band locks the
    // body-prose-only state.
    const article = loadAllSections();
    const wc = wordCount(article);
    expect(wc).toBeGreaterThanOrEqual(2000);
    expect(wc).toBeLessThanOrEqual(2400);
  });

  test('article uses Pillar 1 framing words "shape" AND "intensity"', async () => {
    // Pillar 2 inherits Pillar 1's shape-vs-intensity framework.
    // A draft that uses one without the other has lost the
    // doctrine continuity that makes the four-pillar cluster
    // act as a hub.
    const article = loadAllSections().toLowerCase();
    expect(article).toMatch(/\bshape/);
    expect(article).toMatch(/\bintensity/);
  });

  test('article uses "trail brak" repeatedly (≥10 occurrences)', async () => {
    // The article's title verb. A draft that uses "trail
    // braking" only a few times is drifting toward generic
    // "braking technique" prose. Lock the floor — repeated
    // explicit framing is the article's SEO head term and its
    // doctrine anchor.
    const article = loadAllSections().toLowerCase();
    const matches = article.match(/trail\s*brak/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(10);
  });

  test('article uses Pillar 2 physics anchor concepts (≥2 of 3)', async () => {
    // Section 2 set the physics floor with weight transfer +
    // contact patch + friction circle. Cumulative check ensures
    // those concepts persist across the article — sections 03
    // (mistakes) and 04 (detection) lean on them, and a future
    // edit that drops them in s2 would weaken the foundation.
    const article = loadAllSections().toLowerCase();
    const physicsAnchors = [
      /weight\s+transfer/,
      /contact\s+patch/,
      /friction\s+circle/,
    ];
    const matched = physicsAnchors.filter((re) => re.test(article));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });

  test('article cross-platform: "sim" AND "real" both appear', async () => {
    // The cross-platform thread runs through every section.
    // Locking at article level catches a future edit that
    // accidentally shifts the article to a sim-only or
    // real-only voice.
    const article = loadAllSections().toLowerCase();
    expect(article).toMatch(/\bsim\b/);
    expect(article).toMatch(/\breal\b/);
  });

  test('article forbidden-vocab guardrail (cumulative defense-in-depth)', async () => {
    // Per-section tests already lock these absent (with the
    // section-04 detection-section asymmetry: LLM/neural/
    // generative permitted in negation context). Cumulative
    // check is the integration safety net — guards against a
    // future copy-paste from another article that drops a
    // forbidden CLAIM word into one section while passing
    // per-section checks via a permitted-context loophole.
    const article = loadAllSections().toLowerCase();
    expect(article).not.toMatch(/\bai coach\b/);
    expect(article).not.toMatch(/\brealistic\b/);
    expect(article).not.toMatch(/\bmagic\b/);
    expect(article).not.toMatch(/\bsecret\b/);
    expect(article).not.toMatch(/\btrick\b/);
  });

  test('article filler-word count is bounded (anti-fluff guardrail)', async () => {
    // Same lock as T137 used for Pillar 1.
    // "actually", "really", "very", "basically", "essentially"
    // all signal weak prose when overused. Per-section tests
    // don't catch fluff because the per-section vocabulary is
    // positive. Cumulative count caps the budget at a
    // reasonable threshold so a future editorial pass that
    // re-introduces filler is caught.
    const article = loadAllSections().toLowerCase();
    const fillers = ['actually', 'really', 'very', 'basically', 'essentially'];
    let fillerCount = 0;
    for (const filler of fillers) {
      const matches = article.match(new RegExp(`\\b${filler}\\b`, 'g')) ?? [];
      fillerCount += matches.length;
    }
    // Same ≤3 ceiling as Pillar 1's article-level test.
    expect(fillerCount).toBeLessThanOrEqual(3);
  });

  test('article contains at least one /product/ internal cross-link', async () => {
    // Conversion funnel discipline. Detail T148 will verify
    // distribution across multiple product pages and ≥5
    // cumulative count; this article-level test just locks the
    // floor.
    const article = loadAllSections();
    expect(article).toMatch(/\]\(\/product\//);
  });

  test('article contains the cross-pillar link to /blog/sim-to-real-transfer', async () => {
    // The four-pillar cluster acts as a hub only if pillars
    // cross-link. Pillar 2 outline puts the cross-link to
    // Pillar 1 in sections 03 (T143) and 06 (T146). At least
    // one must survive editorial passes — lock at the article
    // level.
    const article = loadAllSections();
    expect(article).toMatch(/\]\(\/blog\/sim-to-real-transfer\)/);
  });
});
