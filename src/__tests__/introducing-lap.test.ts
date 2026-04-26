// T211 — launch-day blog post "Introducing LAP".
//
// Drafted today (2026-04-26, Month 1) and scheduled for
// publication on 2026-07-23 (public-beta launch day, end
// Month 3). Three artefacts:
//   1. docs/blog-posts/introducing-lap.md — markdown body
//   2. src/pages/blog/introducing-lap.astro — publish page
//   3. BLOG_INDEX entry with datePublished: '2026-07-23'
//
// Tense strategy mirrors T209 + T210 launch landings:
// date-anchored copy ("LAP enters public beta on
// 2026-07-23") that reads accurately whether a visitor
// lands ahead of launch or after. Avoids the trap of
// "Today is launch day" which would be a lie when the
// post becomes visible pre-launch.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { BLOG_INDEX } from '../data/blog-index';

const MD_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'introducing-lap.md',
);
const PUBLISH_PATH = join(
  process.cwd(),
  'src',
  'pages',
  'blog',
  'introducing-lap.astro',
);

const loadMd = (): string => readFileSync(MD_PATH, 'utf8');
const loadPublishPage = (): string => readFileSync(PUBLISH_PATH, 'utf8');

const SLUG = 'introducing-lap';

describe('T211: artefacts on disk', () => {
  test('docs/blog-posts/introducing-lap.md exists', () => {
    expect(existsSync(MD_PATH)).toBe(true);
  });

  test('src/pages/blog/introducing-lap.astro exists', () => {
    expect(existsSync(PUBLISH_PATH)).toBe(true);
  });
});

describe('T211: BLOG_INDEX entry', () => {
  test('BLOG_INDEX includes introducing-lap', () => {
    const entry = BLOG_INDEX.find((p) => p.slug === SLUG);
    expect(entry, 'BLOG_INDEX must include introducing-lap entry').toBeTruthy();
  });

  test('entry datePublished is 2026-07-23 (scheduled for launch day)', () => {
    const entry = BLOG_INDEX.find((p) => p.slug === SLUG);
    expect(entry?.datePublished).toBe('2026-07-23');
  });

  test('entry category is founder-story', () => {
    const entry = BLOG_INDEX.find((p) => p.slug === SLUG);
    expect(entry?.category).toBe('founder-story');
  });

  test('entry has at least one tag', () => {
    const entry = BLOG_INDEX.find((p) => p.slug === SLUG);
    expect((entry?.tags ?? []).length).toBeGreaterThanOrEqual(1);
  });
});

