import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import PricingValueAnchor from '../components/PricingValueAnchor.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(PricingValueAnchor));

test('T064: renders the H2 "A year of LAP is one hour with a human coach, or two."', async () => {
  // The H2 does the whole anchoring job in one line: €150/year
  // ≈ 1-2 hours of human coaching (doctrine §7 Bet #3 range of
  // €80-€150/hr). Locking the exact string prevents drift to
  // softer "can be less expensive" framings that blur the math.
  const html = await render();
  expect(html).toMatch(
    /<h2[^>]*>[\s\S]*A year of LAP is one hour with a human coach, or two\.[\s\S]*<\/h2>/,
  );
});

test('T064: wraps the section in a <section> with aria-labelledby landmark', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T064: carries the €80-€150 hourly-coach price range (doctrine §7 Bet #3)', async () => {
  // 01-STRATEGIC-DOCTRINE.md §7 Bet #3: "€15/month single tier
  // is 3-5x below per-sim coaching (€80-150/hr human coach)."
  // Lock both endpoints of the range so the lower figure can't
  // silently disappear (which would make LAP look cheaper than
  // doctrine's honest anchor) and the upper can't either.
  const html = await render();
  expect(html).toMatch(/€80/);
  expect(html).toMatch(/€150/);
});

test('T064: names "human coach" as the category being compared against', async () => {
  // Being explicit about the comparison subject matters — "€80 to
  // €150 per hour" without "human coach" reads ambiguous (what
  // else costs that?). Naming the category respects the reader's
  // intelligence and clarifies the value claim.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/human coach/);
});

test('T064: carries the "not a replacement" positioning clause', async () => {
  // 01-STRATEGIC-DOCTRINE.md §3 anti-persona: "Pro drivers with
  // dedicated coaches → we are not trying to replace Driver61."
  // The value-anchor section is the most likely place for this
  // positioning to drift toward "LAP replaces your coach" —
  // explicitly naming the non-replacement stance keeps LAP
  // positioned as additive, and respects the reader who already
  // has (or wants) a human coach.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/not a replacement/);
});

test('T064: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
