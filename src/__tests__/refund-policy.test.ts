import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import RefundPolicy from '../pages/refund-policy.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(RefundPolicy));

test('T065: /refund-policy renders a single <main> landmark', async () => {
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T065: /refund-policy renders an <h1> "Refund policy"', async () => {
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*Refund policy[\s\S]*<\/h1>/);
});

test('T065: /refund-policy names the 14-day trial as the refund-equivalent', async () => {
  // Doctrine §8 commits to a 14-day full-feature free trial with
  // no card at signup. That trial IS the practical refund policy
  // for most cases — if the user decides against LAP within the
  // window, nothing is charged. The policy page must surface
  // this as the first line of defence.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/14[- ]?day/);
});

test('T065: /refund-policy explains cancellation behaviour', async () => {
  // Post-trial, the policy is "cancel anytime, plan runs to end
  // of period" (matches T061 FAQ Q2). The policy page must state
  // this explicitly so a user who cancels mid-month understands
  // they still have access through the end of the period.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/cancel/);
});

test('T065: /refund-policy provides a contact email for edge cases', async () => {
  // Incorrect charges, double-billing, and EU statutory withdrawal
  // are edge cases not covered by the trial+cancellation defaults.
  // The policy page must expose a working contact — an email is
  // the cheapest honest handoff (no support desk exists yet).
  const html = await render();
  expect(html).toMatch(/support@lap-coach\.racing/);
});

test('T065: /refund-policy copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
