import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Home from '../pages/index.astro';
import { MEMBERSHIP } from '../data/membership';

const render = () => AstroContainer.create().then((c) => c.renderToString(Home));

// --- Doctrine-locked copy ---------------------------------------------------

test('homepage carries the June-8 position headline verbatim', async () => {
  const html = await render();
  // The home <h1> states the brand position. Rule-based coaching, not timing.
  expect(html).toContain('They time laps. We coach drivers.');
});

test('forbids retired headline / pricing figures', async () => {
  const html = await render();
  // Old V2 headline and the dropped €15 / €150 / 14-day figures must be gone.
  expect(html).not.toContain('The Driver OS — Train. Race. Improve.');
  expect(html).not.toContain('€15');
  expect(html).not.toContain('€150');
  expect(html).not.toContain('14-day');
});

test('font-monument H1 is present', async () => {
  const html = await render();
  expect(html).toMatch(/<h1[^>]*class="[^"]*font-monument[^"]*"/);
});

test('hero subhead pitches every session becoming an executable plan', async () => {
  const html = await render();
  expect(html).toContain('Every sim and real session becomes a plan you can execute');
});

test('forbids AI / LLM / generative vocabulary (ADR-004 §4)', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

// --- CTAs -------------------------------------------------------------------

test('primary CTA links to /register with rel=noopener and the trial label', async () => {
  const html = await render();
  expect(MEMBERSHIP.ctaHref).toBe('/register');
  expect(MEMBERSHIP.ctaText).toBe('Start 30-day free trial');
  expect(html).toMatch(/<a[^>]+href="\/register"[^>]+rel="noopener"/);
  expect(html).toContain(MEMBERSHIP.ctaText);
});

test('secondary CTA links to /how-it-works with the "See how it works" label', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/how-it-works"[\s\S]*?See how it works/);
});

// --- New 8-section structure ------------------------------------------------

test('homepage flows through the new static sections in order', async () => {
  const html = await render();
  // Section kickers / headings in the canonical design order. No rooms, no
  // data-sector-id, no MarqueeStrip — those concepts were removed in the rebuild.
  const order = [
    'The cross-platform Driver OS', // 1 · hero kicker
    'From session to plan, in four steps', // 2 · value strip
    'After every session', // 3 · session proof
    'The problem', // 4 · ecosystem split
    'Our position', // 5 · they time laps / we coach drivers
    'The loop', // 6 · the loop
    'One membership', // 7 · pricing teaser
    'From the team', // 8 · founder / beta + CTA
  ];
  let cursor = 0;
  for (const marker of order) {
    const idx = html.indexOf(marker, cursor);
    expect(idx, `expected "${marker}" at or after offset ${cursor}`).toBeGreaterThan(-1);
    cursor = idx + marker.length;
  }
});

test('no removed concepts leak into the markup', async () => {
  const html = await render();
  expect(html).not.toMatch(/data-sector-id=/);
  expect(html).not.toContain('01 / START GRID');
  expect(html).not.toContain('CORNER COACHING'); // old MarqueeStrip keyword
  expect(html).not.toMatch(/For schools/i);
});

// --- Membership pricing teaser ----------------------------------------------

test('pricing teaser shows the single-membership figures', async () => {
  const html = await render();
  expect(html).toContain(MEMBERSHIP.standardMonthly); // €19.90
  expect(html).toContain(MEMBERSHIP.foundingMonthly); // €14.90
  expect(html).toContain(`first ${MEMBERSHIP.foundingLimit} founding members`);
  expect(html).toContain(`${MEMBERSHIP.trialDays}-day free trial`);
  expect(html).toContain('See full pricing');
  expect(html).toMatch(/<a[^>]+href="\/pricing"/);
});

test('trial terms make clear no card is charged until it ends, cancel anytime', async () => {
  const html = await render();
  expect(html).toContain('no card');
  expect(html).toContain('cancel');
});

// --- SEO + a11y -------------------------------------------------------------

test('document carries an SEO title and meta description', async () => {
  const html = await render();
  expect(html).toContain('<title>LAP — coaching for every lap</title>');
  expect(html).toMatch(/<meta name="description" content="[^"]+"/);
});

test('a11y landmarks: skip-target main present', async () => {
  const html = await render();
  expect(html).toMatch(/<main[^>]*id="main-content"/);
});
