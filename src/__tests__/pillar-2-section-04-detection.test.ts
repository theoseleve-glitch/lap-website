// T144 — contract test for Pillar 2 Section 4 ("how LAP detects
// it"). Sprint task numbering calls this Section 3; outline
// numbering calls it Section 4. The detection-pipeline section
// is where the article makes its strongest doctrine claim:
// rule-based pipeline, not a language model, per ADR-004.
//
// Unlike other section tests that ban LLM/neural/generative
// outright, this section must EXPLICITLY name and negate those
// patterns — that's the section's whole purpose. The test
// therefore REQUIRES a negation phrase rather than checking for
// absence of the words. Other forbidden marketing vocab (AI
// coach as a claim, magic, secret, trick, realistic) remains
// banned outright.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'trail-braking',
  'section-04-detection.md',
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

describe('T144: Pillar 2 Section 4 — how LAP detects trail braking', () => {
  test('word count is in the 320-480 band (±20% of 400 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(320);
    expect(wc).toBeLessThanOrEqual(480);
  });

  test('explicit ADR-004 negation — distances LAP from LLM/neural framing', async () => {
    // The section's whole doctrine purpose. ADR-004 forbids
    // language-model coaching in the 6-month plan; the article
    // must say so, not merely avoid the words. A draft that
    // ducks the negation leaves the door open to a future copy
    // editor who reintroduces "AI-powered" framing.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(
      /(not\s+a\s+language\s+model|not\s+an?\s+llm|not\s+a\s+neural\s+net|not\s+generative|no\s+llm)/,
    );
  });

  test('uses "rule" repeatedly — the doctrine framing word', async () => {
    // Doctrine framing for the detection pipeline is "written
    // rules / rule library" (ADR-013). Lock the word so a
    // future paraphrase can't replace it with "algorithm" or
    // "system" without the test catching the drift away from
    // doctrine vocabulary.
    const section = loadSection().toLowerCase();
    const matches = section.match(/\brule\b/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  test('names ≥2 of the three signal sources from the outline', async () => {
    // Outline §4 brief specifies: brake-trace gradient,
    // steering-input correlation, apex-speed deficit. Lock that
    // ≥2 of the three are explicitly named — the section's
    // technical credibility comes from the specificity.
    const section = loadSection().toLowerCase();
    const sources = [
      /brake.trace\s+gradient|brake.pressure\s+gradient|gradient\s+(of|on)\s+(the\s+)?brake/,
      /steering.input\s+correlation|steering.trace\s+correlation|steering\s+(peak|input).*correlation|when\s+does\s+steering/,
      /apex.speed\s+deficit|apex\s+speed\s+(under|deficit|loss|gap)/,
    ];
    const matched = sources.filter((re) => re.test(section));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });

  test('makes the cross-platform claim — sim and real both', async () => {
    // The cross-platform consistency framing is the whole point
    // of the bridge product. Section 4 is its primary
    // explainer.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/sim\b/);
    expect(section).toMatch(/real\b/);
  });

  test('contains internal link to /product/bridge', async () => {
    // Outline cross-link assignment. The bridge IS the technical
    // artifact this section describes. Without the link, the
    // section is a doctrine essay disconnected from the
    // product surface.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/bridge\)/);
  });

  test('contains internal link to /product/coaching', async () => {
    // Outline cross-link assignment. The detection pipeline
    // reads from the coaching library; the link is what makes
    // that operational connection legible.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/coaching\)/);
  });

  test('contains the honest-framing phrase ("hand-curated" / "hand-written" / "written rule")', async () => {
    // ADR-004 commits to hand-curated rules as a strategic
    // choice. The article must SAY this, not merely allude to
    // it. Lock the phrasing so a future copy edit can't soften
    // the doctrine into "carefully designed" or "expertly
    // crafted" generic marketing prose.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/(hand.curated|hand.written|written\s+rule)/);
  });

  test('uses "trail brak" repeatedly — article title verb', async () => {
    const section = loadSection().toLowerCase();
    const matches = section.match(/trail\s*brak/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test('forbidden CLAIMS — no "AI coach" / magic / secret / trick / realistic', async () => {
    // Note the asymmetry vs other sections: LLM / neural /
    // generative are PERMITTED here ONLY in negation context
    // (locked by the explicit-negation test above). The
    // wholesale bans are on the marketing-overclaim words that
    // have no legitimate negation use here.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai coach\b/);
    expect(section).not.toMatch(/\bmagic\b/);
    expect(section).not.toMatch(/\bsecret\b/);
    expect(section).not.toMatch(/\btrick\b/);
    expect(section).not.toMatch(/\brealistic\b/);
  });
});
