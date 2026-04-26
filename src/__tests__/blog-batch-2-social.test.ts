// T190 — contract test for the Batch 2 social-media kit. 5
// tweets per published post × 5 posts = 25 total. Same shape
// as T180 (Batch 1 social kit); editorial divergence:
//
//   * Batch 2 tweets cover positioning, doctrine, scope,
//     and pre-launch transparency rather than technique
//     deep-dives.
//   * ADR-004 ASYMMETRIC for the corpus (same logic as T188
//     FAQ): the kit needs ≥1 spelled-out "language-model"
//     reference because two of the five posts (T181, T185)
//     argue the negation explicitly. Bare "llm" / "ai
//     coach" / "generative" / "neural" still banned across
//     all 25 tweets.

import { describe, expect, test } from 'vitest';
import {
  BATCH_2_TWEETS,
  type Batch2Tweet,
} from '../data/blog-batch-2-social';

const ALL_SLUGS = [
  'why-im-building-lap-not-motec-clone',
  'sim-to-real-gap-honest-look',
  'designing-coaching-drivers-follow',
  'pre-launch-month-in-numbers',
  'what-were-not-building',
] as const;

const totalProse = (): string =>
  BATCH_2_TWEETS.map((t) => t.body).join(' ').toLowerCase();

describe('T190: Batch 2 social kit data module', () => {
  test('exports BATCH_2_TWEETS array with exactly 25 entries (5 × 5 posts)', () => {
    expect(Array.isArray(BATCH_2_TWEETS)).toBe(true);
    expect(BATCH_2_TWEETS.length).toBe(25);
  });

  test('every tweet has a non-empty body string', () => {
    for (const tweet of BATCH_2_TWEETS) {
      expect(typeof tweet.body).toBe('string');
      expect(tweet.body.trim().length).toBeGreaterThan(0);
    }
  });

  test('every tweet has a valid Batch 2 post slug', () => {
    for (const tweet of BATCH_2_TWEETS) {
      expect(
        ALL_SLUGS,
        `Tweet "${tweet.body.slice(0, 50)}..." has invalid post slug "${tweet.post}"`,
      ).toContain(tweet.post);
    }
  });

  test('every post has exactly 5 tweets', () => {
    for (const slug of ALL_SLUGS) {
      const count = BATCH_2_TWEETS.filter((t) => t.post === slug).length;
      expect(
        count,
        `Post "${slug}" should have exactly 5 tweets; found ${count}`,
      ).toBe(5);
    }
  });

  test('every tweet body is ≤280 characters', () => {
    for (const tweet of BATCH_2_TWEETS) {
      expect(
        tweet.body.length,
        `Tweet body exceeds 280 chars (${tweet.body.length}): "${tweet.body.slice(0, 60)}..."`,
      ).toBeLessThanOrEqual(280);
    }
  });

  test('every tweet body is ≥40 characters (no padding-shy stubs)', () => {
    for (const tweet of BATCH_2_TWEETS) {
      expect(
        tweet.body.length,
        `Tweet body too short (${tweet.body.length}): "${tweet.body}"`,
      ).toBeGreaterThanOrEqual(40);
    }
  });

  test('no verbatim duplicate body across the 25 tweets', () => {
    const bodies = BATCH_2_TWEETS.map((t) => t.body);
    const uniqueBodies = new Set(bodies);
    expect(
      uniqueBodies.size,
      `Expected 25 unique tweet bodies; found ${uniqueBodies.size}`,
    ).toBe(BATCH_2_TWEETS.length);
  });

  test('tweet corpus addresses the language-model question (≥1 spelled-out reference for ADR-004 negation)', () => {
    // Same asymmetry as T188 (FAQ corpus): the social kit
    // needs to make the language-model negation argument
    // explicit somewhere because the positioning posts
    // (T181, T185) depend on it.
    const prose = totalProse();
    expect(
      prose,
      'Batch 2 tweet corpus must include ≥1 spelled-out "language-model" reference',
    ).toMatch(/\blanguage[-\s]model/);
  });

  test('tweets respect ADR-004 (asymmetric: bare "llm"/"ai coach"/"generative"/"neural" banned; "language-model" allowed)', () => {
    const prose = totalProse();
    expect(prose).not.toMatch(/\bai\s+coach\b/);
    expect(prose).not.toMatch(/\bllm\b/);
    expect(prose).not.toMatch(/\bgenerative\b/);
    expect(prose).not.toMatch(/\bneural\b/);
    expect(prose).not.toMatch(/\brealistic\b/);
  });

  test('tweets respect Pillar 2/3/4 forbidden vocabulary', () => {
    const prose = totalProse();
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

  test('tweets respect blog-post-layer technique-overclaim guardrail', () => {
    const prose = totalProse();
    expect(prose).not.toMatch(/\bguaranteed?\s+(faster|improvement|results?|pace)\b/);
    expect(prose).not.toMatch(/\binstantly\s+(faster|improve|fix)\b/);
    expect(prose).not.toMatch(/\bwhat\s+pros\s+(do|use|know)\b/);
    expect(prose).not.toMatch(/\bone\s+weird\s+/);
    expect(prose).not.toMatch(/\bunlock\s+your\s+(true\s+)?potential\b/);
  });

  test('tweets cumulative filler-word budget (≤6)', () => {
    const prose = totalProse();
    const fillers = ['actually', 'really', 'very', 'basically', 'essentially'];
    let fillerCount = 0;
    for (const filler of fillers) {
      const matches = prose.match(new RegExp(`\\b${filler}\\b`, 'g')) ?? [];
      fillerCount += matches.length;
    }
    expect(
      fillerCount,
      `Tweet filler-word count was ${fillerCount} (cap: 6)`,
    ).toBeLessThanOrEqual(6);
  });

  test('tweets do NOT use hashtag spam (≤1 hashtag per tweet)', () => {
    for (const tweet of BATCH_2_TWEETS) {
      const hashtagCount = (tweet.body.match(/#\w+/g) ?? []).length;
      expect(
        hashtagCount,
        `Tweet has ${hashtagCount} hashtags (cap: 1): "${tweet.body.slice(0, 50)}..."`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test('Batch2Tweet type shape is preserved (TS contract)', () => {
    for (const tweet of BATCH_2_TWEETS) {
      const t: Batch2Tweet = tweet;
      expect(typeof t.body).toBe('string');
      expect(typeof t.post).toBe('string');
    }
  });
});
