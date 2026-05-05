import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SiteFooter from '../components/chrome/SiteFooter.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(SiteFooter, {}));

describe('SiteFooter', () => {
  test('uses <footer role="contentinfo">', async () => {
    const html = await render();
    expect(html).toMatch(/<footer[^>]+role="contentinfo"/);
  });
  test('Product column: links to /pricing, /how-it-works, /demo, /v1', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/pricing"/);
    expect(html).toMatch(/href="\/how-it-works"/);
    expect(html).toMatch(/href="\/demo"/);
    expect(html).toMatch(/href="\/v1"/);
  });
  test('Company column: /for-schools, /press, /blog', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/for-schools"/);
    expect(html).toMatch(/href="\/press"/);
    expect(html).toMatch(/href="\/blog"/);
  });
  test('Legal column: /privacy, /refund-policy', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/privacy"/);
    expect(html).toMatch(/href="\/refund-policy"/);
  });
  test('contains LAP brand stamp at the bottom', async () => {
    const html = await render();
    expect(html).toMatch(/LAP/);
    expect(html).toMatch(/©|copyright/i);
  });
  test('column section headings use font-telemetry (Phase-1 utility)', async () => {
    const html = await render();
    // Each column has a heading like "Product" / "Company" / "Legal".
    // Match a heading element with font-telemetry class.
    expect(html).toMatch(/class="[^"]*font-telemetry[^"]*"/);
  });
});
