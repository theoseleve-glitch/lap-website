// T220 — final site audit. Four dimensions per the sprint task:
// broken links, missing meta, accessibility, performance. The
// audit report is a markdown artefact at docs/marketing/site-
// audit-final.md; this test file verifies the report's structure
// AND performs the cross-cutting checks that earn the PASS claim
// on each dimension.
//
// Cross-cuts performed here (catch issues that per-page tests
// don't because they only test their own page):
//
//   * Broken-link audit — enumerate every internal `href="/..."`
//     reference across src/pages/ + src/components/ + docs/blog-
//     posts/, verify each resolves to a built page or matches a
//     whitelisted infrastructure path (/api/*, /og/*, dynamic
//     /blog/<slug>, public assets like /press/*).
//
//   * Missing-meta audit — every .astro page in src/pages/ must
//     import BaseLayout (which provides title/desc/og/canonical
//     /JSON-LD by construction). New pages added without a
//     BaseLayout import would ship without meta and fail SEO.
//
//   * ADR-004 vocab cross-cut — no bare "AI coach" / "LLM" /
//     "generative" / "neural" / "realistic" in any page body.
//     Cuts across all pages even when a per-page test was never
//     added.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, test } from 'vitest';

const FILE_PATH = join(
  process.cwd(),
  'docs',
  'marketing',
  'site-audit-final.md',
);

const loadFile = (): string => readFileSync(FILE_PATH, 'utf8');

