import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Pricing from '../pages/pricing.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Pricing));

test('T057: /pricing renders a single <main> landmark', async () => {
  // Every Astro page needs exactly one <main> for axe's landmark
  // rule and for the skip-link target. The shell ships with a
  // minimal body that T058 (tier card) + T059 (what's included) +
  // T060-T062 + T061 (FAQ) will populate.
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T057: /pricing renders an <h1> with the locked shell heading', async () => {
  // The shell ships a deliberately minimal H1 that names the
  // page's premise — "One tier. Clear price." — before T058
  // drops the full tier card with prices. Locking the exact string
  // keeps the shell from drifting away from doctrine §8 "Single
  // tier. €15/month." positioning while subsequent tasks land.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*One tier\. Clear price\.[\s\S]*<\/h1>/);
});

test('T057: title includes "LAP" branding (BaseLayout integration)', async () => {
  // Pattern: "<Page> — LAP" matches the homepage and /how-it-works
  // title shape. Locking "LAP" here catches accidental
  // BaseLayout-bypass during later edits.
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T057: meta description carries the €15 price anchor', async () => {
  // 01-STRATEGIC-DOCTRINE.md §10 bullet 3: "€15/month core tier
  // — price does not move up during the 6 months." The SERP
  // snippet for /pricing must show the price to filter out
  // price-averse visitors before they bounce. Lock the number.
  const html = await render();
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  expect(descMatch).not.toBeNull();
  expect(descMatch![1]).toMatch(/€15/);
});

test('T057: meta description names the 14-day trial', async () => {
  // Doctrine §8: "Trial: 14-day full-feature free trial." The
  // trial is the single most-clicked path from pricing; the
  // description must signal it so a SERP click arrives with the
  // right expectation.
  const html = await render();
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  expect(descMatch).not.toBeNull();
  expect(descMatch![1].toLowerCase()).toMatch(/14[- ]?day/);
});

test('T057: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T058: the tier card is mounted on /pricing below the header', async () => {
  // Integration check: the PricingTierCard ships the €15/€150
  // prices + trial badge + CTAs. Its mount on /pricing is what
  // makes this page do its job — without it, the shell from T057
  // is just text. Match the tier card's unique wiring (the
  // ?plan=monthly CTA href) rather than price strings, since the
  // shell's subhead already contains "14-day free trial" + price
  // anchors and would false-pass a content-only check.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup\?plan=monthly"/);
  expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup\?plan=yearly"/);
});

test('T059: the "What\'s included" checklist is mounted after the tier card', async () => {
  // Integration check: the 12-bullet checklist lands below the
  // tier card. Ordering matters — the reader sees price first,
  // then the full inventory, which matches the mental sequence
  // "is this affordable?" → "is it enough?"
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*What(?:'|&#39;|&apos;|&rsquo;)s included/);
  const tierIdx = html.indexOf('Full LAP access');
  const includedIdx = html.search(/What(?:'|&#39;|&apos;|&rsquo;)s included/);
  expect(tierIdx).toBeGreaterThan(-1);
  expect(includedIdx).toBeGreaterThan(tierIdx);
});

test('T060: the founder-waitlist offer is mounted after the checklist', async () => {
  // Integration check: grandfathered-rate offer lands below the
  // inventory. Reader arc: price → what's included → "and if you
  // signed up early, it's €3 cheaper." Reversing the order would
  // make the offer a banner the trial-ready visitor has to scroll
  // past to reach the inventory.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Signed up before launch/);
  const includedIdx = html.search(/What(?:'|&#39;|&apos;|&rsquo;)s included/);
  const founderIdx = html.indexOf('Signed up before launch');
  expect(includedIdx).toBeGreaterThan(-1);
  expect(founderIdx).toBeGreaterThan(includedIdx);
});
