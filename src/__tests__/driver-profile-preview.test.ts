import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import DriverProfilePreview from '../components/DriverProfilePreview.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(DriverProfilePreview));

test('wraps the preview in a figure with role="img" and a descriptive aria-label', async () => {
  // A11y posture: the mockup is an illustrative visualization, not
  // critical content. We expose a single aria-label and mark decorative
  // inner nodes as aria-hidden so screen readers do not announce fake
  // numbers that would mislead users about actual product state.
  const html = await render();
  expect(html).toMatch(/<figure[^>]+role="img"/);
  expect(html).toMatch(/<figure[^>]+aria-label="[^"]{12,}"/);
});

test('surfaces the overall score as the dominant visual element', async () => {
  // ADR-005 §5.1 DriverProgressSnapshot.overall_score (0-100).
  const html = await render();
  expect(html).toMatch(/\b72\b/);
});

test('renders four or more skill-dimension rows by name', async () => {
  // Names must come from ADR-005 §5.1 dimensions list — no invented
  // skill categories. Using a subset (4) to keep the card scannable.
  const html = await render();
  expect(html).toMatch(/Braking/);
  expect(html).toMatch(/Throttle/);
  expect(html).toMatch(/Minimum speed/i);
  expect(html).toMatch(/Consistency/);
});

test('renders a session-count footer (the "12 sessions" telemetry beat)', async () => {
  const html = await render();
  expect(html).toMatch(/\b\d+\s+sessions?\b/);
});

test('the preview copy stays doctrine-aligned — no AI-coach / LLM claims', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
});
