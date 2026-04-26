// T195 — contract test for the related-posts utility +
// component. Algorithm: posts sharing tags rank above posts
// sharing only category; tag matches score 2x category
// matches; the source post itself is excluded; posts with
// zero overlap are excluded entirely (no recency fallback —
// genuinely unrelated posts are worse than no recommendation
// at all).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { findRelatedPosts } from '../utils/related-posts';
import { BLOG_INDEX } from '../data/blog-index';

const RELATED_PATH = join(
  process.cwd(),
  'src',
  'components',
  'RelatedPosts.astro',
);

describe('T195: findRelatedPosts utility', () => {
  test('exports findRelatedPosts function', () => {
    expect(typeof findRelatedPosts).toBe('function');
  });

  test('throws on unknown slug (fail-loud, not silent empty)', () => {
    expect(() => findRelatedPosts('nonexistent-post-slug')).toThrow();
  });

  test('never includes the source post itself', () => {
    for (const post of BLOG_INDEX) {
      const related = findRelatedPosts(post.slug);
      for (const r of related) {
        expect(
          r.slug,
          `Related list for "${post.slug}" must not include itself`,
        ).not.toBe(post.slug);
      }
    }
  });

  test('default limit is 3', () => {
    // Pillars and well-tagged posts have plenty of related
    // candidates; the default should keep the surface clean.
    const related = findRelatedPosts('driver-development-plan');
    expect(related.length).toBeLessThanOrEqual(3);
  });

  test('respects an explicit limit parameter', () => {
    const related = findRelatedPosts('driver-development-plan', 2);
    expect(related.length).toBeLessThanOrEqual(2);
  });

  test('returns posts sharing ≥1 tag (when any exist)', () => {
    // The braking pillar (what-is-trail-braking) shares the
    // "braking" tag with late-braking-at-t1. Tag-share must
    // produce a related-pair edge.
    const related = findRelatedPosts('what-is-trail-braking');
    const slugs = related.map((p) => p.slug);
    expect(
      slugs,
      'expected late-braking-at-t1 in related posts of trail-braking pillar',
    ).toContain('late-braking-at-t1');
  });

  test('ranks tag-sharing posts above category-only matches', () => {
    // sim-to-real-transfer (pillar, sim-vs-real tag) should
    // rank sim-to-real-gap-honest-look (founder-story,
    // sim-vs-real tag) higher than what-is-trail-braking
    // (pillar, braking tag — only category match) because
    // the tag match scores 2x the category match.
    const related = findRelatedPosts('sim-to-real-transfer');
    const positionGap = related.findIndex(
      (p) => p.slug === 'sim-to-real-gap-honest-look',
    );
    const positionTrail = related.findIndex(
      (p) => p.slug === 'what-is-trail-braking',
    );
    if (positionGap !== -1 && positionTrail !== -1) {
      expect(positionGap).toBeLessThan(positionTrail);
    } else {
      // At minimum, the tag-sharing post must appear at all.
      expect(positionGap).toBeGreaterThanOrEqual(0);
    }
  });

  test('excludes posts with zero overlap (no unrelated noise)', () => {
    // Better to return fewer related posts than to pad with
    // unrelated content. A post with neither shared tags nor
    // shared category must not appear.
    for (const post of BLOG_INDEX) {
      const related = findRelatedPosts(post.slug);
      for (const r of related) {
        const sharesTag = r.tags.some((t) => post.tags.includes(t));
        const sharesCategory = r.category === post.category;
        expect(
          sharesTag || sharesCategory,
          `Related "${r.slug}" for "${post.slug}" shares neither tag nor category`,
        ).toBe(true);
      }
    }
  });

  test('returns posts in score-descending order (best matches first)', () => {
    // Iterate every post, compute scores manually, verify
    // returned ordering.
    for (const post of BLOG_INDEX) {
      const related = findRelatedPosts(post.slug, 10);
      const scoreOf = (p: typeof related[number]) =>
        p.tags.filter((t) => post.tags.includes(t)).length * 2 +
        (p.category === post.category ? 1 : 0);
      for (let i = 1; i < related.length; i++) {
        expect(
          scoreOf(related[i - 1]!),
          `Score order broken between "${related[i - 1]!.slug}" and "${related[i]!.slug}" for source "${post.slug}"`,
        ).toBeGreaterThanOrEqual(scoreOf(related[i]!));
      }
    }
  });
});

describe('T195: RelatedPosts component', () => {
  test('component file exists at src/components/RelatedPosts.astro', () => {
    expect(() => readFileSync(RELATED_PATH, 'utf8')).not.toThrow();
  });

  test('component declares Props with slug + optional limit', () => {
    const src = readFileSync(RELATED_PATH, 'utf8');
    expect(src).toMatch(/interface\s+Props/);
    expect(src).toMatch(/slug/);
    expect(src).toMatch(/limit/);
  });

  test('component imports findRelatedPosts utility', () => {
    const src = readFileSync(RELATED_PATH, 'utf8');
    expect(src).toMatch(
      /import\s+\{[^}]*findRelatedPosts[^}]*\}\s+from\s+['"][^'"]*related-posts['"]/,
    );
  });

  test('component renders an aria-labelled section with anchor links', () => {
    const src = readFileSync(RELATED_PATH, 'utf8');
    expect(src).toMatch(/aria-label/);
    expect(src).toMatch(/<h2|<h3/);
    expect(src).toMatch(/href=\{`\/blog\//);
  });
});
