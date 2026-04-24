import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HowItWorks from '../pages/how-it-works.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(HowItWorks));

test('T042: /how-it-works renders a single <main> landmark', async () => {
  // Every Astro page is wrapped by BaseLayout; the shell's own job
  // is to provide the <main> landmark (screen-reader skip target and
  // axe root container). Failing to emit exactly one <main> would
  // surface as an a11y regression when T055's e2e axe runs.
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T042: /how-it-works renders an <h1> titled "How LAP works"', async () => {
  // The shell ships with a minimal working H1 so the T026 secondary
  // CTA (/how-it-works) resolves to a real page today. T043 will
  // replace this with the full hero copy ("The whole driver
  // improvement loop, in one place") — this test flags the
  // transition point rather than locking forever.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*How LAP works[\s\S]*<\/h1>/);
});

test('T042: /how-it-works introduces the page with a descriptive paragraph', async () => {
  // The intro paragraph is the second most visible copy surface on
  // the page and carries the "what this page covers" scent for
  // readers who followed T026's "See how it works" CTA from the
  // homepage. It must name the three pillars this page will build
  // out (coaching loop, sim↔real bridge, data model) so a returning
  // reader doesn't wonder whether they landed on the right page.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/coaching loop/);
  expect(html.toLowerCase()).toMatch(/bridge/);
});

test('T042: /how-it-works copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T042: /how-it-works title includes "LAP" branding (BaseLayout integration)', async () => {
  // Ensures BaseLayout is the chosen wrapper — the page-title format
  // "<Page> — LAP" mirrors the homepage ("LAP — Every lap, one step
  // better.") so the site's SERP appearance stays consistent.
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});
