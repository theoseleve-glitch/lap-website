// T178 — contract test for the Batch 1 FAQ data module +
// per-post FAQPage JSON-LD factory. Single canonical source
// pattern, same as Pillar FAQ modules (T139/T149/T159/T169);
// the divergence is that one Batch 1 FAQ data module serves
// all 5 published posts (T179) — each post emits its own
// topic-filtered FAQPage JSON-LD via the factory rather than
// every post emitting an identical full-batch FAQPage.
//
// Why per-post filtering matters: emitting an identical
// FAQPage on 5 different URLs is a Google duplicate-content
// signal that can suppress rich-snippet eligibility. The
// factory takes a post slug, filters FAQs by the `posts` tag
// array, and returns a JSON-LD payload specific to that
// post's topic.

import { describe, expect, test } from 'vitest';
import {
  BATCH_1_FAQS,
  batchPostFaqJsonLd,
  type BatchPostSlug,
} from '../data/blog-batch-1-faq';

const ALL_SLUGS: ReadonlyArray<BatchPostSlug> = [
  'late-braking-at-t1',
  'throttle-pickup-smooth-vs-aggressive',
  'apex-speed-corner-commitment',
  'consistency-over-raw-pace',
  'tire-management-endurance',
];

const totalAnswerProse = (): string =>
  BATCH_1_FAQS.map((f) => f.answer).join(' ').toLowerCase();

const wordCount = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

