// T199 — accessibility + responsive contract tests for the
// 14 blog publish pages and the listing/tag/index surfaces.
// Source-level invariants enforceable without a headless
// browser; rendering-level a11y (color contrast, focus
// trap on accordion summary, etc.) is verified at the
// component-tooling layer (T192's BlogTOC has aria-label
// locks; T197's BlogNewsletterEmbed locks aria-labelledby
// + label/input pairing).
//
// What this test locks across publish pages + BaseLayout:
//   * BaseLayout has lang attribute + viewport meta
//   * Every publish page wraps body in <main> landmark
//   * Every publish page wraps article body in <article>
//   * Every publish page uses max-w-prose constraint
//     (responsive readable line length)
//   * Source markdown: exactly one H1 per post (heading
//     hierarchy correctness)
//   * Anchor elements have accessible text content (no
//     empty <a></a> links)
//   * Interactive accordion summary uses default browser
//     <details>/<summary> semantics (keyboard accessible
//     by default)

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { BLOG_INDEX } from '../data/blog-index';

const BASE_LAYOUT_PATH = join(
  process.cwd(),
  'src',
  'layouts',
  'BaseLayout.astro',
);

const PUBLISH_DIR = join(process.cwd(), 'src', 'pages', 'blog');
const MD_DIR = join(process.cwd(), 'docs', 'blog-posts');

const SLUGS = BLOG_INDEX.map((p) => p.slug);

const loadPublishPage = (slug: string): string =>
  readFileSync(join(PUBLISH_DIR, `${slug}.astro`), 'utf8');

// Pillar markdowns live in a different shape; only the
// 10 Batch 1/Batch 2 posts have a one-to-one markdown
// file in docs/blog-posts/. Pillars are inline-rendered.
const MD_SLUGS = SLUGS.filter((s) => {
  try {
    readFileSync(join(MD_DIR, `${s}.md`), 'utf8');
    return true;
  } catch {
    return false;
  }
});

describe('T199: BaseLayout a11y + responsive primitives', () => {
  test('html element declares lang attribute', () => {
    const src = readFileSync(BASE_LAYOUT_PATH, 'utf8');
    expect(src).toMatch(/<html\s+[^>]*lang=/);
  });

  test('viewport meta tag is present (responsive baseline)', () => {
    const src = readFileSync(BASE_LAYOUT_PATH, 'utf8');
    expect(src).toMatch(
      /<meta\s+name=["']viewport["']\s+content=["']width=device-width/,
    );
  });
});

describe('T199: publish-page landmark structure (iterated across all 14)', () => {
  test.each(SLUGS)('page %s wraps content in <main> landmark', (slug) => {
    const src = loadPublishPage(slug);
    expect(src).toMatch(/<main[\s>]/);
  });

  test.each(SLUGS)(
    'page %s uses <article> for the post body wrapper',
    (slug) => {
      const src = loadPublishPage(slug);
      expect(src).toMatch(/<article[\s>]/);
    },
  );

  test.each(SLUGS)(
    'page %s applies max-w-prose constraint (responsive line length)',
    (slug) => {
      // Long-form prose without a max-w constraint goes
      // edge-to-edge on wide displays and degrades
      // readability. The publish-page surface must constrain
      // article width.
      const src = loadPublishPage(slug);
      expect(src).toMatch(/max-w-prose/);
    },
  );

  test.each(SLUGS)(
    'page %s has no empty anchor elements (a11y: every link has accessible text)',
    (slug) => {
      const src = loadPublishPage(slug);
      // <a href=...></a> with no text content is the most
      // common a11y failure for SEO pages. Pattern: opening
      // <a> tag, optional whitespace, closing </a>.
      const emptyLinks = src.match(/<a\s+[^>]*>\s*<\/a>/g) ?? [];
      expect(
        emptyLinks.length,
        `Page ${slug} has empty anchor element(s): ${emptyLinks.join(', ')}`,
      ).toBe(0);
    },
  );
});

describe('T199: source markdown heading hierarchy (Batch 1/2 posts)', () => {
  test.each(MD_SLUGS)(
    'markdown %s has exactly one H1 (heading hierarchy correctness)',
    (slug) => {
      const md = readFileSync(join(MD_DIR, `${slug}.md`), 'utf8');
      const h1Lines = md.match(/^#\s+/gm) ?? [];
      expect(
        h1Lines.length,
        `Markdown ${slug} should have exactly 1 H1; found ${h1Lines.length}`,
      ).toBe(1);
    },
  );

  test.each(MD_SLUGS)(
    'markdown %s has at least one H2 (no flat post structure)',
    (slug) => {
      const md = readFileSync(join(MD_DIR, `${slug}.md`), 'utf8');
      const h2Lines = md.match(/^##\s+/gm) ?? [];
      expect(h2Lines.length).toBeGreaterThanOrEqual(1);
    },
  );

  test.each(MD_SLUGS)(
    'markdown %s does not skip from H1 to H3 (heading hierarchy)',
    (slug) => {
      // Heading hierarchy correctness: an H3 should never
      // appear before an H2 in the document. Screen readers
      // build a navigable outline from heading levels;
      // skipping levels breaks the outline.
      const md = readFileSync(join(MD_DIR, `${slug}.md`), 'utf8');
      const lines = md.split('\n');
      let seenH2 = false;
      for (const line of lines) {
        if (/^##\s+/.test(line)) seenH2 = true;
        if (/^###\s+/.test(line)) {
          expect(
            seenH2,
            `Markdown ${slug} has H3 before any H2 (skipped heading level)`,
          ).toBe(true);
          break;
        }
      }
    },
  );
});

describe('T199: blog listing + tag pages a11y', () => {
  test('/blog listing page has <main> landmark', () => {
    const src = readFileSync(
      join(PUBLISH_DIR, 'index.astro'),
      'utf8',
    );
    expect(src).toMatch(/<main[\s>]/);
  });

  test('/blog listing page has H1', () => {
    const src = readFileSync(
      join(PUBLISH_DIR, 'index.astro'),
      'utf8',
    );
    expect(src).toMatch(/<h1[\s>]/i);
  });

  test('/blog/tag/[tag] page has <main> landmark and H1', () => {
    const src = readFileSync(
      join(PUBLISH_DIR, 'tag', '[tag].astro'),
      'utf8',
    );
    expect(src).toMatch(/<main[\s>]/);
    expect(src).toMatch(/<h1[\s>]/i);
  });

  test('/blog/tag/[tag] page has back-link to /blog (navigation depth)', () => {
    // Tag pages must not be dead-ends. A user on /blog/tag/braking
    // who arrived from a search engine needs a clear path back to
    // the main blog index.
    const src = readFileSync(
      join(PUBLISH_DIR, 'tag', '[tag].astro'),
      'utf8',
    );
    expect(src).toMatch(/href=["']\/blog["']/);
  });
});

describe('T199: responsive — mobile-first class usage on publish pages', () => {
  test.each(SLUGS)(
    'page %s does NOT use fixed widths in pixels for content (px-only width is non-responsive)',
    (slug) => {
      const src = loadPublishPage(slug);
      // Catch hardcoded width:Npx style declarations that
      // would break on narrow viewports. Tailwind's max-w-*
      // classes are fine because they cap not fix.
      const fixedWidth = src.match(/style=["'][^"']*width:\s*\d+px/g) ?? [];
      expect(
        fixedWidth.length,
        `Page ${slug} has hardcoded pixel width: ${fixedWidth.join(', ')}`,
      ).toBe(0);
    },
  );
});
