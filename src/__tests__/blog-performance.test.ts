// T200 — performance budget contract tests for the
// 14 blog publish pages + listing + tag pages.
//
// LCP <2s on mobile 4G is the target. lighthouserc.json
// is the runtime enforcement (lighthouse-ci runs in CI,
// fails the build when LCP exceeds the budget). This
// test locks the source-level invariants that allow the
// budget to hold:
//
//   1. No Astro client islands on publish pages — pure
//      static delivery, zero framework hydration JS.
//      The moment a publish page introduces a `client:*`
//      directive it pulls a JS chunk into the critical
//      path, regressing LCP.
//
//   2. No raster <img> tags inline — blog posts are
//      text-first. A raster <img> without explicit
//      width/height + loading="lazy" is a render-blocking
//      LCP candidate. SVG OG images (T198) live in the
//      <head> via meta tags, never in the body.
//
//   3. JSON-LD scripts use is:inline — Astro extracts
//      non-inline <script> blocks into separate JS
//      bundles. Schema markup is data, not code; it
//      MUST stay as raw <script> text in the rendered
//      HTML. is:inline is the contract that guarantees
//      this.
//
//   4. lighthouserc.json includes blog URLs with LCP
//      ≤ 2000ms — runtime enforcement, fails the
//      pipeline when the budget is breached.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { BLOG_INDEX } from '../data/blog-index';

const PUBLISH_DIR = join(process.cwd(), 'src', 'pages', 'blog');
const LIGHTHOUSERC_PATH = join(process.cwd(), 'lighthouserc.json');
const SLUGS = BLOG_INDEX.map((p) => p.slug);

const loadPublishPage = (slug: string): string =>
  readFileSync(join(PUBLISH_DIR, `${slug}.astro`), 'utf8');

interface LighthouseRc {
  readonly ci: {
    readonly collect: { readonly url: ReadonlyArray<string> };
    readonly assert: {
      readonly assertMatrix: ReadonlyArray<{
        readonly matchingUrlPattern: string;
        readonly assertions?: Readonly<
          Record<string, readonly [string, { readonly maxNumericValue?: number }]>
        >;
      }>;
    };
  };
}

const loadLighthouseRc = (): LighthouseRc =>
  JSON.parse(readFileSync(LIGHTHOUSERC_PATH, 'utf8')) as LighthouseRc;

describe('T200: no client islands on publish pages (zero hydration JS)', () => {
  test.each(SLUGS)(
    'page %s does not use any Astro client:* directive',
    (slug) => {
      const src = loadPublishPage(slug);
      const matches =
        src.match(/\sclient:(load|idle|visible|only|media)\b/g) ?? [];
      expect(
        matches.length,
        `Page ${slug} uses Astro client island directive(s): ${matches.join(', ')} — pure-static blog posts MUST have zero hydration JS`,
      ).toBe(0);
    },
  );

  test('/blog listing page has no client:* directives', () => {
    const src = readFileSync(join(PUBLISH_DIR, 'index.astro'), 'utf8');
    const matches =
      src.match(/\sclient:(load|idle|visible|only|media)\b/g) ?? [];
    expect(matches.length).toBe(0);
  });

  test('/blog/tag/[tag] page has no client:* directives', () => {
    const src = readFileSync(join(PUBLISH_DIR, 'tag', '[tag].astro'), 'utf8');
    const matches =
      src.match(/\sclient:(load|idle|visible|only|media)\b/g) ?? [];
    expect(matches.length).toBe(0);
  });
});

describe('T200: no raster image tags on publish pages (text-first content)', () => {
  test.each(SLUGS)(
    'page %s has no <img> elements pointing to raster files',
    (slug) => {
      const src = loadPublishPage(slug);
      const rasterImg =
        src.match(/<img[^>]*src=["'][^"']*\.(jpe?g|png|webp|avif)["']/gi) ?? [];
      expect(
        rasterImg.length,
        `Page ${slug} embeds raster image(s): ${rasterImg.join(', ')}`,
      ).toBe(0);
    },
  );

  test('/blog listing has no raster <img> elements', () => {
    const src = readFileSync(join(PUBLISH_DIR, 'index.astro'), 'utf8');
    const rasterImg =
      src.match(/<img[^>]*src=["'][^"']*\.(jpe?g|png|webp|avif)["']/gi) ?? [];
    expect(rasterImg.length).toBe(0);
  });
});

