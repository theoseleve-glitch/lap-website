// T124 — ProductPillarFooter component contract. Hoists the
// See-also + /product back-link block that T123 inlined on each
// of the five pillar product pages into one component. The block
// shape is identical on every page modulo the omitted self-link;
// keeping five inline copies invites silent drift, so T124 collapses
// them into one component driven by a currentSlug prop.
//
// Page-level cross-linking contract is already locked by T123
// (product-cross-linking.test.ts). This file targets the component
// in isolation so a future edit fails here first, instead of in
// 25 page-level test rows.
//
// Canonical pillar order is enforced inside the component (single
// source of truth) — see PILLARS in ProductPillarFooter.astro.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import ProductPillarFooter from '../components/ProductPillarFooter.astro';

const PILLAR_SLUGS = ['desktop', 'mobile', 'bridge', 'coaching', 'driver-profile'] as const;
type PillarSlug = (typeof PILLAR_SLUGS)[number];

const ALL_HREFS = PILLAR_SLUGS.map((slug) => `/product/${slug}`);

const renderFooter = async (currentSlug: PillarSlug): Promise<string> => {
  const container = await AstroContainer.create();
  return container.renderToString(ProductPillarFooter, { props: { currentSlug } });
};

describe('T124: ProductPillarFooter component', () => {
  test.each(PILLAR_SLUGS)(
    'renders the See-also section with consistent labelling for currentSlug=%s',
    async (slug) => {
      const html = await renderFooter(slug);
      expect(html).toMatch(/<section[^>]+aria-labelledby="[^"]*see-also[^"]*"/i);
      expect(html.toLowerCase()).toContain('see also');
    },
  );

  test.each(PILLAR_SLUGS)('renders all 4 sibling pillar links for currentSlug=%s', async (slug) => {
    // The component's job — per-currentSlug, link to all four
    // siblings and skip self. Absent any of the four is a
    // regression of the T123 contract collapsed into the
    // component.
    const html = await renderFooter(slug);
    const ownHref = `/product/${slug}`;
    const expected = ALL_HREFS.filter((href) => href !== ownHref);
    for (const href of expected) {
      expect(html).toMatch(new RegExp(`href="${href}"`));
    }
  });

  test.each(PILLAR_SLUGS)('omits self-link for currentSlug=%s', async (slug) => {
    // Linking to the page the user is already on is noise. This
    // assertion is the structural complement to "all 4 siblings"
    // above — together they verify the filter is working
    // exactly, not approximately.
    const html = await renderFooter(slug);
    const ownHref = `/product/${slug}`;
    expect(html).not.toMatch(new RegExp(`href="${ownHref}"(?!\\w)`));
  });

  test.each(PILLAR_SLUGS)(
    'renders the /product overview back-link for currentSlug=%s',
    async (slug) => {
      // Back-link must be preserved across the DRY pass — pages
      // need a path back to the catalog regardless of which
      // pillar they're on.
      const html = await renderFooter(slug);
      expect(html).toMatch(
        /<a[^>]+href="\/product"(?![\w-])[^>]*>[\s\S]*?Back to product overview/i,
      );
    },
  );

  test('canonical pillar order: siblings on desktop page render in mobile → bridge → coaching → driver-profile order', async () => {
    // Lock the canonical sibling order as visible to readers. A
    // future edit that re-orders the PILLARS array silently in
    // the component would break the consistent reader experience
    // (cross-linking is consistent only if the order is). Test
    // on the desktop page because it has all four siblings in
    // the natural order with no skipping.
    const html = await renderFooter('desktop');
    const mobileIdx = html.indexOf('href="/product/mobile"');
    const bridgeIdx = html.indexOf('href="/product/bridge"');
    const coachingIdx = html.indexOf('href="/product/coaching"');
    const profileIdx = html.indexOf('href="/product/driver-profile"');
    expect(mobileIdx).toBeGreaterThan(-1);
    expect(bridgeIdx).toBeGreaterThan(mobileIdx);
    expect(coachingIdx).toBeGreaterThan(bridgeIdx);
    expect(profileIdx).toBeGreaterThan(coachingIdx);
  });
});
