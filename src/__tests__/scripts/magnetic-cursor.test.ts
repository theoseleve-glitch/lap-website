import { describe, expect, test, vi } from 'vitest';

describe('magnetic-cursor', () => {
  test('exports initMagneticCursor', async () => {
    const mod = await import('../../scripts/magnetic-cursor');
    expect(typeof mod.initMagneticCursor).toBe('function');
  });

  test('does nothing when pointer is coarse', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('coarse'),
      addEventListener: () => {},
      removeEventListener: () => {},
      media: q,
    }));
    const mod = await import('../../scripts/magnetic-cursor');
    const teardown = mod.initMagneticCursor();
    expect(typeof teardown).toBe('function');
    vi.unstubAllGlobals();
  });

  test('does nothing when reduced-motion is preferred', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {},
      media: q,
    }));
    const mod = await import('../../scripts/magnetic-cursor');
    const teardown = mod.initMagneticCursor();
    expect(typeof teardown).toBe('function');
    vi.unstubAllGlobals();
  });

  test('isCursorEligible() returns false in non-browser', async () => {
    vi.stubGlobal('matchMedia', undefined);
    const mod = await import('../../scripts/magnetic-cursor');
    expect(mod.isCursorEligible()).toBe(false);
    vi.unstubAllGlobals();
  });
});
