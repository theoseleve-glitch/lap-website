// T201 — /for-schools landing page shell.
//
// Doctrine context: 01-STRATEGIC-DOCTRINE.md §6 + §8 frames B2B
// (racing schools, karting academies) as "door open, outbound
// starts only in Month 5." Today is Month 1 (2026-04-26). The
// landing page is the inbound surface — the destination of the
// T062 PricingB2bTeaser link, currently 404. T201 ships the
// shell that makes the link resolve; T202-T206 progressively
// fill the hero + value-prop + form + pricing-anchor + social-
// proof slots.
//
// Test contract for T201 locks:
//   * Page renders, single <main>, BaseLayout integration
//   * H1 + title + description position the page for the right
//     audience (racing schools AND karting academies — both
//     plural noun phrases per doctrine §8)
//   * Inbound posture (mailto:sales@lap-coach.racing — same
//     T066 pattern; T204 replaces with form). No outbound
//     pitch tone since outbound campaign starts Month 5.
//   * Doctrine prohibitions — no AI-coach / LLM / generative
//     / neural / realistic vocab (ADR-004)
//   * No committed price (T205 owns the "from €X/seat/mo,
//     contact us" anchor; before that the shell must not
//     leak a number)
//   * No fake social proof ("X academies trust us") since
//     there are no customers yet (T184 baseline)
//   * No-orphan navigation: at least one link to /pricing
//   * Performance carry-over: no client:* directives

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ForSchools from '../pages/for-schools.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(ForSchools));

const SOURCE_PATH = join(
  process.cwd(),
  'src',
  'pages',
  'for-schools.astro',
);
const loadSource = (): string => readFileSync(SOURCE_PATH, 'utf8');

describe('T201: /for-schools shell renders', () => {
  test('renders a single <main> landmark', async () => {
    const html = await render();
    const mainMatches = html.match(/<main[\s>]/g) ?? [];
    expect(mainMatches.length).toBe(1);
  });

  test('renders an <h1>', async () => {
    const html = await render();
    expect(html).toMatch(/<h1[\s>]/i);
  });

  test('h1 names the audience (schools or academies)', async () => {
    const html = await render();
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    expect(h1Match).not.toBeNull();
    expect(h1Match![1].toLowerCase()).toMatch(/schools|academies/);
  });
});

describe('T201: BaseLayout integration', () => {
  test('title includes "LAP" branding (BaseLayout integration)', async () => {
    // Pattern matches /demo, /pricing, /how-it-works titles.
    // Locking "LAP" here catches accidental BaseLayout-bypass.
    const html = await render();
    expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
  });

  test('title positions the page for B2B audience (schools/academies)', async () => {
    // SERP click signal — the title must contain a noun the
    // B2B audience self-identifies as. Doctrine §6 names the
    // two segments: "racing schools, karting academies."
    const html = await render();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1].toLowerCase()).toMatch(/schools|academies/);
  });

  test('meta description names racing schools', async () => {
    const html = await render();
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    expect(descMatch).not.toBeNull();
    expect(descMatch![1].toLowerCase()).toMatch(/racing schools?/);
  });

  test('meta description names karting academies', async () => {
    const html = await render();
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    expect(descMatch).not.toBeNull();
    expect(descMatch![1].toLowerCase()).toMatch(/karting academ(?:y|ies)/);
  });
});

describe('T201: inbound contact route (T066 mailto pattern reuse)', () => {
  test('exposes a mailto link to sales@lap-coach.racing', async () => {
    // T204 will introduce a real form posting to Resend → the
    // same sales@lap-coach.racing inbox. Until then the shell
    // ships the same mailto pattern as T066 on /pricing — same
    // inbox, zero external dependency, rich inbound signal.
    const html = await render();
    expect(html).toMatch(
      /<a[^>]+href="mailto:sales@lap-coach\.racing[^"]*"/,
    );
  });
});

describe('T201: doctrine-aligned copy (ADR-004 + anti-overclaim)', () => {
  test('no AI-coach / LLM / generative / neural / realistic vocab', async () => {
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });

  test('no committed price number — T205 owns the pricing anchor', async () => {
    // Before T205 lands the "from €X/seat/mo, contact us" anchor,
    // the shell must not leak a euro amount. Locks the discipline
    // that pricing lives in exactly one place.
    const html = await render();
    // The mailto subject can include URL-encoded chars but should
    // not contain a € price token. Strip <head> to focus on body
    // content where the visible copy lives.
    const bodyMatch = html.match(/<body[\s\S]*<\/body>/i);
    expect(bodyMatch).not.toBeNull();
    expect(bodyMatch![0]).not.toMatch(/€\s*\d+/);
  });

  test('no fake social proof ("X academies trust us" / "X schools use")', async () => {
    // T184 baseline: no paying customers, no public beta yet.
    // Any "trusted by N schools" claim would be untrue. Lock
    // common templates so they cannot drift in.
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).not.toMatch(/\btrusted by\s+\d+/);
    expect(lower).not.toMatch(/\bused by\s+\d+/);
    expect(lower).not.toMatch(/\bjoin\s+\d+\s+(schools|academies|teams)\b/);
  });
});

describe('T201: navigation + responsive carry-over', () => {
  test('links to /pricing (no dead-end)', async () => {
    // /demo precedent: footer carries /how-it-works + /pricing
    // links. Lock at least /pricing so the inbound visitor has
    // a path to the price anchor and consumer-tier context.
    const html = await render();
    expect(html).toMatch(/href="\/pricing"/);
  });

  test('article body uses max-w-prose responsive constraint', async () => {
    // T199 a11y carry-over: long-form prose on wide displays
    // needs a max-width cap.
    const html = await render();
    expect(html).toMatch(/max-w-prose/);
  });
});

describe('T201: performance carry-over (T200)', () => {
  test('source has no Astro client:* directives', () => {
    // Pure-static delivery; zero hydration JS for the inbound
    // landing page.
    const src = loadSource();
    const matches = src.match(/\sclient:(load|idle|visible|only|media)\b/g) ?? [];
    expect(matches.length).toBe(0);
  });
});
