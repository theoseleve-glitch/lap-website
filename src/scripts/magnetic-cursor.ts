import { loadGsap } from './gsap-loader';

/**
 * Hero-only crosshair cursor with magnetic pull on links.
 *
 * Eligibility:
 *   - pointer: fine (mouse / pen) — touch devices keep native cursor
 *   - prefers-reduced-motion: no-preference — reduced-motion users keep native
 *   - matchMedia available — SSR / Vitest-node early-out
 *
 * The crosshair is a fixed-position div appended to body. We listen for
 * pointermove globally; when within the hero room (data-magnetic-zone),
 * the crosshair shows. When over a link inside the zone, GSAP `quickTo`
 * lerps the crosshair toward the link center (magnetic pull).
 */

export function isCursorEligible(): boolean {
  if (typeof matchMedia !== 'function') return false;
  if (matchMedia('(pointer: coarse)').matches) return false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

export function initMagneticCursor(): () => void {
  if (typeof document === 'undefined') return () => {};
  if (!isCursorEligible()) return () => {};

  const zone = document.querySelector<HTMLElement>('[data-magnetic-zone]');
  if (!zone) return () => {};

  const cursor = document.createElement('div');
  cursor.setAttribute('data-magnetic-cursor', '');
  cursor.setAttribute('aria-hidden', 'true');
  cursor.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:24px',
    'height:24px',
    'pointer-events:none',
    'border:1px solid var(--color-pit-orange)',
    'border-radius:50%',
    'box-shadow:0 0 12px rgba(201,168,76,0.5)',
    'transform:translate(-50%, -50%)',
    'z-index:var(--z-cursor)',
    'opacity:0',
    'transition:opacity 0.2s ease',
    'will-change:transform',
  ].join(';');
  document.body.appendChild(cursor);
  document.body.style.cursor = 'none';

  let xTo: ((value: number) => void) | null = null;
  let yTo: ((value: number) => void) | null = null;

  loadGsap()
    .then(({ gsap }) => {
      xTo = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
      yTo = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
    })
    .catch(() => {
      // GSAP failed to load; cursor still moves via direct CSS transform.
    });

  let inZone = false;

  const setPos = (x: number, y: number) => {
    if (xTo && yTo) {
      xTo(x);
      yTo(y);
    } else {
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }
  };

  const onMove = (e: PointerEvent) => {
    const rect = zone.getBoundingClientRect();
    inZone =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    cursor.style.opacity = inZone ? '1' : '0';
    if (!inZone) return;

    // Magnetic pull on links/buttons inside zone.
    const target = e.target as HTMLElement | null;
    const magnet = target?.closest<HTMLElement>('a, button');
    if (magnet && zone.contains(magnet)) {
      const m = magnet.getBoundingClientRect();
      const cx = m.left + m.width / 2;
      const cy = m.top + m.height / 2;
      // Lerp 60 % toward link centre, 40 % follow pointer.
      setPos(e.clientX * 0.4 + cx * 0.6, e.clientY * 0.4 + cy * 0.6);
    } else {
      setPos(e.clientX, e.clientY);
    }
  };

  document.addEventListener('pointermove', onMove);
  return () => {
    document.removeEventListener('pointermove', onMove);
    cursor.remove();
    document.body.style.cursor = '';
  };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initMagneticCursor());
  } else {
    initMagneticCursor();
  }
}
