// T162 — contract test for Pillar 4 Section 2 ("what a
// development plan is — vs aimless practice"). Sprint task
// wording calls this Section 1; outline numbering calls it
// Section 2. The article's premise: aimless practice is the
// default; a development plan is a structured feedback loop
// tied to data. ~400 words.
//
// Doctrine §6 anchor: the loop closes or the feature doesn't
// ship. Pillar 4 lifts this principle from product doctrine
// into reader-facing prose; the phrase "the loop closes" is
// the article's structural anchor and must appear in this
// foundational section.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'driver-development-plan',
  'section-02-what-is.md',
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

describe('T162: Pillar 4 Section 2 — what a development plan is', () => {
  test('word count is in the 320-480 band (±20% of 400 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(320);
    expect(wc).toBeLessThanOrEqual(480);
  });

  test('section names "aimless practice" as the contrast term', async () => {
    // Outline §2 brief: "contrast aimless practice... with a
    // structured plan." The exact phrase is the article's
    // contrast anchor; without it the section's premise has
    // no name.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\baimless\s+practice\b/);
  });

  test('section uses "development plan" repeatedly (≥3 occurrences)', async () => {
    // The article's title verb. A draft that uses
    // "development plan" only once is drifting toward
    // generic "training routine" or "practice schedule"
    // language.
    const section = loadSection().toLowerCase();
    const matches = section.match(/development\s+plan/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "development plan" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('section contains the doctrine anchor phrase "the loop closes"', async () => {
    // Outline §2: "The phrase 'the loop closes' must appear
    // at least once; it is the article's structural anchor."
    // The phrase is lifted from Doctrine §4 principle 6 into
    // reader-facing prose — without it, the section's
    // doctrinal anchor breaks.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/the\s+loop\s+closes/);
  });

  test('section previews all five framework verbs (without unpacking)', async () => {
    // Outline §2 brief: "The framework verbs (diagnose /
    // prescribe / execute / measure / adapt) are PREVIEWED
    // but not unpacked — that's T163's job." Lock that all
    // five appear in the preview list.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\bdiagnose\b/);
    expect(section).toMatch(/\bprescribe\b/);
    expect(section).toMatch(/\bexecute\b/);
    expect(section).toMatch(/\bmeasure\b/);
    expect(section).toMatch(/\badapt\b/);
  });

  test('section contains internal link to /product/coaching', async () => {
    // Outline §2 internal link: /product/coaching ("the
    // prescription concept lives in our rule library").
    // Lock the link.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/coaching\)/);
  });

  test('section forbids Pillar 4-specific overclaim vocabulary', async () => {
    // Outline §2 quality bar extended: "no 'secret formula',
    // 'guru system', 'shortcut to fast laps' — any framing
    // that suggests the plan replaces sustained practice."
    // Section 2 is the article's premise-setter and is the
    // highest-risk place for the speed-of-results overclaim.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bguru\b/);
    expect(section).not.toMatch(/\bsecret\s+formula\b/);
    expect(section).not.toMatch(/\bshortcut\b/);
    expect(section).not.toMatch(/\bovernight\b/);
    expect(section).not.toMatch(/\bhack\b/);
    expect(section).not.toMatch(/\bsystem\s+that\s+guarantees\b/);
    expect(section).not.toMatch(/\btransform\s+your\s+driving\s+in\s+\d+\s+days\b/);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 + Pillar 3 carry-over', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai\s+coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\bneural\b/);
    expect(section).not.toMatch(/\brealistic\b/);
    expect(section).not.toMatch(/\bmagic\b/);
    expect(section).not.toMatch(/\bsecret\b/);
    expect(section).not.toMatch(/\btrick\b/);
    expect(section).not.toMatch(/\bclearly\s+worse\b/);
    expect(section).not.toMatch(/\boutdated\b/);
    expect(section).not.toMatch(/\bbloated\b/);
  });
});
