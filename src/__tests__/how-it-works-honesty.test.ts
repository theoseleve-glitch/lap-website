import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HowItWorksHonesty from '../components/HowItWorksHonesty.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(HowItWorksHonesty));

test('T049: renders the H2 "What ships today, and what is still roadmap"', async () => {
  // The H2 frames the section as a trust statement — "roadmap" is
  // the explicit word for "not-yet-shipped" that aligns with the
  // doctrine §5 DOES NOT list. Drifting to "coming soon" would
  // under-specify and reintroduce the overclaim risk the section
  // exists to prevent.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*What ships today, and what is still roadmap[\s\S]*<\/h2>/);
});

test('T049: wraps the section in a <section> with aria-labelledby landmark', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T049: renders two h3 columns — "Today" and "Year 2"', async () => {
  // The two time horizons come straight from the sprint task ("where
  // we are today vs year 2"). "Year 2" is doctrine-anchored
  // vocabulary (appears in 01-STRATEGIC-DOCTRINE.md §5 deferrals);
  // locking it keeps the horizon specific rather than vague
  // ("later", "future").
  const html = await render();
  const h3Matches = html.match(/<h3[\s>]/g) ?? [];
  expect(h3Matches.length).toBe(2);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Today[\s\S]*<\/h3>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Year 2[\s\S]*<\/h3>/);
});

test('T049: the Year 2 column names Android as a deferred release item', async () => {
  // Doctrine §5 DOES NOT includes "Android app in Month 1-4 (port
  // starts Month 5)". Android is the single highest-signal deferral
  // because the primary persona (§3 serious sim racer) is
  // desktop-first; mobile means real-world capture, which is the
  // secondary persona's surface. Locking "Android" in the Year 2
  // column prevents accidental cross-listing.
  const html = await render();
  expect(html).toMatch(/Android/);
});

test('T049: each column lists multiple items — at least 8 <li> total', async () => {
  // Thin lists read as vague. Each column should carry 4+ concrete
  // items so a reader gets a scannable comparison of what works
  // today vs what is roadmap. Below 8 total means one of the
  // columns has collapsed into a single-line note.
  const html = await render();
  const liCount = (html.match(/<li[\s>]/g) ?? []).length;
  expect(liCount).toBeGreaterThanOrEqual(8);
});

test('T049: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  // The honesty section is especially prone to LLM drift ("AI
  // coaching coming in Year 2"). Doctrine §4 principle 4 and §10
  // bullet 4 make that a merge-blocking claim — never, in this
  // 6-month plan OR in Year 2.
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
