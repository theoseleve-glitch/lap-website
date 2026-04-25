// T146 — contract test for Pillar 2 Section 6 ("examples from
// real telemetry"). Sprint task numbering calls this Section 5;
// outline numbering calls it Section 6. Three concrete
// corner-by-corner case studies that cash the abstract framework
// from earlier sections into legible diagnostic patterns. Maps
// onto ADR-005 §5.2 WeaknessEpisode + §5.4 ActionOutcome — the
// open → improving → resolved loop closing on captured data.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'trail-braking',
  'section-06-examples.md',
);

const loadSection = (): string => readFileSync(SECTION_PATH, 'utf8');

const wordCount = (text: string): number =>
  text
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;

describe('T146: Pillar 2 Section 6 — real telemetry examples', () => {
  test('word count is in the 360-540 band (±20% of 450 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(360);
    expect(wc).toBeLessThanOrEqual(540);
  });

  test('names all three outline-canonical case-study circuits', async () => {
    // Outline §6 brief specifies three examples each at a named
    // circuit:
    //   1. Spa La Source (sim, iRacing GT3) — release-too-early
    //   2. Suzuka Hairpin (sim, AMS2) — brake-too-gentle
    //   3. Brands Hatch Druids (real track day) — held-too-late
    // A draft can substitute one circuit for variety, but
    // dropping more than one collapses the section's
    // case-study breadth. Floor: ≥2 of 3 outline circuits
    // named.
    const section = loadSection();
    const outlineCircuits = ['Spa', 'Suzuka', 'Brands Hatch'];
    const matched = outlineCircuits.filter((c) => section.includes(c));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });

  test('includes specific corner names (not generic "the corner")', async () => {
    // Pillar 1 specificity bar carried through. Outline calls
    // for La Source, Hairpin, Druids. Generic "the entry corner"
    // prose is the drift this catches.
    const section = loadSection();
    const corners = ['La Source', 'Hairpin', 'Druids', 'Spoon', 'Eau Rouge'];
    const matched = corners.filter((c) => section.includes(c));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });

  test('includes specific numeric values — directional but verifiable', async () => {
    // Outline §6 brief: "numbers should be illustrative —
    // directional, not source-attributed precision." A draft
    // that elides numbers entirely retreats to vague "loses
    // some time" prose; a draft with numbers carries enough
    // specificity to be falsifiable. Lock that ≥3 numeric
    // values appear.
    //
    // Match: digit followed by km/h, %, second, s, or "bar"
    // (brake pressure unit), or a percentage word.
    const section = loadSection();
    const numericPatterns = section.match(
      /\d+\s*(km\/h|kmh|%|percent|second|seconds|s\b|bar|degrees?)/g,
    ) ?? [];
    expect(numericPatterns.length).toBeGreaterThanOrEqual(3);
  });

  test('names ≥2 sim platforms across the examples', async () => {
    // Cross-platform breadth — outline puts iRacing on Example
    // 1 and AMS2 on Example 2. Locking ≥2 platform names
    // catches a draft that retreats to "your sim of choice".
    const section = loadSection();
    const platforms = ['iRacing', 'ACC', 'AMS2', 'Assetto Corsa', 'rFactor'];
    const matched = platforms.filter((p) => section.includes(p));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });

  test('makes the cross-platform claim — sim AND real both present', async () => {
    // Outline §6 calls for one of the three examples to be a
    // real-track capture (Brands Hatch Druids in a 911 GT3 RS).
    // The cross-platform breadth across the three examples is
    // the section's structural argument.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/sim\b/);
    expect(section).toMatch(/real\b/);
  });

  test('references doctrine "shape" AND "intensity" (Pillar 1 framework)', async () => {
    // Outline §6 closing brief: "intensity is platform-specific
    // — these are real captures; the shape is what
    // generalises." Locks the cross-pillar framework vocabulary
    // in the section that uses it most pointedly.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\bshape/);
    expect(section).toMatch(/\bintensity/);
  });

  test('contains internal link to /product/driver-profile', async () => {
    // Outline cross-link assignment. Driver profile is where
    // these diagnoses surface for the actual driver as
    // WeaknessEpisode rows (ADR-005 §5.2) — the link makes the
    // article-to-product connection legible.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/driver-profile\)/);
  });

  test('contains cross-link to /blog/sim-to-real-transfer', async () => {
    // Outline §6: "brief reference back to /blog/sim-to-real-
    // transfer for the shape-vs-intensity pattern." The
    // cross-pillar link reinforces the four-pillar cluster as
    // a hub.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/blog\/sim-to-real-transfer\)/);
  });

  test('uses "trail brak" repeatedly — article title verb', async () => {
    const section = loadSection().toLowerCase();
    const matches = section.match(/trail\s*brak/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 outline extensions', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\bneural\b/);
    expect(section).not.toMatch(/\brealistic\b/);
    expect(section).not.toMatch(/\bmagic\b/);
    expect(section).not.toMatch(/\bsecret\b/);
    expect(section).not.toMatch(/\btrick\b/);
  });
});
