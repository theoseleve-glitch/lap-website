// T180 — contract test for the Batch 1 social-media kit.
// 5 tweets per published post × 5 posts = 25 total. Stored
// as a typed data module (src/data/blog-batch-1-social.ts)
// so future drip tooling can consume the kit programmatically;
// the drip cron itself (T096) is BLOCKED on infrastructure
// and not part of T180's scope.
//
// Editorial discipline mirrors the body posts and FAQ:
//   * Forbidden vocab carry-over (ADR-004 + Pillar 2/3/4 +
//     blog-post-layer overclaim guardrail)
//   * Twitter character budget (≤280 per body, leaving the
//     drip tool room to append the post URL at publish time)
//   * No verbatim duplicates across the 25 tweets — copy-
//     paste reuse would break the per-post diversity that
//     justifies "5 per post" in the first place

import { describe, expect, test } from 'vitest';
import {
  BATCH_1_TWEETS,
  type Tweet,
} from '../data/blog-batch-1-social';

const ALL_SLUGS = [
  'late-braking-at-t1',
  'throttle-pickup-smooth-vs-aggressive',
  'apex-speed-corner-commitment',
  'consistency-over-raw-pace',
  'tire-management-endurance',
] as const;

const totalProse = (): string =>
  BATCH_1_TWEETS.map((t) => t.body).join(' ').toLowerCase();

describe('T180: Batch 1 social kit data module', () => {
  test('exports BATCH_1_TWEETS array with exactly 25 entries (5 × 5 posts)', () => {
    expect(Array.isArray(BATCH_1_TWEETS)).toBe(true);
    expect(BATCH_1_TWEETS.length).toBe(25);
  });

  test('every tweet has a non-empty body string', () => {
    for (const tweet of BATCH_1_TWEETS) {
      expect(typeof tweet.body).toBe('string');
      expect(tweet.body.trim().length).toBeGreaterThan(0);
    }
  });

  test('every tweet has a valid Batch 1 post slug', () => {
    for (const tweet of BATCH_1_TWEETS) {
      expect(
        ALL_SLUGS,
        `Tweet "${tweet.body.slice(0, 50)}..." has invalid post slug "${tweet.post}"`,
      ).toContain(tweet.post);
    }
  });

  test('every post has exactly 5 tweets', () => {
    for (const slug of ALL_SLUGS) {
      const count = BATCH_1_TWEETS.filter((t) => t.post === slug).length;
      expect(
        count,
        `Post "${slug}" should have exactly 5 tweets; found ${count}`,
      ).toBe(5);
    }
  });

  test('every tweet body is ≤280 characters', () => {
    // Twitter's hard limit. The drip tool will append the
    // post URL at publish time; t.co shortens to ~23 chars
    // regardless of length, so a body at 257 chars + ~23
    // chars for the URL still fits. Lock the body itself
    // ≤280 so a future kit edit cannot silently overflow.
    for (const tweet of BATCH_1_TWEETS) {
      expect(
        tweet.body.length,
        `Tweet body exceeds 280 chars (${tweet.body.length}): "${tweet.body.slice(0, 60)}..."`,
      ).toBeLessThanOrEqual(280);
    }
  });

  test('every tweet body is ≥40 characters (no padding-shy stubs)', () => {
    // Below 40 chars the tweet is too thin to carry an
    // editorial argument; lock a substance floor so a
    // future edit cannot pad the kit with one-liner stubs.
    for (const tweet of BATCH_1_TWEETS) {
      expect(
        tweet.body.length,
        `Tweet body too short (${tweet.body.length}): "${tweet.body}"`,
      ).toBeGreaterThanOrEqual(40);
    }
  });

  test('no verbatim duplicate body across the 25 tweets', () => {
    // Copy-paste reuse would defeat the "5 per post"
    // structure. A future edit that copies one tweet across
    // posts is caught here.
    const bodies = BATCH_1_TWEETS.map((t) => t.body);
    const uniqueBodies = new Set(bodies);
    expect(
      uniqueBodies.size,
      `Expected 25 unique tweet bodies; found ${uniqueBodies.size}`,
    ).toBe(BATCH_1_TWEETS.length);
  });

  test('tweets cumulatively respect ADR-004 + Pillar 2/3/4 forbidden vocabulary', () => {
    const prose = totalProse();
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

  test('tweets respect blog-post-layer technique-overclaim guardrail', () => {
    // Same lock as the body posts. Twitter format invites
    // viral-bait phrasing ("the secret pros use", "guaranteed
    // faster") — the kit must hold the same editorial
    // discipline as the long-form content it links to.
    const prose = totalProse();
    expect(prose).not.toMatch(/\bguaranteed?\s+(faster|improvement|results?|pace)\b/);
    expect(prose).not.toMatch(/\binstantly\s+(faster|improve|fix)\b/);
    expect(prose).not.toMatch(/\bwhat\s+pros\s+(do|use|know)\b/);
    expect(prose).not.toMatch(/\bone\s+weird\s+/);
    expect(prose).not.toMatch(/\bunlock\s+your\s+(true\s+)?potential\b/);
  });

  test('tweets cumulative filler-word budget (≤6)', () => {
    // Across 25 tweets averaging ~140 chars each (~3500
    // chars total, ~600 words), 6 fillers is generous (1
    // per 4 tweets max). Anti-fluff.
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
    // A tweet with 4+ hashtags reads as low-effort
    // promotion. Lock 1 hashtag per tweet as an upper bound
    // (zero hashtags is the recommended editorial default;
    // the kit prefers prose over tagging).
    for (const tweet of BATCH_1_TWEETS) {
      const hashtagCount = (tweet.body.match(/#\w+/g) ?? []).length;
      expect(
        hashtagCount,
        `Tweet has ${hashtagCount} hashtags (cap: 1): "${tweet.body.slice(0, 50)}..."`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test('Tweet type shape is preserved (TS contract)', () => {
    // Light runtime check that the exported type's expected
    // fields exist on every entry. Catches a future refactor
    // that drops a field without updating consumers.
    for (const tweet of BATCH_1_TWEETS) {
      const t: Tweet = tweet;
      expect(typeof t.body).toBe('string');
      expect(typeof t.post).toBe('string');
    }
  });
});
