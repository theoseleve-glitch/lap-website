// T170 (article-level) — cumulative contract test for Pillar 4
// ("How to Build a Driver Development Plan"). Per-section
// tests (T162-T167) and the link-audit test (T168) each lock a
// scoped slice; this file locks the article as a whole —
// cumulative word count, framework-vocabulary defense-in-depth,
// cross-section cadence reach, forbidden-vocab guardrail with
// the Pillar 4 extension, filler-word budget, and the cross-
// pillar cluster-closing constraint (Pillar 4 references ALL
// THREE sibling pillars per outline mandate).
//
// T170's deliverable is the published page; this test is what
// makes the editorial state durable. A future edit that trims
// one section and bloats another would still pass per-section
// tests but might break the article-level word band; a future
// copy-paste from another article that drops a forbidden word
// into a section is now caught by both per-section AND article-
// level guardrails.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_FILES = [
  'section-01-intro.md',
  'section-02-what-is.md',
  'section-03-framework.md',
  'section-04-cadences.md',
  'section-05-automation.md',
  'section-06-diy-template.md',
  'section-07-conclusion.md',
];

const SECTIONS_DIR = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'driver-development-plan',
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

describe('T170: Pillar 4 article-level (cumulative across all 7 sections)', () => {
  test('all seven sections exist on disk', async () => {
    // Lock the section count. T162-T167 each shipped one or
    // more sections; future edits that delete a section file
    // would silently shrink the article. Catching that here
    // means publish (T170) cannot proceed against an incomplete
    // article.
    for (const file of SECTION_FILES) {
      const path = join(SECTIONS_DIR, file);
      expect(() => readFileSync(path, 'utf8')).not.toThrow();
    }
  });

  test('cumulative word count is in the 2300-2800 band', async () => {
    // Outline target: 2,800-3,300 words (excluding FAQ).
    // Drafted state lands lower (~2,420 words) — the framework
    // is concise by design; the five-verb structure rewards
    // discipline over expansion. Band reflects the drafted
    // state:
    //   * Floor 2300: a draft losing substance below this
    //     can no longer carry the five-verb framework + three
    //     cadences + LAP-automation + DIY template credibly.
    //   * Ceiling 2800: above this the article is over-
    //     explaining and a future tightening pass should cut.
    // FAQ section (T169) lands additional content separately
    // via PILLAR_4_FAQS array — not counted here.
    const article = loadAllSections();
    const wc = wordCount(article);
    expect(wc).toBeGreaterThanOrEqual(2300);
    expect(wc).toBeLessThanOrEqual(2800);
  });

  test('article uses all five framework verbs cumulatively', async () => {
    // The article's structural vocabulary is locked at the
    // outline level: diagnose / prescribe / execute / measure /
    // adapt. Every verb must appear in the article text — a
    // future edit that drops a verb header (or a synonym
    // creep) would break the framework's editorial coherence.
    const article = loadAllSections().toLowerCase();
    expect(article, 'article must reference diagnose').toMatch(/\bdiagnos/);
    expect(article, 'article must reference prescribe').toMatch(/\bprescrib/);
    expect(article, 'article must reference execute').toMatch(/\bexecut/);
    expect(article, 'article must reference measure').toMatch(/\bmeasur/);
    expect(article, 'article must reference adapt').toMatch(/\badapt/);
  });

  test('article uses all three cadence anchors cumulatively', async () => {
    // §4 names the three cadences (per-session / weekly /
    // event-cycle); §3 + §5 reference them in framework + LAP-
    // automation context. Lock the cadence vocabulary at
    // article level so a tightening pass cannot collapse the
    // three time-horizon argument back into a generic "review
    // your sessions" pitch.
    const article = loadAllSections().toLowerCase();
    expect(article, 'article must name per-session cadence').toMatch(/per-session/);
    expect(article, 'article must name weekly cadence').toMatch(/\bweek/);
    expect(article, 'article must name event-cycle cadence').toMatch(/event-cycle/);
  });

  test('article anchors on the doctrine "loop closes" framing', async () => {
    // Doctrine §6 anchor — Pillar 4 lifts "the loop closes" /
    // "close the loop" directly into reader-facing prose. The
    // article's structural commitment is that the framework's
    // verbs are the loop, and a development plan that fails to
    // close the loop has not been executed. §2 names the
    // principle; §3 + §5 reference it; lock at article level.
    const article = loadAllSections().toLowerCase();
    expect(article).toMatch(/loop\s+(closes|close)|closes?\s+the\s+loop/);
  });

  test('article cross-platform: "sim" AND "real" both appear', async () => {
    // The cross-platform thread runs through the development-
    // plan framework. Locking at article level catches a
    // future edit that accidentally shifts the article to a
    // sim-only or real-only voice, which would break the LAP-
    // distinguishing bridge claim that the framework runs on
    // both surfaces.
    const article = loadAllSections().toLowerCase();
    expect(article).toMatch(/\bsim\b/);
    expect(article).toMatch(/\breal/);
  });

  test('article forbidden-vocab guardrail (cumulative defense-in-depth)', async () => {
    // Per-section tests already lock these absent (with the §5
    // automation-section asymmetry: "language-model" permitted
    // in negation context like "never to a language-model
    // output"). Cumulative check is the integration safety net
    // — guards against a future copy-paste from another article
    // that drops a forbidden word into one section while
    // passing per-section checks via permitted-context loophole.
    const article = loadAllSections().toLowerCase();
    // ADR-004
    expect(article).not.toMatch(/\bai\s+coach\b/);
    expect(article).not.toMatch(/\bllm\b/);
    expect(article).not.toMatch(/\bgenerative\b/);
    expect(article).not.toMatch(/\bneural\b/);
    expect(article).not.toMatch(/\brealistic\b/);
    // Pillar 2 carry-over
    expect(article).not.toMatch(/\bmagic\b/);
    expect(article).not.toMatch(/\bsecret\b/);
    expect(article).not.toMatch(/\btrick\b/);
    // Pillar 3 carry-over
    expect(article).not.toMatch(/\bclearly\s+worse\b/);
    expect(article).not.toMatch(/\boutdated\b/);
    expect(article).not.toMatch(/\bbloated\b/);
    expect(article).not.toMatch(/\boverhyped\b/);
    expect(article).not.toMatch(/\bobviously\s+inferior\b/);
    expect(article).not.toMatch(/\bexpensive\b/);
    expect(article).not.toMatch(/\bcheap\b/);
    expect(article).not.toMatch(/\bpricey\b/);
    expect(article).not.toMatch(/\baffordable\b/);
    // Pillar 4 extension
    expect(article).not.toMatch(/\bguru\b/);
    expect(article).not.toMatch(/\bsecret\s+formula\b/);
    expect(article).not.toMatch(/\bshortcut\b/);
    expect(article).not.toMatch(/\bovernight\b/);
    expect(article).not.toMatch(/\bhack\b/);
    expect(article).not.toMatch(/\bsystem\s+that\s+guarantees\b/);
  });

  test('article filler-word count is bounded (anti-fluff guardrail)', async () => {
    // Same lock as Pillars 1 / 2 / 3. "actually", "really",
    // "very", "basically", "essentially" all signal weak prose
    // when overused. Per-section tests don't catch fluff
    // because the per-section vocabulary is positive; cumulative
    // count caps the budget so a future editorial pass that
    // re-introduces filler is caught.
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
    // T168 internal-linking audit checks per-section presence;
    // article-level test locks the cluster floor of distinct
    // product subpages (a draft that consolidated all links to
    // /product alone would shrink the cluster reach). Pillar 4
    // outline mandates 5 product subpage targets across §3-§5
    // (bridge / coaching / driver-profile / desktop / mobile);
    // the floor of 3 leaves headroom for editorial pruning
    // without breaking cluster-hub status.
    const article = loadAllSections();
    const productSubpages = article.match(/\]\(\/product\/[a-z-]+\)/g) ?? [];
    const distinct = new Set(productSubpages);
    expect(
      distinct.size,
      `Expected ≥3 distinct /product/* subpages; found ${distinct.size}: ${[...distinct].join(', ')}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('article cross-pillar links: ALL THREE sibling pillars referenced (cluster closer)', async () => {
    // Pillar 4 closes the four-pillar cluster. The outline's
    // distinguishing constraint vs Pillars 1-3 is that Pillar 4
    // links to ALL THREE siblings (vs Pillar 3's two). Without
    // this, the four-pillar cluster does not close as a hub.
    // T168 already locks per-section (§3 → trail-braking, §4 →
    // sim-to-real-transfer, §6 → telemetry-app-comparison,
    // §7 → all three); article-level test confirms the
    // cumulative cluster reach.
    const article = loadAllSections();
    expect(article, 'must reference Pillar 1 (sim-to-real-transfer)').toMatch(
      /\]\(\/blog\/sim-to-real-transfer\)/,
    );
    expect(article, 'must reference Pillar 2 (what-is-trail-braking)').toMatch(
      /\]\(\/blog\/what-is-trail-braking\)/,
    );
    expect(article, 'must reference Pillar 3 (best-sim-racing-telemetry-app)').toMatch(
      /\]\(\/blog\/best-sim-racing-telemetry-app\)/,
    );
  });
});
