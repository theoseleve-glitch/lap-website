// T165 — contract test for Pillar 4 Section 5 ("how LAP
// automates this"). Sprint task wording calls this Section
// 4; outline numbering calls it Section 5. The article's
// commercial section, with the highest sales-pitch drift
// risk in the pillar.
//
// ~500 words walking through how LAP automates each of the
// five framework verbs (~80w per verb plus opening). The
// section MUST resist marketing-superlative drift — the
// honest framing is what makes §6 DIY template believable;
// without that, §5 reads as a sales pitch and §6 as a
// generosity gesture rather than the article's structural
// trust signal.
//
// ADR-004 negation appears here in its strongest version
// because the prescribe step is the article's highest LLM-
// temptation point: "every prescription traces to a written
// rule, never to a language-model output."

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'driver-development-plan',
  'section-05-automation.md',
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

const FRAMEWORK_VERBS = ['Diagnose', 'Prescribe', 'Execute', 'Measure', 'Adapt'];

describe('T165: Pillar 4 Section 5 — how LAP automates this', () => {
  test('word count is in the 400-600 band (±20% of 500 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(400);
    expect(wc).toBeLessThanOrEqual(600);
  });

  test('section uses bold leaders for all five framework verbs (parallel structure with §3)', async () => {
    // §3 unpacked the framework verbs; §5 unpacks how each
    // one is automated. Same bold-leader pattern for parallel
    // scannability — a reader cross-referencing §3 and §5
    // can match verb-to-automation in one glance.
    const section = loadSection();
    for (const verb of FRAMEWORK_VERBS) {
      expect(
        section,
        `Section must use bold leader "**${verb}.**" or "**${verb}**"`,
      ).toMatch(new RegExp(`\\*\\*${verb}\\.?\\*\\*`));
    }
  });

  test('section contains ADR-004 no-language-model-coaching negation in strongest form', async () => {
    // Outline §5 brief: "ADR-004 negation MUST appear in
    // strongest form — Pillar 4's strongest version because
    // the automation surface is where the temptation to
    // delegate to a language model is highest." A reader
    // shopping for a "best AI coach" must hit a clear
    // negation here.
    const section = loadSection().toLowerCase();
    const negationPatterns = [
      /(no|not|without|never)\s+(\w+\s+){0,4}language.?model/,
      /every\s+(\w+\s+){0,3}(traces\s+to|comes\s+from)\s+a?\s*(written|rule)/,
      /rule.?based\s+(prescription|coaching|library)/,
    ];
    const matched = negationPatterns.filter((re) => re.test(section));
    expect(
      matched.length,
      'Section must contain ≥1 explicit ADR-004 no-language-model-coaching negation',
    ).toBeGreaterThanOrEqual(1);
  });

  test('section forbids sales-pitch superlatives and time-to-result overclaim', async () => {
    // Outline §5 voice: "declarative, not promotional";
    // "automate doesn't mean replace — the driver still has
    // to execute." Forbid the marketing intensifiers that
    // would undercut the §6 DIY-template trust signal.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\brevolutionary\b/);
    expect(section).not.toMatch(/\bgame.?changer\b/);
    expect(section).not.toMatch(/\bunmatched\b/);
    expect(section).not.toMatch(/\bunrivaled\b/);
    expect(section).not.toMatch(/\bbreakthrough\b/);
    expect(section).not.toMatch(/\bdramatically\s+improve\b/);
    expect(section).not.toMatch(/\btransform\s+your\s+driving\s+in\s+\d+\s+days\b/);
    expect(section).not.toMatch(/\bnever\s+practice\s+aimlessly\s+again\b/);
  });

  test('section contains internal link to /product (overview)', async () => {
    // Outline §5: /product (overview, the LAP five-pillar
    // surface).
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\)/);
  });

  test('section contains internal link to /product/coaching', async () => {
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/coaching\)/);
  });

  test('section contains internal link to /product/driver-profile', async () => {
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/driver-profile\)/);
  });

  test('section contains internal link to /pricing', async () => {
    // Outline §5: /pricing — what subscription buys.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/pricing\)/);
  });

  test('section addresses cross-platform discipline (sim AND real)', async () => {
    // Cross-platform must run through the LAP automation
    // section as well — the bridge claim is the article's
    // distinguishing capability and the section that omits
    // it would weaken the four-pillar cluster's central
    // argument.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\bsim\b/);
    expect(section).toMatch(/\breal/);
  });

  test('section names LAP automation surface artifacts (≥3 of 4)', async () => {
    // Outline §5 per-verb brief names specific surface
    // entities: WeaknessEpisode (diagnose), ActionPrescription
    // (prescribe), ActionOutcome (measure), DriverProgress-
    // Snapshot (measure). Lock that ≥3 of 4 named entities
    // appear so the section reads as concrete product fact
    // rather than abstract automation prose.
    const section = loadSection();
    const surfaceEntities = [
      /WeaknessEpisode/,
      /ActionPrescription/,
      /ActionOutcome/,
      /DriverProgress(Snapshot)?/,
    ];
    const matched = surfaceEntities.filter((re) => re.test(section));
    expect(
      matched.length,
      `Expected ≥3 of 4 named LAP surface entities; matched ${matched.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('section forbids Pillar 4-specific overclaim vocabulary', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bguru\b/);
    expect(section).not.toMatch(/\bsecret\s+formula\b/);
    expect(section).not.toMatch(/\bshortcut\b/);
    expect(section).not.toMatch(/\bovernight\b/);
    expect(section).not.toMatch(/\bhack\b/);
    expect(section).not.toMatch(/\bsystem\s+that\s+guarantees\b/);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 + Pillar 3 carry-over (asymmetric for language-model negation)', async () => {
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