describe('T200: JSON-LD scripts use is:inline (no JS bundle for schema)', () => {
  test.each(SLUGS)(
    'page %s emits all JSON-LD via is:inline (raw HTML, not bundled JS)',
    (slug) => {
      const src = loadPublishPage(slug);
      const jsonLdBlocks =
        src.match(/type=["']application\/ld\+json["']/g) ?? [];
      const inlineJsonLd =
        src.match(/is:inline[^>]*type=["']application\/ld\+json["']/g) ?? [];
      expect(
        inlineJsonLd.length,
        `Page ${slug} has ${jsonLdBlocks.length} JSON-LD script(s) but only ${inlineJsonLd.length} use is:inline — Astro will bundle non-inline scripts as separate JS chunks`,
      ).toBe(jsonLdBlocks.length);
    },
  );
});

describe('T200: lighthouserc.json blog LCP budget (runtime enforcement)', () => {
  test('lighthouserc.json includes /blog/ listing page in collect URLs', () => {
    const rc = loadLighthouseRc();
    const urls = rc.ci.collect.url;
    expect(
      urls.includes('http://localhost/blog/index.html'),
      `/blog/index.html must be in lighthouse-ci collect URLs; got [${urls.join(', ')}]`,
    ).toBe(true);
  });

  test('lighthouserc.json includes at least one specific blog post URL', () => {
    const rc = loadLighthouseRc();
    const blogPostUrls = rc.ci.collect.url.filter(
      (u) =>
        /\/blog\/[^/]+\/index\.html$/.test(u) &&
        u !== 'http://localhost/blog/index.html',
    );
    expect(
      blogPostUrls.length,
      `lighthouserc.json must include at least one specific blog post URL beyond the /blog/ listing; got ${blogPostUrls.length}`,
    ).toBeGreaterThanOrEqual(1);
  });

  test('lighthouserc.json has assertMatrix entry matching /blog/ URLs', () => {
    const rc = loadLighthouseRc();
    const blogEntry = rc.ci.assert.assertMatrix.find((m) =>
      /blog/.test(m.matchingUrlPattern),
    );
    expect(
      blogEntry,
      'lighthouserc.json must contain an assertMatrix entry whose matchingUrlPattern matches blog URLs',
    ).toBeTruthy();
  });

  test('blog assertMatrix entry enforces LCP ≤ 2000ms as error', () => {
    const rc = loadLighthouseRc();
    const blogEntry = rc.ci.assert.assertMatrix.find((m) =>
      /blog/.test(m.matchingUrlPattern),
    );
    const lcp = blogEntry?.assertions?.['largest-contentful-paint'];
    expect(lcp, 'blog assertMatrix entry must define largest-contentful-paint').toBeTruthy();
    if (!lcp) return;
    const [severity, opts] = lcp;
    expect(severity, 'LCP severity must be "error" (not "warn") — budget breach must fail the build').toBe(
      'error',
    );
    expect(
      opts.maxNumericValue,
      `LCP budget for blog pages must be ≤ 2000ms (sprint T200 target); got ${opts.maxNumericValue}`,
    ).toBeLessThanOrEqual(2000);
  });

  test('blog assertMatrix pattern matches the listing URL', () => {
    const rc = loadLighthouseRc();
    const blogEntry = rc.ci.assert.assertMatrix.find((m) =>
      /blog/.test(m.matchingUrlPattern),
    );
    expect(blogEntry).toBeTruthy();
    if (!blogEntry) return;
    const re = new RegExp(blogEntry.matchingUrlPattern);
    expect(
      re.test('http://localhost/blog/index.html'),
      `assertMatrix pattern ${blogEntry.matchingUrlPattern} must match /blog/index.html`,
    ).toBe(true);
  });
});
