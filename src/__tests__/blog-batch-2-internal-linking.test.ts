// T187 — internal-linking audit for Block I Batch 2
// (T181-T185). Same pattern as T177 (Batch 1 audit): a per-
// link mandate matrix locking editorially load-bearing
// connections, plus cumulative no-isolated-node invariants.
//
// Where T186's collection test locked the OUTWARD link mesh
// (every pillar referenced ≥1 time across Batch 2), T187
// locks the INTRA-batch mesh — the connections between
// Batch 2 posts themselves — AND the cross-batch reach into
// Batch 1.
//
// Without intra-batch links, each post is an isolated SEO
// page even though Batch 2 was conceived as a coherent
// 5-post founder/product-story cluster. Without
// cross-batch links to Batch 1, the founder/product story
// posts read as disconnected from the technique deep-dives
// the rule library is actually about.
//
// The mandate matrix is anchored on three editorially
// load-bearing connections:
//   1. Positioning-twin pair: T181 (motec clone, what LAP IS)
//      ↔ T185 (not building, what LAP is NOT). At least one
//      direction must be linked.
//   2. Transparency thread: T184 (monthly numbers) is the
//      build-in-public format that depends on the scope-
//      discipline writing in T181 and/or T185.
//   3. Doctrine-pair: T183 (Pillar 4 prescription anatomy)
//      → T182 (Pillar 1 sim-to-real gap). T183's cross-
//      platform section assumes T182's argument.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POSTS_DIR = join(process.cwd(), 'docs', 'blog-posts');

const BATCH_2 = {
  motecClone: 'why-im-building-lap-not-motec-clone',
  simRealGap: 'sim-to-real-gap-honest-look',
  coachingFollow: 'designing-coaching-drivers-follow',
  monthlyNumbers: 'pre-launch-month-in-numbers',
  notBuilding: 'what-were-not-building',
} as const;

const BATCH_1_SLUGS = [
  'late-braking-at-t1',
  'throttle-pickup-smooth-vs-aggressive',
  'apex-speed-corner-commitment',
  'consistency-over-raw-pace',
  'tire-management-endurance',
] as const;

const loadPost = (slug: string): string =>
  readFileSync(join(POSTS_DIR, `${slug}.md`), 'utf8');

const linkRe = (slug: string): RegExp =>
  new RegExp(`\\]\\(/blog/${slug.replace(/-/g, '\\-')}\\)`);

describe('T187: Batch 2 internal-linking audit', () => {
  // ── Positioning-twin pair ────────────────────────────────

  test('T181 (motec clone) ↔ T185 (not building) — at least one direction linked', () => {
    // Both posts are positioning/scope-discipline arguments.
    // T181 says what LAP IS (vs MoTeC's persona); T185 says
    // what LAP is NOT (across six exclusions). The pair is
    // editorially the strongest in Batch 2; not linking
    // either direction leaves the strongest connection
    // unspoken.
    const motec = loadPost(BATCH_2.motecClone);
    const notBuilding = loadPost(BATCH_2.notBuilding);
    const motecToNotBuilding = linkRe(BATCH_2.notBuilding).test(motec);
    const notBuildingToMotec = linkRe(BATCH_2.motecClone).test(notBuilding);
    expect(
      motecToNotBuilding || notBuildingToMotec,
      'T181 must link to T185 OR T185 must link to T181 — positioning-twin pair must be connected in at least one direction',
    ).toBe(true);
  });

  // ── Transparency thread ──────────────────────────────────

  test('T184 (monthly numbers) → at least one of T181 OR T185 (transparency thread)', () => {
    // The build-in-public format that T184 establishes
    // depends on the scope-discipline writing that T181/T185
    // produced. The monthly update naturally cites the
    // scope-discipline arguments that frame what is and is
    // not in the roadmap.
    const monthly = loadPost(BATCH_2.monthlyNumbers);
    const linksMotec = linkRe(BATCH_2.motecClone).test(monthly);
    const linksNotBuilding = linkRe(BATCH_2.notBuilding).test(monthly);
    expect(
      linksMotec || linksNotBuilding,
      'T184 must link to T181 OR T185 — monthly update has to cite the scope-discipline writing it depends on',
    ).toBe(true);
  });

  // ── Doctrine-pair ────────────────────────────────────────

  test('T183 (coaching follow) → T182 (sim-real gap) (Pillar 4 + Pillar 1 founder-voice doctrine pair)', () => {
    // T183's cross-platform discipline section assumes the
    // "shapes transfer / magnitudes don't" argument T182
    // makes. Linking through the Pillar 1 article alone
    // hides the founder-voice version of that argument; the
    // doctrine pair has to be linked directly.
    const coaching = loadPost(BATCH_2.coachingFollow);
    expect(coaching).toMatch(linkRe(BATCH_2.simRealGap));
  });

  // ── Cumulative: no isolated nodes ────────────────────────

  test('every Batch 2 post is linked FROM at least one other Batch 2 post', () => {
    // Same invariant as T177's no-orphan-FROM check. A post
    // that no sibling references is an effective orphan in
    // the cluster mesh, even when the per-post tests pass.
    const allSlugs = Object.values(BATCH_2);
    for (const target of allSlugs) {
      const linkedFrom = allSlugs
        .filter((source) => source !== target)
        .filter((source) => linkRe(target).test(loadPost(source)));
      expect(
        linkedFrom.length,
        `Batch 2 post "${target}" should be linked FROM ≥1 sibling; found ${linkedFrom.length} (${linkedFrom.join(', ')})`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  test('every Batch 2 post links TO at least one other Batch 2 post', () => {
    // Mesh completeness from the source side.
    const allSlugs = Object.values(BATCH_2);
    for (const source of allSlugs) {
      const post = loadPost(source);
      const linksTo = allSlugs
        .filter((target) => target !== source)
        .filter((target) => linkRe(target).test(post));
      expect(
        linksTo.length,
        `Batch 2 post "${source}" should link TO ≥1 sibling; found ${linksTo.length} (${linksTo.join(', ')})`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  // ── Cross-batch reach: Batch 2 → Batch 1 ─────────────────

  test('Batch 2 cumulatively references ≥2 Batch 1 posts (cross-batch reach)', () => {
    // Founder/product stories should not float disconnected
    // from the technique deep-dives the rule library is
    // about. The natural connection: the Batch 1 corner-
    // phase / consistency / tire-management deep-dives
    // exemplify the weakness shapes the doctrine framework
    // (Batch 2 territory) names abstractly. Lock a
    // cumulative floor of ≥2 references across the batch.
    const allBatch2Text = Object.values(BATCH_2).map(loadPost).join('\n\n');
    const matched = BATCH_1_SLUGS.filter((s) => linkRe(s).test(allBatch2Text));
    expect(
      matched.length,
      `Batch 2 should reference ≥2 distinct Batch 1 posts cumulatively; found ${matched.length} (${matched.join(', ')})`,
    ).toBeGreaterThanOrEqual(2);
  });
});
