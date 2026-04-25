// T128 — unit tests for the PostHog `downloads_initiated` event
// helper. Mirrors the T103 waitlist-events pattern: a small, typed,
// pure module that pages import and call from a click handler.
//
// Why ship the helper before the buttons exist (T110/T114 blocked
// on real artifacts): the analytics primitive is the stable API.
// When T110 unblocks (GitHub Releases of the desktop client) and
// T114 unblocks (Play Store listing), they just import the helper
// and attach it to their click handlers — no analytics design at
// the moment the button arrives. Same pattern that worked for
// T103 → T091 wiring on the waitlist funnel.
//
// Event name is locked at "downloads_initiated" (plural) per
// sprint spec. Property shape { platform, source } supports
// the obvious downstream funnel analysis (group by platform,
// filter by source page).

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

describe('T128: captureDownloadInitiated — fires the downloads_initiated event', () => {
  test('windows + product-desktop fires downloads_initiated with both properties', async () => {
    const { captureDownloadInitiated } = await import('../scripts/download-events');
    captureDownloadInitiated({ platform: 'windows', source: 'product-desktop' });
    expect(captureMock).toHaveBeenCalledTimes(1);
    expect(captureMock).toHaveBeenCalledWith('downloads_initiated', {
      platform: 'windows',
      source: 'product-desktop',
    });
  });

  test('macos + product-desktop fires the same event with platform=macos', async () => {
    // Same source, different platform — both must be captured
    // independently for the funnel to differentiate Windows vs
    // macOS conversion rates per source page.
    const { captureDownloadInitiated } = await import('../scripts/download-events');
    captureDownloadInitiated({ platform: 'macos', source: 'product-desktop' });
    expect(captureMock).toHaveBeenCalledWith('downloads_initiated', {
      platform: 'macos',
      source: 'product-desktop',
    });
  });

  test('android + product-mobile fires the same event with platform=android', async () => {
    // The mobile page's Play Store button (T114, BLOCKED) is
    // the second canonical caller of the helper. Locking the
    // android+product-mobile pair here means T114 doesn't have
    // to invent the event shape when it unblocks.
    const { captureDownloadInitiated } = await import('../scripts/download-events');
    captureDownloadInitiated({ platform: 'android', source: 'product-mobile' });
    expect(captureMock).toHaveBeenCalledWith('downloads_initiated', {
      platform: 'android',
      source: 'product-mobile',
    });
  });

  test('ios + product-mobile fires the same event with platform=ios', async () => {
    // iOS lands at V1 release per doctrine §9 (M5 / 2026-09-23).
    // Pre-launch this is dormant, but keeping the platform in
    // the union means the App Store CTA can wire up cleanly
    // when it ships — no API change needed at that moment.
    const { captureDownloadInitiated } = await import('../scripts/download-events');
    captureDownloadInitiated({ platform: 'ios', source: 'product-mobile' });
    expect(captureMock).toHaveBeenCalledWith('downloads_initiated', {
      platform: 'ios',
      source: 'product-mobile',
    });
  });

  test('homepage source fires the event (CTA on home page is also valid call site)', async () => {
    // Pre-launch the homepage CTA is the waitlist; post-launch
    // a "Download" CTA could land on the homepage hero. Locking
    // 'homepage' in the source union ahead of time prevents a
    // future copy edit from inventing a new source string.
    const { captureDownloadInitiated } = await import('../scripts/download-events');
    captureDownloadInitiated({ platform: 'windows', source: 'homepage' });
    expect(captureMock).toHaveBeenCalledWith('downloads_initiated', {
      platform: 'windows',
      source: 'homepage',
    });
  });

  test('multiple sequential calls each fire independently (no de-duplication)', async () => {
    // A user on /product/desktop who clicks Windows then macOS
    // should produce TWO events — they're showing platform
    // indecision, which is itself a useful funnel signal. Don't
    // accidentally introduce a "fired-once" guard.
    const { captureDownloadInitiated } = await import('../scripts/download-events');
    captureDownloadInitiated({ platform: 'windows', source: 'product-desktop' });
    captureDownloadInitiated({ platform: 'macos', source: 'product-desktop' });
    expect(captureMock).toHaveBeenCalledTimes(2);
  });
});
