// T167 (intro half) — contract test for Pillar 4 Section 1
// ("the question"). Outline §1 is intro-only: no individual
// T-task, drafted under the T167 editing umbrella because
// section-02 through section-06 are already shipped and the
// publish step (T170) needs all 7 sections present.
//
// Outline brief: ~250 words, two distinct reader personas
// (serious sim racer who plateaued + track-day driver who
// wants to compress weekend learning), framing premise that
// aimless practice is the default and a development plan is
// a structured feedback loop tied to data, framework verbs
// preview, closing line teases §6 (DIY template trust
// signal).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'driver-development-plan',
  'section-01-intro.md',
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

const FRAMEWORK_VERBS = ['diagnose', 'prescribe', 'execute', 'measure', 'adapt'];

describe('T167 (intro): Pillar 4 Section 1 — the question', () => {
  test('word count is in the 200-300 band (±20% of 250 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(200);
    expect(wc).toBeLessThanOrEqual(300);
  });

  test('section names both reader personas (serious sim racer + track-day driver)', async () => {
    // Outline §1 brief: two distinct readers — the serious
    // sim racer who has plateaued at a licence class, and
    // the track-day driver running 4-8 events a year who
    // wants to compress each weekend's learning. Both must
    // be named in the intro so each reader recognises
    // themselves on the first paragraph.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/sim\s+racer/);
    expect(section).toMatch(/track.day\s+driver/);
  });

  test('section names "aimless practice" as the contrast term', async () => {
    // Outline §1 frame: "aimless practice is the default. A
    // development plan is a structured feedback loop tied to
    // data." The contrast term must appear in the intro to
    // set up the article's premise — §2 then unpacks it.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\baimless\s+practice\b/);
  });

  test('section previews all five framework verbs', async () => {
    // Outline §1 closing line: "previews the framework verbs
    // (diagnose → prescribe → execute → measure → adapt)."
    // The reader should leave §1 knowing the article's
    // structural vocabulary.
    const section = loadSection().toLowerCase();
    for (const verb of FRAMEWORK_VERBS) {
      expect(
        section,
        `Section must preview framework verb "${verb}"`,
      ).toMatch(new RegExp(`\\b${verb}`));
    }
  });

  test('section forwards the reader to the DIY template trust signal', async () => {
    // Outline §1 closing line: "notes that Section 6 carries
    // the DIY template for readers who do not use LAP — the
    // article's trust signal that the loop is universal, not
    // LAP-exclusive." Without this forward pointer, readers
    // who suspect the article is a sales pitch may bounce
    // before reaching §6.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(
      /(diy\s+template|non.lap|tool.agnostic|any\s+telemetry\s+(tool|app)|universal|not\s+lap.exclusive)/,
    );
  });

  test('section forbids Pillar 4-specific overclaim vocabulary', async () => {
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
