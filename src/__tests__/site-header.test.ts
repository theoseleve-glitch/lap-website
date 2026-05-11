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
  test('mounts a primary "Start trial" CTA on the right of the header', async () => {
    const html = await render();
    // Header CTA exists, links to signup, opens with rel=noopener, and uses
    // gold pit-orange. Astro can render the attributes in any order, so the
    // assertions are order-agnostic.
    expect(html).toMatch(/<a[^>]*?\sdata-header-cta(?:\s|>)/);
    const ctaMatch = html.match(/<a[^>]*?\sdata-header-cta[^>]*>[\s\S]*?<\/a>/);
    expect(ctaMatch).not.toBeNull();
    const cta = ctaMatch![0];
    expect(cta).toMatch(/href="\/register"/);
    expect(cta).toMatch(/rel="noopener"/);
    expect(cta).toMatch(/bg-pit-orange-deep/);
    expect(cta).toMatch(/text-asphalt/);
    expect(cta).toMatch(/Start trial/);
  });
  test('mounts a "Sign in" text link to the left of the trial CTA', async () => {
    const html = await render();
    // The V2 marketing header (lap_web/lap-website/src/components/site/
    // SiteHeader.tsx) shipped a quiet text "Sign in" link paired with the
    // gold signup CTA. The Phase 4 Astro port initially dropped the Sign in
    // and shipped trial-only; this test pins the V2-equivalent pairing.
    expect(html).toMatch(/<a[^>]*?\sdata-header-login(?:\s|>)/);
    const loginMatch = html.match(/<a[^>]*?\sdata-header-login[^>]*>[\s\S]*?<\/a>/);
    expect(loginMatch).not.toBeNull();
    const login = loginMatch![0];
    expect(login).toMatch(/href="\/login"/);
    expect(login).toMatch(/text-steel/);
    expect(login).toMatch(/hover:text-chalk/);
    expect(login).toMatch(/Sign in/);
    // Hidden on mobile, shown on md+ (mirrors V2 hide-on-mobile behaviour;
    // the trial CTA carries the mobile conversion path on its own).
    expect(login).toMatch(/hidden[^"]*md:inline-flex|md:inline-flex[^"]*hidden/);
    // Document order: Sign in MUST precede the trial CTA so primary
    // attention still lands on the signup conversion.
    const loginIdx = html.indexOf('data-header-login');
    const ctaIdx = html.indexOf('data-header-cta');
    expect(loginIdx).toBeGreaterThan(-1);
    expect(ctaIdx).toBeGreaterThan(loginIdx);
  });

  test('mounts SectorRibbon when currentPath is "/"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SiteHeader, {
      props: { currentPath: '/' },
    });
    expect(html).toMatch(/data-sector-ribbon/);
  });

  test('omits SectorRibbon on inner pages (currentPath != "/")', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SiteHeader, {
      props: { currentPath: '/pricing' },
    });
    expect(html).not.toMatch(/data-sector-ribbon/);
  });
});
