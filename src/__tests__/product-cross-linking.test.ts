// T123 — Cross-linking between the five pillar product pages.
// /product/desktop, /product/mobile, /product/bridge,
// /product/coaching, /product/driver-profile must each carry a
// uniform "See also" block listing the other four pillars so a
// reader can traverse the product surface laterally without
// bouncing back to /product. Deliverable verb is "consistent"
// (sprint T123) — same structural contract on every pillar.
//
// Why parameterized: the contract is identical on each page;
// duplicating five test files would invite drift. test.each runs
// the same assertions per pillar, so a future edit that breaks one
// pillar's section structure fails the corresponding row only.
//
// The /product overview back-link stays — it's the catalog/home
// link. The See also block is sibling-only.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Desktop from '../pages/product/desktop.astro';
import Mobile from '../pages/product/mobile.astro';
import Bridge from '../pages/product/bridge.astro';
import Coaching from '../pages/product/coaching.astro';
import DriverProfile from '../pages/product/driver-profile.astro';

interface Pillar {
  slug: string;
  ownHref: string;
  component: Parameters<AstroContainer['renderToString']>[0];
}

const PILLARS: Pillar[] = [
  { slug: 'desktop', ownHref: '/product/desktop', component: Desktop },
  { slug: 'mobile', ownHref: '/product/mobile', component: Mobile },
  { slug: 'bridge', ownHref: '/product/bridge', component: Bridge },
  { slug: 'coaching', ownHref: '/product/coaching', component: Coaching },
  { slug: 'driver-profile', ownHref: '/product/driver-profile', component: DriverProfile },
];

const ALL_PILLAR_HREFS = PILLARS.map((p) => p.ownHref);

const renderPage = async (component: Pillar['component']): Promise<string> => {
  const container = await AstroContainer.create();
  return container.renderToString(component);
};

function extractSeeAlsoSection(html: string): string {
  const match = html.match(
    /<section[^>]+aria-labelledby="[^"]*see-also[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
  );
  return match ? match[1] : '';
}

describe('T123: cross-linking between pillar product pages', () => {
  test.each(PILLARS)(
    '$slug page has a "See also" section (sibling navigation cluster)',
    async ({ component }) => {
      const html = await renderPage(component);
      expect(html).toMatch(/<section[^>]+aria-labelledby="[^"]*see-also/i);
    },
  );

  test.each(PILLARS)(
    '$slug See also section links to all 4 sibling pillars',
    async ({ component, ownHref }) => {
      // The whole point of the cross-linking surface — a reader on
      // any pillar should reach all 4 siblings in a single click.
      // Without all 4, "consistent" collapses to "some pages link
      // to some others" which is the failure mode this test prevents.
      const html = await renderPage(component);
      const section = extractSeeAlsoSection(html);
      expect(section).not.toBe('');
      const expectedSiblings = ALL_PILLAR_HREFS.filter((href) => href !== ownHref);
      for (const sibling of expectedSiblings) {
        expect(section).toMatch(new RegExp(`href="${sibling}"`));
      }
    },
  );

  test.each(PILLARS)(
    '$slug See also section does NOT link to itself',
    async ({ component, ownHref }) => {
      // Self-links in a "See also" cluster are noise — the reader
      // is already on the page. Locking the absence catches a
      // copy-paste regression where a fresh pillar's section is
      // forgotten to be edited from the template.
      const html = await renderPage(component);
      const section = extractSeeAlsoSection(html);
      expect(section).not.toBe('');
      expect(section).not.toMatch(new RegExp(`href="${ownHref}"`));
    },
  );

  test.each(PILLARS)(
    '$slug See also section uses the consistent vocabulary anchor',
    async ({ component }) => {
      // Lock the heading vocabulary so a future copy edit cannot
      // genericise to "Other content" or "More posts" — those
      // labels would imply a blog index, not a pillar map.
      const html = await renderPage(component);
      const section = extractSeeAlsoSection(html);
      expect(section.toLowerCase()).toMatch(/see also/);
    },
  );

  test.each(PILLARS)(
    '$slug page still has the /product overview back-link (separate from See also)',
    async ({ component }) => {
      // T123 adds sibling links; the /product overview back-link
      // (existing on each pillar pre-T123) must NOT be removed —
      // it's the only path back to the catalog/home view of all
      // five pillars at once.
      const html = await renderPage(component);
      expect(html).toMatch(/<a[^>]+href="\/product"(?![\w-])/);
    },
  );
});
