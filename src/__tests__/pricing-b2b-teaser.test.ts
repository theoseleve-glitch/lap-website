import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import PricingB2bTeaser from '../components/PricingB2bTeaser.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(PricingB2bTeaser));

test('T062: renders the H2 "Running a racing academy?" verbatim', async () => {
  // Sprint T062 quotes this question directly. Phrasing is
  // audience-specific — "racing academy" names the persona
  // (karting academy operators, driving-school admins) in two
  // words, so a visitor self-qualifies before reading past the
  // heading.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Running a racing academy\?[\s\S]*<\/h2>/);
});

test('T062: wraps the section in a <section> with aria-labelledby landmark', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T062: renders a "Talk to us" CTA linked to /for-schools', async () => {
  // Sprint brief: "inline CTA to /for-schools". /for-schools ships
  // in T201 (Block J); linking to it today means the route will
  // 404 until T201 lands — same temporary-forward-link pattern as
  // T034's /pricing reference before T057 fixed it. Route locked
  // at the HTML surface so T201 has a concrete target contract
  // to satisfy.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/for-schools"[^>]*>[\s\S]*Talk to us[\s\S]*<\/a>/);
});

test('T062: names the B2B audience (schools / academies, plural)', async () => {
  // Doctrine §8 B2B scope: "racing schools, karting academies".
  // Lock the plural noun(s) so the teaser stays positioned at
  // operations that buy for multiple drivers, not individual
  // coaches who already fit the €15 tier.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/schools|academies/);
});

test('T062: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
