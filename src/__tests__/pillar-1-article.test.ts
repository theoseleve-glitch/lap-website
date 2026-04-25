// T137 — article-level contract test for Pillar 1 ("Sim to
// Real-Life Racing Transfer"). The per-section tests (T132-T136)
// each lock their own section's contract; this file locks the
// article as a whole — cumulative word count, cross-section
// vocabulary consistency, defense-in-depth on forbidden vocab.
//
// T137's deliverable was the editing pass tightening prose; this
// test is what makes the editorial state durable. A future edit
// that bloats one section while trimming another would still pass
// the per-section tests but might break the article-level word
// count band; a future copy edit that adds a forbidden word in
// one section is now caught by both per-section AND article-level
// guardrails.

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

describe('T137: Pillar 1 article-level (cumulative across drafted sections)', () => {
  test('all five drafted sections exist on disk', async () => {
    // Lock the section count. T132-T136 each shipped one
    // section; future edits that delete a section file would
    // silently shrink the article. Catching that here means
    // assembly (post-T140) cannot proceed against an incomplete
    // article.
    for (const file of SECTION_FILES) {
      const path = join(SECTIONS_DIR, file);
      expect(() => readFileSync(path, 'utf8')).not.toThrow();
    }
  });

  test('cumulative word count is in the 1900-2400 band', async () => {
    // The 5-section draft target is roughly 2000 words. Band
    // accounts for editorial polish either direction:
    //   * Floor 1900: a draft that loses substance below this
    //     can no longer carry the framework + case studies +
    //     DIY guide credibly.
    //   * Ceiling 2400: above this, the article is over-
    //     explaining and a future tightening pass should cut.
    // FAQ section (T139) lands additional content separately;
    // this band locks the body-prose-only state.
    const article = loadAllSections();
    const wc = wordCount(article);
    expect(wc).toBeGreaterThanOrEqual(1900);
    expect(wc).toBeLessThanOrEqual(2400);
  });

  test('article uses both doctrine framing words: "shape" AND "intensity"', async () => {
    // Cross-section vocabulary check. The shape-vs-intensity
    // framework from Section 3 must reach all the way through
    // the article. A future per-section edit that drops one of
    // these in any individual section may pass that section's
    // own test, but the cumulative check catches accumulated
    // drift.
    const article = loadAllSections().toLowerCase();
    expect(article).toMatch(/\bshape/);
    expect(article).toMatch(/\bintensity/);
  });

  test('article uses the doctrine word "transfer" repeatedly (≥10 occurrences)', async () => {
    // The article's title verb. A draft that uses "transfer" only
    // a few times is drifting toward generic "sim vs real" prose.
    // Lock the floor — repeated explicit framing is the article's
    // SEO head term and its doctrine anchor.
    const article = loadAllSections().toLowerCase();
    const matches = article.match(/transfer/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(10);
  });

  test('article forbidden-vocab guardrail (cumulative defense-in-depth)', async () => {
    // Per-section tests already lock these absent. Cumulative
    // check is the integration safety net — guards against a
    // future copy-paste from another article that drops a
    // forbidden word into one section while passing per-section
    // checks via test-skipping.
    const article = loadAllSections().toLowerCase();
    expect(article).not.toMatch(/\bai coach\b/);
    expect(article).not.toMatch(/\bllm\b/);
    expect(article).not.toMatch(/\bgenerative\b/);
    expect(article).not.toMatch(/\brealistic\b/);
  });

  test('article filler-word count is bounded (anti-fluff guardrail)', async () => {
    // Soft anti-fluff lock. "actually", "really", "very", "just",
    // "basically", "essentially" all signal weak prose when
    // overused. Per-section tests don't catch fluff because the
    // per-section vocabulary is positive. Cumulative count caps
    // the budget at a reasonable threshold so a future editorial
    // pass that re-introduces filler is caught.
    const article = loadAllSections().toLowerCase();
    const fillers = ['actually', 'really', 'very', 'basically', 'essentially'];
    let fillerCount = 0;
    for (const filler of fillers) {
      const matches = article.match(new RegExp(`\\b${filler}\\b`, 'g')) ?? [];
      fillerCount += matches.length;
    }
    // Allow up to 3 across the whole article — some uses are
    // legitimate (e.g., "really" in dialogue framing). 0 would
    // be over-tight; double digits would mean the prose is
    // padded.
    expect(fillerCount).toBeLessThanOrEqual(3);
  });

  test('article contains at least one /product/ internal cross-link', async () => {
    // The conversion funnel. The outline cross-link plan put at
    // least one /product/* link in each section; a draft that
    // removes ALL of them would still pass per-section tests
    // (each per-section test checks only its own scoped link).
    // Cumulative check guarantees the article is at least one
    // click from the product surface.
    const article = loadAllSections();
    expect(article).toMatch(/\]\(\/product\//);
  });
});
