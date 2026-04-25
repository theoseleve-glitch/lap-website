// T128 — PostHog conversion event for the desktop / mobile app
// download funnel. Pages that surface a download CTA (T110
// GitHub Releases on /product/desktop, T114 Play Store badge on
// /product/mobile, both currently BLOCKED on shipped artifacts)
// import this helper and call it from the click handler.
//
// Event name `downloads_initiated` is the funnel signal — fired
// the moment a visitor clicks a download CTA, regardless of
// whether the actual download completes (no easy way to detect
// completion for an external link). Properties:
//   * platform — which OS / app store the download is for
//   * source — which page the click came from
//
// Same shape as T103's waitlist-events module so future analytics
// dashboards can treat all conversion events uniformly.

import posthog from 'posthog-js';

export type DownloadPlatform = 'windows' | 'macos' | 'android' | 'ios';

export type DownloadSource = 'product-desktop' | 'product-mobile' | 'homepage';

export interface DownloadInitiatedProps {
  platform: DownloadPlatform;
  source: DownloadSource;
}

export function captureDownloadInitiated(props: DownloadInitiatedProps): void {
  posthog.capture('downloads_initiated', { ...props });
}
