// T198 — contract test for the blog-post OG image
// auto-generation pipeline. SVG-based OG images (1200×630)
// generated per post at build time via Astro's
// getStaticPaths. SVG works as og:image content across the
// major social platforms (Facebook, LinkedIn, Slack,
// Discord) and is the minimum-viable approach without
// adding canvas/sharp/satori dependencies.
//
// Pipeline:
//   * src/utils/og-svg.ts — buildBlogPostOgSvg(post) → SVG
//     string (deterministic, testable without runtime)
//   * src/pages/og/blog/[slug].svg.ts — Astro APIRoute
//     with getStaticPaths emitting one path per BLOG_INDEX
//     entry, returning image/svg+xml content
//   * Each publish page passes ogImage="/og/blog/<slug>.svg"
//     to BaseLayout so the meta tag references the
//     per-post image rather than a fallback default.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { buildBlogPostOgSvg } from '../utils/og-svg';
import { BLOG_INDEX } from '../data/blog-index';

const ENDPOINT_PATH = join(
  process.cwd(),
  'src',
  'pages',
  'og',
  'blog',
  '[slug].svg.ts',
);

const PUBLISH_PAGE_DIR = join(process.cwd(), 'src', 'pages', 'blog');

describe('T198: buildBlogPostOgSvg utility', () => {
  test('exports buildBlogPostOgSvg function', () => {
    expect(typeof buildBlogPostOgSvg).toBe('function');
  });

  test('returns a non-empty string', () => {
    const svg = buildBlogPostOgSvg(BLOG_INDEX[0]!);
    expect(typeof svg).toBe('string');
    expect(svg.length).toBeGreaterThan(0);
  });

  test('starts with the SVG XML declaration', () => {
    const svg = buildBlogPostOgSvg(BLOG_INDEX[0]!);
    expect(svg.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  test('uses 1200×630 viewBox (standard OG dimensions)', () => {
    const svg = buildBlogPostOgSvg(BLOG_INDEX[0]!);
    expect(svg).toMatch(/viewBox=["']0\s+0\s+1200\s+630["']/);
    expect(svg).toMatch(/width=["']1200["']/);
    expect(svg).toMatch(/height=["']630["']/);
  });

  test('includes the post title in the SVG content', () => {
    for (const post of BLOG_INDEX) {
      const svg = buildBlogPostOgSvg(post);
      // Title may be wrapped across multiple <text> or <tspan>
      // elements for line-breaking; the full title string
      // should reconstruct from the rendered text content.
      const textContent = svg.match(/>([^<>]+)</g)?.join('') ?? '';
      const firstWord = post.title.split(' ')[0]!;
      expect(
        textContent,
        `OG SVG for "${post.slug}" must include first word of title "${firstWord}"`,
      ).toContain(firstWord);
    }
  });

  test('includes the category eyebrow', () => {
    const svg = buildBlogPostOgSvg(BLOG_INDEX[0]!);
    // Category appears in the eyebrow as a normalised label
    // (e.g. "Pillar guide", "Founder note", "Technique
    // deep-dive"). Lock that the SVG content includes some
    // recognisable category-specific text.
    const lower = svg.toLowerCase();
    const matches =
      lower.includes('pillar') ||
      lower.includes('founder') ||
      lower.includes('technique');
    expect(matches).toBe(true);
  });

  test('includes the LAP brand mark', () => {
    const svg = buildBlogPostOgSvg(BLOG_INDEX[0]!);
    expect(svg).toContain('LAP');
  });

  test('escapes XML special characters in title (synthetic post)', () => {
    // A future post titled "Q&A on <thoughts>" must not
    // produce broken SVG markup.
    const synthetic = {
      slug: 'test-escape',
      title: 'Q&A on <thoughts> & "quotes"',
      description: 'whatever',
      category: 'pillar' as const,
      tags: ['braking' as const],
      datePublished: '2026-04-26',
    };
    const svg = buildBlogPostOgSvg(synthetic);
    expect(svg).toContain('Q&amp;A');
    expect(svg).toContain('&lt;thoughts&gt;');
    // Raw special chars must NOT appear in attribute or text
    // positions where they would break the SVG parser.
    expect(svg).not.toMatch(/Q&A\son\s</);
  });
});

describe('T198: /og/blog/[slug].svg endpoint', () => {
  test('endpoint file exists at src/pages/og/blog/[slug].svg.ts', () => {
    expect(() => readFileSync(ENDPOINT_PATH, 'utf8')).not.toThrow();
  });

  test('endpoint declares getStaticPaths', () => {
    const src = readFileSync(ENDPOINT_PATH, 'utf8');
    expect(src).toMatch(/getStaticPaths/);
  });

  test('endpoint imports BLOG_INDEX + buildBlogPostOgSvg', () => {
    const src = readFileSync(ENDPOINT_PATH, 'utf8');
    expect(src).toMatch(/BLOG_INDEX/);
    expect(src).toMatch(/buildBlogPostOgSvg/);
  });

  test('endpoint exports GET handler', () => {
    const src = readFileSync(ENDPOINT_PATH, 'utf8');
    expect(src).toMatch(/export\s+const\s+GET/);
  });

  test('endpoint sets image/svg+xml content-type', () => {
    const src = readFileSync(ENDPOINT_PATH, 'utf8');
    expect(src).toMatch(/image\/svg\+xml/);
  });
});

describe('T198: publish pages pass per-post ogImage to BaseLayout', () => {
  const SLUGS = BLOG_INDEX.map((p) => p.slug);

  test.each(SLUGS)(
    'publish page %s passes ogImage="/og/blog/<slug>.svg" to BaseLayout',
    (slug) => {
      const pagePath = join(PUBLISH_PAGE_DIR, `${slug}.astro`);
      const src = readFileSync(pagePath, 'utf8');
      const expected = new RegExp(
        `ogImage=["']/og/blog/${slug.replace(/-/g, '\\-')}\\.svg["']`,
      );
      expect(
        src,
        `Page ${slug} must pass ogImage="/og/blog/${slug}.svg" to BaseLayout`,
      ).toMatch(expected);
    },
  );
});
