// T149 — contract test for Pillar 2 FAQ + schema.org FAQPage
// markup. Same shape as T139's pillar-1-faq.test.ts: single
// canonical source for both human-rendered Q&A surface AND
// FAQPage JSON-LD; tests enforce that the structured data
// derives correctly from the FAQ array (positional sync) so a
// future Q&A edit cannot drift the schema out of sync with the
// visible content.

import { describe, expect, test } from 'vitest';
import { PILLAR_2_FAQS, pillar2FaqJsonLd } from '../data/pillar-2-faq';

const totalAnswerProse = (): string =>
  PILLAR_2_FAQS.map((f) => f.answer).join(' ').toLowerCase();

const wordCount = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

describe('T149: Pillar 2 FAQ data module', () => {
  test('exports a FAQs array with ≥5 entries', async () => {
    // Floor — 5 questions is the minimum for a credible FAQ.
    // Below that, the section reads as token padding rather
    // than genuine reader-question coverage. Google FAQ rich
    // snippets also reward depth.
    expect(Array.isArray(PILLAR_2_FAQS)).toBe(true);
    expect(PILLAR_2_FAQS.length).toBeGreaterThanOrEqual(5);
  });

  test('every FAQ has non-empty string question + answer', async () => {
    for (const faq of PILLAR_2_FAQS) {
      expect(typeof faq.question).toBe('string');
      expect(faq.question.trim().length).toBeGreaterThan(0);
      expect(typeof faq.answer).toBe('string');
      expect(faq.answer.trim().length).toBeGreaterThan(0);
    }
  });

  test('every question ends with a question mark', async () => {
    // FAQ format discipline. A "question" that's actually a
    // statement is a marketing antipattern, not a FAQ. Google's
    // FAQPage structured-data guidance also expects questions to
    // read as questions.
    for (const faq of PILLAR_2_FAQS) {
      expect(
        faq.question.trim().endsWith('?'),
        `Question "${faq.question}" must end with '?'`,
      ).toBe(true);
    }
  });

  test('every answer is substantive (≥30 words)', async () => {
    // Defends against placeholder one-liners. A 30-word floor
    // forces real explanatory prose — long enough to land a
    // doctrine-aligned answer, short enough that ten of them
    // don't bloat the page.
    for (const faq of PILLAR_2_FAQS) {
      const wc = wordCount(faq.answer);
      expect(
        wc,
        `Answer to "${faq.question}" should be ≥30 words (got ${wc})`,
      ).toBeGreaterThanOrEqual(30);
    }
  });

  test('FAQ answers cumulatively use article title verb "trail brak"', async () => {
    // Pillar 2's article title verb. A FAQ that drifts to
    // generic "braking technique" prose has lost the SEO head
    // term and the doctrine anchor.
    const prose = totalAnswerProse();
    const matches = prose.match(/trail\s*brak/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  test('FAQ answers cumulatively use shape-vs-intensity vocabulary', async () => {
    // Pillar 1 framework continuity — the FAQ should reach for
    // the same doctrine vocabulary as the body sections so the
    // two surfaces speak the same language.
    const prose = totalAnswerProse();
    expect(prose).toMatch(/\b(shape|transfer)/);
  });

  test('FAQ answers respect ADR-004 + Pillar 2 forbidden vocabulary', async () => {
    // ADR-004 ban on coaching-AI overclaims plus Pillar 2
    // outline extensions (no "magic"/"secret"/"trick"/"realistic"
    // — the article's whole pitch is that trail braking is a
    // learnable technique with explainable physics, not a trick).
    const prose = totalAnswerProse();
    expect(prose).not.toMatch(/\bai coach\b/);
    expect(prose).not.toMatch(/\bllm\b/);
    expect(prose).not.toMatch(/\bgenerative\b/);
    expect(prose).not.toMatch(/\brealistic\b/);
    expect(prose).not.toMatch(/\bmagic\b/);
    expect(prose).not.toMatch(/\bsecret\b/);
    expect(prose).not.toMatch(/\btrick\b/);
  });
});

describe('T149: Pillar 2 FAQ schema.org JSON-LD', () => {
  test('JSON-LD has the FAQPage shape Google expects', async () => {
    const ld = pillar2FaqJsonLd();
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('FAQPage');
    expect(Array.isArray(ld.mainEntity)).toBe(true);
  });

  test('JSON-LD mainEntity length matches FAQs length (cross-sync)', async () => {
    // The whole point of deriving JSON-LD from the FAQs array:
    // markdown rendering and structured data stay in lockstep.
    const ld = pillar2FaqJsonLd();
    expect(ld.mainEntity.length).toBe(PILLAR_2_FAQS.length);
  });

  test('every mainEntity entry has the Question + Answer shape', async () => {
    const ld = pillar2FaqJsonLd();
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
    // First question in the data array should be the first
    // entry in the JSON-LD. Order matters for Google's
    // rich-snippet rendering and for editorial intent.
    const ld = pillar2FaqJsonLd();
    for (let i = 0; i < PILLAR_2_FAQS.length; i++) {
      expect(ld.mainEntity[i].name).toBe(PILLAR_2_FAQS[i].question);
      expect(ld.mainEntity[i].acceptedAnswer.text).toBe(PILLAR_2_FAQS[i].answer);
    }
  });

  test('JSON-LD is JSON-serializable (script-tag inline-able)', async () => {
    const ld = pillar2FaqJsonLd();
    expect(() => JSON.stringify(ld)).not.toThrow();
    const serialized = JSON.stringify(ld);
    expect(serialized).toContain('FAQPage');
    expect(serialized.length).toBeGreaterThan(0);
  });
});