describe('T211: markdown structure', () => {
  test('exactly one H1 (heading hierarchy correctness)', () => {
    const md = loadMd();
    const h1Lines = md.match(/^#\s+/gm) ?? [];
    expect(h1Lines.length).toBe(1);
  });

  test('at least three H2 sections (substantial structure)', () => {
    const md = loadMd();
    const h2Lines = md.match(/^##\s+/gm) ?? [];
    expect(
      h2Lines.length,
      `launch announcement should have ≥3 H2 sections; got ${h2Lines.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('word count is in the 800–1500 band', () => {
    const md = loadMd();
    const stripped = md
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^#+\s+/gm, '')
      .replace(/[*_`#>[\]()|—–-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = stripped.split(/\s+/).filter((w) => w.length > 0);
    expect(words.length).toBeGreaterThanOrEqual(800);
    expect(words.length).toBeLessThanOrEqual(1500);
  });
});

describe('T211: critical facts (locked from doctrine)', () => {
  test('mentions public-beta date 2026-07-23', () => {
    const md = loadMd();
    expect(md).toMatch(/2026-07-23|July 23,?\s*2026|23 July 2026/);
  });

  test('mentions V1 release date 2026-09-23', () => {
    const md = loadMd();
    expect(md).toMatch(
      /2026-09-23|September 23,?\s*2026|23 September 2026/,
    );
  });

  test('mentions €15 consumer pricing', () => {
    const md = loadMd();
    expect(md).toMatch(/€15/);
  });

  test('mentions €12 grandfathered founder rate (waitlist context)', () => {
    const md = loadMd();
    expect(md).toMatch(/€12/);
  });

  test('mentions 14-day free trial', () => {
    const md = loadMd();
    expect(md.toLowerCase()).toMatch(/14[- ]day/);
  });
});

describe('T211: doctrine framing', () => {
  test('uses cross-platform mission framing', () => {
    const md = loadMd();
    expect(md.toLowerCase()).toMatch(/cross[- ]platform/);
  });

  test('mentions both sim and real-world racing', () => {
    const md = loadMd();
    const lower = md.toLowerCase();
    expect(lower).toMatch(/\bsim\b|\bsimulator\b/);
    expect(lower).toMatch(
      /\breal[- ]world|real[- ]track|on[- ]track|on track\b/,
    );
  });

  test('names ≥2 sim platforms (concrete capture roster)', () => {
    const md = loadMd();
    const lower = md.toLowerCase();
    const platforms = [
      /\biracing\b/,
      /\bams\s*2\b|\bautomobilista\b/,
      /\bacc\b|\bassetto corsa competizione/,
      /\brfactor/,
      /\blmu\b|\ble mans ultimate/,
    ];
    const matched = platforms.filter((re) => re.test(lower));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });
});

describe('T211: ADR-004 vocab discipline (asymmetric)', () => {
  test('explicitly negates LLM coaching (spelled-out "language model" required)', () => {
    // Asymmetric vocab rule: this post argues the no-LLM
    // commitment as a launch differentiator, so it must
    // spell "language model" out somewhere in negation
    // context.
    const md = loadMd();
    expect(md.toLowerCase()).toMatch(
      /\bnot\b[\s\S]{0,40}\blanguage[- ]model|\blanguage[- ]model[\s\S]{0,40}\bnot\b|\bno\b[\s\S]{0,40}\blanguage[- ]model|without[\s\S]{0,30}\blanguage[- ]model/,
    );
  });

  test('does not use bare "AI coach" / "LLM" / "generative" / "neural" / "realistic"', () => {
    const md = loadMd();
    const lower = md.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });

  test('uses "hand-curated" or "written rule" framing (positive doctrine)', () => {
    const md = loadMd();
    const lower = md.toLowerCase();
    expect(lower).toMatch(
      /\bhand[- ]curated\b|\bwritten rule\b|\brule[- ]traceable\b/,
    );
  });
});

describe('T211: internal cross-links (cluster integration)', () => {
  test('links to at least 2 internal site routes', () => {
    const md = loadMd();
    const internalLinks =
      md.match(/\]\(\/(?:waitlist|pricing|how-it-works|for-schools|blog\/[^)]+|launch|v1)/g) ?? [];
    expect(
      internalLinks.length,
      `launch post must surface ≥2 internal links; got ${internalLinks.length}`,
    ).toBeGreaterThanOrEqual(2);
  });
});

describe('T211: publish page structure (T199 + T200 carry-over)', () => {
  test('publish page imports BaseLayout', () => {
    const src = loadPublishPage();
    expect(src).toMatch(/import BaseLayout/);
  });

  test('publish page imports the markdown file', () => {
    const src = loadPublishPage();
    expect(src).toMatch(
      /import\s+\*\s+as\s+post\s+from\s+['"]\.\.\/\.\.\/\.\.\/docs\/blog-posts\/introducing-lap\.md['"]/,
    );
  });

  test('publish page wraps content in <main>', () => {
    const src = loadPublishPage();
    expect(src).toMatch(/<main[\s>]/);
  });

  test('publish page wraps article body in <article>', () => {
    const src = loadPublishPage();
    expect(src).toMatch(/<article[\s>]/);
  });

  test('publish page applies max-w-prose constraint', () => {
    const src = loadPublishPage();
    expect(src).toMatch(/max-w-prose/);
  });

  test('publish page emits Article JSON-LD with datePublished 2026-07-23', () => {
    // The date can be held in a const and referenced by
    // `datePublished` (preferred pattern) OR inlined. Lock
    // that both tokens are present somewhere in source.
    const src = loadPublishPage();
    expect(src).toMatch(/'@type':\s*'Article'/);
    expect(src).toMatch(/datePublished/);
    expect(src).toMatch(/2026-07-23/);
  });

  test('publish page uses is:inline on JSON-LD scripts (perf carry-over)', () => {
    const src = loadPublishPage();
    expect(src).toMatch(/is:inline[^>]*type=["']application\/ld\+json["']/);
  });

  test('publish page has no client:* directives', () => {
    const src = loadPublishPage();
    const matches =
      src.match(/\sclient:(load|idle|visible|only|media)\b/g) ?? [];
    expect(matches.length).toBe(0);
  });

  test('publish page sets ogImage to /og/blog/introducing-lap.svg', () => {
    // T198 OG endpoint emits one SVG per BLOG_INDEX entry
    // via getStaticPaths; the publish page must reference
    // its dedicated OG asset path.
    const src = loadPublishPage();
    expect(src).toMatch(/ogImage=["']\/og\/blog\/introducing-lap\.svg["']/);
  });
});
