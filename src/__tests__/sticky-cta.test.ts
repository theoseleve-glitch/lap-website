import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const BAR = join(
  process.cwd(),
  'src',
  'components',
  'chrome',
  'StickyCtaBar.astro',
);
const load = (): string => readFileSync(BAR, 'utf8');

describe('StickyCtaBar', () => {
  test('is mobile-only (max-width media query) and hidden by default', () => {
    const src = load();
    expect(src).toMatch(/max-width:\s*767px/);
    expect(src).toMatch(/data-sticky-cta/);
    expect(src).toMatch(/hidden/);
  });

  test('uses the central HERO CTA (label + href)', () => {
    const src = load();
    expect(src).toMatch(/HERO/);
    expect(src).toMatch(/primaryHref/);
    expect(src).toMatch(/primaryCta/);
  });

  test('reveals via IntersectionObserver on the hero sentinel', () => {
    const src = load();
    expect(src).toMatch(/IntersectionObserver/);
    expect(src).toMatch(/data-hero-sentinel/);
    expect(src).toMatch(/is:inline/);
  });

  test('respects the bottom safe-area inset', () => {
    expect(load()).toMatch(/safe-area-inset-bottom/);
  });
});
