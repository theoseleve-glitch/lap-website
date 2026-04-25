// T157 (intro half) — contract test for Pillar 3 Section 1
// ("the question"). Outline §1 is intro-only: no individual
// T-task, drafted under the T157 editing umbrella because
// section-02 through section-06 are already in flight and the
// publish step (T160) needs all 7 sections present.
//
// Outline brief: ~250 words, two distinct reader personas
// (sim racer + track-day driver), framing premise that there
// is no single "best" telemetry app, comparison axes preview,
// closing line teases §5 (the persona-mapping payoff). The
// article TITLE uses "best" because that's what people search
// for; the BODY never declares one winner.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'telemetry-apps-comparison',
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

describe('T157 (intro): Pillar 3 Section 1 — the question', () => {
  test('word count is in the 200-300 band (±20% of 250 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(200);
    expect(wc).toBeLessThanOrEqual(300);
  });

  test('section names both reader personas (sim racer + track-day driver)', async () => {
    // Outline §1 premise: two distinct readers arrive at this
    // article — the sim racer who has done a season without
    // telemetry, AND the track-day driver who already uses
    // RaceBox or phone-based capture. Both must be named in
    // the intro so each reader recognises themselves on the
    // first paragraph.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/sim\s+racer|iracing/);
    expect(section).toMatch(/track.day\s+driver/);
  });

  test('section forbids "best app" winner-declaration framing', async () => {
    // Outline §1 forbidden: "best app" as winner-declaration.
    // The article TITLE uses "best" (search intent) but the
    // BODY never declares one. Intro is the highest-risk
    // section for this slip because it sets the framing for
    // the rest of the article.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bthe\s+best\s+(telemetry\s+)?app\s+(is|for\s+everyone)\b/);
    expect(section).not.toMatch(/\bbest\s+(telemetry\s+)?app\s+overall\b/);
    expect(section).not.toMatch(/\boverall\s+winner\b/);
    expect(section).not.toMatch(/\bclearly\s+the\s+best\b/);
  });

  test('section names ≥4 of the 6 comparison-axes vocabulary patterns (axes preview)', async () => {
    // Outline §1 closing-line mandate: "previews the
    // comparison axes". The six axes per outline §
    // "Comparison axes" are: capture surface (sim platforms),
    // capture surface (real-world), data depth (raw →
    // coaching → driver profile), cross-platform unification,
    // pricing model, persona fit. Lock that ≥4 axis-vocab
    // patterns appear so the reader knows what dimensions the
    // article will compare on.
    const section = loadSection().toLowerCase();
    const axesPatterns = [
      /(capture\s+surface|sim\s+platform|sim\s+title)/,
      /(real.world|track.day\s+capture|racebox)/,
      /(data\s+depth|coaching|driver\s+profile|telemetry\s+depth)/,
      /(cross.platform|sim.and.real|bridge)/,
      /(pricing|price|cost|subscription|free\s+tier)/,
      /persona/,
    ];
    const matched = axesPatterns.filter((re) => re.test(section));
    expect(
      matched.length,
      `Expected ≥4 of 6 comparison-axes patterns; matched ${matched.length}`,
    ).toBeGreaterThanOrEqual(4);
  });

  test('section forwards the reader to the persona-mapping payoff', async () => {
    // Outline §1 closing line: "previews the comparison axes
    // and notes that Section 5 carries the persona-mapping
    // payoff." Intro must explicitly forward the reader to
    // the section that does the matching work — without it,
    // the article reads as a comparison without a punchline.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(
      /(persona|matching|shortlist|fits\s+(your|each|the)|which\s+app\s+fits|which\s+app\s+suits)/,
    );
  });

  test('section forbids subjective competitor disparagement (Pillar 3 carry-over)', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bclearly\s+worse\b/);
    expect(section).not.toMatch(/\boutdated\b/);
    expect(section).not.toMatch(/\bbloated\b/);
    expect(section).not.toMatch(/\boverhyped\b/);
    expect(section).not.toMatch(/\bobviously\s+inferior\b/);
    expect(section).not.toMatch(/\bugly\b/);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 carry-over', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai\s+coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\bneural\b/);
    expect(section).not.toMatch(/\brealistic\b/);
    expect(section).not.toMatch(/\bmagic\b/);
    expect(section).not.toMatch(/\bsecret\b/);
    expect(section).not.toMatch(/\btrick\b/);
  });
});
