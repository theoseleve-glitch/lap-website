// T195 — related-posts utility. Scores other posts in
// BLOG_INDEX against a source post by shared tags (2 pts
// each) and shared category (1 pt). Returns top-N by
// score, descending. Excludes the source post itself and
// posts with zero overlap (better to under-recommend than
// to pad with unrelated noise).

import {
  BLOG_INDEX,
  type BlogPostIndexEntry,
} from '../data/blog-index';

const TAG_WEIGHT = 2;
const CATEGORY_WEIGHT = 1;

/**
 * Returns up to `limit` posts most related to the post with
 * the given slug. Throws on unknown slug (fail-loud, not
 * silent empty array).
 */
export const findRelatedPosts = (
  slug: string,
  limit = 3,
): ReadonlyArray<BlogPostIndexEntry> => {
  const source = BLOG_INDEX.find((p) => p.slug === slug);
  if (!source) {
    throw new Error(
      `Unknown post slug "${slug}". Add the post to src/data/blog-index.ts before referencing it.`,
    );
  }

  const scored = BLOG_INDEX
    .filter((p) => p.slug !== source.slug)
    .map((p) => {
      const sharedTags = p.tags.filter((t) => source.tags.includes(t)).length;
      const score =
        sharedTags * TAG_WEIGHT +
        (p.category === source.category ? CATEGORY_WEIGHT : 0);
      return { post: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.post);
};
