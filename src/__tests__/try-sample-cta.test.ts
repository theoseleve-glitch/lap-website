// T076 — "Try it with a real session" CTA on /demo. Bridges the
// gap between the 3-minute walkthrough video (T074, BLOCKED on
// real product UI) and the full T085 trial CTA with a lower-
// friction interactive offer: visitor either uploads their own
// iRacing .ibt file or opens our prewired Sebring sample at
// app.lap-coach.racing/sample (T077 data fixture, also pending).
//
// The site-side CTA ships now. The destination 404s pre-launch
// — same posture as T085's /signup destination — and becomes
// live alongside public-beta launch on 2026-07-23.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import TrySampleCta from '../components/TrySampleCta.astro';
import Demo from '../pages/demo.astro';

const renderComponent = (): Promise<string> =>
  AstroContainer.create().then((c) => c.renderToString(TrySampleCta));
const renderDemoPage = (): Promise<string> =>
  AstroContainer.create().then((c) => c.renderToString(Demo));

describe('T076: TrySampleCta component contract', () => {
  test('renders a labelled <section> with aria-labelledby pointing at an H2', async () => {
    const html = await renderComponent();
    const sectionMatch = html.match(/<section[^>]+aria-labelledby=["']([^"']+)["']/);
    expect(sectionMatch).toBeTruthy();
    const headingId = sectionMatch![1];
    expect(html).toMatch(
      new RegExp(`<h2[^>]+id=["']${headingId}["'][^>]*>`),
    );
  });

  test('H2 names "real session" framing', async () => {
    const html = await renderComponent();
    const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    expect(h2Match).toBeTruthy();
    expect(h2Match![1].toLowerCase()).toMatch(/real session/);
  });

  test('CTA href is the canonical sample path on app.lap-coach.racing', async () => {
    const html = await renderComponent();
    expect(html).toMatch(
      /href=["']https:\/\/app\.lap-coach\.racing\/sample["']/,
    );
  });

  test('CTA carries rel="noopener" (cross-origin link safety)', async () => {
    const html = await renderComponent();
    const ctaMatch = html.match(
      /<a\s+[^>]*href=["']https:\/\/app\.lap-coach\.racing\/sample["'][^>]*>/,
    );
    expect(ctaMatch).toBeTruthy();
    expect(ctaMatch![0]).toMatch(/\brel=["']noopener["']/);
  });

  test('mentions both upload paths (iRacing/.ibt) and sample option', async () => {
    // Two paths in the deliverable: "upload .ibt or use sample".
    // Lock both in the body copy so a future edit can't quietly
    // drop one path.
    const html = await renderComponent();
    const lower = html.toLowerCase();
    expect(lower).toMatch(/\bibt\b|iracing/);
    expect(lower).toMatch(/\bsample\b/);
  });

  test('locks "no sign-up required" friction-free framing', async () => {
    // Mirrors the same anchor used in /demo's hero subhead — the
    // lower-friction promise is what makes this CTA distinct from
    // T085's "Start 14-day trial".
    const html = await renderComponent();
    expect(html.toLowerCase()).toMatch(/no sign[- ]?up/);
  });
});

describe('T076: ADR-004 vocab discipline', () => {
  test('no bare "AI coach" / "LLM" / "generative" / "neural" / "realistic"', async () => {
    const html = await renderComponent();
    const lower = html.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });
});

describe('T076: TrySampleCta is mounted on /demo', () => {
  test('/demo renders the TrySampleCta H2', async () => {
    const html = await renderDemoPage();
    expect(html).toMatch(/<h2[^>]*>[\s\S]*real session[\s\S]*<\/h2>/i);
  });

  test('/demo includes the canonical sample-path link', async () => {
    const html = await renderDemoPage();
    expect(html).toMatch(
      /href=["']https:\/\/app\.lap-coach\.racing\/sample["']/,
    );
  });

  test('/demo retains both existing H2s (walkthrough + testimonials)', async () => {
    // Regression guard: T076 inserts a third H2 between
    // walkthrough and testimonials. Lock the two pre-existing
    // H2s stay rendered so T090 e2e + T086 testimonial mount
    // don't silently break.
    const html = await renderDemoPage();
    expect(html).toMatch(
      /<h2[^>]*>[\s\S]*three-minute walkthrough[\s\S]*<\/h2>/i,
    );
    expect(html).toMatch(
      /<h2[^>]*>[\s\S]*No testimonials until the beta opens[\s\S]*<\/h2>/,
    );
  });
});
