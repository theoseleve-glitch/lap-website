import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HowItWorksDiagram from '../components/HowItWorksDiagram.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(HowItWorksDiagram));

test('T044: wraps the diagram in a <figure> with role="img" and aria-labelledby', async () => {
  // Accessible image pattern: the figure exposes itself as a single
  // image to assistive tech; aria-labelledby points at the
  // figcaption's visible heading so the SR-announced name matches
  // what sighted users read. Screen readers announce "image: <title>"
  // and can then fall into the figcaption for the full step list.
  const html = await render();
  const figureMatch = html.match(/<figure[^>]+role="img"[^>]+aria-labelledby="([^"]+)"/);
  expect(figureMatch).not.toBeNull();
  const titleId = figureMatch![1];
  expect(html).toMatch(new RegExp(`id="${titleId}"`));
});

test('T044: exposes an aria-describedby target with the long text-alt', async () => {
  // aria-labelledby gives the short name; aria-describedby gives
  // the full description. For a diagram, the description is the
  // numbered list of loop steps — which is also visible in the
  // figcaption, so sighted and non-sighted users read the same
  // content.
  const html = await render();
  const describedMatch = html.match(/<figure[^>]+aria-describedby="([^"]+)"/);
  expect(describedMatch).not.toBeNull();
  const descId = describedMatch![1];
  expect(html).toMatch(new RegExp(`id="${descId}"`));
});

test('T044: embeds an SVG with viewBox + aria-hidden (decorative duplicate)', async () => {
  // The figure already carries the semantic label via aria-labelledby
  // pointing at the figcaption. The SVG itself is a visual
  // enhancement — marking it aria-hidden prevents screen readers
  // from double-announcing (once as the figure's name, once as a
  // second graphic). viewBox is required for responsive scaling
  // at mobile widths (T039 360 px gate).
  const html = await render();
  expect(html).toMatch(/<svg[^>]+viewBox="[^"]+"/);
  expect(html).toMatch(/<svg[^>]+aria-hidden="true"/);
});

test('T044: text-alt names all four loop steps in order (capture, brain, plan, improve)', async () => {
  // The four-step vocabulary lands in T043's hero subhead; the
  // diagram's figcaption must reuse the same four words in the
  // same order. A diverging step list would be a semantic
  // regression — the hero subhead and the diagram are two views
  // of the same loop.
  const html = await render();
  const captureIdx = html.toLowerCase().indexOf('capture');
  const brainIdx = html.toLowerCase().indexOf('brain');
  const planIdx = html.toLowerCase().indexOf('plan');
  const improveIdx = html.toLowerCase().indexOf('improve');
  expect(captureIdx).toBeGreaterThan(-1);
  expect(brainIdx).toBeGreaterThan(captureIdx);
  expect(planIdx).toBeGreaterThan(brainIdx);
  expect(improveIdx).toBeGreaterThan(planIdx);
});

test('T044: text-alt renders an ordered list so step order is conveyed to assistive tech', async () => {
  // <ol> + <li> is the semantic container that tells screen readers
  // "these four items have an order." A bulleted <ul> or a <p>
  // with dashes would still pass the other tests but would lose
  // the order information for SR users — defeats the purpose of
  // a "flow" diagram's text alternative.
  const html = await render();
  expect(html).toMatch(/<ol[\s>]/);
  const liMatches = html.match(/<li[\s>]/g) ?? [];
  expect(liMatches.length).toBe(4);
});

test('T044: diagram copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
