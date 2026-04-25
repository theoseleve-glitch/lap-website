// T129 — DownloadButton integrity contract. The actual buttons
// land with T110 (GitHub Releases on /product/desktop) and T114
// (Play Store badge on /product/mobile), both BLOCKED on shipped
// artifacts. T129 ships the component primitive that enforces
// integrity invariants on every download CTA the site will ever
// surface, so when T110/T114 unblock they pick up the component
// and inherit the contract automatically.
//
// Same pattern T124 used for ProductPillarFooter: hoist the
// invariants into one component, lock them at the component
// level, callers can't drift.
//
// Why this matters — external download links carry real security
// invariants:
//   * target="_blank" + rel="noopener noreferrer" prevents tab-
//     nabbing (target page can rewrite window.opener) and blocks
//     referrer leakage to download hosts.
//   * data-download-platform / data-download-source attributes
//     are how the page-side click-wiring (T128's helper) finds
//     the right metadata to capture.
//
// The actual click-handler attachment is a page-level one-liner
// when T110/T114 unblock: querySelectorAll('[data-download-
// platform]').forEach(el => el.addEventListener('click', () =>
// captureDownloadInitiated({ platform: el.dataset.downloadPlatform,
// source: el.dataset.downloadSource })). vitest runs in Node env
// without a DOM, so wiring stays out of this contract.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import DownloadButton from '../components/DownloadButton.astro';
import type { DownloadPlatform, DownloadSource } from '../scripts/download-events';

const renderButton = async (props: {
  platform: DownloadPlatform;
  source: DownloadSource;
  href: string;
  slots?: { default?: string };
}): Promise<string> => {
  const container = await AstroContainer.create();
  return container.renderToString(DownloadButton, {
    props: { platform: props.platform, source: props.source, href: props.href },
    slots: props.slots,
  });
};

const SAMPLE_HREF = 'https://github.com/lap/lap-desktop/releases/latest/download/lap-windows.exe';

describe('T129: DownloadButton integrity contract', () => {
  test('renders an <a> element with the given href', async () => {
    const html = await renderButton({
      platform: 'windows',
      source: 'product-desktop',
      href: SAMPLE_HREF,
    });
    expect(html).toMatch(new RegExp(`<a[^>]+href="${SAMPLE_HREF.replace(/[/.]/g, '\\$&')}"`));
  });

  test('sets target="_blank" so external download opens in a new tab', async () => {
    // Same-tab navigation to a download URL replaces the page
    // the user was reading. New-tab is the convention.
    const html = await renderButton({
      platform: 'windows',
      source: 'product-desktop',
      href: SAMPLE_HREF,
    });
    expect(html).toMatch(/<a[^>]+target="_blank"/);
  });

  test('sets rel="noopener noreferrer" (security invariant for external links)', async () => {
    // noopener: target page cannot rewrite window.opener (tab-
    // nabbing protection). noreferrer: the download host does
    // not see which LAP page sent them. Both are required on
    // every external link with target="_blank" — there is no
    // single-flag option that covers both.
    const html = await renderButton({
      platform: 'windows',
      source: 'product-desktop',
      href: SAMPLE_HREF,
    });
    expect(html).toMatch(/<a[^>]+rel="[^"]*noopener[^"]*"/);
    expect(html).toMatch(/<a[^>]+rel="[^"]*noreferrer[^"]*"/);
  });

  test('emits data-download-platform attribute matching the platform prop', async () => {
    // The page-level click-wiring uses this attribute to find
    // download buttons and read their platform metadata. Without
    // it the analytics helper (T128) cannot fire with the right
    // platform on the event.
    const html = await renderButton({
      platform: 'macos',
      source: 'product-desktop',
      href: SAMPLE_HREF,
    });
    expect(html).toMatch(/data-download-platform="macos"/);
  });

  test('emits data-download-source attribute matching the source prop', async () => {
    const html = await renderButton({
      platform: 'android',
      source: 'product-mobile',
      href: 'https://play.google.com/store/apps/details?id=racing.lapcoach.app',
    });
    expect(html).toMatch(/data-download-source="product-mobile"/);
  });

  test('renders slot content as the visible label of the anchor', async () => {
    // The button label is what users see; locking it via slot
    // means callers control the copy without the component
    // having opinions about Windows-vs-macOS button copy.
    const html = await renderButton({
      platform: 'windows',
      source: 'product-desktop',
      href: SAMPLE_HREF,
      slots: { default: 'Download for Windows' },
    });
    expect(html).toContain('Download for Windows');
  });

  test('renders consistently for every supported platform', async () => {
    // The component must accept all 4 DownloadPlatform values
    // T128 declared. If a future edit drops one, the contract
    // breaks here before T110/T114 silently lose a CTA.
    const platforms: DownloadPlatform[] = ['windows', 'macos', 'android', 'ios'];
    for (const platform of platforms) {
      const html = await renderButton({
        platform,
        source: 'product-desktop',
        href: SAMPLE_HREF,
      });
      expect(html).toMatch(new RegExp(`data-download-platform="${platform}"`));
      expect(html).toMatch(/<a[^>]+target="_blank"/);
      expect(html).toMatch(/rel="[^"]*noopener[^"]*"/);
    }
  });

  test('renders consistently for every supported source page', async () => {
    const sources: DownloadSource[] = ['product-desktop', 'product-mobile', 'homepage'];
    for (const source of sources) {
      const html = await renderButton({
        platform: 'windows',
        source,
        href: SAMPLE_HREF,
      });
      expect(html).toMatch(new RegExp(`data-download-source="${source}"`));
    }
  });
});
