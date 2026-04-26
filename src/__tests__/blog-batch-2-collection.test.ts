// T186 — collection-level editing pass for Block I Batch 2
// (T181-T185 founder/product stories). Mirrors the T176
// pattern from Batch 1: collection-level invariants the
// per-post tests cannot enforce because they need
// cross-post reasoning.
//
// What this test locks (collection-level only):
//   * All 5 Batch 2 posts exist
//   * Cumulative cluster reach: every one of the 4 pillar
//     articles is referenced ≥1 time across the 5 posts
//     (per-post tests floor at 1 OR 2 sibling pillars; this
//     test floors at COMPLETE coverage of all 4)
//   * Anti-boilerplate: no sentence ≥80 chars appears in
//     >2 posts (catches template-fill drift across batch)
//   * Founder voice consistency: every post uses
//     first-person "I " or "We " in body text (not just
//     in titles)
//   * ADR-004 asymmetric distribution: ≥2 posts spell out
//     "language-model" (T181 and T185 by design) — the
//     posts that need to argue the negation; the other 3
//     stay strict per their own contracts.
//
// What this test does NOT lock (covered by per-post tests):
//   * Word counts (each post has its own band)
//   * Doctrine anchor counts (each post has its own list)
//   * Bare ADR-004 token bans (per-post strict mode)
//   * Pillar 2/3/4 forbidden vocab carry-over

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const BATCH_2_SLUGS = [
  'why-im-building-lap-not-motec-clone',
  'sim-to-real-gap-honest-look',
  'designing-coaching-drivers-follow',
  'pre-launch-month-in-numbers',
  'what-were-not-building',
] as const;

const POSTS_DIR = join(process.cwd(), 'docs', 'blog-posts');

const loadPost = (slug: string): string =>
  readFileSync(join(POSTS_DIR, `${slug}.md`), 'utf8');

describe('T186: Block I Batch 2 — collection-level editing pass', () => {
  test('all 5 Batch 2 posts exist on disk', () => {
    for (const slug of BATCH_2_SLUGS) {
      expect(() => loadPost(slug), `missing post: ${slug}`).not.toThrow();
    }
  });

  test('cumulative cluster reach: every pillar article referenced ≥1 time across batch', () => {
    // The collection-level floor that Batch 1 caught at
    // T176 — Pillar 3 had 0 cumulative references across
    // the 5 Batch 1 posts. Batch 2 has the same risk
    // surface; lock the floor.
    const allText = BATCH_2_SLUGS.map(loadPost).join('\n\n');
    const pillars = [
      '/blog/sim-to-real-transfer',
      '/blog/what-is-trail-braking',
      '/blog/best-sim-racing-telemetry-app',
      '/blog/driver-development-plan',
    ];
    const missing: string[] = [];
    for (const pillar of pillars) {
      const re = new RegExp(`\\]\\(${pillar.replace(/-/g, '\\-')}\\)`);
      if (!re.test(allText)) {
        missing.push(pillar);
      }
    }
    expect(
      missing.length,
      `Pillars with 0 references across Batch 2: ${missing.join(', ')}`,
    ).toBe(0);
  });

  test('anti-boilerplate: no sentence ≥80 chars appears verbatim in >2 posts', () => {
    // Same anti-template-fill check as Batch 1's collection
    // test caught at T176 (where 4 of 5 posts shared a
    // closing line about cross-platform argument). Batch 2
    // has its own template-fill risk surface — closing
    // doctrine lines, framework re-statements, etc.
    const sentenceMap = new Map<string, string[]>();
    for (const slug of BATCH_2_SLUGS) {
      const text = loadPost(slug);
      const sentences = text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.replace(/\s+/g, ' ').trim())
        .filter((s) => s.length >= 80);
      const seenInThisPost = new Set<string>();
      for (const s of sentences) {
        if (seenInThisPost.has(s)) continue;
        seenInThisPost.add(s);
        const arr = sentenceMap.get(s) ?? [];
        arr.push(slug);
        sentenceMap.set(s, arr);
      }
    }
    const offenders = Array.from(sentenceMap.entries())
      .filter(([, slugs]) => slugs.length > 2)
      .map(
        ([s, slugs]) =>
          `"${s.slice(0, 100)}${s.length > 100 ? '...' : ''}" in: ${slugs.join(', ')}`,
      );
    expect(
      offenders.length,
      `Verbatim sentences appearing in >2 Batch 2 posts:\n${offenders.join('\n')}`,
    ).toBe(0);
  });

  test('founder voice: every post uses first-person "I " or "We " in body', () => {
    // Batch 2 is fundamentally founder voice. A post that
    // drops first-person framing has drifted to Batch 1
    // technique-deep-dive register and breaks the editorial
    // pattern.
    const offenders: string[] = [];
    for (const slug of BATCH_2_SLUGS) {
      const text = loadPost(slug);
      // Strip H1/H2 lines so we test body, not titles.
      const body = text.replace(/^#+\s+.*$/gm, '');
      const hasFirstPerson = /\b(?:I|We)\s+\w/.test(body);
      if (!hasFirstPerson) {
        offenders.push(slug);
      }
    }
    expect(
      offenders.length,
      `posts missing founder-voice first-person: ${offenders.join(', ')}`,
    ).toBe(0);
  });

  test('ADR-004 asymmetry distribution: ≥2 posts spell out "language-model" (T181 + T185 by design)', () => {
    // The asymmetry split is by editorial design: T181
    // (MoTeC clone) and T185 (not building) need to argue
    // the language-model negation; T182, T183, T184 do not.
    // Lock the FLOOR (≥2 posts spell it out) so a future
    // edit cannot accidentally remove the negation
    // arguments wholesale.
    let spellOutCount = 0;
    const spellOutPosts: string[] = [];
    for (const slug of BATCH_2_SLUGS) {
      const text = loadPost(slug).toLowerCase();
      if (/\blanguage[-\s]model/.test(text)) {
        spellOutCount += 1;
        spellOutPosts.push(slug);
      }
    }
    expect(
      spellOutCount,
      `Expected ≥2 posts to spell out "language-model"; found ${spellOutCount} (${spellOutPosts.join(', ')})`,
    ).toBeGreaterThanOrEqual(2);
  });
});
