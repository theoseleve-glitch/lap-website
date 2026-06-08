import { describe, expect, test } from 'vitest';
import { mulberry32, tracePath, racingLinePath } from '../scripts/atmosphere';

describe('atmosphere generators (deterministic)', () => {
  test('mulberry32 is deterministic for a seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });

  test('tracePath is deterministic for a seed', () => {
    expect(tracePath(7, 800, 200)).toBe(tracePath(7, 800, 200));
  });

  test('tracePath varies with the seed', () => {
    expect(tracePath(1, 800, 200)).not.toBe(tracePath(2, 800, 200));
  });

  test('tracePath returns a valid SVG path with no NaN', () => {
    const d = tracePath(3, 800, 200);
    expect(d.startsWith('M ')).toBe(true);
    expect(d).toMatch(/Q/);
    expect(d).not.toMatch(/NaN/);
  });

  test('racingLinePath returns a cubic path with no NaN', () => {
    const d = racingLinePath(5, 800, 200);
    expect(d.startsWith('M ')).toBe(true);
    expect(d).toMatch(/C/);
    expect(d).not.toMatch(/NaN/);
  });
});
