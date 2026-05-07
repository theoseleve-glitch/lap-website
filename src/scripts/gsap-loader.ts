/**
 * Lazy GSAP + ScrollTrigger loader.
 *
 * The current static `import gsap from 'gsap'` in `hero-motion.ts` ships
 * ~40 KB into the LCP-blocking script bundle. CLAUDE.md caps homepage JS
 * at 100 KB gzip; that single import already eats half the budget.
 * This module:
 *   1. Exposes `shouldAnimate()` — the same prefers-reduced-motion guard
 *      hero-motion has used since T027, lifted here so every consumer
 *      shares one source of truth.
 *   2. Exposes `loadGsap()` — a one-time dynamic import that resolves to
 *      `{ gsap, ScrollTrigger }`. Subsequent calls reuse the same Promise
 *      (memoised), so callers never pay the resolve cost twice.
 *
 * Callers wrap `loadGsap()` in `requestIdleCallback` (or a fallback
 * setTimeout) so GSAP enters the bundle AFTER the LCP element paints.
 */

export function shouldAnimate(): boolean {
  // typeof guard so the module is safe to import in SSR / Vitest-node.
  if (typeof matchMedia !== 'function') return false;
  return !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type GsapBundle = {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
};

let cached: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (cached) return cached;
  cached = (async () => {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  })();
  return cached;
}

/**
 * Schedule a callback for after first paint. Uses requestIdleCallback when
 * available, otherwise setTimeout(0). Always safe to call from module top
 * level — guards on `typeof window`.
 */
export function onIdle(cb: () => void): void {
  if (typeof window === 'undefined') return;
  type IdleWindow = Window & { requestIdleCallback?: (cb: () => void) => void };
  const w = window as IdleWindow;
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(cb);
  } else {
    window.setTimeout(cb, 0);
  }
}
