import gsap from 'gsap';

/**
 * True when the browser is capable of running motion AND the user has not
 * asked for reduced motion. Runs pure — no DOM mutation — so it can be
 * unit-tested and used as an early-return guard.
 *
 * CLAUDE.md locks the policy: "GSAP only for above-the-fold motion; defer
 * below-fold." T027 delivers the above-the-fold entrance; the guard below
 * is the mechanism that honours `prefers-reduced-motion: reduce`.
 */
export function shouldAnimate(): boolean {
  // `typeof X` is the only global-lookup form that does not throw on
  // undeclared identifiers, so it works in both browser (matchMedia on
  // window → globalThis) and non-browser (matchMedia absent) contexts,
  // which is what the Vitest-node + browser-runtime split requires.
  if (typeof matchMedia !== 'function') return false;
  return !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Stagger-fade the hero's headline, subhead, and CTA pair in from a
 * translateY(20px) + opacity:0 start state to their natural layout.
 * Selector decouples motion from class names — any element tagged
 * `data-hero-animate` participates in the sequence, so future copy
 * refactors don't drift from the motion choreography.
 */
export function initHeroMotion(): void {
  if (!shouldAnimate()) return;

  gsap.from('[data-hero-animate]', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroMotion);
  } else {
    initHeroMotion();
  }
}
