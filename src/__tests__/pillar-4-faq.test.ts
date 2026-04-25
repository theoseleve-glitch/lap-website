// T169 — contract test for Pillar 4 FAQ + schema.org FAQPage
// markup. Same shape as T139 / T149 / T159: single canonical
// source for both the human-rendered Q&A surface AND the
// FAQPage JSON-LD; tests enforce positional sync so a future
// Q&A edit cannot drift the schema out of sync with the visible
// content.
//
// Pillar 4 specifics: the article ("How to Build a Driver
// Development Plan") closes the four-pillar cluster. Its FAQ
// surface fields long-tail action-oriented queries from the
// outline keyword cluster — "how do I structure my sim racing
// practice?", "should I review my telemetry every session?",
// etc. The framework's five verbs (diagnose, prescribe, execute,
// measure, adapt) are the article's structural vocabulary; the
// FAQ inherits them.
//
// T169 also performs the type-extraction refactor mandated by
// outline § "FAQ data + schema" (lines 472–481): with three
// consumers now sharing the Faq + FaqPageJsonLd types
// (Pillars 2/3/4), they move to a dedicated `src/data/faq.ts`
// module. This test file is the third consumer — it imports the
// VALUES from `pillar-4-faq.ts`, not the types, so the refactor
// does not change the test surface.

import { describe, expect, test } from 'vitest';
import { PILLAR_4_FAQS, pillar4FaqJsonLd } from '../data/pillar-4-faq';

const totalAnswerProse = (): string =>
  PILLAR_4_FAQS.map((f) => f.answer).join(' ').toLowerCase();

const wordCount = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

