import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import PricingFaq from '../components/PricingFaq.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(PricingFaq));

test('T061: renders the H2 "Common questions."', async () => {
  // "Common questions" over "FAQ" to match the site's
  // conversational voice (cf. T029 "After every session." and
  // T048 "Every target either hits or misses." — declarative,
  // not formal-abbreviation).
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Common questions\.[\s\S]*<\/h2>/);
});

test('T061: wraps the section in a <section> with aria-labelledby landmark', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T061: renders exactly 10 <details>/<summary> pairs', async () => {
  // Sprint brief: "10 questions". Native <details>/<summary> is
  // the zero-JS accordion element — keyboard-accessible, ARIA
  // handled by the browser, no React-style state to ship. The
  // count lock catches silent question drift (same pattern as
  // T059's 12-bullet lock).
  const html = await render();
  const detailsCount = (html.match(/<details[\s>]/g) ?? []).length;
  const summaryCount = (html.match(/<summary[\s>]/g) ?? []).length;
  expect(detailsCount).toBe(10);
  expect(summaryCount).toBe(10);
});

test('T061: covers the "no card for trial" question', async () => {
  // Sprint brief calls this out specifically. Doctrine §8 is
  // clear that the 14-day trial runs without a card; the FAQ
  // must say so in plain language.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/credit card/);
});

test('T061: covers the "cancel anytime" question', async () => {
  // Sprint-brief bullet. The single most common cancellation-
  // anxiety question for any subscription product.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\bcancel\b/);
});

test('T061: covers the "data export" question', async () => {
  // Sprint-brief bullet. Critical for technically-inclined
  // visitors who want to know their data isn't held hostage —
  // this is a trust signal that matters to the primary persona.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\bexport\b/);
});

test('T061: covers the "is coaching written by a language model" doctrine question', async () => {
  // 01-STRATEGIC-DOCTRINE.md §10 bullet 4 rules out LLM coaching.
  // The FAQ is the natural place to answer the question
  // explicitly — most sim-racer prospects have been trained to
  // expect AI by every competitor, and "no, and here's why" is
  // a positioning statement that deserves prose, not silence.
  // Phrasing avoids the \bllm\b / \bgenerative\b / \bai coach\b
  // forbidden vocabulary by using "language model" instead.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/language model/);
});

test('T061: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
