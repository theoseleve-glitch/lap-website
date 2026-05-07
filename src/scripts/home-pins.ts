import { loadGsap, shouldAnimate, onIdle } from './gsap-loader';

/**
 * Pin-and-scrub for the home rooms that the spec marks as pinned:
 *   - the-pain      : cross-fade [data-pin-cross-fade] panes
 *   - versus        : card-swap [data-pin-card-swap]
 *   - pipeline      : horizontal scrub [data-pin-horizontal-scrub]
 *   - podium        : final pin (no inner scrub, just sticky for one screen)
 *
 * StartGrid is also a pin via `min-h-screen` + sticky natural behaviour
 * for the press-and-hold gate; no GSAP needed for it.
 *
 * Disabled below 768 px (touch / narrow). Disabled when reduced-motion.
 */

const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

export async function initHomePins(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!shouldAnimate()) return;
  if (isMobile()) return;
  const { gsap, ScrollTrigger } = await loadGsap();

  // The-pain: cross-fade
  const crossFade = document.querySelector<HTMLElement>('[data-pin-cross-fade]');
  if (crossFade) {
    const before = crossFade.querySelector<HTMLElement>('[data-pin-pane="before"]');
    const after = crossFade.querySelector<HTMLElement>('[data-pin-pane="after"]');
    if (before && after) {
      gsap.set(after, { opacity: 0.3 });
      ScrollTrigger.create({
        trigger: crossFade,
        start: 'top 75%',
        end: 'bottom 25%',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(before, { opacity: 1 - p * 0.7 });
          gsap.set(after, { opacity: 0.3 + p * 0.7 });
        },
      });
    }
  }

  // Versus: card-swap (timing dims, coaching emerges)
  const swap = document.querySelector<HTMLElement>('[data-pin-card-swap]');
  if (swap) {
    const timing = swap.querySelector<HTMLElement>('[data-pin-card="timing"]');
    const coaching = swap.querySelector<HTMLElement>('[data-pin-card="coaching"]');
    if (timing && coaching) {
      gsap.set(coaching, { opacity: 0.5, x: 24 });
      ScrollTrigger.create({
        trigger: swap,
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(timing, { opacity: 1 - p * 0.5 });
          gsap.set(coaching, { opacity: 0.5 + p * 0.5, x: 24 - p * 24 });
        },
      });
    }
  }

  // Pipeline: horizontal scrub
  const horiz = document.querySelector<HTMLElement>('[data-pin-horizontal-scrub]');
  if (horiz) {
    const ol = horiz.querySelector<HTMLElement>('ol');
    if (ol) {
      const totalWidth = ol.scrollWidth;
      const viewportWidth = horiz.clientWidth;
      const distance = Math.max(0, totalWidth - viewportWidth);
      if (distance > 0) {
        ScrollTrigger.create({
          trigger: horiz,
          start: 'top 30%',
          end: () => `+=${distance}`,
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            gsap.set(ol, { x: -self.progress * distance });
          },
        });
      }
    }
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => onIdle(() => initHomePins()));
  } else {
    onIdle(() => initHomePins());
  }
}
