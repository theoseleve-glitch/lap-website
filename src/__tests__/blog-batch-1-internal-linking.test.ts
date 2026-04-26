// T177 — internal-linking audit for Batch 1 (T171-T175). Same
// pattern as the pillar internal-linking audits (T148, T158,
// T168): a per-link mandate matrix, plus a cumulative cluster-
// completeness invariant.
//
// Where T176's collection test locked completion of the
// outward link mesh (all 4 sibling pillars referenced
// cumulatively across Batch 1), T177 locks the INTRA-batch
// link mesh — the connections between Batch 1 posts
// themselves. Without intra-batch links, each post is an
// isolated SEO page even though the batch was conceived as a
// coherent five-post coaching-rule cluster.
//
// The mandate matrix is anchored on three editorially load-
// bearing connections:
//   1. Apex-speed is the centerpiece between entry-phase and
//      exit-phase. Entry/exit posts must reference apex-speed;
//      apex-speed must reference at least one of entry/exit.
//   2. Tire-management is endurance-extended distribution
//      discipline; it must reference the consistency post.
//   3. Consistency's "spike pattern" failure mode points at
//      one specific corner — naturally a corner-phase post.
//
// Plus a cumulative no-isolated-node invariant: every Batch 1
// post is linked FROM at least one other Batch 1 post.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POSTS_DIR = join(process.cwd(), 'docs', 'blog-posts');

const SLUGS = {
  lateBraking: 'late-braking-at-t1',
  throttlePickup: 'throttle-pickup-smooth-vs-aggressive',
  apexSpeed: 'apex-speed-corner-commitment',
  consistency: 'consistency-over-raw-pace',
  tireManagement: 'tire-management-endurance',
} as const;

const loadPost = (slug: string): string =>
  readFileSync(join(POSTS_DIR, `${slug}.md`), 'utf8');

const linkRe = (slug: string): RegExp =>
  new RegExp(`\\]\\(/blog/${slug.replace(/-/g, '\\-')}\\)`);

describe('T177: Batch 1 internal-linking audit', () => {
  // ── Apex-speed centrepiece ───────────────────────────────

  test('late-braking-at-t1 → apex-speed-corner-commitment (entry sets up apex)', async () => {
    // Entry-phase technique exists to set up the apex. A
    // late-braking post that does not point at the apex-speed
    // article leaves the corner-phase mesh incomplete.
    const post = loadPost(SLUGS.lateBraking);
    expect(post).toMatch(linkRe(SLUGS.apexSpeed));
  });

  test('throttle-pickup-smooth-vs-aggressive → apex-speed-corner-commitment (exit follows apex)', async () => {
    // Exit-phase technique starts AT the apex. A throttle-
    // pickup post that does not point at the apex-speed
    // article leaves the corner-phase mesh incomplete.
    const post = loadPost(SLUGS.throttlePickup);
    expect(post).toMatch(linkRe(SLUGS.apexSpeed));
  });

  test('apex-speed-corner-commitment → late-braking-at-t1 OR throttle-pickup-smooth-vs-aggressive', async () => {
    // Apex-speed is sandwiched between entry and exit. It
    // must reference at least one corner-phase neighbour so
    // the centrepiece has links back into the corner-flow
    // posts. Either neighbour satisfies the editorial intent;
    // both is even better.
    const post = loadPost(SLUGS.apexSpeed);
    const linksLateBraking = linkRe(SLUGS.lateBraking).test(post);
    const linksThrottle = linkRe(SLUGS.throttlePickup).test(post);
    expect(
      linksLateBraking || linksThrottle,
      'apex-speed must link to at least one of late-braking or throttle-pickup',
    ).toBe(true);
  });

  // ── Tire-management ↔ consistency ────────────────────────

  test('tire-management-endurance → consistency-over-raw-pace (stint-level extends distribution)', async () => {
    // Tire management in endurance is the stint-level
    // extension of session-level consistency discipline. The
    // tire-management post arguing race-result-depends-on-
    // median without pointing at the consistency post leaves
    // a load-bearing connection unspoken.
    const post = loadPost(SLUGS.tireManagement);
    expect(post).toMatch(linkRe(SLUGS.consistency));
  });

  // ── Consistency → corner-phase ───────────────────────────

  test('consistency-over-raw-pace → at least one corner-phase post', async () => {
    // Consistency's "spike pattern" failure mode is, by the
    // post's own framing, a single corner that is unreliable.
    // The fix is corner-phase work. A consistency post that
    // names the spike pattern but does not point at any
    // corner-phase post fails to complete the chain it
    // started.
    const post = loadPost(SLUGS.consistency);
    const cornerPhaseSlugs = [
      SLUGS.lateBraking,
      SLUGS.throttlePickup,
      SLUGS.apexSpeed,
    ];
    const matches = cornerPhaseSlugs.filter((s) => linkRe(s).test(post));
    expect(
      matches.length,
      `consistency must link to ≥1 corner-phase post; found ${matches.length} (${matches.join(', ')})`,
    ).toBeGreaterThanOrEqual(1);
  });

  // ── Cumulative: no isolated nodes ────────────────────────

  test('every Batch 1 post is linked FROM at least one other Batch 1 post', async () => {
    // Cluster-mesh completeness: an SEO page that is never
    // referenced by sibling content in the same batch reads
    // as an orphan node and gets less internal pagerank
    // weight than a connected node. The invariant catches the
    // case where the per-post and per-link-matrix tests pass
    // but a post is still effectively isolated as a target.
    const allSlugs = Object.values(SLUGS);
    for (const target of allSlugs) {
      const linkedFrom = allSlugs
        .filter((source) => source !== target)
        .filter((source) => linkRe(target).test(loadPost(source)));
      expect(
        linkedFrom.length,
        `Post "${target}" should be linked FROM at least 1 sibling Batch 1 post; found ${linkedFrom.length} (${linkedFrom.join(', ')})`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  test('every Batch 1 post links TO at least one other Batch 1 post', async () => {
    // Mesh completeness from the source side. A post that
    // references no Batch 1 sibling has no internal-link
    // outflow within the batch and reads as the end of a
    // chain, not a node in a cluster.
    const allSlugs = Object.values(SLUGS);
    for (const source of allSlugs) {
      const post = loadPost(source);
      const linksTo = allSlugs
        .filter((target) => target !== source)
        .filter((target) => linkRe(target).test(post));
      expect(
        linksTo.length,
        `Post "${source}" should link TO at least 1 sibling Batch 1 post; found ${linksTo.length} (${linksTo.join(', ')})`,
      ).toBeGreaterThanOrEqual(1);
    }
  });
});
