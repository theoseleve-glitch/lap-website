import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Welcome from '../pages/waitlist/welcome.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Welcome));

test('T095: /waitlist/welcome renders a single <main> landmark', async () => {
  // One <main> per page — axe landmark rule + skip-link target.
  // Same convention as every other page on the site.
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T095: /waitlist/welcome renders an H1 confirming the visitor is on the waitlist', async () => {
  // The H1 names the new state. "You're on the LAP waitlist"
  // reads as a confirmation (past-tense state); "Welcome to the
  // waitlist" would read as marketing-blur and lose the
  // confirms-the-action posture. Visitors arrived here by clicking
  // a link in their inbox — the page exists to make that click
  // feel resolved.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*You're on the LAP waitlist[\s\S]*<\/h1>/);
});

test('T095: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('/waitlist/welcome names the canonical founding rate (€14.90)', async () => {
  // Corrected to the June-8 canon: the welcome page confirms the
  // founding offer (€14.90/mo, first 50, 30-day trial) — not the
  // retired €12/12-month grandfathered rate. Keeps the waitlist
  // surface aligned with src/data/membership.ts.
  const html = await render();
  expect(html).toMatch(/€14\.90/);
  expect(html).not.toMatch(/€12/);
});

test('T095: page sets noindex meta (no SERP traffic to a post-confirm page)', async () => {
  // The welcome page is the destination of a confirmation click,
  // not a marketing page. Search engines have no reason to surface
  // it; a public confirmation URL in SERPs would also leak the
  // (otherwise harmless) success copy to anyone Googling the brand.
  // robots=noindex is the standard signal.
  const html = await render();
  expect(html).toMatch(/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i);
});

test('T095: page mentions the unsubscribe path (GDPR continuity)', async () => {
  // T091's consent disclosure promised "unsubscribe anytime from
  // any email" — the welcome page reaffirms it so the visitor's
  // first post-confirm impression includes the exit door, not just
  // the entry door. Article 7 (consent must be as easy to withdraw
  // as it is to give) reads through to the in-product surface, but
  // the marketing welcome is the right place to remind.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/unsubscribe/);
});

test('T095: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
