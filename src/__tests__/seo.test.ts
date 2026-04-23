import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import BaseLayout from '../layouts/BaseLayout.astro';

const render = (props: Record<string, unknown>) =>
  AstroContainer.create().then((c) =>
    c.renderToString(BaseLayout, { props, slots: { default: '' } }),
  );

test('emits <meta name="description"> from prop', async () => {
  const html = await render({ title: 'x', description: 'Driver OS for serious sim racers' });
  expect(html).toMatch(
    /<meta\s+name="description"\s+content="Driver OS for serious sim racers"\s*\/?>/,
  );
});

test('falls back to a doctrine-aligned description when none is passed', async () => {
  const html = await render({ title: 'x' });
  const match = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  expect(match).not.toBeNull();
  const description = match![1];
  expect(description.length).toBeGreaterThan(40);
  expect(description.length).toBeLessThan(200);
  // Strategic doctrine: no LLM / AI-coach claims (ADR-004, principle 4).
  expect(description.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(description.toLowerCase()).not.toMatch(/\bllm\b/);
});

test('emits Open Graph title + description + type + site_name + locale', async () => {
  const html = await render({ title: 'Home — LAP', description: 'the driver OS' });
  expect(html).toMatch(/<meta\s+property="og:title"\s+content="Home — LAP"/);
  expect(html).toMatch(/<meta\s+property="og:description"\s+content="the driver OS"/);
  expect(html).toMatch(/<meta\s+property="og:type"\s+content="website"/);
  expect(html).toMatch(/<meta\s+property="og:site_name"\s+content="LAP"/);
  expect(html).toMatch(/<meta\s+property="og:locale"\s+content="en_US"/);
});

test('emits og:url and og:image as absolute URLs on the configured site', async () => {
  const html = await render({ title: 'x' });
  expect(html).toMatch(/<meta\s+property="og:url"\s+content="https:\/\/lap\.com\/[^"]*"/);
  expect(html).toMatch(/<meta\s+property="og:image"\s+content="https:\/\/lap\.com\/[^"]+"/);
});

test('emits Twitter summary_large_image card with title + description + image', async () => {
  const html = await render({ title: 'Home — LAP', description: 'the driver OS' });
  expect(html).toMatch(/<meta\s+name="twitter:card"\s+content="summary_large_image"/);
  expect(html).toMatch(/<meta\s+name="twitter:title"\s+content="Home — LAP"/);
  expect(html).toMatch(/<meta\s+name="twitter:description"\s+content="the driver OS"/);
  expect(html).toMatch(/<meta\s+name="twitter:image"\s+content="https:\/\/lap\.com\/[^"]+"/);
});

test('emits a JSON-LD WebSite block with name / url / description', async () => {
  const html = await render({ title: 'x', description: 'the driver OS' });
  const match = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/);
  expect(match).not.toBeNull();
  const payload = JSON.parse(match![1]);
  expect(payload['@context']).toBe('https://schema.org');
  expect(payload['@type']).toBe('WebSite');
  expect(payload.name).toBe('LAP');
  expect(payload.url).toBe('https://lap.com/');
  expect(payload.description).toBe('the driver OS');
});
