// T188 — contract test for the Batch 2 FAQ data module +
// per-post FAQPage JSON-LD factory. Same canonical-source +
// per-post filter pattern as T178 (Batch 1 FAQ); the
// divergence is editorial:
//
//   * Batch 2 covers founder/product-story topics
//     (positioning, doctrine, scope, transparency) rather
//     than technique deep-dives. FAQ prose has to argue
//     positioning honestly without sliding into competitor
//     disparagement.
//   * ADR-004 is ASYMMETRIC for Batch 2 FAQ corpus, same
//     logic as T181/T185: the FAQ corpus needs ≥1 entry
//     addressing the language-model question to back the
//     positioning argument; bare "llm" / "ai coach" /
//     "generative" / "neural" still banned.
//   * Doctrine vocabulary is locked cumulatively (≥3 of
//     the doctrine anchor terms) since Batch 2 FAQ
//     answers should ground in doctrine vocabulary, not
//     in opinion-shaped marketing copy.

import { describe, expect, test } from 'vitest';
import {
  BATCH_2_FAQS,
  batch2PostFaqJsonLd,
  type Batch2PostSlug,
} from '../data/blog-batch-2-faq';

const ALL_SLUGS: ReadonlyArray<Batch2PostSlug> = [
  'why-im-building-lap-not-motec-clone',
  'sim-to-real-gap-honest-look',
  'designing-coaching-drivers-follow',
  'pre-launch-month-in-numbers',
  'what-were-not-building',
];

const totalAnswerProse = (): string =>
  BATCH_2_FAQS.map((f) => f.answer).join(' ').toLowerCase();

const wordCount = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

