import { describe, expect, test, vi, beforeEach } from 'vitest';

describe('gsap-loader', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('exposes loadGsap() that returns gsap when imported', async () => {
    const mod = await import('../../scripts/gsap-loader');
    expect(typeof mod.loadGsap).toBe('function');
  });

  test('shouldAnimate returns false when prefers-reduced-motion: reduce', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {},
      media: q,
    }));
    const mod = await import('../../scripts/gsap-loader');
    expect(mod.shouldAnimate()).toBe(false);
    vi.unstubAllGlobals();
  });

  test('shouldAnimate returns true when motion preference is no-preference', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      media: q,
    }));
    const mod = await import('../../scripts/gsap-loader');
    expect(mod.shouldAnimate()).toBe(true);
    vi.unstubAllGlobals();
  });

  test('shouldAnimate is false in non-browser context', async () => {
    vi.stubGlobal('matchMedia', undefined);
    const mod = await import('../../scripts/gsap-loader');
    expect(mod.shouldAnimate()).toBe(false);
    vi.unstubAllGlobals();
  });
});