describe('T169: Pillar 4 FAQ data module', () => {
  test('exports a FAQs array with ≥6 entries', async () => {
    // Pillar 4 floor — 6 questions. The outline's question-form
    // long-tail cluster lists 5 candidates plus several head-term
    // variants; below 6 the FAQ does not cover the search surface
    // a "how do I build a development plan" reader is bringing.
    expect(Array.isArray(PILLAR_4_FAQS)).toBe(true);
    expect(PILLAR_4_FAQS.length).toBeGreaterThanOrEqual(6);
  });

  test('every FAQ has non-empty string question + answer', async () => {
    for (const faq of PILLAR_4_FAQS) {
      expect(typeof faq.question).toBe('string');
      expect(faq.question.trim().length).toBeGreaterThan(0);
      expect(typeof faq.answer).toBe('string');
      expect(faq.answer.trim().length).toBeGreaterThan(0);
    }
  });

  test('every question ends with a question mark', async () => {
    for (const faq of PILLAR_4_FAQS) {
      expect(
        faq.question.trim().endsWith('?'),
        `Question "${faq.question}" must end with '?'`,
      ).toBe(true);
    }
  });

  test('every answer is substantive (≥30 words)', async () => {
    for (const faq of PILLAR_4_FAQS) {
      const wc = wordCount(faq.answer);
      expect(
        wc,
        `Answer to "${faq.question}" should be ≥30 words (got ${wc})`,
      ).toBeGreaterThanOrEqual(30);
    }
  });

  test('FAQ answers cumulatively use the article keyword "development plan"', async () => {
    // Pillar 4's title keyword cluster is "driver development
    // plan" / "development plan". A FAQ that drifts to generic
    // "training routine" prose has lost the SEO head term and
    // the doctrine anchor. Lock ≥3 occurrences cumulatively.
    const prose = totalAnswerProse();
    const matches = prose.match(/development\s+plan/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  test('FAQ answers cumulatively use all five framework verbs', async () => {
    // Doctrine continuity. The article's structural commitment
    // is the five-verb framework — diagnose, prescribe, execute,
    // measure, adapt. Each verb must appear at least once across
    // the FAQ prose so the FAQ surface and the body sections
    // speak the same vocabulary. Synonyms ("identify" / "fix" /
    // "test") drift the framework out of doctrine.
    const prose = totalAnswerProse();
    expect(prose, 'FAQ should reference the diagnose verb').toMatch(/\bdiagnos/);
    expect(prose, 'FAQ should reference the prescribe verb').toMatch(/\bprescrib/);
    expect(prose, 'FAQ should reference the execute verb').toMatch(/\bexecut/);
    expect(prose, 'FAQ should reference the measure verb').toMatch(/\bmeasur/);
    expect(prose, 'FAQ should reference the adapt verb').toMatch(/\badapt/);
  });

  test('FAQ answers reference at least 3 framework concepts (cadences/anchors)', async () => {
    // The article's framework anchors beyond the verbs themselves:
    // three cadences (per-session / weekly / event-cycle), and
    // the structural concepts (weakness shape, success criterion,
    // coaching library, drill, rule library). The FAQ should
    // engage with at least three of these — without them the
    // answers read as generic practice advice rather than as
    // continuations of the article's framework argument.
    const prose = totalAnswerProse();
    const concepts = [
      'per-session',
      'weekly',
      'event-cycle',
      'weakness shape',
      'success criterion',
      'coaching library',
      'rule library',
      'drill',
    ];
    const matched = concepts.filter((c) => prose.includes(c));
    expect(
      matched.length,
      `Expected ≥3 framework-concept references; matched ${matched.length} (${matched.join(', ')})`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('FAQ answers respect ADR-004 + Pillar 2 + Pillar 3 + Pillar 4 forbidden vocabulary', async () => {
    // ADR-004 ban on coaching-AI overclaims; Pillar 2 carry-over
    // (no magic / secret / trick / realistic); Pillar 3 carry-
    // over (no clearly worse / outdated / bloated / overhyped /
    // obviously inferior; no expensive / cheap / pricey /
    // affordable for pricing); Pillar 4 extension (no guru /
    // secret formula / shortcut / overnight / hack / system that
    // guarantees) — development plans are sustained loops, not
    // marketing shortcuts.
    const prose = totalAnswerProse();
    // ADR-004
    expect(prose).not.toMatch(/\bai\s+coach\b/);
    expect(prose).not.toMatch(/\bllm\b/);
    expect(prose).not.toMatch(/\bgenerative\b/);
    expect(prose).not.toMatch(/\bneural\b/);
    expect(prose).not.toMatch(/\brealistic\b/);
    // Pillar 2 carry-over
    expect(prose).not.toMatch(/\bmagic\b/);
    expect(prose).not.toMatch(/\bsecret\b/);
    expect(prose).not.toMatch(/\btrick\b/);
    // Pillar 3 carry-over
    expect(prose).not.toMatch(/\bclearly\s+worse\b/);
    expect(prose).not.toMatch(/\boutdated\b/);
    expect(prose).not.toMatch(/\bbloated\b/);
    expect(prose).not.toMatch(/\boverhyped\b/);
    expect(prose).not.toMatch(/\bobviously\s+inferior\b/);
    expect(prose).not.toMatch(/\bexpensive\b/);
    expect(prose).not.toMatch(/\bcheap\b/);
    expect(prose).not.toMatch(/\bpricey\b/);
    expect(prose).not.toMatch(/\baffordable\b/);
    // Pillar 4 extension
    expect(prose).not.toMatch(/\bguru\b/);
    expect(prose).not.toMatch(/\bsecret\s+formula\b/);
    expect(prose).not.toMatch(/\bshortcut\b/);
    expect(prose).not.toMatch(/\bovernight\b/);
    expect(prose).not.toMatch(/\bhack\b/);
    expect(prose).not.toMatch(/\bsystem\s+that\s+guarantees\b/);
  });

  test('FAQ answers avoid timeline-promise marketing framing', async () => {
    // The Pillar 4 outline forbids "transform your driving in N
    // days" framing. A FAQ that answers "how long until I see
    // results?" with a fixed timeline ("transform in 30 days",
    // "guaranteed improvement in 6 weeks") is exactly what the
    // article's structural argument rejects — the framework is a
    // sustained loop, not a packaged program.
    const prose = totalAnswerProse();
    expect(prose).not.toMatch(/\btransform\s+your\s+driving\s+in\s+\d+/);
    expect(prose).not.toMatch(/\bguaranteed?\s+(improvement|results?|progress)\b/);
    expect(prose).not.toMatch(/\bin\s+just\s+\d+\s+(days?|weeks?)\b/);
  });
});

describe('T169: Pillar 4 FAQ schema.org JSON-LD', () => {
  test('JSON-LD has the FAQPage shape Google expects', async () => {
    const ld = pillar4FaqJsonLd();
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('FAQPage');
    expect(Array.isArray(ld.mainEntity)).toBe(true);
  });

  test('JSON-LD mainEntity length matches FAQs length (cross-sync)', async () => {
    const ld = pillar4FaqJsonLd();
    expect(ld.mainEntity.length).toBe(PILLAR_4_FAQS.length);
  });

  test('every mainEntity entry has the Question + Answer shape', async () => {
    const ld = pillar4FaqJsonLd();
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
    const ld = pillar4FaqJsonLd();
    for (let i = 0; i < PILLAR_4_FAQS.length; i++) {
      expect(ld.mainEntity[i].name).toBe(PILLAR_4_FAQS[i].question);
      expect(ld.mainEntity[i].acceptedAnswer.text).toBe(PILLAR_4_FAQS[i].answer);
    }
  });

  test('JSON-LD is JSON-serializable (script-tag inline-able)', async () => {
    const ld = pillar4FaqJsonLd();
    expect(() => JSON.stringify(ld)).not.toThrow();
    const serialized = JSON.stringify(ld);
    expect(serialized).toContain('FAQPage');
    expect(serialized.length).toBeGreaterThan(0);
  });
});
