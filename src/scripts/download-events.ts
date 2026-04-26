// T128 + T218 — PostHog conversion event for the desktop /
// mobile app download funnel. Pages that surface a download
// CTA (T110 GitHub Releases on /product/desktop, T114 Play
// Store badge on /product/mobile, both currently BLOCKED on
// shipped artifacts) import this helper and call it from the
// click handler.
//
// Event name `download_clicked` is the funnel signal — fired
// the moment a visitor clicks a download CTA, regardless of
// whether the actual download completes (no easy way to detect
// completion for an external link). Properties:
//   * platform — which OS / app store the download is for
//   * source — which page the click came from
//
// T218 renamed this event from `downloads_initiated` (and the
// helper from `captureDownloadInitiated`) to align with the
// verb_noun convention used by the rest of the marketing-event
// vocabulary (signup_clicked, demo_viewed, pricing_viewed,
// waitlist_submitted). No production data exists pre-launch
// (today is 2026-04-26, public beta opens 2026-07-23), so the
// rename is a free move.

import posthog from 'posthog-js';

export type DownloadPlatform = 'windows' | 'macos' | 'android' | 'ios';

export type DownloadSource = 'product-desktop' | 'product-mobile' | 'homepage';

export interface DownloadClickedProps {
  platform: DownloadPlatform;
  source: DownloadSource;
}

export function captureDownloadClicked(props: DownloadClickedProps): void {
  posthog.capture('download_clicked', { ...props });
}
