import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ServerError from '../pages/500.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(ServerError));

test('500 page sets a title that marks the server-error state', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*500[^<]*<\/title>/);
});

test('500 page surfaces a visible primary heading carrying the status code', async () => {
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*500[\s\S]*<\/h1>/);
});

test('500 page offers a link back to the homepage', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/"[^>]*>/);
});

test('500 copy stays doctrine-aligned — no AI-coach / LLM language', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
});
