// T176 — collection-level contract test for Batch 1 (T171-
// T175). Locks editorial invariants that span ALL FIVE
// posts as a coherent batch, rather than per-post invariants
// that the per-draft tests already enforce. The editing pass
// (T176) sits between the draft phase (T171-T175) and the
// internal-linking + FAQ + publish phase (T177-T179) — its
// job is to catch issues that only show up when reading the
// five posts as a collection: cluster-mesh gaps, verbatim
// boilerplate across drafts, cumulative budget overruns.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POSTS_DIR = join(process.cwd(), 'docs', 'blog-posts');

const POST_FILES = [
  'late-braking-at-t1.md',
  'throttle-pickup-smooth-vs-aggressive.md',
  'apex-speed-corner-commitment.md',
  'consistency-over-raw-pace.md',
  'tire-management-endurance.md',
];

const loadPost = (file: string): string =>
  readFileSync(join(POSTS_DIR, file), 'utf8');

const loadAllPosts = (): string =>
  POST_FILES.map(loadPost).join('\n\n');

const wordCount = (text: string): number =>
  text
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;

describe('T176: Batch 1 editing pass — collection-level invariants', () => {
  test('all five posts exist on disk', async () => {
    // Lock the post count. T171-T175 each shipped one post;
    // a future edit that deletes a post file would silently
    // shrink the batch. Catching that here means publish
    // (T179) cannot proceed against an incomplete batch.
    for (const file of POST_FILES) {
      const path = join(POSTS_DIR, file);
      expect(() => readFileSync(path, 'utf8')).not.toThrow();
    }
  });

  test('cumulative word count is in the 6500-8500 band', async () => {
    // 5 posts × ~1500 words = ~7500 cumulative target.
    // Floor 6500: a draft losing substance below this can no
    // longer carry five coaching rule deep-dives credibly.
    // Ceiling 8500: above this the batch is over-explaining
    // and a tightening pass should cut.
    const all = loadAllPosts();
    const wc = wordCount(all);
    expect(wc).toBeGreaterThanOrEqual(6500);
    expect(wc).toBeLessThanOrEqual(8500);
  });

  test('cluster mesh: all 4 sibling pillar articles referenced cumulatively', async () => {
    // Per-post tests lock ≥2 pillar references per post; the
    // collection-level lock is stronger: every pillar in the
    // four-pillar cluster must be referenced from at least
    // one Batch 1 post. Without this, a pillar can become an
    // editorial dead end (cluster reach gap). Editing-pass
    // discovery: Pillar 3 (/blog/best-sim-racing-telemetry-
    // app) initially had 0 references across Batch 1 — the
    // post-cluster-mesh discipline failed silently because
    // the per-post test only required ≥2-of-4 pillars.
    const all = loadAllPosts();
    const pillars = [
      '/blog/sim-to-real-transfer',
      '/blog/what-is-trail-braking',
      '/blog/best-sim-racing-telemetry-app',
      '/blog/driver-development-plan',
    ];
    for (const pillar of pillars) {
      const re = new RegExp(`\\]\\(${pillar.replace(/-/g, '\\-')}\\)`);
      expect(
        re.test(all),
        `Pillar ${pillar} must be referenced from at least one Batch 1 post`,
      ).toBe(true);
    }
  });

  test('framework vocabulary: all 5 verbs referenced cumulatively', async () => {
    // Per-post tests lock ≥1 verb per post; the collection-
    // level lock confirms cumulative coverage of all five
    // verbs (diagnose / prescribe / execute / measure /
    // adapt). The framework's structural integrity at the
    // batch layer requires the full vocabulary surface.
    const all = loadAllPosts().toLowerCase();
    const verbs = [/\bdiagnos/, /\bprescrib/, /\bexecut/, /\bmeasur/, /\badapt/];
    const labels = ['diagnose', 'prescribe', 'execute', 'measure', 'adapt'];
    verbs.forEach((re, i) => {
      expect(
        re.test(all),
        `Framework verb "${labels[i]}" must appear in at least one Batch 1 post`,
      ).toBe(true);
    });
  });

  test('cumulative filler-word budget (≤12 across all 5 posts)', async () => {
    // Per-post tests cap each post at ≤3 filler words; 5 × 3
    // = 15 worst-case. Collection-level cap of 12 (4% under
    // the worst case) catches batch-level filler creep that
    // per-post tests would let through.
    const all = loadAllPosts().toLowerCase();
    const fillers = ['actually', 'really', 'very', 'basically', 'essentially'];
    let fillerCount = 0;
    for (const filler of fillers) {
      const matches = all.match(new RegExp(`\\b${filler}\\b`, 'g')) ?? [];
      fillerCount += matches.length;
    }
    expect(
      fillerCount,
      `Cumulative filler-word count was ${fillerCount} (cap: 12)`,
    ).toBeLessThanOrEqual(12);
  });

  test('anti-boilerplate: no verbatim sentence appears across >2 posts', async () => {
    // Editing-pass discovery: 4 of 5 posts initially shared
    // the verbatim string "develops the cross-platform
    // argument that this post depends on" — template-fill
    // prose that a careful reader scanning multiple posts in
    // the batch would notice as boilerplate. Lock this:
    // signature phrases appearing in 3+ posts indicate the
    // editing pass has not been performed (or has regressed).
    // The test currently checks the canonical
    // cross-platform-argument phrase; if a future batch
    // surfaces a different boilerplate template, add it to
    // the watchlist below.
    const watchlist = [
      'develops the cross-platform argument that this post depends on',
    ];
    for (const phrase of watchlist) {
      let count = 0;
      for (const file of POST_FILES) {
        const post = loadPost(file).toLowerCase();
        // strip newlines so phrases that span line wraps still match
        const flat = post.replace(/\s+/g, ' ');
        if (flat.includes(phrase)) {
          count += 1;
        }
      }
      expect(
        count,
        `Boilerplate phrase "${phrase}" appeared in ${count} posts (cap: 2)`,
      ).toBeLessThanOrEqual(2);
    }
  });

  test('cumulative forbidden-vocab guardrail (defense-in-depth)', async () => {
    // Per-post tests already lock these absent. Cumulative
    // check is the integration safety net — catches a future
    // copy-paste from another article that drops a forbidden
    // word into one post while passing per-post checks via
    // permitted-context loophole.
    const all = loadAllPosts().toLowerCase();
    // ADR-004
    expect(all).not.toMatch(/\bai\s+coach\b/);
    expect(all).not.toMatch(/\bllm\b/);
    expect(all).not.toMatch(/\bgenerative\b/);
    expect(all).not.toMatch(/\bneural\b/);
    expect(all).not.toMatch(/\brealistic\b/);
    // Pillar 2/3/4 carry-over (full set)
    expect(all).not.toMatch(/\bmagic\b/);
    expect(all).not.toMatch(/\bsecret\b/);
    expect(all).not.toMatch(/\btrick\b/);
    expect(all).not.toMatch(/\bguru\b/);
    expect(all).not.toMatch(/\bshortcut\b/);
    expect(all).not.toMatch(/\bovernight\b/);
    expect(all).not.toMatch(/\bhack\b/);
  });
});
