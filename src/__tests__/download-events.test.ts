// T128 + T218 — unit tests for the PostHog `download_clicked`
// event helper. T128 introduced the helper as `downloads_initiated`;
// T218 renamed the canonical event + function to `download_clicked`
// / `captureDownloadClicked` so the marketing-event vocabulary is
// uniform (verb_noun) across signup_clicked, demo_viewed,
// pricing_viewed, waitlist_submitted, download_clicked. No
// production analytics data exists pre-launch (today is 2026-04-26,
// public beta opens 2026-07-23), so the rename is a free move.
//
// Pages that surface a download CTA (T110 GitHub Releases on
// /product/desktop, T114 Play Store badge on /product/mobile,
// both currently BLOCKED on shipped artifacts) import this helper
// and call it from the click handler. Property shape
// { platform, source } supports the obvious downstream funnel
// analysis (group by platform, filter by source page).

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const captureMock = vi.fn();
vi.mock('posthog-js', () => ({
  default: {
    capture: captureMock,
  },
}));

beforeEach(() => {
  captureMock.mockReset();
});

afterEach(() => {
  vi.resetModules();
});

describe('T218: captureDownloadClicked — fires the download_clicked event', () => {
  test('windows + product-desktop fires download_clicked with both properties', async () => {
    const { captureDownloadClicked } = await import('../scripts/download-events');
    captureDownloadClicked({ platform: 'windows', source: 'product-desktop' });
    expect(captureMock).toHaveBeenCalledTimes(1);
    expect(captureMock).toHaveBeenCalledWith('download_clicked', {
      platform: 'windows',
      source: 'product-desktop',
    });
  });

  test('macos + product-desktop fires the same event with platform=macos', async () => {
    // Same source, different platform — both must be captured
    // independently for the funnel to differentiate Windows vs
    // macOS conversion rates per source page.
    const { captureDownloadClicked } = await import('../scripts/download-events');
    captureDownloadClicked({ platform: 'macos', source: 'product-desktop' });
    expect(captureMock).toHaveBeenCalledWith('download_clicked', {
      platform: 'macos',
      source: 'product-desktop',
    });
  });

  test('android + product-mobile fires the same event with platform=android', async () => {
    // The mobile page's Play Store button (T114, BLOCKED) is
    // the second canonical caller of the helper. Locking the
    // android+product-mobile pair here means T114 doesn't have
    // to invent the event shape when it unblocks.
    const { captureDownloadClicked } = await import('../scripts/download-events');
    captureDownloadClicked({ platform: 'android', source: 'product-mobile' });
    expect(captureMock).toHaveBeenCalledWith('download_clicked', {
      platform: 'android',
      source: 'product-mobile',
    });
  });

  test('ios + product-mobile fires the same event with platform=ios', async () => {
    // iOS lands at V1 release per doctrine §9 (M5 / 2026-09-23).
    // Pre-launch this is dormant, but keeping the platform in
    // the union means the App Store CTA can wire up cleanly
    // when it ships — no API change needed at that moment.
    const { captureDownloadClicked } = await import('../scripts/download-events');
    captureDownloadClicked({ platform: 'ios', source: 'product-mobile' });
    expect(captureMock).toHaveBeenCalledWith('download_clicked', {
      platform: 'ios',
      source: 'product-mobile',
    });
  });

  test('homepage source fires the event (CTA on home page is also valid call site)', async () => {
    // Pre-launch the homepage CTA is the waitlist; post-launch
    // a "Download" CTA could land on the homepage hero. Locking
    // 'homepage' in the source union ahead of time prevents a
    // future copy edit from inventing a new source string.
    const { captureDownloadClicked } = await import('../scripts/download-events');
    captureDownloadClicked({ platform: 'windows', source: 'homepage' });
    expect(captureMock).toHaveBeenCalledWith('download_clicked', {
      platform: 'windows',
      source: 'homepage',
    });
  });

  test('multiple sequential calls each fire independently (no de-duplication)', async () => {
    // A user on /product/desktop who clicks Windows then macOS
    // should produce TWO events — they're showing platform
    // indecision, which is itself a useful funnel signal. Don't
    // accidentally introduce a "fired-once" guard.
    const { captureDownloadClicked } = await import('../scripts/download-events');
    captureDownloadClicked({ platform: 'windows', source: 'product-desktop' });
    captureDownloadClicked({ platform: 'macos', source: 'product-desktop' });
    expect(captureMock).toHaveBeenCalledTimes(2);
  });
});
