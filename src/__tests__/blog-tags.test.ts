// T194 — contract test for the blog tags + categories
// taxonomy. Tags are a typed union (not free-form strings)
// so a typo at the data-module entry site fails at compile
// time rather than producing an orphan tag page that no
// other post references.
//
// What this test locks:
//   * BLOG_INDEX entries all have a `tags` array
//   * Every tag is one of the typed BlogTag union values
//   * Every post has ≥1 tag (no orphan posts)
//   * listAllTags() returns the deduplicated union of tags
//     present in BLOG_INDEX
//   * postsByTag(tag) filters correctly
//   * Every tag has ≥1 post (no orphan tags)
//   * /blog/tag/[tag].astro dynamic route file exists

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  BLOG_INDEX,
  BLOG_TAGS,
  listAllTags,
  postsByTag,
  type BlogTag,
} from '../data/blog-index';

const TAG_PAGE_PATH = join(
  process.cwd(),
  'src',
  'pages',
  'blog',
  'tag',
  '[tag].astro',
);

describe('T194: blog tags taxonomy', () => {
  test('BLOG_TAGS exported as the typed union of valid tags', () => {
    expect(Array.isArray(BLOG_TAGS)).toBe(true);
    expect(BLOG_TAGS.length).toBeGreaterThanOrEqual(5);
  });

  test('every BLOG_INDEX entry has a tags array with ≥1 tag', () => {
    for (const post of BLOG_INDEX) {
      expect(
        Array.isArray(post.tags),
        `Post "${post.slug}" must have a tags array`,
      ).toBe(true);
      expect(
        post.tags.length,
        `Post "${post.slug}" must have ≥1 tag`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  test('every tag on every post is a valid BlogTag', () => {
    const tagSet = new Set<BlogTag>(BLOG_TAGS);
    for (const post of BLOG_INDEX) {
      for (const tag of post.tags) {
        expect(
          tagSet.has(tag),
          `Post "${post.slug}" has invalid tag "${tag}"`,
        ).toBe(true);
      }
    }
  });

  test('listAllTags returns the deduplicated union of tags present in BLOG_INDEX', () => {
    const expected = new Set<BlogTag>();
    for (const post of BLOG_INDEX) {
      for (const tag of post.tags) {
        expected.add(tag);
      }
    }
    const actual = new Set(listAllTags());
    expect(actual).toEqual(expected);
  });

  test('every tag has ≥1 post (no orphan tags)', () => {
    // A tag with no posts is a dead-end navigation — the
    // taxonomy must stay tight. Either drop the tag or
    // ensure ≥1 post tags it.
    for (const tag of listAllTags()) {
      const posts = postsByTag(tag);
      expect(
        posts.length,
        `Tag "${tag}" has 0 posts; either drop the tag or assign it`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  test('postsByTag filters BLOG_INDEX correctly', () => {
    for (const tag of listAllTags()) {
      const filtered = postsByTag(tag);
      for (const post of filtered) {
        expect(
          post.tags.includes(tag),
          `postsByTag("${tag}") included post "${post.slug}" without that tag`,
        ).toBe(true);
      }
      // And the filter is exhaustive — every tagged post
      // must be in the filter result.
      const expected = BLOG_INDEX.filter((p) => p.tags.includes(tag));
      expect(filtered.length).toBe(expected.length);
    }
  });

  test('/blog/tag/[tag].astro dynamic route file exists', () => {
    expect(() => readFileSync(TAG_PAGE_PATH, 'utf8')).not.toThrow();
  });

  test('tag page declares getStaticPaths emitting one path per tag', () => {
    const src = readFileSync(TAG_PAGE_PATH, 'utf8');
    expect(src).toMatch(/getStaticPaths/);
    // The dynamic route has to enumerate all tags, otherwise
    // tag pages return 404 instead of a filtered listing.
    expect(src).toMatch(/listAllTags|BLOG_TAGS/);
  });

  test('tag page filters posts via postsByTag', () => {
    const src = readFileSync(TAG_PAGE_PATH, 'utf8');
    expect(src).toMatch(/postsByTag/);
  });

  test('tag page emits CollectionPage JSON-LD', () => {
    const src = readFileSync(TAG_PAGE_PATH, 'utf8');
    expect(src).toMatch(/['"@]type['"]?\s*:\s*['"]CollectionPage['"]/);
    expect(src).toMatch(/application\/ld\+json/);
  });

  test('tag page routes through BaseLayout with TITLE + DESCRIPTION', () => {
    const src = readFileSync(TAG_PAGE_PATH, 'utf8');
    expect(src).toMatch(/import\s+BaseLayout/);
    expect(src).toMatch(/<BaseLayout/);
    expect(src).toMatch(/title=/);
    expect(src).toMatch(/description=/);
  });
});
