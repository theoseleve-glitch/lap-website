// T130 — /product/ios coming-soon page contract. Closes Block G
// of the marketing sprint.
//
// The page exists for one reason: an iOS-only racer searching
// "LAP iOS app" or "racing iPhone app" should land on a clear
// "coming with V1" surface with a waitlist CTA, instead of either
// (a) finding /product/mobile and parsing the Android-first
// disclosure, or (b) finding nothing and bouncing.
//
// Doctrine §9 timeline anchors this page: iOS lands at V1 release
// (M5 / 2026-09-23), not at public beta (M3 / 2026-07-23). Same
// timing the /product/mobile iOS section already discloses; this
// is the dedicated SEO landing surface for that disclosure.
//
// Page is indexable (not noindex) — exists to serve inbound iOS-
// search traffic. Once iOS ships at V1, this page either becomes
// the actual iOS pillar page or 301-redirects to it; until then
// the indexable coming-soon page is the right answer.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import IOS from '../pages/product/ios.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(IOS));

test('T130: /product/ios renders a single <main> landmark', async () => {
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T130: H1 names iOS or iPhone (the platform anchor)', async () => {
  const html = await render();
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  expect(h1Match).not.toBeNull();
  const h1 = h1Match![1].toLowerCase();
  expect(h1).toMatch(/(ios|iphone)/);
});

test('T130: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T130: page is indexable (no noindex meta — this is search-landing surface)', async () => {
  // Coming-soon page exists to serve inbound iOS-search traffic.
  // noindex would defeat the entire purpose. Locking the absence
  // catches a future copy-paste-from-/waitlist/welcome that
  // accidentally inherits the wrong robots posture.
  const html = await render();
  expect(html).not.toMatch(/<meta name="robots"[^>]*noindex/i);
});

test('T130: page names the V1 release timing (V1 / September / 2026)', async () => {
  // Doctrine §9: iOS lands at V1 release M5 / 2026-09-23.
  // Ambiguity here ("coming soon!" with no date) reads as vapor.
  // Lock at least one anchor: V1, September 2026, or 2026-09.
  const html = await render();
  expect(html).toMatch(/(V1|September 2026|2026-09|M5|V1 release)/);
});

test('T130: page acknowledges public beta is Android-first (anti-overclaim lock)', async () => {
  // Without naming Android, an iOS reader could come away thinking
  // the public beta is also iOS-then-Android — overclaim. Naming
  // Android explicitly tells the reader where the platform sequence
  // actually is, mirroring the /product/mobile disclosure.
  const html = await render();
  expect(html).toMatch(/Android/i);
});

test('T130: page has a waitlist CTA (links to /waitlist)', async () => {
  // Sprint task deliverable — "renders with waitlist CTA". The
  // CTA is the only call-to-action on a coming-soon page; without
  // it the page is a dead-end ("LAP for iPhone is coming soon"
  // and nothing else for the visitor to do).
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/waitlist"/);
});

test('T130: page links to /product/mobile (cross-platform context)', async () => {
  // The Android app is what iOS racers are looking at while they
  // wait. Linking to /product/mobile lets them preview the actual
  // shipping product surface — same shape, different platform.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/product\/mobile"/);
});

test('T130: page has a back-link to the /product overview', async () => {
  // Same back-link convention as the five pillar pages.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/product"(?![\w-])/);
});

test('T130: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T130: heading hierarchy is well-formed (single h1, h2 sections only)', async () => {
  // Same a11y discipline as T125's audit. /product/ios is the
  // 7th product page and was not in T125's PAGES list, so this
  // test brings it under the same structural contract.
  const html = await render();
  const headings = [...html.matchAll(/<h([1-6])(?=[\s>])/gi)].map((m) => parseInt(m[1], 10));
  expect(headings.filter((l) => l === 1)).toHaveLength(1);
  let lastLevel = 0;
  for (const level of headings) {
    if (lastLevel === 0) {
      expect(level).toBe(1);
    } else {
      expect(level).toBeLessThanOrEqual(lastLevel + 1);
    }
    lastLevel = level;
  }
});

test('T130: title length is 35-70 chars (SERP band, parallel to T126 contract)', async () => {
  const html = await render();
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : '';
  expect(title.length).toBeGreaterThanOrEqual(35);
  expect(title.length).toBeLessThanOrEqual(70);
});

test('T130: description length is 120-180 chars (SERP band, parallel to T126 contract)', async () => {
  const html = await render();
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
  const desc = descMatch ? descMatch[1] : '';
  expect(desc.length).toBeGreaterThanOrEqual(120);
  expect(desc.length).toBeLessThanOrEqual(180);
});
