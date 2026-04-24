import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import PricingFounderOffer from '../components/PricingFounderOffer.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(PricingFounderOffer));

test('T060: renders the H2 "Signed up before launch? €12 a month for 12 months."', async () => {
  // Sprint T060 locks this exact H2 string. It carries the
  // grandfathered rate (€12/mo per 01-STRATEGIC-DOCTRINE.md §8) and
  // the duration (12 months, §10 bullet 5) in the heading itself —
  // a prospective waitlist member can take the decision without
  // reading past the H2.
  const html = await render();
  expect(html).toMatch(
    /<h2[^>]*>[\s\S]*Signed up before launch\?[\s\S]*€12 a month for 12 months\.[\s\S]*<\/h2>/,
  );
});

test('T060: wraps the section in a <section> with aria-labelledby landmark', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T060: body names the €3 differential below standard pricing', async () => {
  // Differential framing is what turns "€12" into a value — without
  // the €3 comparison, a reader can't tell if €12 is cheap or
  // standard. Doctrine §8 is explicit about the delta (standard
  // €15 − grandfathered €12 = €3).
  const html = await render();
  expect(html).toMatch(/€3/);
});

test('T060: names "waitlist" as the qualifier', async () => {
  // 01-STRATEGIC-DOCTRINE.md §8: "Existing pre-launch signups
  // (waitlist)" get the grandfathered rate. Naming "waitlist"
  // explicitly prevents drift to generic "early users" framing
  // which would imply the offer is open to anyone claiming
  // pre-launch status.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\bwaitlist\b/);
});

test('T060: commits that terms preserve across future pricing changes', async () => {
  // Doctrine §10 bullet 5: "Grandfathered early users — any change
  // to pricing or feature availability preserves terms for pre-
  // launch waitlist signups." This is the durability promise that
  // makes the offer a loyalty signal rather than a one-time discount.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/preserve|grandfather/);
});

test('T060: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
