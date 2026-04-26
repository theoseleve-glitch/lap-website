// T207 — contract tests for /press, the press kit page.
//
// Sprint spec: "/press: logo files, screenshots, founder
// bio, facts ⇒ renders." The page bundles assets and
// information journalists need without making them write
// to ask for the basics. T184 baseline: no paying customers,
// no public beta yet — anything that would be a fabrication
// (named founder we haven't published, screenshots of
// shipped UI, press coverage logos) ships as honest "lands
// here ahead of public beta" framing.
//
// Test contract for T207 locks:
//   * Page renders, single <main>, BaseLayout integration
//   * Title + description position the page for press/media
//   * Five labelled sections: facts, founder, logos,
//     screenshots, contact. Each is a landmark with H2.
//   * Logos section links to a real /press/*.svg asset on
//     disk. Lock the file exists so the link cannot 404.
//   * Screenshots + founder sections honestly signal
//     deferral when assets aren't ready (no fabricated
//     screenshots, no fabricated founder profile).
//   * Press contact route — mailto with a press-themed
//     subject so it filters cleanly in the inbox.
//   * Carry-over: doctrine vocab, no fabricated press
//     quotes, no client islands.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Press from '../pages/press.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(Press));

const SOURCE_PATH = join(process.cwd(), 'src', 'pages', 'press.astro');
const loadSource = (): string => readFileSync(SOURCE_PATH, 'utf8');

const LOGO_SVG_PATH = join(
  process.cwd(),
  'public',
  'press',
  'lap-wordmark.svg',
);

describe('T207: /press shell renders', () => {
  test('renders a single <main> landmark', async () => {
    const html = await render();
    const mainMatches = html.match(/<main[\s>]/g) ?? [];
    expect(mainMatches.length).toBe(1);
  });

  test('renders an <h1>', async () => {
    const html = await render();
    expect(html).toMatch(/<h1[\s>]/i);
  });

  test('h1 names "press"', async () => {
    // SERP signal + scannable heading for journalists who
    // arrived from a search.
    const html = await render();
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    expect(h1Match).not.toBeNull();
    expect(h1Match![1].toLowerCase()).toMatch(/press/);
  });
});

describe('T207: BaseLayout integration', () => {
  test('title includes "LAP" branding', async () => {
    const html = await render();
    expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
  });

  test('title includes "press" for SERP', async () => {
    const html = await render();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1].toLowerCase()).toMatch(/press/);
  });

  test('meta description names press/journalist/media audience', async () => {
    const html = await render();
    const descMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]+)"/,
    );
    expect(descMatch).not.toBeNull();
    expect(descMatch![1].toLowerCase()).toMatch(/press|journalist|media/);
  });
});

describe('T207: facts section', () => {
  test('facts section is labelled landmark with paired H2', async () => {
    const html = await render();
    const sectionMatch = html.match(
      /<section[^>]+aria-labelledby="(press-facts[^"]+)"/,
    );
    expect(sectionMatch).not.toBeNull();
    const labelId = sectionMatch![1];
    expect(html).toMatch(new RegExp(`<h2[^>]+id="${labelId}"`));
  });

  test('facts mention pre-launch stage', async () => {
    // Doctrine roadmap: M1 internal alpha, M2 closed private
    // beta, M3 public beta. Today is Month 1 (2026-04-26).
    // Honest stage description = "pre-launch".
    const html = await render();
    expect(html.toLowerCase()).toMatch(
      /\bpre[- ]launch\b|\bpublic beta\b|\bprivate beta\b/,
    );
  });

  test('facts mention public-beta date 2026-07-23', async () => {
    // Doctrine §9 launch moments: 2026-07-23 = end M3 public
    // beta with Stripe live + driver OS v1 + sim↔real MVP.
    // Lock the date so a journalist sees the same milestone
    // that ships in the press release T208.
    const html = await render();
    expect(html).toMatch(/2026-07-23|July 23,?\s*2026|23 July 2026/);
  });

  test('facts mention €15 consumer pricing tier', async () => {
    // Doctrine §8 single tier. Press needs the price as a
    // fact even when the page is doctrine-anchor-only.
    const html = await render();
    expect(html).toMatch(/€15/);
  });
});

describe('T207: founder section', () => {
  test('founder section is labelled landmark with paired H2', async () => {
    const html = await render();
    const sectionMatch = html.match(
      /<section[^>]+aria-labelledby="(press-founder[^"]+)"/,
    );
    expect(sectionMatch).not.toBeNull();
    const labelId = sectionMatch![1];
    expect(html).toMatch(new RegExp(`<h2[^>]+id="${labelId}"`));
  });

  test('founder section signals named-bio deferral or names the team', async () => {
    // T184 + doctrine: no named founder profile published
    // on the marketing site yet. The section must either
    // (a) honestly defer ("named founder profile lands ahead
    // of public beta") or (b) ship organisation-level framing
    // ("built and operated by a small founding team").
    const html = await render();
    const lower = html.toLowerCase();
    const honestMarkers = [
      /\blands? (?:on this page|here) (?:ahead of|before|when)/,
      /\bsmall founding team\b/,
      /\bfounding team\b/,
      /\bahead of (?:public beta|launch)/,
      /\bpre[- ]launch\b/,
      /\bpublished (?:here|on this page) (?:ahead of|before|when)/,
    ];
    expect(
      honestMarkers.some((re) => re.test(lower)),
      'founder section must signal deferred-bio or organisation-level framing',
    ).toBe(true);
  });
});

