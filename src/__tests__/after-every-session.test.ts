import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import AfterEverySession from '../components/AfterEverySession.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(AfterEverySession));

test('renders the section heading "After every session" in an <h2>', async () => {
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*After every session[\s\S]*<\/h2>/);
});

test('wraps the section in a <section> with an aria-labelledby pointing to the heading id', async () => {
  // Landmark posture: the section has a visible <h2>, and aria-labelledby
  // binds the section to that heading so assistive tech names the
  // landmark instead of falling back to a generic "region".
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('renders exactly three tile articles, each with its own h3', async () => {
  const html = await render();
  const articleMatches = html.match(/<article[\s>]/g) ?? [];
  expect(articleMatches.length).toBe(3);
  const h3Matches = html.match(/<h3[\s>]/g) ?? [];
  expect(h3Matches.length).toBe(3);
});

test('three tile headings map to the ADR-005 coaching loop beats', async () => {
  // ADR-005 §5.2 WeaknessEpisode → §5.3 ActionPrescription → §5.4
  // ActionOutcome. The H3 copy must name each beat so a visitor reading
  // just the headings gets the observation → prescription → measurement
  // sequence intact.
  const html = await render();
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Weakness[\s\S]*<\/h3>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Prescription[\s\S]*<\/h3>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Outcome[\s\S]*<\/h3>/);
});

test('tiles are numbered 01 / 02 / 03 in telemetry-mono style', async () => {
  const html = await render();
  expect(html).toMatch(/\b01\b/);
  expect(html).toMatch(/\b02\b/);
  expect(html).toMatch(/\b03\b/);
});

test('the coaching loop copy stays doctrine-aligned — no AI-coach / LLM', async () => {
  // ADR-004 §4 principle 4 forbids LLM coaching text. The prescription
  // beat is especially prone to drift here ("AI coach writes your
  // drill") — lock it at the test surface.
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
});
