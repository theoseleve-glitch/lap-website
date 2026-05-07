import { loadGsap, shouldAnimate, onIdle } from './gsap-loader';

/**
 * Re-export shouldAnimate so existing tests keep passing — the original
 * hero-motion.test.ts imports it from this module path.
 */
export { shouldAnimate } from './gsap-loader';

/**
 * Stagger-fade the hero's headline, subhead, and CTA pair from a
 * translateY(20px) + opacity:0 start state to their natural layout.
 * Selector decouples motion from class names — any element tagged
 * `data-hero-animate` participates.
 *
 * GSAP loads lazily via gsap-loader so it never blocks LCP.
 */
export async function initHeroMotion(): Promise<void> {
  if (!shouldAnimate()) return;
  const { gsap } = await loadGsap();
  gsap.from('[data-hero-animate]', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
  });
}

if (typeof window !== 'undefined') {
  onIdle(() => {
    initHeroMotion();
  });
}
