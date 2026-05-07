import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SectorTabs from '../components/chrome/SectorTabs.astro';

const render = (currentPath: string) =>
  AstroContainer.create().then((c) =>
    c.renderToString(SectorTabs, { props: { currentPath } }),
  );

describe('SectorTabs · variant C', () => {
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

  test('labels render in font-telemetry uppercase', async () => {
    const html = await render('/');
    expect(html).toMatch(/class="[^"]*font-telemetry[^"]*"[^>]*>\s*PRICING/);
    expect(html).toMatch(/class="[^"]*font-telemetry[^"]*"[^>]*>\s*HOW/);
  });

  test('does NOT render single-letter sector codes (P/H/D/B/S)', async () => {
    const html = await render('/');
    expect(html).not.toMatch(/<span[^>]*>\s*P\s*<\/span>/);
    expect(html).not.toMatch(/<span[^>]*>\s*H\s*<\/span>/);
  });

  test('active link gets data-active="true"', async () => {
    const html = await render('/pricing');
    const activeMatch = html.match(/<a[^>]+href="\/pricing"[^>]*>[\s\S]*?<\/a>/);
    expect(activeMatch).not.toBeNull();
    expect(activeMatch![0]).toMatch(/data-active="true"/);
  });

  test('blog match is path-prefix not exact', async () => {
    const html = await render('/blog/why-not-motec-clone');
    expect(html).toMatch(/<a[^>]+href="\/blog"[^>]+aria-current="page"/);
  });
});
