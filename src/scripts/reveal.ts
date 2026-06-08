/**
 * One-shot scroll-reveal controller for BroadcastReveal.astro.
 *
 * Arms reveals only when motion is allowed; below-fold `[data-reveal]` elements
 * fade/rise/scale in once as they enter the viewport, then are unobserved.
 * Fail-open: no-JS or reduced-motion leaves every element fully visible because
 * the hidden CSS state only applies under `.reveal-ready`, which is added here.
 */

const REVEAL_SELECTOR = '[data-reveal]';
const REVEAL_THRESHOLD = 0.2;

export function initReveal(): void {
  if (typeof document === 'undefined') return;

  const reduce = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const supportsIO = 'IntersectionObserver' in window;
  const els = Array.from(
    document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
  );
  if (els.length === 0) return;

  // Leave everything visible when we can't (or shouldn't) animate.
  if (reduce || !supportsIO) return;

  // Arm the hidden state. CSS hides [data-reveal] only under .reveal-ready.
  document.documentElement.classList.add('reveal-ready');

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      }
    },
    { threshold: REVEAL_THRESHOLD, rootMargin: '0px 0px -10% 0px' },
  );

  // Elements already in/near view are revealed synchronously (no flash), the
  // rest are observed for their entrance.
  const viewport = window.innerHeight;
  for (const el of els) {
    if (el.getBoundingClientRect().top < viewport * 0.9) {
      el.classList.add('is-revealed');
    } else {
      observer.observe(el);
    }
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal, { once: true });
  } else {
    initReveal();
  }
}
