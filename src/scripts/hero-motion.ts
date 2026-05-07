// Hero stagger — CSS-driven for above-the-fold performance budget.
// We cannot use GSAP here because GSAP is lazy-loaded and would arrive
// after first paint, causing FOUC. Instead each [data-hero-animate]
// element starts at opacity:0 (CSS), and a single class on <html>
// triggers a staggered fade-in via animation-delay per :nth-child.
//
// Reduced-motion: the CSS @media query in global.css writes the final
// state instantly so reduced-motion users never see the opacity:0 frame.
//
// Re-export shouldAnimate so existing callers (and the hero-motion test
// suite) keep importing it from this module path.

import { shouldAnimate } from './gsap-loader';

export { shouldAnimate } from './gsap-loader';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const root = document.documentElement;
  if (shouldAnimate()) {
    // Two rAFs: first paints the opacity:0 initial state, second flips
    // the class so the animation actually runs (without this, the class
    // could be added in the same frame as initial paint and the browser
    // would skip the transition).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.add('hero-ready'));
    });
  } else {
    // Reduced-motion users: the @media block in global.css forces the
    // final state regardless of `.hero-ready`, so we don't strictly need
    // this. But adding the class anyway keeps :nth-child rules visible
    // in DevTools and avoids surprising future maintainers.
    root.classList.add('hero-ready');
  }
}
