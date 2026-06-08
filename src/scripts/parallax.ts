/**
 * Lightweight scroll parallax. Translates any `[data-parallax]` element on the
 * Y axis at `data-parallax-speed` (default 0.25) of scroll, via a GPU-composited
 * transform inside a rAF tick. Disabled entirely under reduced-motion.
 */

export function initParallax(): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const els = Array.from(
    document.querySelectorAll<HTMLElement>('[data-parallax]'),
  );
  if (els.length === 0) return;

  let ticking = false;
  const update = (): void => {
    const y = window.scrollY;
    for (const el of els) {
      const speed = Number(el.dataset.parallaxSpeed ?? '0.25');
      el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
    }
    ticking = false;
  };
  const onScroll = (): void => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParallax, { once: true });
  } else {
    initParallax();
  }
}
