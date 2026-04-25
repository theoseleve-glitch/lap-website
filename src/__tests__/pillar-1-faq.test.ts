// T139 — contract test for Pillar 1 FAQ + schema.org FAQPage
// markup. The article ("Sim to Real-Life Racing Transfer") needs
// a FAQ section that (a) reads as substantive answers to actual
// reader questions and (b) emits a schema.org FAQPage JSON-LD
// payload eligible for Google's FAQ rich snippets.
//
// The deliverable is a single TypeScript data module
// (src/data/pillar-1-faq.ts). This test treats that module as
// the canonical source — markdown rendering AND JSON-LD emission
// both derive from the same array, so a future Q&A edit cannot
// drift the schema out of sync with the visible content.

import { describe, expect, test } from 'vitest';
import {
  PILLAR_1_FAQS,
  pillar1FaqJsonLd,
} from '../data/pillar-1-faq';

const totalAnswerProse = (): string =>
  PILLAR_1_FAQS.map((f) => f.answer).join(' ').toLowerCase();

const wordCount = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

describe('T139: Pillar 1 FAQ data module', () => {
  test('exports a FAQs array with ≥5 entries', async () => {
    // Floor — 5 questions is the minimum for a credible FAQ.
    // Below that, the section reads as token padding rather than
    // genuine reader-question coverage. Google FAQ rich snippets
    // also reward depth.
    expect(Array.isArray(PILLAR_1_FAQS)).toBe(true);
    expect(PILLAR_1_FAQS.length).toBeGreaterThanOrEqual(5);
  });

  test('every FAQ has non-empty string question + answer', async () => {
    // Catches a future edit that introduces empty/null fields,
    // which would render as broken accordion entries and emit
    // invalid JSON-LD.
    for (const faq of PILLAR_1_FAQS) {
      expect(typeof faq.question).toBe('string');
      expect(faq.question.trim().length).toBeGreaterThan(0);
      expect(typeof faq.answer).toBe('string');
      expect(faq.answer.trim().length).toBeGreaterThan(0);
    }
  });

  test('every question ends with a question mark', async () => {
    // FAQ format discipline. A "question" that's actually a
    // statement ("Things to know about sim racing") is a
    // marketing antipattern, not a FAQ. Google's FAQPage
    // structured-data guidance also expects questions to read as
    // questions.
    for (const faq of PILLAR_1_FAQS) {
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
    for (const faq of PILLAR_1_FAQS) {
      const wc = wordCount(faq.answer);
      expect(
        wc,
        `Answer to "${faq.question}" should be ≥30 words (got ${wc})`,
      ).toBeGreaterThanOrEqual(30);
    }
  });

  test('FAQ answers cumulatively use doctrine vocabulary', async () => {
    // The article's framework (shape vs intensity, transfer)
    // must reach the FAQ. A FAQ that drifts to generic
    // "sim vs real" prose is no longer doctrine-aligned and
    // breaks the article's editorial coherence.
    const prose = totalAnswerProse();
    expect(prose).toMatch(/\btransfer/);
    expect(prose).toMatch(/\b(shape|intensity)/);
  });

  test('FAQ answers respect ADR-004 forbidden vocabulary', async () => {
    // Same lock as the body sections — FAQ is part of the
    // article's public surface and inherits the ADR-004 ban
    // (no AI-coach-now / LLM / generative / "realistic"
    // overclaim).
    const prose = totalAnswerProse();
    expect(prose).not.toMatch(/\bai coach\b/);
    expect(prose).not.toMatch(/\bllm\b/);
    expect(prose).not.toMatch(/\bgenerative\b/);
    expect(prose).not.toMatch(/\brealistic\b/);
  });
});

describe('T139: Pillar 1 FAQ schema.org JSON-LD', () => {
  test('JSON-LD has the FAQPage shape Google expects', async () => {
    // schema.org/FAQPage requires @context, @type, and a
    // mainEntity array of Question entries. Locks the top-level
    // shape so a future refactor can't quietly drop a required
    // field and break rich-snippet eligibility.
    const ld = pillar1FaqJsonLd();
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('FAQPage');
    expect(Array.isArray(ld.mainEntity)).toBe(true);
  });

  test('JSON-LD mainEntity length matches FAQs length (cross-sync)', async () => {
    // The whole point of deriving JSON-LD from the FAQs array:
    // markdown rendering and structured data stay in lockstep.
    // A future addition of a Q&A pair must surface in both;
    // this test catches drift if the factory is rewritten.
    const ld = pillar1FaqJsonLd();
    expect(ld.mainEntity.length).toBe(PILLAR_1_FAQS.length);
  });

  test('every mainEntity entry has the Question + Answer shape', async () => {
    // schema.org/Question requires `name` (the question text)
    // and `acceptedAnswer` (an Answer entity with `text`).
    // Locking entry shape ensures Google's structured-data
    // validator passes.
    const ld = pillar1FaqJsonLd();
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
    // rich-snippet rendering and for editorial intent (the
    // most common reader question goes first).
    const ld = pillar1FaqJsonLd();
    for (let i = 0; i < PILLAR_1_FAQS.length; i++) {
      expect(ld.mainEntity[i].name).toBe(PILLAR_1_FAQS[i].question);
      expect(ld.mainEntity[i].acceptedAnswer.text).toBe(PILLAR_1_FAQS[i].answer);
    }
  });

  test('JSON-LD is JSON-serializable (script-tag inline-able)', async () => {
    // BaseLayout emits JSON-LD via JSON.stringify into an
    // inline <script type="application/ld+json"> tag. Anything
    // not serializable (functions, undefined, circular refs)
    // would throw at render time. Lock that the factory output
    // can always be inlined.
    const ld = pillar1FaqJsonLd();
    expect(() => JSON.stringify(ld)).not.toThrow();
    const serialized = JSON.stringify(ld);
    expect(serialized).toContain('FAQPage');
    expect(serialized.length).toBeGreaterThan(0);
  });
});
