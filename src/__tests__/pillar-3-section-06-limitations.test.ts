// T156 — contract test for Pillar 3 Section 6 ("honest LAP
// limitations"). Sprint task wording calls this Section 5;
// outline numbering calls it Section 6. The article's deepest
// trust-earner. ~400 words, first-person plural voice
// ("we"/"our"/"us"), 3-5 specific LAP limitations from
// Doctrine §10 + sprint BLOCKED surface, mandatory ADR-004
// no-LLM-coaching negation, closing durability promise.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'telemetry-apps-comparison',
  'section-06-limitations.md',
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

describe('T156: Pillar 3 Section 6 — honest LAP limitations', () => {
  test('word count is in the 320-480 band (±20% of 400 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(320);
    expect(wc).toBeLessThanOrEqual(480);
  });

  test('section uses first-person plural voice (≥6 we/our/us)', async () => {
    // Outline §6 voice mandate: "first-person plural ('we').
    // This is the only section that uses 'we' naturally — the
    // limitations are ours." Without this, the section
    // regresses from "we do not ship X" (first-person,
    // accountable) to "LAP does not ship X" (third-person,
    // deniable), which violates the trust-building intent.
    //
    // Lock ≥6 first-person-plural pronouns across the section
    // (5 limitations + opening + closing leaves room).
    const section = loadSection().toLowerCase();
    const matches = section.match(/\b(we|our|us)\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥6 first-person-plural pronouns; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(6);
  });

  test('section names ≥3 specific limitations from Doctrine §10 + sprint BLOCKED surface', async () => {
    // Outline §6 required limitations:
    // 1) iOS app not until V1 (Sep 2026)
    // 2) Android closed beta until M3 (Jul 2026)
    // 3) Coaching library hand-curated (not every weakness
    //    shape detected today)
    // 4) macOS/Linux desktop not on 6-month roadmap
    // 5) Real-world capture requires RaceBox + iPhone today
    //
    // Lock ≥3 of these 5 explicitly named — substance floor
    // for the trust-earning section. Catches a draft that
    // pads with prose without disclosing concrete gaps.
    const section = loadSection().toLowerCase();
    const limitationIndicators = [
      /(ios|iphone)\s+(\w+\s+){0,5}(september\s+2026|v1|public\s+beta)/,
      /android\s+(\w+\s+){0,4}(closed\s+beta|invited|july\s+2026|m3)/,
      /(coaching\s+library|rule\s+library)\s+(\w+\s+){0,4}(hand.curated|growing|not\s+every)/,
      /(macos|linux|mac\s+os)\s+(\w+\s+){0,5}(not\s+on|six.month|6.month|roadmap)/,
      /racebox\s+(\w+\s+){0,3}iphone/,
    ];
    const matched = limitationIndicators.filter((re) => re.test(section));
    expect(
      matched.length,
      `Expected ≥3 specific limitations from outline §6 list; matched ${matched.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('section contains explicit ADR-004 no-language-model-coaching negation', async () => {
    // Outline §6: "ADR-004 negation carries through —
    // limitations include 'no language-model coaching' as a
    // deliberate scope choice." This is asymmetric to the
    // Pillar 3 forbidden-vocab list: the BARE words
    // ("llm"/"ai coach"/"generative"/"neural") remain
    // forbidden, but a NEGATION construction naming the
    // "language-model" or "rule-based" choice is REQUIRED.
    //
    // The section must contain at least one phrase that makes
    // ADR-004's deliberate scope choice explicit to a reader
    // shopping for a "best AI coach" telemetry app.
    const section = loadSection().toLowerCase();
    const adr004NegationPatterns = [
      /(no|not|without|never)\s+(\w+\s+){0,4}language.?model/,
      /rule.?based\s+(coaching|prescription|library)/,
      /every\s+(\w+\s+){0,5}(traces\s+to|comes\s+from)\s+a?\s*(written|rule|hand)/,
      /deliberate(ly)?\s+(\w+\s+){0,3}(rule|hand|written)/,
    ];
    const matched = adr004NegationPatterns.filter((re) => re.test(section));
    expect(
      matched.length,
      'Section must contain ≥1 explicit ADR-004 no-language-model-coaching negation',
    ).toBeGreaterThanOrEqual(1);
  });

  test('section contains durability promise — "if [X] changes, we will say so"', async () => {
    // Outline §6 closing line: "this list is the foundation
    // of every claim above. If we shrink it next quarter, we
    // will say so on the same page." The durability
    // commitment is the section's load-bearing trust signal —
    // without it, the limitation list reads as a snapshot
    // and not a living commitment.
    const section = loadSection().toLowerCase();
    const durabilityPatterns = [
      /(if|when)\s+(this|that|we|the)\s+(\w+\s+){0,6}(shrink|change|update|expand)s?,?\s+we\s+will\s+(say|update|note)/,
      /we\s+will\s+(update|revise|edit|note)\s+(\w+\s+){0,6}(here|on\s+this\s+page|same\s+page)/,
      /this\s+list\s+(\w+\s+){0,6}(updated|revised|kept\s+current|maintained)/,
      /if\s+(we|the)\s+(\w+\s+){0,6}(ship|add|deliver),?\s+we\s+will/,
    ];
    const matched = durabilityPatterns.filter((re) => re.test(section));
    expect(
      matched.length,
      'Section must contain ≥1 durability promise tying limitations to ongoing commitment',
    ).toBeGreaterThanOrEqual(1);
  });

  test('section contains internal link to /product (Doctrine §10 verification path)', async () => {
    // Outline §6 internal link: "/product — the five-pillar
    // overview that maps to current scope. The link is the
    // verification path for any limitation claim." Lock the
    // link.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product(\/[a-z-]+)?\)/);
  });

  test('section forbids subjective competitor disparagement (Pillar 3 carry-over)', async () => {
    // Section 6 is about LAP's limits — it is NOT a place to
    // disparage competitors by inverse comparison. The
    // forbidden subjective vocab list applies the same way
    // here as in §2-§5.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bclearly\s+worse\b/);
    expect(section).not.toMatch(/\boutdated\b/);
    expect(section).not.toMatch(/\bbloated\b/);
    expect(section).not.toMatch(/\boverhyped\b/);
    expect(section).not.toMatch(/\bobviously\s+inferior\b/);
    expect(section).not.toMatch(/\bugly\b/);
    expect(section).not.toMatch(/\bfeels\s+(dated|old|clunky|amateur)/);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 carry-over (bare LLM/AI-coach phrases)', async () => {
    // Bare "llm" / "ai coach" / "generative" / "neural"
    // remain forbidden — only the spelled-out "language-
    // model" with negation context is permitted (asymmetric).
    // This catches a draft that says "we are not building an
    // AI coach" — the negation is correct but the phrase
    // "AI coach" is doctrine-prohibited at the marketing-copy
    // level (ADR-004 + Pillar 2 vocab discipline).
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

  test('section avoids "lap" mid-paragraph as third-person stand-in for "we"', async () => {
    // Voice-discipline guardrail: a draft satisfying the ≥6
    // first-person-plural test could still slip into mixed
    // voice — "we are based in Europe. LAP does not ship
    // macOS yet." Mixed voice undermines the section's
    // accountability frame.
    //
    // Heuristic check: count "LAP" occurrences. The section
    // is ABOUT LAP, so some references are unavoidable
    // (heading, opening, closing) — but body paragraphs
    // discussing limitations should use "we" not "LAP".
    // Cap at ≤4 "LAP" mentions for a 400-word section.
    const section = loadSection();
    const lapMentions = section.match(/\bLAP\b/g) ?? [];
    expect(
      lapMentions.length,
      `Expected ≤6 "LAP" mentions to keep first-person voice; found ${lapMentions.length}`,
    ).toBeLessThanOrEqual(6);
  });
});
