import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import PricingTierCard from '../components/PricingTierCard.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(PricingTierCard));

test('T058: wraps the card in a <section> with aria-labelledby landmark', async () => {
  // Landmark posture per the site-wide convention: the <section>
  // is named by its visible heading so assistive tech announces
  // the tier name rather than a generic "region".
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`id="${headingId}"`));
});

test('T058: displays the €15 / month price anchor', async () => {
  // 01-STRATEGIC-DOCTRINE.md §8 + §10 bullet 3: €15/month is the
  // single tier, price fixed for 6 months. Locking both the
  // number and the unit so a regression can't quietly change one
  // without the other.
  const html = await render();
  expect(html).toMatch(/€15/);
  expect(html.toLowerCase()).toMatch(/\/\s*month/);
});

test('T058: displays the €150 / year price anchor', async () => {
  // The annual plan (€150/year) must render alongside the monthly
  // — doctrine §8 is explicit that BOTH billing options exist,
  // and the yearly is how the grandfathered waitlist value
  // (€12/mo × 12 = €150 ceiling) stays consistent.
  const html = await render();
  expect(html).toMatch(/€150/);
  expect(html.toLowerCase()).toMatch(/\/\s*year/);
});

test('T058: displays the "save €30" annual-discount callout', async () => {
  // The annual plan at €150 saves €30 over 12×€15 monthly (€180).
  // Doctrine §8 implicit calculation; the callout is what turns a
  // raw number into a decision. Lock the phrase so the discount
  // gets visibly acknowledged rather than silently priced in.
  const html = await render();
  expect(html).toMatch(/save €30/i);
});

test('T058: surfaces the "14-day free trial" badge verbatim', async () => {
  // Doctrine §8: "14-day full-feature free trial." The badge is
  // the single most-clicked visual on the pricing page for visitors
  // who haven't decided on trial-length risk yet. "14-day free
  // trial" must be present as an explicit phrase.
  const html = await render();
  expect(html).toMatch(/14-day free trial/i);
});

test('T058: monthly CTA wires to /signup?plan=monthly with rel=noopener', async () => {
  // T063 will formally test the checkout wiring; T058 ships the
  // hrefs today so the section isn't a dead-end visual. ?plan=monthly
  // is the query parameter the lap-webapp signup flow reads to
  // pre-select billing cadence.
  const html = await render();
  expect(html).toMatch(
    /<a[^>]+href="\/register\?plan=monthly"[^>]+rel="noopener"/,
  );
});

test('T058: yearly CTA wires to /signup?plan=yearly with rel=noopener', async () => {
  // Sprint T063 uses the value "yearly" (not "annual") — match
  // that vocabulary so downstream attribution and the lap-webapp
  // handler see the same identifier.
  const html = await render();
  expect(html).toMatch(
    /<a[^>]+href="\/register\?plan=yearly"[^>]+rel="noopener"/,
  );
});

test('T058: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
