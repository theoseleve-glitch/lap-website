import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Unsubscribed from '../pages/waitlist/unsubscribed.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Unsubscribed));

test('T100: /waitlist/unsubscribed renders a single <main> landmark', async () => {
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T100: /waitlist/unsubscribed renders an H1 confirming the action', async () => {
  // The H1 must say something specific. "You're unsubscribed"
  // confirms the state in past-tense; vague copy ("Action
  // completed") would fail the recipient's reasonable expectation
  // that the page tells them what happened.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*unsubscribed[\s\S]*<\/h1>/i);
});

test('T100: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T100: page sets noindex meta (no SERP value to a post-unsubscribe page)', async () => {
  // Same posture as /waitlist/welcome (T095) — private destination,
  // no SEO value, mild leak risk.
  const html = await render();
  expect(html).toMatch(/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i);
});

test('T100: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
