import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SectorTabs from '../components/chrome/SectorTabs.astro';

const render = (currentPath: string) =>
  AstroContainer.create().then((c) =>
    c.renderToString(SectorTabs, {
      props: { currentPath },
    }),
  );

describe('SectorTabs', () => {
  test('renders all 5 primary nav links', async () => {
    const html = await render('/');
    expect(html).toMatch(/href="\/pricing"/);
    expect(html).toMatch(/href="\/how-it-works"/);
    expect(html).toMatch(/href="\/demo"/);
    expect(html).toMatch(/href="\/blog"/);
    expect(html).toMatch(/href="\/for-schools"/);
  });
  test('uses <nav role="navigation" aria-label="Primary"> as root', async () => {
    const html = await render('/');
    expect(html).toMatch(/<nav[^>]+role="navigation"[^>]+aria-label="Primary"/);
  });
  test('marks the current path with aria-current="page"', async () => {
    const html = await render('/pricing');
    expect(html).toMatch(/<a[^>]+href="\/pricing"[^>]+aria-current="page"/);
  });
  test('renders sector labels (P/H/D/B/S) in font-telemetry', async () => {
    const html = await render('/');
    expect(html).toMatch(/font-telemetry.*?>.*?P\s*<\/span>/);
    expect(html).toMatch(/font-telemetry.*?>.*?H\s*<\/span>/);
  });
  test('blog match is path-prefix not exact (so /blog/some-post still highlights Blog)', async () => {
    const html = await render('/blog/why-not-motec-clone');
    expect(html).toMatch(/<a[^>]+href="\/blog"[^>]+aria-current="page"/);
  });
});
