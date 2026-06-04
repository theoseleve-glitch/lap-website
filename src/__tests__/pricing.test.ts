import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Pricing from '../pages/pricing.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Pricing));

test('/pricing renders a single <main> landmark', async () => {
  // Every Astro page needs exactly one <main> for axe's landmark
  // rule and for the skip-link target.
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('/pricing renders an <h1> with the membership premise heading', async () => {
  // The June-8 model is ONE membership at ONE price. The H1 states
  // exactly that premise — "One membership. One price." — before the
  // PricingCard drops the figures. Locking the exact string keeps the
  // page from drifting off the single-membership doctrine.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*One membership\. One price\.[\s\S]*<\/h1>/);
});

test('title includes "LAP" branding (BaseLayout integration)', async () => {
  // The page title flows through BaseLayout. Locking "LAP" here
  // catches accidental BaseLayout-bypass during later edits.
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('meta description carries the standard €19.90 price anchor', async () => {
  // The SERP snippet for /pricing must show the price to set
  // expectations before the click. The standard monthly price is
  // €19.90 — lock the number so the description never drifts off the
  // June-8 pricing canon.
  const html = await render();
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  expect(descMatch).not.toBeNull();
  expect(descMatch![1]).toMatch(/€19\.90/);
});

test('meta description carries the €14.90 founding-member price', async () => {
  // The first 50 founding members lock €14.90/mo. The discounted
  // anchor is the second most-clicked hook from a pricing SERP result,
  // so the description must signal it.
  const html = await render();
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  expect(descMatch).not.toBeNull();
  expect(descMatch![1]).toMatch(/€14\.90/);
});

test('meta description names the 30-day free trial', async () => {
  // The trial is the single most-clicked path from pricing; the
  // description must signal it so a SERP click arrives with the
  // right expectation. The new trial is 30 days (no card until it ends).
  const html = await render();
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  expect(descMatch).not.toBeNull();
  expect(descMatch![1].toLowerCase()).toMatch(/30[- ]?day/);
});

test('title names the page as the LAP membership pricing page', async () => {
  // The <title> is the strongest on-page ranking and SERP signal. The
  // June-8 page positions itself around the single membership rather
  // than a keyword phrase — assert the title reads as a natural pricing
  // title that names both "membership" and "pricing".
  const html = await render();
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  expect(titleMatch).not.toBeNull();
  const title = titleMatch![1].toLowerCase();
  expect(title).toContain('membership');
  expect(title).toContain('pricing');
});

test('copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('the PricingCard is mounted on /pricing with the trial CTA → /register', async () => {
  // Integration check: the PricingCard ships the membership prices +
  // trial badge + the single primary CTA. Its mount on /pricing is what
  // makes the page do its job. The June-8 CTA is one button —
  // "Start 30-day free trial" → /register (no ?plan=monthly/yearly,
  // since there is one monthly-only membership).
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/register"[\s\S]*?Start 30-day free trial[\s\S]*?<\/a>/);
  // No legacy multi-plan query-string CTAs survive.
  expect(html).not.toMatch(/\/register\?plan=/);
});

test('the PricingCard carries the founding and standard monthly prices', async () => {
  // The card is the page's core: it must show €14.90/mo for founding
  // members and the €19.90/mo standard rate, plus the 30-day trial.
  const html = await render();
  expect(html).toMatch(/€14\.90/);
  expect(html).toMatch(/€19\.90/);
  expect(html.toLowerCase()).toMatch(/30[- ]?day free trial/);
});

test('the "Everything in your membership" section is mounted after the card', async () => {
  // Integration check: the full feature inventory lands below the
  // pricing card. Ordering matters — the reader sees price first, then
  // the full inventory: "is this affordable?" → "is it enough?".
  // The new model has no per-tier gating, so the heading is
  // "Everything in your membership" rather than the old "What's included".
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Everything in your membership[\s\S]*<\/h2>/);
  const cardIdx = html.indexOf('Membership'); // PricingCard heading "<name> Membership"
  const includedIdx = html.indexOf('Everything in your membership');
  expect(cardIdx).toBeGreaterThan(-1);
  expect(includedIdx).toBeGreaterThan(cardIdx);
});

test('the founding-50 callout is mounted after the feature inventory', async () => {
  // Integration check: the founding-member offer lands below the
  // inventory. Reader arc: price → what's included → "and if you're one
  // of the first 50, it's €5/mo cheaper, locked for life."
  const html = await render();
  expect(html).toMatch(/Founding\s+50/);
  expect(html).toMatch(/locked while you stay a member/);
  const includedIdx = html.indexOf('Everything in your membership');
  const foundingIdx = html.indexOf('locked while you stay a member');
  expect(includedIdx).toBeGreaterThan(-1);
  expect(foundingIdx).toBeGreaterThan(includedIdx);
});

test('the FAQ section is mounted after the founding offer', async () => {
  // Integration check: FAQ lands at the bottom of the page's decision
  // arc. The <details>/<summary> accordion shows questions as scannable
  // summaries with answers hidden behind a click — no JS required.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Frequently asked questions[\s\S]*<\/h2>/);
  expect(html).toMatch(/<details/);
  const foundingIdx = html.indexOf('locked while you stay a member');
  const faqIdx = html.indexOf('Frequently asked questions');
  expect(foundingIdx).toBeGreaterThan(-1);
  expect(faqIdx).toBeGreaterThan(foundingIdx);
});

test('/pricing links to /refund-policy', async () => {
  // Integration check: the refund policy is one click away from the
  // pricing page, under a named link on its own route.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/refund-policy"[\s\S]*?refund policy[\s\S]*?<\/a>/);
});

test('/pricing emits AggregateOffer JSON-LD in EUR spanning 14.90–19.90', async () => {
  // The pricing page ships Product/AggregateOffer structured data so the
  // two offers (founding + standard) are eligible for rich results.
  // lowPrice 14.90, highPrice 19.90, EUR, offerCount 2 — and it must
  // stay in lockstep with the rendered card.
  const html = await render();
  const ldMatches = [
    ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => JSON.parse(m[1]));

  const aggregate = ldMatches.find(
    (ld) => ld['@type'] === 'Product' && ld.offers?.['@type'] === 'AggregateOffer',
  );
  expect(aggregate).toBeDefined();
  expect(aggregate.offers.priceCurrency).toBe('EUR');
  expect(aggregate.offers.lowPrice).toBe('14.90');
  expect(aggregate.offers.highPrice).toBe('19.90');
  expect(aggregate.offers.offerCount).toBe(2);
});

test('/pricing exposes no legacy B2B "Contact sales" mailto', async () => {
  // The June-8 model removed the B2B / per-seat teaser entirely. Assert
  // the legacy sales mailto is gone so it cannot creep back in.
  const html = await render();
  expect(html).not.toMatch(/mailto:sales@lap-coach\.racing/);
  expect(html.toLowerCase()).not.toContain('contact sales');
});
