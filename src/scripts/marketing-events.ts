// T218 — PostHog conversion events for the marketing-funnel
// vocabulary the sprint locked: signup_clicked, demo_viewed,
// pricing_viewed. Sits alongside waitlist-events.ts (T103,
// waitlist_submitted + waitlist_confirmed) and download-events.ts
// (T128, download_clicked — renamed from downloads_initiated by
// T218 for naming consistency).
//
// Event shapes:
//   * signup_clicked  { source }   — primary CTA (Start 30-day free
//                                    trial → /register). Source is the page
//                                    the click originated from.
//   * demo_viewed     { source }   — visitor reached the demo
//                                    surface (full /demo page or
//                                    a homepage / product-page
//                                    section becoming visible).
//   * pricing_viewed                — pageview on /pricing.
//
// signup_clicked is wired via a global delegated click listener
// (bindSignupClickListener) auto-installed in BaseLayout, so any
// anchor pointing to www.lap-coach.racing/register fires the event
// without per-anchor per-page wiring. Source is derived from
// window.location.pathname at click time via signupSourceFromPathname.

import posthog from 'posthog-js';
import { postMarketingEvents, postMarketingPageview } from './marketing-collector';

export type SignupSource =
  | 'homepage'
  | 'launch-page'
  | 'v1-page'
  | 'pricing'
  | 'for-schools'
  | 'demo-page'
  | 'other';

export type DemoSource = 'demo-page' | 'homepage' | 'product-page';

export function signupSourceFromPathname(pathname: string): SignupSource {
  const cleaned = pathname.replace(/\/+$/, '') || '/';
  if (cleaned === '/' || cleaned === '/index.html') return 'homepage';
  if (cleaned === '/launch') return 'launch-page';
  if (cleaned === '/v1') return 'v1-page';
  if (cleaned === '/pricing') return 'pricing';
  if (cleaned === '/for-schools') return 'for-schools';
  if (cleaned === '/demo') return 'demo-page';
  return 'other';
}

export function captureSignupClicked(source: SignupSource): void {
  posthog.capture('signup_clicked', { source });
  postMarketingEvents([{ event: 'signup_clicked', properties: { source } }]);
}

export function captureDemoViewed(source: DemoSource): void {
  posthog.capture('demo_viewed', { source });
  postMarketingEvents([{ event: 'demo_viewed', properties: { source } }]);
}

export function capturePricingViewed(): void {
  posthog.capture('pricing_viewed');
  postMarketingEvents([{ event: 'pricing_viewed' }]);
}

// Global delegated click listener: catches clicks on any anchor
// pointing to www.lap-coach.racing/register and fires the event
// with source derived from the page path. Pages don't need
// per-anchor wiring; the listener delegates from the document
// root, so new CTAs added later inherit the instrumentation
// automatically.
export function bindSignupClickListener(doc: Document, win: Window): void {
  doc.addEventListener('click', (ev) => {
    const target = ev.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href') ?? '';
    if (!/\/register(?:[/?#]|$)/.test(href)) return;
    captureSignupClicked(signupSourceFromPathname(win.location.pathname));
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  bindSignupClickListener(document, window);
  postMarketingPageview();
}