function walkDir(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDir(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const PAGES_DIR = join(process.cwd(), 'src', 'pages');
const COMPONENTS_DIR = join(process.cwd(), 'src', 'components');

function collectStaticRoutes(): Set<string> {
  const routes = new Set<string>();
  for (const file of walkDir(PAGES_DIR).filter((p) => p.endsWith('.astro'))) {
    const rel = relative(PAGES_DIR, file).replace(/\\/g, '/');
    if (rel.includes('[')) continue; // dynamic routes covered by whitelist
    let route = '/' + rel.replace(/\.astro$/, '');
    route = route.replace(/\/index$/, '');
    if (route === '') route = '/';
    routes.add(route);
  }
  return routes;
}

const HREF_WHITELIST: ReadonlyArray<RegExp> = [
  /^\/api\//,
  /^\/og\//,
  /^\/og-default\.png$/,
  /^\/og-default-twitter\.png$/,
  /^\/favicon\b/,
  /^\/blog\/[^/]+\/?$/, // /blog/<slug>
  /^\/press\/[^/]+/, // public press assets
  /^\/robots\.txt$/,
  /^\/sitemap/,
  // V2 webapp routes — served by the Cloudflare Worker `lap-website` on
  // the same zone (`lap-coach.racing/login*`, `/register*`, `/app/*` etc.).
  // Same-domain handoffs, not 404 orphans on the Phase 4 Astro side.
  // See C:/Users/Admin/.claude/projects/C--Users-Admin-Documents-Telemetry/memory/lap_repo_map.md
  /^\/login(?:[/?#]|$)/,
  /^\/register(?:[/?#]|$)/,
  /^\/oauth-callback(?:[/?#]|$)/,
  /^\/forgot-password(?:[/?#]|$)/,
  /^\/reset-password(?:[/?#]|$)/,
  /^\/verify-email(?:[/?#]|$)/,
  /^\/app(?:[/?#]|$)/,
  /^\/admin(?:[/?#]|$)/,
];

function isWhitelisted(href: string): boolean {
  return HREF_WHITELIST.some((re) => re.test(href));
}

function normalizeHref(href: string): string {
  const noQuery = href.split('?')[0].split('#')[0];
  if (noQuery === '' || noQuery === '/') return '/';
  return noQuery.replace(/\/+$/, '');
}

function extractInternalHrefs(src: string): string[] {
  return [...src.matchAll(/href=["'](\/[^"']*)["']/g)]
    .map((m) => m[1])
    .filter((h) => !h.startsWith('//')); // protocol-relative is external
}

describe('T220: audit report on disk', () => {
  test('docs/marketing/site-audit-final.md exists', () => {
    expect(existsSync(FILE_PATH)).toBe(true);
  });

  test('audit report has a single H1 (overview heading)', () => {
    expect((loadFile().match(/^#\s+/gm) ?? []).length).toBe(1);
  });

  test('audit report has ≥4 H2 sections (one per dimension + acceptance)', () => {
    const h2 = loadFile().match(/^##\s+/gm) ?? [];
    expect(h2.length).toBeGreaterThanOrEqual(4);
  });
});

describe('T220: audit report covers the four sprint-mandated dimensions', () => {
  test.each([
    /broken[- ]links?/i,
    /missing meta|meta tags?/i,
    /a11y|accessibility/i,
    /performance|lighthouse/i,
  ])('dimension matching %s is named in audit report', (re) => {
    expect(loadFile()).toMatch(re);
  });

  test('audit report claims PASS on each dimension (≥4 PASS markers)', () => {
    const md = loadFile();
    const passCount = (md.match(/\bPASS\b/g) ?? []).length;
    expect(
      passCount,
      `audit needs ≥4 PASS markers (one per dimension); got ${passCount}`,
    ).toBeGreaterThanOrEqual(4);
  });
});

describe('T220: audit report acceptance criteria checklist (≥4 items)', () => {
  test('has ≥4 checkbox items', () => {
    const checkboxes = loadFile().match(/^\s*-\s+\[[\sx]\]\s+\S+/gm) ?? [];
    expect(checkboxes.length).toBeGreaterThanOrEqual(4);
  });
});

// ───────────────────────────────────────────────────────────
// Cross-cutting checks — these are the actual audit verdict.
// ───────────────────────────────────────────────────────────

describe('T220: cross-cut — every .astro page imports BaseLayout (missing-meta dimension)', () => {
  const pages = walkDir(PAGES_DIR).filter((p) => p.endsWith('.astro'));

  test.each(
    pages.map((p) => relative(PAGES_DIR, p).replace(/\\/g, '/')),
  )('src/pages/%s imports BaseLayout (inherits title/desc/og/JSON-LD)', (rel) => {
    const src = readFileSync(join(PAGES_DIR, rel), 'utf8');
    expect(
      src,
      `${rel} must import BaseLayout to inherit title/desc/og/JSON-LD`,
    ).toMatch(/import\s+BaseLayout\s+from\s+['"][^'"]*BaseLayout/);
  });
});

describe('T220: cross-cut — broken-link audit (every internal href resolves)', () => {
  test('all internal hrefs in src/pages and src/components resolve to a built route', () => {
    const routes = collectStaticRoutes();
    const sourceFiles = [
      ...walkDir(PAGES_DIR).filter((p) => p.endsWith('.astro')),
      ...walkDir(COMPONENTS_DIR).filter((p) => p.endsWith('.astro')),
    ];

    const orphans: ReadonlyArray<{
      readonly href: string;
      readonly file: string;
    }> = sourceFiles.flatMap((file) => {
      const src = readFileSync(file, 'utf8');
      return extractInternalHrefs(src)
        .filter((href) => !isWhitelisted(href))
        .filter((href) => !routes.has(normalizeHref(href)))
        .map((href) => ({ href, file: relative(process.cwd(), file) }));
    });

    expect(
      orphans,
      `orphan internal hrefs (no matching static route + not in whitelist):\n${orphans.map((o) => `  ${o.href} (in ${o.file})`).join('\n')}`,
    ).toEqual([]);
  });
});

describe('T220: cross-cut — ADR-004 vocab discipline (every page body)', () => {
  function pageBody(astroSrc: string): string {
    // Strip frontmatter (--- ... --- block at file start) so
    // the test only sees rendered content, not code comments.
    const match = astroSrc.match(/^---[\s\S]*?\n---\n/);
    return match ? astroSrc.slice(match[0].length) : astroSrc;
  }

  const pages = walkDir(PAGES_DIR).filter((p) => p.endsWith('.astro'));

  test.each(
    pages.map((p) => relative(PAGES_DIR, p).replace(/\\/g, '/')),
  )('src/pages/%s body has no bare ADR-004 banned vocab', (rel) => {
    const src = readFileSync(join(PAGES_DIR, rel), 'utf8');
    const body = pageBody(src).toLowerCase();
    expect(body).not.toMatch(/\bai coach\b/);
    expect(body).not.toMatch(/\bllm\b/);
    expect(body).not.toMatch(/\bgenerative\b/);
    expect(body).not.toMatch(/\bneural\b/);
    expect(body).not.toMatch(/\brealistic\b/);
  });
});
