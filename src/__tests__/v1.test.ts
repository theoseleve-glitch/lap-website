// T210 — V1 release landing page at /v1.
//
// Companion to T209's /launch (public-beta page on
// 2026-07-23). V1 release ships 2026-09-23 = end Month 5
// = Doctrine §9 launch moment. Sprint task qualifier is
// "renders later" — the page exists in source today and
// ships in the static build, but is not featured on the
// homepage until V1 launch week. Today is Month 1
// (2026-04-26); V1 is ~5 months out.
//
// Differentiation from /launch:
//   * /launch describes what arrives WITH public beta on
//     2026-07-23 (Driver OS v1 web, sim↔real bridge MVP,
//     Stripe live, hand-curated coaching).
//   * /v1 describes what V1 ADDS over public beta on
//     2026-09-23 — Android app, Apple Watch / WearOS
//     companion, coaching library v1 (≥100 rules),
//     endurance events.
//
// Tests lock the four V1-specific additions plus the
// usual carry-overs (BaseLayout, doctrine vocab, no
// fabricated quotes, no client islands).

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import V1 from '../pages/v1.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(V1));

const SOURCE_PATH = join(process.cwd(), 'src', 'pages', 'v1.astro');
const loadSource = (): string => readFileSync(SOURCE_PATH, 'utf8');

describe('T210: /v1 shell renders', () => {
  test('renders a single <main> landmark', async () => {
    const html = await render();
    const mainMatches = html.match(/<main[\s>]/g) ?? [];
    expect(mainMatches.length).toBe(1);
  });

  test('renders an <h1>', async () => {
    const html = await render();
    expect(html).toMatch(/<h1[\s>]/i);
  });

  test('h1 names "V1" or "release"', async () => {
    const html = await render();
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    expect(h1Match).not.toBeNull();
    expect(h1Match![1].toLowerCase()).toMatch(/\bv1\b|release/);
  });
});

describe('T210: BaseLayout integration', () => {
  test('title includes "LAP" branding', async () => {
    const html = await render();
    expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
  });

  test('title includes "V1" for SERP', async () => {
    const html = await render();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1].toLowerCase()).toMatch(/\bv1\b/);
  });

  test('meta description names V1 + release date 2026-09-23', async () => {
    const html = await render();
    const descMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]+)"/,
    );
    expect(descMatch).not.toBeNull();
    expect(descMatch![1].toLowerCase()).toMatch(/\bv1\b|release/);
    expect(descMatch![1]).toMatch(/2026-09-23|September 23/);
  });
});

describe('T210: hero (labelled landmark)', () => {
  test('hero is wrapped in a region with aria-labelledby pointing at H1', async () => {
    const html = await render();
    const ariaLabelledByMatch = html.match(
      /<(?:section|header)[^>]+aria-labelledby="([^"]+)"/,
    );
    expect(ariaLabelledByMatch).not.toBeNull();
    const labelId = ariaLabelledByMatch![1];
    expect(html).toMatch(new RegExp(`<h1[^>]+id="${labelId}"`));
  });

  test('page has a primary CTA (waitlist, signup, or pricing link)', async () => {
    const html = await render();
    expect(html).toMatch(
      /href="(?:\/waitlist[^"]*|https:\/\/app\.lap-coach\.racing\/[^"]*|\/pricing[^"]*)"/,
    );
  });
});

describe('T210: V1 release date', () => {
  test('mentions V1 release date 2026-09-23', async () => {
    const html = await render();
    expect(html).toMatch(
      /2026-09-23|September 23,?\s*2026|23 September 2026/,
    );
  });

  test('references the public-beta date 2026-07-23 as precursor', async () => {
    // V1 follows public beta; the page should reference
    // public beta as context so a visitor reading /v1
    // before September 2026 sees the timeline cleanly.
    const html = await render();
    expect(html).toMatch(/2026-07-23|July 23,?\s*2026|23 July 2026/);
  });
});

describe('T210: V1 deliverables (Doctrine §9)', () => {
  test('mentions Android app', async () => {
    const html = await render();
    expect(html.toLowerCase()).toMatch(/\bandroid\b/);
  });

  test('mentions Apple Watch or WearOS companion', async () => {
    const html = await render();
    expect(html.toLowerCase()).toMatch(
      /\bapple watch\b|\bwearos\b|\bwear os\b/,
    );
  });

  test('mentions coaching library v1 (≥100 rules)', async () => {
    // Doctrine §9 V1 deliverable: "coaching library v1 (100+
    // rules)". Lock both the library noun and the count
    // anchor so the page can't drift to vague "more coaching
    // rules coming."
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).toMatch(/\bcoaching library\b/);
    expect(lower).toMatch(/\b(?:100|one hundred)\b|\b\d{3,}\b/);
  });

  test('mentions endurance events', async () => {
    const html = await render();
    expect(html.toLowerCase()).toMatch(/\bendurance\b/);
  });
});

describe('T210: doctrine framing carry-over', () => {
  test('uses the cross-platform framing', async () => {
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

  test('mentions €15 consumer pricing carry-over', async () => {
    const html = await render();
    expect(html).toMatch(/€15/);
  });
});

describe('T210: ADR-004 vocab + anti-fabrication', () => {
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
        `V1 page contains blockquote with attribution dash — fabricated quote: ${bq}`,
      ).not.toMatch(/[—–][\s]+[A-Z][a-zA-Z]+/);
    }
  });
});

describe('T210: navigation + performance carry-over', () => {
  test('source has no Astro client:* directives', () => {
    const src = loadSource();
    const matches =
      src.match(/\sclient:(load|idle|visible|only|media)\b/g) ?? [];
    expect(matches.length).toBe(0);
  });

  test('navigation: at least one link to /pricing or /how-it-works', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/(?:pricing|how-it-works|waitlist|blog)"/);
  });
});
