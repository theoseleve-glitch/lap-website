// T103 — PostHog conversion events for the waitlist funnel.
//
// Two events:
//   * `waitlist_submitted` — fired on /waitlist when the URL has
//     ?status=submitted (the 303 destination of the form POST).
//     This is the "form intent" event; it does NOT mean the
//     contact is on the audience yet — that requires the
//     double-opt-in confirm click.
//   * `waitlist_confirmed` — fired on /waitlist/welcome (the 303
//     destination of /api/waitlist/confirm). This is the "real
//     subscription" event; this is the conversion signal that
//     matters for the funnel.
//
// Why a separate "submitted" event despite double-opt-in: the gap
// between submit and confirm is the leakage point of the funnel.
// Tracking both events independently lets us measure the
// confirmation rate (confirmed / submitted) as a deliverability +
// inbox-trust metric — if it drops, our domain reputation or
// inbox placement is worth investigating.

import posthog from 'posthog-js';

export function captureWaitlistSubmittedFromUrl(search: string): boolean {
  const params = new URLSearchParams(search);
  if (params.get('status') !== 'submitted') return false;
  posthog.capture('waitlist_submitted');
  return true;
}

export function captureWaitlistConfirmed(): void {
  posthog.capture('waitlist_confirmed');
}

// Side-effect for /waitlist: when the script is imported in the
// page, auto-check the URL on load and fire if appropriate. This
// is what makes the page-level <script> import a one-liner.
if (typeof window !== 'undefined') {
  captureWaitlistSubmittedFromUrl(window.location.search);
}
