// T076 (retargeted for the June-8 rebuild) — the old "Try it with a
// real session" bridge CTA (upload your own .ibt / open a Sebring
// sample / "no sign-up required" → /register?...&source=demo) was a
// pre-launch interactive offer that the new one-membership model
// removed. `TrySampleCta.astro` is now an orphaned component (imported
// by nothing) and `/demo` is a lean static page that no longer mounts
// it.
//
// This file now guards the thing that actually ships: the rebuilt
// /demo page. The verification intent is preserved — an <h1>, the
// canonical trial CTA (Start 30-day free trial → /register) with the
// correct rel, the page's key sections, the pricing figures, the a11y
// landmark, the SEO title/description, and ADR-004 vocab discipline —
// just retargeted to the new source and copy.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Demo from '../pages/demo.astro';
import { MEMBERSHIP } from '../data/membership';

const renderDemoPage = (): Promise<string> =>
  AstroContainer.create().then((c) => c.renderToString(Demo));

describe('/demo: page contract', () => {
  test('renders an <h1>', async () => {
    const html = await renderDemoPage();
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    expect(h1Match).toBeTruthy();
    expect(h1Match![1].trim().length).toBeGreaterThan(0);
  });

  test('h1 carries the "see it before you sign up" framing', async () => {
    const html = await renderDemoPage();
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    expect(h1Match).toBeTruthy();
    expect(h1Match![1].toLowerCase()).toMatch(/before you sign up/);
  });

  test('exposes the <main> landmark', async () => {
    const html = await renderDemoPage();
    expect(html).toMatch(/<main[\s>]/);
  });

  test('SEO title + description are present', async () => {
    const html = await renderDemoPage();
    expect(html).toMatch(/<title>[^<]*demo[^<]*<\/title>/i);
    expect(html).toMatch(/<meta\s+name=["']description["']\s+content=["'][^"']+["']/);
  });
});

describe('/demo: trial CTA (new one-membership model)', () => {
  test('primary CTA links to /register', async () => {
    const html = await renderDemoPage();
    expect(MEMBERSHIP.ctaHref).toBe('/register');
    expect(html).toMatch(/href=["']\/register["']/);
  });

  test('CTA uses the canonical "Start 30-day free trial" copy', async () => {
    const html = await renderDemoPage();
    expect(MEMBERSHIP.ctaText).toBe('Start 30-day free trial');
    expect(html).toContain(MEMBERSHIP.ctaText);
  });

  test('the /register CTA carries rel="noopener"', async () => {
    const html = await renderDemoPage();
    // Match every anchor that targets /register and assert each one
    // is rel-safe (header chip + in-page CTA both go to /register).
    const anchors = html.match(/<a\s[^>]*href=["']\/register["'][^>]*>/g);
    expect(anchors).toBeTruthy();
    for (const a of anchors!) {
      expect(a).toMatch(/\brel=["']noopener["']/);
    }
  });

  test('states the 30-day free trial with no card charged until it ends', async () => {
    const html = await renderDemoPage();
    // Collapse whitespace: the body copy wraps "no card charged" /
    // "until it ends" across a source line break, so assert on the
    // normalized text rather than the literal newline-laden string.
    const lower = html.toLowerCase().replace(/\s+/g, ' ');
    expect(lower).toMatch(/30-day free trial/);
    expect(lower).toMatch(/no card charged until it ends/);
  });
});

describe('/demo: pricing figures present (one-membership canon)', () => {
  test('shows €19.90 standard and €14.90 founding monthly', async () => {
    const html = await renderDemoPage();
    expect(html).toContain(MEMBERSHIP.standardMonthly); // €19.90
    expect(html).toContain(MEMBERSHIP.foundingMonthly); // €14.90
  });

  test('names the founding-50 limit and the EUR/cancel-anytime note', async () => {
    const html = await renderDemoPage();
    expect(html).toContain(String(MEMBERSHIP.foundingLimit)); // 50
    expect(html).toContain(MEMBERSHIP.currencyNote); // billed in EUR · cancel anytime
  });
});

describe('/demo: key sections render', () => {
  test('reserves the walkthrough video slot', async () => {
    const html = await renderDemoPage();
    expect(html).toMatch(/<h2[^>]*>[\s\S]*?walkthrough[\s\S]*?<\/h2>/i);
  });

  test('shows the "what it looks like" preview section', async () => {
    const html = await renderDemoPage();
    expect(html).toMatch(/<h2[^>]*>[\s\S]*?what it looks like[\s\S]*?<\/h2>/i);
  });

  test('closes with the trial CTA section', async () => {
    const html = await renderDemoPage();
    expect(html).toMatch(/<h2[^>]*>[\s\S]*?ready to coach[\s\S]*?<\/h2>/i);
  });
});

describe('/demo: ADR-004 vocab discipline', () => {
  test('no bare "AI coach" / "LLM" / "generative" / "neural" / "realistic"', async () => {
    const html = await renderDemoPage();
    const lower = html.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });
});
