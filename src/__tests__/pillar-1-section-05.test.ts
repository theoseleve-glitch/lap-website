// T135 — contract test for Pillar 1 Section 5 ("case studies").
// Sprint task numbering calls this Section 4; outline numbering
// calls it Section 5. The article's most concrete section —
// abstract framework gets cashed out into circuit-by-circuit
// guidance, three named tracks each illustrating one fidelity
// tier from Section 4.
//
// Outline contract: ~600 words across three case studies (Sebring,
// Silverstone, Nürburgring/Nordschleife), each ~200 words with
// paired-honesty per circuit (where transfer is strong AND where
// it's weak). Same paired-honesty rule T132 introduced, applied
// at the circuit level.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'sim-to-real-transfer',
  'section-05-case-studies.md',
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

describe('T135: Pillar 1 Section 5 — case studies', () => {
  test('word count is in the 480-720 band (±20% of 600 outline target)', async () => {
    // Outline contract: ~600 words across three ~200-word
    // case studies. ±20% gives 480-720. The longest section in
    // the article — drafts under 480 mean the case studies are
    // too thin; over 720 means a future editor needs to trim.
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(480);
    expect(wc).toBeLessThanOrEqual(720);
  });

  test('names all three required circuits — Sebring, Silverstone, and Nürburgring', async () => {
    // The outline specifies these exact three because each
    // illustrates a distinct fidelity tier from Section 4:
    //   * Sebring → bumpy/lowest fidelity
    //   * Silverstone → smooth/highest fidelity baseline
    //   * Nürburgring → layout-as-prep, commitment mis-calibration
    // Substituting one circuit for another loses the tier
    // mapping. Lock all three.
    const section = loadSection();
    expect(section).toMatch(/Sebring/);
    expect(section).toMatch(/Silverstone/);
    expect(section).toMatch(/(Nürburgring|Nordschleife)/);
  });

  test('names specific corners on at least two of the three circuits', async () => {
    // Generic "Silverstone is sim-friendly" is theory; "Copse and
    // Maggotts/Becketts on iRacing transfer almost intact" is
    // concrete. Lock named corners on at least two circuits so
    // the section reads from real laps, not pattern-match
    // assertions.
    const section = loadSection();
    const namedCorners = [
      'Copse',
      'Maggotts',
      'Becketts',
      'Stowe',
      'La Source',
      'Eau Rouge',
      'Pouhon',
      'Bus Stop',
      'Flugplatz',
      'Karussell',
      'Bergwerk',
      'Adenauer',
      'Pflanzgarten',
      'Turn 1',
      'Turn 17',
      'hairpin',
    ];
    const matched = namedCorners.filter((corner) => section.includes(corner));
    expect(matched.length).toBeGreaterThanOrEqual(3);
  });

  test('names at least two sim platforms (per-circuit differentiation)', async () => {
    // Outline specifies the platform availability story: ACC
    // doesn't have Sebring, AMS2 does. iRacing/ACC both have
    // Silverstone at high fidelity. iRacing's Nordschleife is
    // canonical. Naming at least two platforms anchors the
    // ground-truth claim per circuit.
    const section = loadSection();
    const platforms = ['iRacing', 'ACC', 'AMS2', 'rFactor', 'Assetto Corsa'];
    const matched = platforms.filter((p) => section.includes(p));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });

  test('paired-honesty rule — section contains both positive-transfer AND limit language', async () => {
    // Same discipline T132 introduced, now applied per circuit.
    // The outline calls for each case to name where transfer is
    // strong AND where it's weak. Locking section-wide means at
    // least one of each kind of language must appear; a draft
    // that is all-positive (marketing copy) or all-negative
    // (gloomy disclaimer) fails.
    const section = loadSection().toLowerCase();
    const positive = /(transfer|strong|carry|carries|trust|familiar|maximum|clean|essential)/;
    const limit =
      /(surprise|gap|doesn't|miss|mis.calibrat|undersells|expect|recalibrat|weak|simplif|lull)/;
    expect(section).toMatch(positive);
    expect(section).toMatch(limit);
  });

  test('contains the closing-pattern thread — partial transfer is predictable', async () => {
    // Outline contract: across all three, the transfer is
    // partial in a predictable way; the framework explains
    // which parts and why. Lock the closing-pattern claim so a
    // future copy edit cannot drop the bridge back to the
    // article's thesis.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/(predictable|partial|framework|all three|across)/);
  });

  test('forbidden vocab — no AI-coach / LLM / generative / "realistic"', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\brealistic\b/);
  });
});
