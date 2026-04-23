import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import NotFound from '../pages/404.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(NotFound));

test('404 page sets a title that marks the missing-resource state', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*404[^<]*<\/title>/);
});

test('404 page surfaces a visible primary heading', async () => {
  const html = await render();
  // Heading should mention 404 so screen-readers get the context without CSS.
  expect(html).toMatch(/<h1[^>]*>[\s\S]*404[\s\S]*<\/h1>/);
});

test('404 page offers a link back to the homepage', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/"[^>]*>/);
});

test('404 copy stays doctrine-aligned — no AI-coach / LLM language', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
});