describe('T188: Batch 2 FAQ data module', () => {
  test('exports BATCH_2_FAQS array with ≥12 entries', () => {
    // Floor — 12 questions for 5 posts gives each post the
    // headroom to ship ≥3 topic-relevant FAQs without forcing
    // every FAQ to span multiple posts.
    expect(Array.isArray(BATCH_2_FAQS)).toBe(true);
    expect(BATCH_2_FAQS.length).toBeGreaterThanOrEqual(12);
  });

  test('every FAQ has non-empty question + answer', () => {
    for (const faq of BATCH_2_FAQS) {
      expect(typeof faq.question).toBe('string');
      expect(faq.question.trim().length).toBeGreaterThan(0);
      expect(typeof faq.answer).toBe('string');
      expect(faq.answer.trim().length).toBeGreaterThan(0);
    }
  });

  test('every question ends with a question mark', () => {
    for (const faq of BATCH_2_FAQS) {
      expect(
        faq.question.trim().endsWith('?'),
        `Question "${faq.question}" must end with '?'`,
      ).toBe(true);
    }
  });

  test('every answer is substantive (≥30 words)', () => {
    for (const faq of BATCH_2_FAQS) {
      const wc = wordCount(faq.answer);
      expect(
        wc,
        `Answer to "${faq.question}" should be ≥30 words (got ${wc})`,
      ).toBeGreaterThanOrEqual(30);
    }
  });

  test('every FAQ has ≥1 post tag, all valid Batch 2 slugs', () => {
    for (const faq of BATCH_2_FAQS) {
      expect(Array.isArray(faq.posts)).toBe(true);
      expect(
        faq.posts.length,
        `FAQ "${faq.question}" must tag ≥1 post`,
      ).toBeGreaterThanOrEqual(1);
      for (const post of faq.posts) {
        expect(
          ALL_SLUGS,
          `FAQ "${faq.question}" tags invalid slug "${post}"`,
        ).toContain(post);
      }
    }
  });

  test('each of the 5 Batch 2 posts has ≥3 FAQs targeting it', () => {
    for (const slug of ALL_SLUGS) {
      const tagged = BATCH_2_FAQS.filter((f) => f.posts.includes(slug));
      expect(
        tagged.length,
        `Post "${slug}" should have ≥3 tagged FAQs; found ${tagged.length}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  test('FAQ corpus addresses the language-model question (≥1 spelled-out reference for ADR-004 negation)', () => {
    // Same asymmetry as T181/T185: the corpus needs to make
    // the language-model negation argument explicit
    // somewhere, since the positioning posts depend on it.
    // Bare "llm" stays banned (per the strict block below);
    // the spelled-out form is the editorial form that lets
    // the FAQ make the argument cleanly.
    const prose = totalAnswerProse();
    expect(
      prose,
      'Batch 2 FAQ corpus must include ≥1 spelled-out "language-model" reference',
    ).toMatch(/\blanguage[-\s]model/);
  });

  test('FAQ answers respect ADR-004 (asymmetric: bare "llm"/"ai coach"/"generative"/"neural" banned; "language-model" allowed)', () => {
    const prose = totalAnswerProse();
    expect(prose).not.toMatch(/\bai\s+coach\b/);
    expect(prose).not.toMatch(/\bllm\b/);
    expect(prose).not.toMatch(/\bgenerative\b/);
    expect(prose).not.toMatch(/\bneural\b/);
    expect(prose).not.toMatch(/\brealistic\b/);
  });

  test('FAQ answers respect Pillar 2/3/4 forbidden vocabulary', () => {
    const prose = totalAnswerProse();
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
    // Pillar 4 carry-over
    expect(prose).not.toMatch(/\bguru\b/);
    expect(prose).not.toMatch(/\bsecret\s+formula\b/);
    expect(prose).not.toMatch(/\bshortcut\b/);
    expect(prose).not.toMatch(/\bovernight\b/);
    expect(prose).not.toMatch(/\bhack\b/);
    expect(prose).not.toMatch(/\bsystem\s+that\s+guarantees\b/);
  });

  test('FAQ answers respect blog-post-layer overclaim guardrail', () => {
    const prose = totalAnswerProse();
    expect(prose).not.toMatch(/\bguaranteed?\s+(faster|improvement|results?|pace)\b/);
    expect(prose).not.toMatch(/\binstantly\s+(faster|improve|fix)\b/);
    expect(prose).not.toMatch(/\bwhat\s+pros\s+(do|use|know)\b/);
    expect(prose).not.toMatch(/\bone\s+weird\s+/);
    expect(prose).not.toMatch(/\bunlock\s+your\s+(true\s+)?potential\b/);
  });

  test('FAQ answers cumulative filler-word budget (≤8)', () => {
    const prose = totalAnswerProse();
    const fillers = ['actually', 'really', 'very', 'basically', 'essentially'];
    let fillerCount = 0;
    for (const filler of fillers) {
      const matches = prose.match(new RegExp(`\\b${filler}\\b`, 'g')) ?? [];
      fillerCount += matches.length;
    }
    expect(
      fillerCount,
      `FAQ filler-word count was ${fillerCount} (cap: 8)`,
    ).toBeLessThanOrEqual(8);
  });

  test('FAQ answers cumulatively reference doctrine vocabulary (≥3 of: persona, rule library, hand-curated, scope, deliberate, prescription, loop)', () => {
    // Batch 2 is doctrine-anchored. Locking ≥3 of the
    // doctrine vocabulary terms across the FAQ corpus
    // ensures the answers ground in the framework rather
    // than in opinion-shaped marketing copy.
    const prose = totalAnswerProse();
    const anchors = [
      /\bpersona/,
      /\brule\s+library\b/,
      /\bhand[-\s]curated\b/,
      /\bscope\b/,
      /\bdeliberate\b/,
      /\bprescription/,
      /\bloop\b/,
    ];
    const matched = anchors.filter((re) => re.test(prose)).length;
    expect(
      matched,
      `Expected ≥3 doctrine anchors across FAQ answers; matched ${matched}`,
    ).toBeGreaterThanOrEqual(3);
  });
});

describe('T188: Batch 2 FAQ schema.org JSON-LD per-post factory', () => {
  test('factory accepts each of the 5 Batch 2 slugs without throwing', () => {
    for (const slug of ALL_SLUGS) {
      expect(() => batch2PostFaqJsonLd(slug)).not.toThrow();
    }
  });

  test('every per-post JSON-LD has the FAQPage shape Google expects', () => {
    for (const slug of ALL_SLUGS) {
      const ld = batch2PostFaqJsonLd(slug);
      expect(ld['@context']).toBe('https://schema.org');
      expect(ld['@type']).toBe('FAQPage');
      expect(Array.isArray(ld.mainEntity)).toBe(true);
    }
  });

  test('every per-post JSON-LD has ≥3 mainEntity entries (matches per-post FAQ floor)', () => {
    for (const slug of ALL_SLUGS) {
      const ld = batch2PostFaqJsonLd(slug);
      expect(
        ld.mainEntity.length,
        `JSON-LD for "${slug}" should have ≥3 entries; got ${ld.mainEntity.length}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  test('every mainEntity entry has the Question + Answer shape', () => {
    for (const slug of ALL_SLUGS) {
      const ld = batch2PostFaqJsonLd(slug);
      for (const entry of ld.mainEntity) {
        expect(entry['@type']).toBe('Question');
        expect(typeof entry.name).toBe('string');
        expect(entry.name.length).toBeGreaterThan(0);
        expect(entry.acceptedAnswer['@type']).toBe('Answer');
        expect(typeof entry.acceptedAnswer.text).toBe('string');
        expect(entry.acceptedAnswer.text.length).toBeGreaterThan(0);
      }
    }
  });

  test('per-post filter only includes FAQs tagged for that slug', () => {
    for (const slug of ALL_SLUGS) {
      const ld = batch2PostFaqJsonLd(slug);
      const taggedQuestions = new Set(
        BATCH_2_FAQS.filter((f) => f.posts.includes(slug)).map(
          (f) => f.question,
        ),
      );
      for (const entry of ld.mainEntity) {
        expect(
          taggedQuestions,
          `JSON-LD for "${slug}" includes untagged question "${entry.name}"`,
        ).toContain(entry.name);
      }
    }
  });

  test('JSON-LD is JSON-serializable for every post (script-tag inline-able)', () => {
    for (const slug of ALL_SLUGS) {
      const ld = batch2PostFaqJsonLd(slug);
      expect(() => JSON.stringify(ld)).not.toThrow();
      const serialized = JSON.stringify(ld);
      expect(serialized).toContain('FAQPage');
      expect(serialized.length).toBeGreaterThan(0);
    }
  });
});