describe('T178: Batch 1 FAQ data module', () => {
  test('exports BATCH_1_FAQS array with ≥12 entries', async () => {
    // Floor — 12 questions for 5 posts gives each post the
    // headroom to ship ≥3 topic-relevant FAQs without forcing
    // every FAQ to span multiple posts. Below 12 the per-post
    // FAQPage subsets become too thin for rich-snippet
    // eligibility.
    expect(Array.isArray(BATCH_1_FAQS)).toBe(true);
    expect(BATCH_1_FAQS.length).toBeGreaterThanOrEqual(12);
  });

  test('every FAQ has non-empty string question + answer', async () => {
    for (const faq of BATCH_1_FAQS) {
      expect(typeof faq.question).toBe('string');
      expect(faq.question.trim().length).toBeGreaterThan(0);
      expect(typeof faq.answer).toBe('string');
      expect(faq.answer.trim().length).toBeGreaterThan(0);
    }
  });

  test('every question ends with a question mark', async () => {
    for (const faq of BATCH_1_FAQS) {
      expect(
        faq.question.trim().endsWith('?'),
        `Question "${faq.question}" must end with '?'`,
      ).toBe(true);
    }
  });

  test('every answer is substantive (≥30 words)', async () => {
    for (const faq of BATCH_1_FAQS) {
      const wc = wordCount(faq.answer);
      expect(
        wc,
        `Answer to "${faq.question}" should be ≥30 words (got ${wc})`,
      ).toBeGreaterThanOrEqual(30);
    }
  });

  test('every FAQ has ≥1 post tag, all valid Batch 1 slugs', async () => {
    // The post-tag mechanism is the linchpin of per-post
    // FAQPage filtering. An FAQ with zero tags is unreachable
    // from any publish page; an FAQ with an invalid slug tag
    // would crash the publish-page render.
    for (const faq of BATCH_1_FAQS) {
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

  test('each of the 5 Batch 1 posts has ≥3 FAQs targeting it', async () => {
    // Per-post FAQPage JSON-LD floor. Below 3 entries the
    // FAQPage rich-snippet eligibility weakens; below 3 also
    // suggests the FAQ data is failing to cover that post's
    // topic surface adequately.
    for (const slug of ALL_SLUGS) {
      const tagged = BATCH_1_FAQS.filter((f) => f.posts.includes(slug));
      expect(
        tagged.length,
        `Post "${slug}" should have ≥3 tagged FAQs; found ${tagged.length}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  test('FAQ answers respect ADR-004 + Pillar 2/3/4 forbidden vocabulary', async () => {
    // Same lock as the body posts — FAQ surface inherits the
    // editorial-cluster vocabulary discipline.
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
    // Pillar 4 carry-over
    expect(prose).not.toMatch(/\bguru\b/);
    expect(prose).not.toMatch(/\bsecret\s+formula\b/);
    expect(prose).not.toMatch(/\bshortcut\b/);
    expect(prose).not.toMatch(/\bovernight\b/);
    expect(prose).not.toMatch(/\bhack\b/);
    expect(prose).not.toMatch(/\bsystem\s+that\s+guarantees\b/);
  });

  test('FAQ answers respect blog-post-layer overclaim guardrail', async () => {
    // Same lock as the body posts — FAQ surface should not
    // fall to "guaranteed faster" / "what pros do" framing
    // even though the format invites short, declarative
    // answers.
    const prose = totalAnswerProse();
    expect(prose).not.toMatch(/\bguaranteed?\s+(faster|improvement|results?|pace)\b/);
    expect(prose).not.toMatch(/\binstantly\s+(faster|improve|fix)\b/);
    expect(prose).not.toMatch(/\bwhat\s+pros\s+(do|use|know)\b/);
    expect(prose).not.toMatch(/\bone\s+weird\s+/);
    expect(prose).not.toMatch(/\bunlock\s+your\s+(true\s+)?potential\b/);
  });

  test('FAQ answers cumulative filler-word budget (≤8)', async () => {
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

  test('FAQ answers cumulatively reference framework verbs (≥3 of 5)', async () => {
    // The FAQ surface inherits the editorial cluster's
    // structural vocabulary. Locking ≥3 of 5 verbs (rather
    // than all 5) gives the FAQ headroom to focus on
    // technique-explanation Q&A without forcing every verb
    // into the answer prose; per-post body coverage already
    // names all 5 verbs.
    const prose = totalAnswerProse();
    const verbs = [/\bdiagnos/, /\bprescrib/, /\bexecut/, /\bmeasur/, /\badapt/];
    const matched = verbs.filter((v) => v.test(prose)).length;
    expect(
      matched,
      `Expected ≥3 framework verbs across FAQ answers; matched ${matched}`,
    ).toBeGreaterThanOrEqual(3);
  });
});

describe('T178: Batch 1 FAQ schema.org JSON-LD per-post factory', () => {
  test('factory accepts each of the 5 Batch 1 slugs without throwing', async () => {
    for (const slug of ALL_SLUGS) {
      expect(() => batchPostFaqJsonLd(slug)).not.toThrow();
    }
  });

  test('every per-post JSON-LD has the FAQPage shape Google expects', async () => {
    for (const slug of ALL_SLUGS) {
      const ld = batchPostFaqJsonLd(slug);
      expect(ld['@context']).toBe('https://schema.org');
      expect(ld['@type']).toBe('FAQPage');
      expect(Array.isArray(ld.mainEntity)).toBe(true);
    }
  });

  test('every per-post JSON-LD has ≥3 mainEntity entries (matches per-post FAQ floor)', async () => {
    for (const slug of ALL_SLUGS) {
      const ld = batchPostFaqJsonLd(slug);
      expect(
        ld.mainEntity.length,
        `JSON-LD for "${slug}" should have ≥3 entries; got ${ld.mainEntity.length}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  test('every mainEntity entry has the Question + Answer shape', async () => {
    for (const slug of ALL_SLUGS) {
      const ld = batchPostFaqJsonLd(slug);
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

  test('per-post filter only includes FAQs tagged for that slug', async () => {
    // Filtering correctness: a question that does not tag a
    // given post must NOT appear in that post's JSON-LD. This
    // is the test of the canonical-source-with-filter pattern
    // — without it, the per-post emission could be silently
    // unfiltered.
    for (const slug of ALL_SLUGS) {
      const ld = batchPostFaqJsonLd(slug);
      const taggedQuestions = new Set(
        BATCH_1_FAQS.filter((f) => f.posts.includes(slug)).map(
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

  test('JSON-LD is JSON-serializable for every post (script-tag inline-able)', async () => {
    for (const slug of ALL_SLUGS) {
      const ld = batchPostFaqJsonLd(slug);
      expect(() => JSON.stringify(ld)).not.toThrow();
      const serialized = JSON.stringify(ld);
      expect(serialized).toContain('FAQPage');
      expect(serialized.length).toBeGreaterThan(0);
    }
  });
});
