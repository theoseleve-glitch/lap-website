import { describe, expect, test, vi } from 'vitest';

describe('tick-up', () => {
  test('exposes tickUp(node, target, options)', async () => {
    const mod = await import('../../scripts/tick-up');
    expect(typeof mod.tickUp).toBe('function');
  });

  test('tickUp respects reduced-motion → final value instantly', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
      media: '(prefers-reduced-motion: reduce)',
    }));
    const node = { textContent: '' } as { textContent: string };
    const mod = await import('../../scripts/tick-up');
    mod.tickUp(node as unknown as HTMLElement, 2000, { format: (n) => `+${n}` });
    expect(node.textContent).toBe('+2000');
    vi.unstubAllGlobals();
  });

  test('tickUp animates from 0 to target with rAF when motion allowed', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      media: '',
    }));
    const node = { textContent: '' } as { textContent: string };
    let frames: ((t: number) => void)[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
      frames.push(cb);
      return frames.length;
    });
    const mod = await import('../../scripts/tick-up');
    mod.tickUp(node as unknown as HTMLElement, 100, {
      duration: 1000,
      format: (n) => String(n),
    });
    // Simulate frames: t=0, t=500, t=1000
    frames[0](0);
    expect(node.textContent).toBe('0');
    frames[1](500);
    const mid = parseInt(node.textContent, 10);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(100);
    frames[2](1000);
    expect(node.textContent).toBe('100');
    vi.unstubAllGlobals();
  });

  test('observeAndTick attaches IntersectionObserver and tickUps once on view', async () => {
    const mod = await import('../../scripts/tick-up');
    const node = {
      textContent: '',
      getAttribute: (n: string) => (n === 'data-tick-target' ? '500' : null),
      dataset: { tickTarget: '500' },
    } as unknown as HTMLElement;
    const callbacks: Array<(entries: unknown[]) => void> = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: unknown[]) => void) {
          callbacks.push(cb);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal('matchMedia', () => ({
      matches: true, // reduced-motion to skip rAF
      addEventListener: () => {},
      removeEventListener: () => {},
      media: '',
    }));
    mod.observeAndTick([node]);
    callbacks[0]([{ isIntersecting: true, target: node }]);
    expect(node.textContent).toBe('500');
    vi.unstubAllGlobals();
  });
});
