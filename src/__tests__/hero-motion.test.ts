import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { shouldAnimate } from '../scripts/hero-motion';

type MatchMediaStub = (query: string) => { matches: boolean };

interface MatchMediaHost {
  matchMedia?: MatchMediaStub;
}

const globalAsHost = globalThis as unknown as MatchMediaHost;

const originalMatchMedia = globalAsHost.matchMedia;

const mockMatchMedia = (reducedMotion: boolean) => {
  globalAsHost.matchMedia = vi.fn((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
  }));
};

beforeEach(() => {
  globalAsHost.matchMedia = undefined;
});

afterEach(() => {
  globalAsHost.matchMedia = originalMatchMedia;
});

test('shouldAnimate returns true when user has no reduced-motion preference', () => {
  mockMatchMedia(false);
  expect(shouldAnimate()).toBe(true);
});

test('shouldAnimate returns false when user has prefers-reduced-motion: reduce', () => {
  // CLAUDE.md: "GSAP only for above-the-fold motion; ... reduced-motion
  // respected". The early return here is the mechanism.
  mockMatchMedia(true);
  expect(shouldAnimate()).toBe(false);
});

test('shouldAnimate returns false when matchMedia is unavailable (SSR / old UAs)', () => {
  // Container-API test renders and pre-paint SSR both run with matchMedia
  // undefined. Defaulting to "no animation" on missing APIs is the safe
  // posture — we fall back to the final layout, no flash.
  globalAsHost.matchMedia = undefined;
  expect(shouldAnimate()).toBe(false);
});
