import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HowItWorksPlan from '../components/HowItWorksPlan.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(HowItWorksPlan));

test('T047: renders the H2 "A plan sized to the next session"', async () => {
  // The H2 carries the doctrine-anchored size constraint: a plan is
  // executable in a single practice slot, not a weekly program. This
  // rules out "analysis you read but never act on" — the common
  // failure mode 01-STRATEGIC-DOCTRINE.md §3 attributes to shallow
  // telemetry tools.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*A plan sized to the next session[\s\S]*<\/h2>/);
});

test('T047: wraps the section in a <section> with aria-labelledby landmark', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T047: renders two h3 sub-beats — plan size + measurable targets', async () => {
  // Two beats: the plan's SIZE (one session, one plan) and its
  // PRECISION (target metric, target value). Together they commit
  // LAP to principle 6 of 01-STRATEGIC-DOCTRINE.md §4 — "every
  // coaching insight ships with a measurable success condition."
  const html = await render();
  const h3Count = (html.match(/<h3[\s>]/g) ?? []).length;
  expect(h3Count).toBe(2);
});

test('T047: copy carries the "measurable" vocabulary from principle 6', async () => {
  // 01-STRATEGIC-DOCTRINE.md §4 principle 6 ("the loop closes or
  // the feature doesn't ship") mandates measurable success
  // conditions. Lock the word at the HTML surface so the plan
  // copy stays falsifiable — never "try to brake later", always
  // a number.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\bmeasurable\b/);
});

test('T047: copy carries the "target metric / target value" concreteness framing', async () => {
  // A prescription without a target number is a wish. The plan
  // beats must name concrete measurement terminology so a reader
  // knows what "plan" means in this context — a list of numbers
  // to hit, not a paragraph of advice.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\btarget\b/);
});

test('T047: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
