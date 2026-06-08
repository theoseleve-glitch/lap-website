import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const NAV = join(
  process.cwd(),
  'src',
  'components',
  'chrome',
  'MobileNav.astro',
);
const load = (): string => readFileSync(NAV, 'utf8');

describe('MobileNav', () => {
  test('shows only below md', () => {
    expect(load()).toMatch(/md:hidden/);
  });

  test('toggle button wires aria-controls + aria-expanded', () => {
    const src = load();
    expect(src).toMatch(/aria-controls="mobile-nav-panel"/);
    expect(src).toMatch(/aria-expanded="false"/);
  });

  test('panel lists the primary routes + sign in + trial CTA', () => {
    const src = load();
    expect(src).toMatch(/\/product/);
    expect(src).toMatch(/\/how-it-works/);
    expect(src).toMatch(/\/pricing/);
    expect(src).toMatch(/\/login/);
    expect(src).toMatch(/\/register/);
  });

  test('ships an inline toggle script with Esc-to-close', () => {
    const src = load();
    expect(src).toMatch(/is:inline/);
    expect(src).toMatch(/Escape/);
  });

  test('touch targets use the 44px min token', () => {
    expect(load()).toMatch(/--touch-min/);
  });
});
