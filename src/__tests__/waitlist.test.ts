import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Waitlist from '../pages/waitlist.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Waitlist));

test('T091: /waitlist renders a single <main> landmark', async () => {
  // Every page on the site ships exactly one <main> for axe's
  // landmark rule and for the skip-link target. Locking the count
  // catches refactor-induced duplicates or accidental drops.
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T091: /waitlist renders the locked H1 "Join the LAP waitlist"', async () => {
  // The H1 names the action the page asks for. "Join the LAP
  // waitlist" reads as a commitment (specific, branded, action-
  // oriented) — "Sign up for updates" would be the generic
  // marketing-blur variant that doesn't connect to T060's
  // founder-offer terms.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*Join the LAP waitlist[\s\S]*<\/h1>/);
});

test('T091: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('/waitlist lead names the canonical founding rate (€14.90)', async () => {
  // Corrected: the waitlist now points members at the canonical
  // founding offer (€14.90/mo, first 50, 30-day trial) from
  // src/data/membership.ts — NOT the retired €12/12-month
  // grandfathered rate, which contradicted the June-8 pricing.
  // Locking €14.90 keeps the cross-page pricing contract aligned.
  const html = await render();
  expect(html).toMatch(/€14\.90/);
  expect(html).not.toMatch(/€12/);
});

test('T091: WaitlistForm is mounted on /waitlist (form action present)', async () => {
  // Integration check: the component lives on the page. Without
  // this, T091 ships a form file that nobody can submit. The
  // /api/waitlist action is the unique signature of WaitlistForm
  // — checking for it confirms the mount.
  const html = await render();
  expect(html).toMatch(/<form[^>]+action="\/api\/waitlist"/);
});

test('T091: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
