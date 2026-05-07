import { describe, expect, test, vi } from 'vitest';

describe('sector-progress', () => {
  test('exports startSectorProgress and SECTORS list', async () => {
    const mod = await import('../../scripts/sector-progress');
    expect(typeof mod.startSectorProgress).toBe('function');
    expect(Array.isArray(mod.SECTORS)).toBe(true);
    expect(mod.SECTORS.length).toBe(7);
  });

  test('SECTORS each have id, code, name, accent', async () => {
    const mod = await import('../../scripts/sector-progress');
    for (const s of mod.SECTORS) {
      expect(s.id).toMatch(/^[a-z-]+$/);
      expect(s.code).toMatch(/^\d{2}$/);
      expect(typeof s.name).toBe('string');
      expect(s.accent).toMatch(/^(orange|red|steel|purple|green)$/);
    }
  });

  test('SECTORS ordering matches spec — start-grid first, podium last', async () => {
    const mod = await import('../../scripts/sector-progress');
    expect(mod.SECTORS[0].id).toBe('start-grid');
    expect(mod.SECTORS[6].id).toBe('podium');
  });

  test('startSectorProgress dispatches sector-change CustomEvent on activation', async () => {
    const mod = await import('../../scripts/sector-progress');
    // Simulated viewport-relative rect: only sections[0] (start-grid) is in
    // the viewport. The post-T20 impl picks the section with the largest
    // visible-area footprint, so the off-screen sections supply rects that
    // sit below the fold.
    const sections = mod.SECTORS.map((s, i) => ({
      id: s.id,
      setAttribute: vi.fn(),
      getAttribute: (n: string) => (n === 'data-sector-id' ? s.id : null),
      getBoundingClientRect: () => ({
        top: i === 0 ? 0 : 1000 + i * 800,
        bottom: i === 0 ? 600 : 1000 + i * 800 + 800,
        height: 800,
      }),
    }));
    const observed: Array<unknown> = [];
    vi.stubGlobal('document', {
      querySelectorAll: () => sections,
      dispatchEvent: (e: unknown) => observed.push(e),
    });
    vi.stubGlobal('window', { innerHeight: 800 });
    const ioCallbacks: Array<(entries: unknown[]) => void> = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: unknown[]) => void) {
          ioCallbacks.push(cb);
        }
        observe() {}
        disconnect() {}
      },
    );
    mod.startSectorProgress();
    // Simulate the start-grid section becoming intersecting
    ioCallbacks[0]([
      { isIntersecting: true, target: sections[0], intersectionRatio: 0.6 },
    ]);
    expect(observed.some((e) => (e as CustomEvent).type === 'sector-change')).toBe(true);
    vi.unstubAllGlobals();
  });
});
