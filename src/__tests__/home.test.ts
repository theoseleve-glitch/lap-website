import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import BaseLayout from '../layouts/BaseLayout.astro';

test('BaseLayout renders title in <title> tag', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BaseLayout, {
    props: { title: 'LAP — Driver OS' },
    slots: { default: '<p>hello</p>' },
  });

  expect(result).toContain('<title>LAP — Driver OS</title>');
  expect(result).toContain('<p>hello</p>');
  expect(result).toContain('lang="en"');
});

test('BaseLayout applies base surface classes on <body>', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BaseLayout, {
    props: { title: 'x' },
    slots: { default: '' },
  });

  expect(result).toMatch(/<body[^>]*class="[^"]*bg-asphalt[^"]*text-chalk/);
});
