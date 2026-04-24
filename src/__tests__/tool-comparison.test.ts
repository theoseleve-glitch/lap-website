import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ToolComparison from '../components/ToolComparison.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(ToolComparison));

test('renders the section heading "Coming from Garage61 or MoTeC" in an <h2>', async () => {
  // T032 names the two competitors directly in the heading so a
  // reader who has ever installed either one self-selects into the
  // section. The sprint task calls this "Compare to tools you know";
  // the heading paraphrases it with the concrete tool names because
  // 01-STRATEGIC-DOCTRINE.md §3 persona explicitly uses them.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Coming from Garage61 or MoTeC[\s\S]*<\/h2>/);
});

test('wraps the section in a <section> with aria-labelledby pointing to the heading id', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('renders exactly three comparison articles, each with its own h3', async () => {
  // Three comparison cards map to the three positioning claims:
  // Garage61 (sim-only, shallow), MoTeC (engineer-grade), and the
  // bridge (nobody else tries). Anything less collapses the
  // positioning; anything more dilutes the "tight bullets" brief.
  const html = await render();
  const articleMatches = html.match(/<article[\s>]/g) ?? [];
  expect(articleMatches.length).toBe(3);
  const h3Matches = html.match(/<h3[\s>]/g) ?? [];
  expect(h3Matches.length).toBe(3);
});

test('copy names both Garage61 and MoTeC with the correct trademark casing', async () => {
  // Doctrine §3 names both as the persona's prior-tool experience.
  // MoTeC's trademark styling (capital M, small-o, capital T, small-e,
  // capital C) matters — "Motec" or "MOTEC" would look wrong to any
  // reader who has actually used it. Lock at the HTML surface.
  const html = await render();
  expect(html).toMatch(/Garage61/);
  expect(html).toMatch(/MoTeC/);
});

test('copy respects the anti-persona line — MoTeC is still the right tool for engineers', async () => {
  // 01-STRATEGIC-DOCTRINE.md §3 lists "Professional racing team
  // engineers → MoTeC exists" as an anti-persona. The comparison
  // section must acknowledge MoTeC's legitimate role for that
  // audience ("keep MoTeC" / "right tool"), not position LAP as a
  // replacement. The phrase "keep MoTeC" is the trust signal that
  // we're not trying to displace it from the engineer workflow.
  const html = await render();
  expect(html).toMatch(/keep MoTeC/);
});

test('copy names iRacing (the cross-sim bridge claim)', async () => {
  // The third comparison card is the bridge — it requires a concrete
  // sim title to anchor the "one session format across sims" claim.
  // If the bridge bullet silently drops the titles, the claim reads
  // abstract and stops being distinguishable from the other two.
  const html = await render();
  expect(html).toMatch(/iRacing/);
});

test('copy stays doctrine-aligned — no AI-coach / LLM / generative framing', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
