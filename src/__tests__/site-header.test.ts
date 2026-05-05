import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SiteHeader from '../components/chrome/SiteHeader.astro';

const render = (currentPath = '/') =>
  AstroContainer.create().then((c) =>
    c.renderToString(SiteHeader, { props: { currentPath } }),
  );

describe('SiteHeader', () => {
  test('uses <header role="banner"> as root', async () => {
    const html = await render();
    expect(html).toMatch(/<header[^>]+role="banner"/);
  });
  test('contains the LapWordmark text "LAP"', async () => {
    const html = await render();
    expect(html).toMatch(/LAP/);
  });
  test('contains the SectorTabs nav (5 primary links)', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/pricing"/);
    expect(html).toMatch(/href="\/how-it-works"/);
    expect(html).toMatch(/href="\/demo"/);
    expect(html).toMatch(/href="\/blog"/);
    expect(html).toMatch(/href="\/for-schools"/);
  });
  test('uses sticky positioning at z-nav', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*sticky[^"]*"/);
    expect(html).toMatch(/z-nav|z-\[var\(--z-nav\)\]/);
  });
  test('current path flows through to SectorTabs aria-current', async () => {
    const html = await render('/blog/some-post');
    expect(html).toMatch(/<a[^>]+href="\/blog"[^>]+aria-current="page"/);
  });
});
