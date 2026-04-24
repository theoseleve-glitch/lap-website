import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Demo from '../pages/demo.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Demo));

test('T072: /demo renders a single <main> landmark', async () => {
  // Every Astro page needs exactly one <main> for axe's landmark
  // rule and for the skip-link target. T073-T090 will populate
  // this shell with the 3-minute walkthrough video, annotated
  // screens, sample-session CTA, and post-demo trial CTA.
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T072: /demo renders the locked shell H1 "See LAP in action"', async () => {
  // The H1 names what the page does in four words. "See it work"
  // would be more generic but loses the branded direct-address
  // ("LAP in action") that reads as an invitation rather than a
  // section label. Locking the exact string keeps the shell
  // stable while T073 makes format decisions (video vs.
  // screenshots) and T074 lands the walkthrough.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*See LAP in action\.[\s\S]*<\/h1>/);
});

test('T072: title includes "LAP" branding (BaseLayout integration)', async () => {
  // "<Page> — LAP" pattern matches the homepage, /how-it-works,
  // /pricing, and /refund-policy titles. Locking LAP here catches
  // BaseLayout-bypass on future edits.
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T072: intro paragraph signals "session walkthrough, no sign-up"', async () => {
  // Doctrine-aligned scent: the demo page must set expectations
  // before the visitor decides to watch. "Session walkthrough,
  // no sign-up required" is the shortest version of what T074
  // (3-min video) + T077 (pre-seeded Sebring session, viewable
  // without signup) will fulfil. Lock both anchors so the intro
  // can't drift into "Check out what LAP can do!" marketing
  // blur.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/session/);
  expect(html.toLowerCase()).toMatch(/sign[- ]?up/);
});

test('T072: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
