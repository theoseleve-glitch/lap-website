import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import BaseLayout from '../layouts/BaseLayout.astro';

const render = () =>
  AstroContainer.create().then((c) =>
    c.renderToString(BaseLayout, {
      props: { title: 'Test page' },
      slots: { default: '<main>page content</main>' },
    }),
  );

describe('BaseLayout chrome integration', () => {
  test('renders SiteHeader (role="banner") before slot', async () => {
    const html = await render();
    const headerIdx = html.search(/<header[^>]+role="banner"/);
    const slotIdx = html.indexOf('page content');
    expect(headerIdx).toBeGreaterThan(-1);
    expect(slotIdx).toBeGreaterThan(headerIdx);
  });
  test('renders SiteFooter (role="contentinfo") after slot', async () => {
    const html = await render();
    const slotIdx = html.indexOf('page content');
    const footerIdx = html.search(/<footer[^>]+role="contentinfo"/);
    expect(footerIdx).toBeGreaterThan(slotIdx);
  });
  test('renders TimecodeCounter (aria-hidden + fixed) outside the main flow', async () => {
    const html = await render();
    expect(html).toMatch(/<aside[^>]+aria-hidden="true"[^>]*class="[^"]*fixed[^"]*"/);
  });
  test('chrome elements live inside <body>, not <head>', async () => {
    const html = await render();
    const bodyIdx = html.indexOf('<body');
    const headerIdx = html.search(/<header[^>]+role="banner"/);
    expect(headerIdx).toBeGreaterThan(bodyIdx);
  });
});
