// T209 — public beta launch landing page at /launch.
// One-off, featured during launch week (week of
// 2026-07-23), stable as a permanent reference URL after.
// Today is Month 1 (2026-04-26); the page ships date-
// anchored copy that reads accurately whether the
// visitor lands ahead of launch ("LAP enters public beta
// on 2026-07-23") or after.
//
// Doctrine carry-over (01-STRATEGIC-DOCTRINE.md §9 launch
// moments + §8 pricing + §10 commitments):
//   * Public beta = end Month 3 = 2026-07-23
//   * V1 release = end Month 5 = 2026-09-23
//   * €15/mo or €150/yr single tier; 14-day trial
//   * €12/mo grandfathered founder rate for waitlist signups
//   * Cross-platform sim AND real, hand-curated written rules
//
// Test contract for T209 locks:
//   * Page renders, single <main>, BaseLayout integration
//   * Title + description name "public beta" / "launch" for
//     SERP signal during launch week
//   * Hero is a labelled landmark with H1 + primary CTA
//   * Three labelled sections: what-ships, what's-next,
//     pricing-reminder
//   * Critical dates: 2026-07-23 + 2026-09-23 both present
//   * Critical pricing: €15 + €12 + 14-day trial
//   * Doctrine vocab discipline (ADR-004 asymmetric)
//   * No client islands (perf carry-over)

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Launch from '../pages/launch.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(Launch));

const SOURCE_PATH = join(process.cwd(), 'src', 'pages', 'launch.astro');
const loadSource = (): string => readFileSync(SOURCE_PATH, 'utf8');

describe('T209: /launch shell renders', () => {
  test('renders a single <main> landmark', async () => {
    const html = await render();
    const mainMatches = html.match(/<main[\s>]/g) ?? [];
    expect(mainMatches.length).toBe(1);
  });

  test('renders an <h1>', async () => {
    const html = await render();
    expect(html).toMatch(/<h1[\s>]/i);
  });

  test('h1 names "public beta" or "launch"', async () => {
    const html = await render();
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    expect(h1Match).not.toBeNull();
    expect(h1Match![1].toLowerCase()).toMatch(/public beta|launch/);
  });
});

describe('T209: BaseLayout integration', () => {
  test('title includes "LAP" branding', async () => {
    const html = await render();
    expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
  });

  test('title includes "public beta" or "launch" for SERP', async () => {
    const html = await render();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1].toLowerCase()).toMatch(/public beta|launch/);
  });

  test('meta description names public beta + launch date', async () => {
    const html = await render();
    const descMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]+)"/,
    );
    expect(descMatch).not.toBeNull();
    expect(descMatch![1].toLowerCase()).toMatch(/public beta|launch/);
    expect(descMatch![1]).toMatch(/2026-07-23|July 23/);
  });
});

describe('T209: hero (labelled landmark + primary CTA)', () => {
  test('hero is wrapped in a region with aria-labelledby pointing at H1', async () => {
    const html = await render();
    const ariaLabelledByMatch = html.match(
      /<(?:section|header)[^>]+aria-labelledby="([^"]+)"/,
    );
    expect(ariaLabelledByMatch).not.toBeNull();
    const labelId = ariaLabelledByMatch![1];
    expect(html).toMatch(new RegExp(`<h1[^>]+id="${labelId}"`));
  });

  test('hero has a primary CTA — link to /waitlist or signup endpoint', async () => {
    // Pre-launch and during launch the strongest action is
    // join the waitlist (grandfathered €12/mo) or go to the
    // app signup (live during launch). Lock at least one
    // such CTA in the hero region.
    const html = await render();
    const heroMatch = html.match(
      /<(?:section|header)[^>]+aria-labelledby="[^"]+"[\s\S]*?<\/(?:section|header)>/,
    );
    expect(heroMatch, 'hero region must be findable').not.toBeNull();
    expect(heroMatch![0]).toMatch(
      /href="(?:\/waitlist[^"]*|\/[^"]*|\/pricing[^"]*)"/,
    );
  });
});

describe('T209: critical dates', () => {
  test('mentions public-beta launch date 2026-07-23', async () => {
    const html = await render();
    expect(html).toMatch(/2026-07-23|July 23,?\s*2026|23 July 2026/);
  });

  test('mentions V1 release date 2026-09-23', async () => {
    const html = await render();
    expect(html).toMatch(
      /2026-09-23|September 23,?\s*2026|23 September 2026/,
    );
  });
});

describe('T209: critical pricing facts', () => {
  test('mentions €15 consumer tier', async () => {
    const html = await render();
    expect(html).toMatch(/€15/);
  });

  test('mentions 14-day free trial', async () => {
    const html = await render();
    expect(html.toLowerCase()).toMatch(/14[- ]day/);
  });

  test('mentions €12 grandfathered founder rate (waitlist incentive)', async () => {
    // Doctrine §8: pre-launch waitlist signups are
    // grandfathered at €12/mo for 12 months. The launch
    // page must surface this so a visitor in the pre-
    // launch window has the incentive to join the waitlist
    // BEFORE public beta opens (after which the founder
    // rate is closed).
    const html = await render();
    expect(html).toMatch(/€12/);
  });
});

describe('T209: what-ships + what-next sections', () => {
  test('page has at least three aria-labelled sections (hero + ≥2 body)', async () => {
    const html = await render();
    const labelledRegions = [
      ...html.matchAll(/<(?:section|header)[^>]+aria-labelledby="/g),
    ];
    expect(
      labelledRegions.length,
      `page must have ≥3 labelled regions (hero + what-ships + what-next); got ${labelledRegions.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('mentions cross-platform framing', async () => {
    const html = await render();
    expect(html.toLowerCase()).toMatch(/cross[- ]platform/);
  });

  test('mentions both sim and real-world racing', async () => {
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).toMatch(/\bsim\b|\bsimulator\b/);
    expect(lower).toMatch(
      /\breal[- ]world|real[- ]track|on[- ]track|on track\b/,
    );
  });

  test('V1 section names ≥1 specific upcoming addition (Android / watch / coaching library)', async () => {
    // Doctrine §9 V1 = Android app + Apple Watch/WearOS +
    // coaching library v1 + endurance events. Lock at
    // least one specific upcoming feature so the V1 mention
    // is concrete, not generic "more features coming."
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).toMatch(
      /\bandroid\b|\bapple watch\b|\bwearos\b|\bwear os\b|\bcoaching library\b|\bendurance\b/,
    );
  });
});

describe('T209: doctrine-aligned copy (ADR-004 carry-over)', () => {
  test('no AI-coach / LLM / generative / neural / realistic vocab', async () => {
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });

  test('no fabricated press quotes (no <blockquote> with named attribution)', async () => {
    const html = await render();
    const blockquotes = html.match(/<blockquote[\s\S]*?<\/blockquote>/g) ?? [];
    for (const bq of blockquotes) {
      expect(
        bq,
        `launch page contains blockquote with attribution dash — fabricated quote: ${bq}`,
      ).not.toMatch(/[—–][\s]+[A-Z][a-zA-Z]+/);
    }
  });
});

describe('T209: navigation + performance carry-over', () => {
  test('source has no Astro client:* directives', () => {
    const src = loadSource();
    const matches =
      src.match(/\sclient:(load|idle|visible|only|media)\b/g) ?? [];
    expect(matches.length).toBe(0);
  });

  test('navigation: at least one footer link to /pricing or /how-it-works', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/(?:pricing|how-it-works|waitlist|blog)"/);
  });
});
