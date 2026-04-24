import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import DemoWalkthrough from '../components/DemoWalkthrough.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(DemoWalkthrough));

test('T073: renders an H2 that names the three-minute walkthrough format', async () => {
  // T073 locks the format decision: video, not an inline screenshot
  // grid. The H2 states the artefact the reader is about to see —
  // "A three-minute walkthrough" — which is the acceptance-criteria
  // phrasing the downstream T074 video embed and T075 screens
  // render against. Locking "three-minute" here catches silent
  // drift into "quick tour" or "demo video" generic copy.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*three-minute walkthrough[\s\S]*<\/h2>/i);
});

test('T073: section is labelled via aria-labelledby pointing at the H2 id', async () => {
  // Every scroll section on the site carries an aria-labelledby
  // landmark pointing at its H2 id. Locks the a11y contract so a
  // future refactor that drops the labelling gets caught at the
  // unit layer instead of surfacing as an axe violation in CI.
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T073: ships a 16:9 aspect-ratio placeholder slot for the video embed', async () => {
  // This is the format lock. A 16:9 aspect placeholder is what
  // reserves the video-player footprint so T074 can drop in an
  // iframe without a layout shift on load. Inline-screenshot
  // alternatives would use a grid of 4:3 or 3:4 cards — the
  // aspect-[16/9] utility is the single strongest signal that
  // "we chose video". Doctrine rationale is in the component's
  // head comment; this test pins the decision at the HTML surface.
  const html = await render();
  expect(html).toMatch(/aspect-\[16\/9\]/);
});

test('T073: placeholder state names a concrete resolution date (July 2026 beta)', async () => {
  // Placeholder sections across the site (T035 SocialProof, T062
  // B2B teaser) anchor to 01-STRATEGIC-DOCTRINE.md §9's public-beta
  // date (2026-07-23) so a reader knows the "not yet" has an end.
  // Generic "coming soon" reads as vaporware; naming July 2026
  // keeps the placeholder honest.
  const html = await render();
  expect(html).toMatch(/July 2026/);
});

test('T073: explicitly labels the placeholder "Reserved" — not broken markup', async () => {
  // Same pattern as T035 SocialProof and T062 B2B teaser: a visible
  // "Reserved" caption on the empty slot tells a reader the space
  // is intentional, not a rendering bug. When T074 swaps the iframe
  // in, this caption goes away.
  const html = await render();
  expect(html).toMatch(/Reserved/);
});

test('T073: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  // ADR-004 §4 principle 4 / doctrine §10 bullet 4. A section that
  // labels itself "walkthrough of a real session" cannot drift into
  // "AI-generated walkthrough" — lock it at the unit layer.
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