describe('T207: logos section + downloadable asset', () => {
  test('logos section is labelled landmark with paired H2', async () => {
    const html = await render();
    const sectionMatch = html.match(
      /<section[^>]+aria-labelledby="(press-logos[^"]+)"/,
    );
    expect(sectionMatch).not.toBeNull();
    const labelId = sectionMatch![1];
    expect(html).toMatch(new RegExp(`<h2[^>]+id="${labelId}"`));
  });

  test('logos section has a download link to /press/lap-wordmark.svg', async () => {
    // Journalist UX: the link should resolve to a real
    // asset, not a forward-link to a 404. The "download"
    // attribute hints to the browser that this is a save-
    // not-display action.
    const html = await render();
    expect(html).toMatch(/href="\/press\/lap-wordmark\.svg"/);
  });

  test('the logo asset link uses the download attribute', async () => {
    const html = await render();
    expect(html).toMatch(
      /<a[^>]+href="\/press\/lap-wordmark\.svg"[^>]*download|<a[^>]+download[^>]*href="\/press\/lap-wordmark\.svg"/,
    );
  });

  test('public/press/lap-wordmark.svg exists on disk', () => {
    // The download link MUST resolve at deploy time.
    // Astro copies /public/* to /dist/* untouched, so a
    // file in public/press/ is what ships at /press/<file>.
    expect(
      existsSync(LOGO_SVG_PATH),
      `${LOGO_SVG_PATH} must exist for the press download link to resolve`,
    ).toBe(true);
  });

  test('lap-wordmark.svg parses as SVG (root <svg> element)', () => {
    if (!existsSync(LOGO_SVG_PATH)) return;
    const contents = readFileSync(LOGO_SVG_PATH, 'utf8');
    expect(contents).toMatch(/<svg[\s>]/i);
    expect(contents).toMatch(/<\/svg>/i);
  });
});

describe('T207: screenshots section (honest deferral)', () => {
  test('screenshots section is labelled landmark with paired H2', async () => {
    const html = await render();
    const sectionMatch = html.match(
      /<section[^>]+aria-labelledby="(press-screenshots[^"]+)"/,
    );
    expect(sectionMatch).not.toBeNull();
    const labelId = sectionMatch![1];
    expect(html).toMatch(new RegExp(`<h2[^>]+id="${labelId}"`));
  });

  test('screenshots section signals "ships when public beta lands" deferral', async () => {
    // T050/T051 are BLOCKED on real screenshots. Honest
    // framing — "we ship these when the product is live to
    // photograph" — is preferable to fabricated mockups or
    // synthesized UI marketing imagery.
    const html = await render();
    const lower = html.toLowerCase();
    const markers = [
      /\bpublic beta\b/,
      /\bships? (?:here|on this page)? when/,
      /\blands? (?:here|on this page)? when/,
      /\bafter the (?:public )?beta\b/,
      /\bahead of (?:the )?public (?:launch|beta)/,
    ];
    expect(
      markers.some((re) => re.test(lower)),
      'screenshots section must honestly signal deferral until public beta',
    ).toBe(true);
  });
});

describe('T207: press contact route', () => {
  test('exposes a press-themed mailto to sales@lap-coach.racing', async () => {
    // Same canonical inbox as T066 + T204, with a press
    // subject so triage in the inbox is cheap. A separate
    // press@ alias is infrastructure work; the public site
    // ships the route with the existing inbox.
    const html = await render();
    expect(html).toMatch(
      /<a[^>]+href="mailto:sales@lap-coach\.racing[^"]*press[^"]*"/i,
    );
  });
});

describe('T207: carry-over locks', () => {
  test('no AI-coach / LLM / generative / neural / realistic vocab', async () => {
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });

  test('no fabricated press quotes (no <blockquote> with attribution)', async () => {
    // No press coverage exists yet; any blockquote with a
    // dash-attribution pattern would be a fabricated quote.
    const html = await render();
    const blockquotes = html.match(/<blockquote[\s\S]*?<\/blockquote>/g) ?? [];
    for (const bq of blockquotes) {
      expect(
        bq,
        `press page contains a blockquote with attribution dash — fabricated quote: ${bq}`,
      ).not.toMatch(/[—–][\s]+[A-Z][a-zA-Z]+/);
    }
  });

  test('source has no Astro client:* directives', () => {
    const src = loadSource();
    const matches =
      src.match(/\sclient:(load|idle|visible|only|media)\b/g) ?? [];
    expect(matches.length).toBe(0);
  });

  test('navigation: at least one footer link to /pricing or /how-it-works', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/(?:pricing|how-it-works)"/);
  });
});
