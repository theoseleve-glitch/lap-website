// T143 — contract test for Pillar 2 Section 3 ("common mistakes
// + data signatures"). Sprint task numbering calls this Section
// 2; outline numbering calls it Section 3 (the six-mistake
// section after the unnumbered intro and the physics section).
//
// The article's most concrete section. Lists named mistakes,
// each paired with its telemetry signature in plain language.
// Maps one-to-one onto ADR-005 §5.2 WeaknessEpisode subcategory
// enum — what readers see as "the canonical mistake" is what the
// detector emits programmatically. Without this section, T144
// (detection) has nothing to reference; with it, the rest of the
// article inherits a shared mistake vocabulary.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'trail-braking',
  'section-03-mistakes.md',
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

describe('T143: Pillar 2 Section 3 — common mistakes + data signatures', () => {
  test('word count is in the 480-720 band (±20% of 600 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(480);
    expect(wc).toBeLessThanOrEqual(720);
  });

  test('names ≥5 of the 6 outline mistakes (substantive coverage)', async () => {
    // The outline calls out six canonical mistakes:
    //   1. released too early
    //   2. held too late
    //   3. inconsistent / stab pattern (decay shape problem)
    //   4. too gentle to begin with
    //   5. too aggressive at start (lockup pattern)
    //   6. simultaneous longitudinal + lateral peaks
    // A draft can rename one or rephrase, so the floor is 5/6.
    // Below that, the article loses the breadth that makes it a
    // diagnostic resource rather than a single-mistake essay.
    const section = loadSection().toLowerCase();
    const mistakeKeys = [
      /\btoo early\b/, // mistake 1: released too early
      /\btoo late\b/, // mistake 2: held too late
      /(inconsistent|stab|decay)/, // mistake 3: shape problem
      /\btoo gentle\b/, // mistake 4: under-pressure
      /(too aggressive|lockup|locks the front|lock.up)/, // mistake 5: over-pressure
      /(simultaneous|at the same time|at once|both.*peaks)/, // mistake 6
    ];
    const matched = mistakeKeys.filter((re) => re.test(section));
    expect(matched.length).toBeGreaterThanOrEqual(5);
  });

  test('every mistake reference is paired with a telemetry signature word', async () => {
    // The section's whole structure is "named mistake +
    // signature." If the section names mistakes without naming
    // their data signatures, it becomes a list of opinions
    // rather than diagnostic vocabulary. Lock that
    // signature/trace/telemetry words appear in proportion to
    // mistake names — pragmatic floor: section uses any
    // signature-word ≥3 times.
    const section = loadSection().toLowerCase();
    const signatureWords = section.match(/\b(signature|trace|telemetry|pattern)\b/g) ?? [];
    expect(signatureWords.length).toBeGreaterThanOrEqual(3);
  });

  test('uses "brake pressure" / "brake trace" — the foundational data anchor', async () => {
    // Brake pressure / brake trace IS the primary signal a
    // trail-brake mistake reads off of. A draft that talks about
    // mistakes without naming the data the mistake leaves on
    // the brake trace has stayed at the level of feel, not data.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/brake\s+(pressure|trace)/);
  });

  test('uses "trail brak" repeatedly — the article title verb', async () => {
    // Same lock as section 2. The section names many mistakes;
    // each is a flavour of trail-brake gone wrong, so the verb
    // should appear several times naturally.
    const section = loadSection().toLowerCase();
    const matches = section.match(/trail\s*brak/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(4);
  });

  test('contains the cross-link to /blog/sim-to-real-transfer', async () => {
    // Outline mandate. The section's closing thesis ("these
    // mistake shapes carry between platforms") is the
    // shape-vs-intensity framework from Pillar 1. The
    // cross-pillar link is what turns the four-pillar cluster
    // into a hub. Lock the link explicitly.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/blog\/sim-to-real-transfer\)/);
  });

  test('uses Pillar 1 doctrine word "shape" (the cross-pillar anchor)', async () => {
    // The cross-pillar link's surrounding context should use
    // "shape" — the framework word from Pillar 1. Without it,
    // the link is ungrounded; with it, the reader feels the
    // continuity between pillars.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\bshape/);
  });

  test('names ≥1 specific circuit or corner (specificity bar)', async () => {
    // Pillar 1 set this discipline at the article level; Pillar
    // 2 inherits it. A 600-word section listing six abstract
    // mistakes without naming a corner reads like a textbook
    // entry, not a coaching diagnostic.
    const section = loadSection();
    const namedAnchors = [
      'Spa',
      'La Source',
      'Eau Rouge',
      'Pouhon',
      'Silverstone',
      'Copse',
      'Brands Hatch',
      'Druids',
      'Suzuka',
      'Hairpin',
      'Spoon',
      'Nordschleife',
      'Sebring',
      'Monza',
      'Imola',
      'Bus Stop',
    ];
    const matched = namedAnchors.filter((anchor) => section.includes(anchor));
    expect(matched.length).toBeGreaterThanOrEqual(1);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 outline extensions', async () => {
    const section = loadSection().toLowerCase();
    // ADR-004 core ban
    expect(section).not.toMatch(/\bai coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\bneural\b/);
    expect(section).not.toMatch(/\brealistic\b/);
    // Pillar 2 outline extensions — physics-explainer drift catch
    expect(section).not.toMatch(/\bmagic\b/);
    expect(section).not.toMatch(/\bsecret\b/);
    expect(section).not.toMatch(/\btrick\b/);
  });
});
