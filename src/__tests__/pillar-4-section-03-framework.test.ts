// T163 — contract test for Pillar 4 Section 3 ("the
// framework: diagnose → prescribe → execute → measure →
// adapt"). Sprint task wording calls this Section 2; outline
// numbering calls it Section 3. The article's longest
// section because it carries the framework definition.
//
// ~600 words; ~110w per verb plus opening framing. The five
// verbs are the article's structural vocabulary; section
// drafters MUST use the exact verbs (no synonym drift to
// "identify" / "fix" / "test"). The verb-discipline test
// enforces bold-leader format ("**Diagnose.**" etc.) so a
// scanning reader can find each verb in two seconds.
//
// Doctrine §6 anchor + ADR-004 negation + cross-pillar link
// to /blog/what-is-trail-braking are mandatory load-bearers.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'driver-development-plan',
  'section-03-framework.md',
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

describe('T163: Pillar 4 Section 3 — the framework', () => {
  test('word count is in the 480-720 band (±20% of 600 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(480);
    expect(wc).toBeLessThanOrEqual(720);
  });

  test('section uses bold leaders for all five framework verbs', async () => {
    // Outline §3 quality bar: "the five verbs are the
    // article's structural vocabulary; section drafters MUST
    // use the exact verbs." Bold leader format
    // ("**Diagnose.**" or similar) gives the reader a
    // scannable structure — without it, a reader cannot
    // navigate the framework in seconds.
    const section = loadSection();
    for (const verb of FRAMEWORK_VERBS) {
      expect(
        section,
        `Section must use bold leader "**${verb}.**" or "**${verb}**"`,
      ).toMatch(new RegExp(`\\*\\*${verb}\\.?\\*\\*`));
    }
  });

  test('section contains ADR-004 no-language-model-coaching negation in prescribe context', async () => {
    // Outline §3 brief: "every prescription traces to a
    // written rule, never to a language-model output." The
    // prescribe step is where the temptation to delegate to
    // a language model is highest; the negation MUST appear
    // in this section.
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

  test('section contains "the loop closes" in adapt context', async () => {
    // Outline §3 brief: "Doctrine §6 phrase 'the loop
    // closes' appears in the adapt paragraph." The adapt
    // verb is the explicit closure of the framework loop;
    // without the doctrinal anchor, the adapt step reads as
    // "review and decide" rather than "close the loop."
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/(close[s]?\s+the\s+loop|the\s+loop\s+close[s]?)/);
  });

  test('section anchors trail-braking as the diagnose worked example', async () => {
    // Outline §3 brief: "Trail-braking worked example anchors
    // the diagnose step, with cross-pillar link to
    // /blog/what-is-trail-braking." The cross-pillar link is
    // both an SEO + UX move (pulls Pillar 2 readers into
    // Pillar 4 and vice versa) and a doctrinal one (keeps
    // the framework grounded in a concrete weakness shape
    // rather than abstract "data analysis").
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/trail.brak/);
    const sectionRaw = loadSection();
    expect(sectionRaw).toMatch(/\]\(\/blog\/what-is-trail-braking\)/);
  });

  test('section contains internal link to /product/coaching (prescribe)', async () => {
    // Outline §3: /product/coaching link in the prescribe
    // paragraph (rule-based prescription draws from the
    // coaching library).
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/coaching\)/);
  });

  test('section contains internal link to /product/driver-profile (measure)', async () => {
    // Outline §3: /product/driver-profile link in the
    // measure paragraph (the metric over time view).
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/driver-profile\)/);
  });

  test('section addresses cross-platform discipline (sim AND real)', async () => {
    // Outline quality bar: "every section that names sim
    // sessions also addresses real-world capture; the
    // bridge thread runs all the way through." §3 names
    // weakness shapes that occur on both surfaces — the
    // diagnose step works the same on a sim brake-pressure
    // trace and a real-world one.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\bsim\b/);
    expect(section).toMatch(/\breal/);
  });

  test('section has substance per verb (≥80 words between each pair of verb leaders)', async () => {
    // Defends the "~110w per verb" outline target. A draft
    // could pass the bold-leader test by using all five verbs
    // in a single sentence; this test catches that by
    // requiring ≥80 words of body prose between consecutive
    // verb leaders. Five verbs × 80w = 400w substance floor;
    // remaining 80-320w is opening framing + closing.
    const section = loadSection();
    const verbPositions = FRAMEWORK_VERBS.map((verb) => {
      const re = new RegExp(`\\*\\*${verb}\\.?\\*\\*`);
      const match = section.match(re);
      if (!match || match.index === undefined) return -1;
      return match.index;
    });
    expect(
      verbPositions.every((p) => p >= 0),
      'All five verbs must have bold leader markers',
    ).toBe(true);
    for (let i = 0; i < FRAMEWORK_VERBS.length - 1; i++) {
      const between = section.slice(verbPositions[i], verbPositions[i + 1]);
      const wc = wordCount(between);
      expect(
        wc,
        `Expected ≥80 words between **${FRAMEWORK_VERBS[i]}.** and **${FRAMEWORK_VERBS[i + 1]}.**, found ${wc}`,
      ).toBeGreaterThanOrEqual(80);
    }
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
    // Asymmetric: bare "llm" / "ai coach" / "generative" /
    // "neural" remain forbidden. Spelled-out "language-model"
    // is permitted in the negation context that this section
    // requires.
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
