import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HowItWorksImprove from '../components/HowItWorksImprove.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(HowItWorksImprove));

test('T048: renders the H2 "Every target either hits or misses"', async () => {
  // The H2 echoes the T047 plan's "target metric, target value" beat
  // and locks the outcome-loop's falsifiable stance: binary per
  // target, no partial credit. The phrasing maps to the doctrine's
  // §4 principle 6 — "every coaching insight ships with a measurable
  // success condition."
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Every target either hits or misses[\s\S]*<\/h2>/);
});

test('T048: wraps the section in a <section> with aria-labelledby landmark', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T048: renders two h3 sub-beats — baseline + three verdicts', async () => {
  const html = await render();
  const h3Count = (html.match(/<h3[\s>]/g) ?? []).length;
  expect(h3Count).toBe(2);
});

test('T048: measurement beat names the per-driver "baseline" anchor', async () => {
  // Doctrine §5 commits LAP to backend-generated DriverProgressSnapshot
  // (ADR-005 §5.1); the baseline that outcomes are compared against
  // is the driver's OWN, not a cohort average (benchmarking is
  // deferred per §5 "DOES NOT" until Month 4+). Lock the word.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\bbaseline\b/);
});

test('T048: verdict beat names all three ActionOutcome states (closed / improving / still open)', async () => {
  // ADR-005 §5.4 ActionOutcome has a three-state verdict. The
  // homepage T029 coaching-loop section already locks this
  // vocabulary ("closed, improving, or still open"); T048 mirrors
  // it so the /how-it-works page and the homepage agree on the
  // exact outcome space — any accidental drift (e.g., "pending"
  // instead of "still open") would create two different outcome
  // schemas in the reader's mind.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/\bclosed\b/);
  expect(lower).toMatch(/\bimproving\b/);
  expect(lower).toMatch(/\bstill open\b/);
});

test('T048: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
