/**
 * Active-sector tracker driven by IntersectionObserver.
 *
 * Each homepage `<section>` carries `data-sector-id="<id>"`. We observe
 * all of them and dispatch a `sector-change` CustomEvent on
 * `document` whenever the intersecting section changes. The HUD
 * (top ribbon + bottom timecode) listens for this event to update
 * the active segment and the bottom sector-name field.
 *
 * One source of truth = one IO instance = lowest CPU cost. The 50%
 * threshold ensures we activate the section that owns the most of
 * the viewport, not whatever happens to peek in at the edges.
 */

export interface Sector {
  /** Stable kebab-case id, used for `data-sector-id` and event detail. */
  id: string;
  /** Two-digit ribbon code, e.g. "01". */
  code: string;
  /** Display name, e.g. "Start Grid". */
  name: string;
  /** Token identifier matching the [data-accent='X'] selector. */
  accent: 'orange' | 'red' | 'steel' | 'purple' | 'green';
}

export const SECTORS: readonly Sector[] = [
  { id: 'start-grid',    code: '01', name: 'Start Grid',     accent: 'orange' },
  { id: 'session-proof', code: '02', name: 'Session Proof',  accent: 'red' },
  { id: 'the-pain',      code: '03', name: 'The Pain',       accent: 'steel' },
  { id: 'versus',        code: '04', name: 'Versus',         accent: 'purple' },
  { id: 'pipeline',      code: '05', name: 'Pipeline',       accent: 'green' },
  { id: 'garage',        code: '06', name: 'Garage',         accent: 'orange' },
  { id: 'podium',        code: '07', name: 'Podium',         accent: 'orange' },
] as const;

export interface SectorChangeDetail {
  active: Sector;
  passed: ReadonlyArray<Sector>;
}

/**
 * Attach the observer. Returns a teardown function for tests.
 */
export function startSectorProgress(): () => void {
  if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }

  const sections = Array.from(
    document.querySelectorAll<HTMLElement>('[data-sector-id]'),
  );
  if (sections.length === 0) return () => {};

  const idToIndex = new Map<string, number>(
    SECTORS.map((s, i) => [s.id, i]),
  );

  let activeIndex = -1;

  const broadcast = (newIndex: number) => {
    if (newIndex === activeIndex) return;
    activeIndex = newIndex;
    const active = SECTORS[newIndex];
    if (!active) return;
    const passed = SECTORS.slice(0, newIndex);
    const event = new CustomEvent<SectorChangeDetail>('sector-change', {
      detail: { active, passed },
    });
    document.dispatchEvent(event);
  };

  const io = new IntersectionObserver(
    (entries) => {
      // Pick the entry with the largest visible ratio that is intersecting.
      let best: IntersectionObserverEntry | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!best || entry.intersectionRatio > best.intersectionRatio) {
          best = entry;
        }
      }
      if (!best) return;
      const id = (best.target as HTMLElement).getAttribute('data-sector-id');
      if (!id) return;
      const idx = idToIndex.get(id);
      if (idx === undefined) return;
      broadcast(idx);
    },
    { threshold: [0.5] },
  );

  for (const sec of sections) io.observe(sec);
  return () => io.disconnect();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => startSectorProgress());
  } else {
    startSectorProgress();
  }
}
