// T159 — contract test for Pillar 3 FAQ + schema.org FAQPage
// markup. Same shape as T139's pillar-1-faq.test.ts and T149's
// pillar-2-faq.test.ts: single canonical source for both human-
// rendered Q&A surface AND FAQPage JSON-LD; tests enforce
// positional sync so a future Q&A edit cannot drift the schema
// out of sync with the visible content.
//
// Pillar 3 specifics: the comparison article fields the
// broadest shopping-question search universe of the four
// pillars, so the FAQ floor is 6 entries (vs Pillar 1+2's 5).
// Doctrine vocabulary discipline mirrors the body sections —
// no winner-declaration, no subjective competitor
// disparagement, no subjective pricing.

import { describe, expect, test } from 'vitest';
import { PILLAR_3_FAQS, pillar3FaqJsonLd } from '../data/pillar-3-faq';

const totalAnswerProse = (): string =>
  PILLAR_3_FAQS.map((f) => f.answer).join(' ').toLowerCase();

const wordCount = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

describe('T159: Pillar 3 FAQ data module', () => {
  test('exports a FAQs array with ≥6 entries', async () => {
    // Pillar 3 floor — 6 questions because the comparison
    // article's reader brings the broadest shopping-question
    // surface. Below 6 the FAQ reads as token padding instead
    // of genuine reader-question coverage.
    expect(Array.isArray(PILLAR_3_FAQS)).toBe(true);
    expect(PILLAR_3_FAQS.length).toBeGreaterThanOrEqual(6);
  });

  test('every FAQ has non-empty string question + answer', async () => {
    for (const faq of PILLAR_3_FAQS) {
      expect(typeof faq.question).toBe('string');
      expect(faq.question.trim().length).toBeGreaterThan(0);
      expect(typeof faq.answer).toBe('string');
      expect(faq.answer.trim().length).toBeGreaterThan(0);
    }
  });

  test('every question ends with a question mark', async () => {
    for (const faq of PILLAR_3_FAQS) {
      expect(
        faq.question.trim().endsWith('?'),
        `Question "${faq.question}" must end with '?'`,
      ).toBe(true);
    }
  });

  test('every answer is substantive (≥30 words)', async () => {
    for (const faq of PILLAR_3_FAQS) {
      const wc = wordCount(faq.answer);
      expect(
        wc,
        `Answer to "${faq.question}" should be ≥30 words (got ${wc})`,
      ).toBeGreaterThanOrEqual(30);
    }
  });

  test('FAQ answers cumulatively use the article keyword "telemetry app"', async () => {
    // Pillar 3's title keyword cluster is "best telemetry app"
    // / "telemetry app comparison". A FAQ that drifts to
    // generic "racing software" prose has lost the SEO head
    // term. Lock ≥3 occurrences so the long-tail search
    // intent stays anchored.
    const prose = totalAnswerProse();
    const matches = prose.match(/telemetry\s+app/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  test('FAQ answers cumulatively use shopping-by-persona vocabulary', async () => {
    // Doctrine continuity — the article's structural argument
    // is "no single best, shop by persona" (outline §5). The
    // FAQ should reach for the same vocabulary so the two
    // surfaces speak the same shopping question.
    const prose = totalAnswerProse();
    expect(prose).toMatch(/(persona|shortlist|fit|fits|depends\s+on\s+(your|which))/);
  });

  test('FAQ answers reference at least 3 of the 6 named apps', async () => {
    // The FAQ must engage with the comparison universe — if
    // every answer is LAP-only, the article fails its
    // shopping-comparison brief. Lock ≥3 named-app references
    // (cumulative across answers) so competitors get factual
    // air time.
    const prose = totalAnswerProse();
    const apps = ['lap', 'garage61', 'racelab', 'motec', 'track attack', 'stint'];
    const matched = apps.filter((app) => prose.includes(app));
    expect(
      matched.length,
      `Expected ≥3 named-app references; matched ${matched.length} (${matched.join(', ')})`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('FAQ answers respect ADR-004 + Pillar 2 + Pillar 3 forbidden vocabulary', async () => {
    // ADR-004 ban on coaching-AI overclaims; Pillar 2
    // extension (no magic/secret/trick/realistic); Pillar 3
    // extension (no clearly worse/outdated/bloated/overhyped/
    // obviously inferior; no expensive/cheap/pricey/affordable
    // for pricing).
    const prose = totalAnswerProse();
    expect(prose).not.toMatch(/\bai\s+coach\b/);
    expect(prose).not.toMatch(/\bllm\b/);
    expect(prose).not.toMatch(/\bgenerative\b/);
    expect(prose).not.toMatch(/\bneural\b/);
    expect(prose).not.toMatch(/\brealistic\b/);
    expect(prose).not.toMatch(/\bmagic\b/);
    expect(prose).not.toMatch(/\bsecret\b/);
    expect(prose).not.toMatch(/\btrick\b/);
    expect(prose).not.toMatch(/\bclearly\s+worse\b/);
    expect(prose).not.toMatch(/\boutdated\b/);
    expect(prose).not.toMatch(/\bbloated\b/);
    expect(prose).not.toMatch(/\boverhyped\b/);
    expect(prose).not.toMatch(/\bobviously\s+inferior\b/);
    expect(prose).not.toMatch(/\bexpensive\b/);
    expect(prose).not.toMatch(/\bcheap\b/);
    expect(prose).not.toMatch(/\bpricey\b/);
    expect(prose).not.toMatch(/\baffordable\b/);
  });

  test('FAQ answers avoid winner-declaration framing', async () => {
    // Outline §1 forbids declaring a single best app in body
    // copy. FAQ answers are body copy at long-tail-search
    // depth — the temptation to short-circuit a "what is the
    // best telemetry app?" question with "X is the best" is
    // exactly what the article's structure rejects.
    const prose = totalAnswerProse();
    expect(prose).not.toMatch(/\bthe\s+best\s+(telemetry\s+)?app\s+(is|for\s+everyone)\b/);
    expect(prose).not.toMatch(/\bbest\s+(telemetry\s+)?app\s+overall\b/);
    expect(prose).not.toMatch(/\boverall\s+winner\b/);
    expect(prose).not.toMatch(/\bclearly\s+the\s+best\b/);
  });
});

describe('T159: Pillar 3 FAQ schema.org JSON-LD', () => {
  test('JSON-LD has the FAQPage shape Google expects', async () => {
    const ld = pillar3FaqJsonLd();
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('FAQPage');
    expect(Array.isArray(ld.mainEntity)).toBe(true);
  });

  test('JSON-LD mainEntity length matches FAQs length (cross-sync)', async () => {
    const ld = pillar3FaqJsonLd();
    expect(ld.mainEntity.length).toBe(PILLAR_3_FAQS.length);
  });

  test('every mainEntity entry has the Question + Answer shape', async () => {
    const ld = pillar3FaqJsonLd();
    for (const entry of ld.mainEntity) {
      expect(entry['@type']).toBe('Question');
      expect(typeof entry.name).toBe('string');
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.acceptedAnswer['@type']).toBe('Answer');
      expect(typeof entry.acceptedAnswer.text).toBe('string');
      expect(entry.acceptedAnswer.text.length).toBeGreaterThan(0);
    }
  });

  test('mainEntity preserves the FAQs array order (positional sync)', async () => {
    const ld = pillar3FaqJsonLd();
    for (let i = 0; i < PILLAR_3_FAQS.length; i++) {
      expect(ld.mainEntity[i].name).toBe(PILLAR_3_FAQS[i].question);
      expect(ld.mainEntity[i].acceptedAnswer.text).toBe(PILLAR_3_FAQS[i].answer);
    }
  });

  test('JSON-LD is JSON-serializable (script-tag inline-able)', async () => {
    const ld = pillar3FaqJsonLd();
    expect(() => JSON.stringify(ld)).not.toThrow();
    const serialized = JSON.stringify(ld);
    expect(serialized).toContain('FAQPage');
    expect(serialized.length).toBeGreaterThan(0);
  });
});
