import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

// We assert against the SOURCE file (src/styles/global.css), not the built
// CSS bundle, because Tailwind v4's CSS pipeline rewrites variable
// declarations and we want the test to fail at the actual point of
// regression (someone deleted the variable from source) rather than after
// a successful build that happened to keep them.
const GLOBAL_CSS = readFileSync(
  resolve(process.cwd(), 'src/styles/global.css'),
  'utf8',
);

describe('V2 March visual tokens — spacing scale', () => {
  // Spacing tokens — 4 px base unit, mirrors V2 src/styles/tokens.css
  test.each([
    ['--space-px', '1px'],
    ['--space-0-5', '4px'],
    ['--space-1', '8px'],
    ['--space-1-5', '12px'],
    ['--space-2', '16px'],
    ['--space-3', '24px'],
    ['--space-4', '32px'],
    ['--space-5', '40px'],
    ['--space-6', '48px'],
    ['--space-8', '64px'],
    ['--space-10', '80px'],
    ['--space-12', '96px'],
    ['--space-16', '128px'],
  ])('declares %s = %s', (name, value) => {
    // Match either `--space-1: 8px;` or `--space-1: 8px ;` (allow trailing space)
    const escaped = name.replace(/-/g, '\\-');
    const re = new RegExp(`${escaped}\\s*:\\s*${value}\\s*;`);
    expect(GLOBAL_CSS).toMatch(re);
  });
});

describe('V2 March visual tokens — z-layers', () => {
  test.each([
    ['--z-base', '0'],
    ['--z-panels', '10'],
    ['--z-stamps', '20'],
    ['--z-delta', '30'],
    ['--z-hud', '35'],
    ['--z-drs', '36'],
    ['--z-finish-line', '37'],
    ['--z-sector', '40'],
    ['--z-timecode', '50'],
    ['--z-nav', '60'],
    ['--z-overlay', '100'],
    ['--z-cursor', '999'],
  ])('declares %s = %s', (name, value) => {
    const escaped = name.replace(/-/g, '\\-');
    const re = new RegExp(`${escaped}\\s*:\\s*${value}\\s*;`);
    expect(GLOBAL_CSS).toMatch(re);
  });
});

describe('V2 March visual tokens — duration', () => {
  test.each([
    ['--duration-micro', '420ms'],
    ['--duration-room', '900ms'],
    ['--duration-monument', '1400ms'],
    ['--duration-sector-gate', '400ms'],
    ['--duration-drs', '2000ms'],
    ['--duration-pit', '600ms'],
    ['--duration-finish', '600ms'],
  ])('declares %s = %s', (name, value) => {
    const escaped = name.replace(/-/g, '\\-');
    const re = new RegExp(`${escaped}\\s*:\\s*${value}\\s*;`);
    expect(GLOBAL_CSS).toMatch(re);
  });
});

describe('V2 March visual tokens — easing', () => {
  test.each([
    '--ease-inertia',
    '--ease-overshoot',
    '--ease-spring',
    '--ease-snap',
    '--ease-anticipate',
    '--ease-sector-gate',
    '--ease-pit-enter',
    '--ease-pit-exit',
  ])('declares %s', (name) => {
    const escaped = name.replace(/-/g, '\\-');
    // We don't pin the exact cubic-bezier values here — that creates noisy
    // test churn whenever the curve gets nudged. We just assert the token
    // is declared with a cubic-bezier value.
    const re = new RegExp(`${escaped}\\s*:\\s*cubic-bezier\\(`);
    expect(GLOBAL_CSS).toMatch(re);
  });
});

describe('V2 March visual tokens — layered backgrounds', () => {
  test('declares --bg-radial-1 with the gold radial-gradient', () => {
    expect(GLOBAL_CSS).toMatch(
      /--bg-radial-1\s*:\s*radial-gradient\(1200px\s+720px\s+at\s+10%\s+-10%,\s*rgba\(201,\s*168,\s*76,\s*0\.04\),\s*transparent\s+68%\)\s*;/,
    );
  });
  test('declares --bg-radial-2 = none', () => {
    expect(GLOBAL_CSS).toMatch(/--bg-radial-2\s*:\s*none\s*;/);
  });
  test('declares --bg-radial-3 = none', () => {
    expect(GLOBAL_CSS).toMatch(/--bg-radial-3\s*:\s*none\s*;/);
  });
  test('declares --bg-grid as 1px crosshatch on rgba(240,237,229,0.06)', () => {
    expect(GLOBAL_CSS).toContain('--bg-grid:');
    expect(GLOBAL_CSS).toMatch(
      /--bg-grid\s*:\s*linear-gradient\(rgba\(240,\s*237,\s*229,\s*0\.06\)\s+1px,\s*transparent\s+1px\),\s*linear-gradient\(90deg,\s*rgba\(240,\s*237,\s*229,\s*0\.06\)\s+1px,\s*transparent\s+1px\)\s*;/,
    );
  });
});

describe('V2 March visual tokens — chart palette', () => {
  test.each([
    ['--chart-series-1', '#22C55E'],
    ['--chart-series-2', '#3B82F6'],
    ['--chart-series-3', '#F59E0B'],
    ['--chart-series-4', '#EF4444'],
    ['--chart-series-5', '#A78BFA'],
    ['--chart-series-6', '#EC4899'],
  ])('declares %s = %s', (name, value) => {
    const escaped = name.replace(/-/g, '\\-');
    // Hex matching is case-insensitive (V2 uses uppercase, but lowercase is
    // valid CSS — don't fail a future lowercase pass).
    const re = new RegExp(`${escaped}\\s*:\\s*${value}\\s*;`, 'i');
    expect(GLOBAL_CSS).toMatch(re);
  });
});

describe('V2 March visual tokens — touch + shadow-e0', () => {
  test('declares --touch-min = 44px', () => {
    expect(GLOBAL_CSS).toMatch(/--touch-min\s*:\s*44px\s*;/);
  });
  test('declares --shadow-e0 = none', () => {
    expect(GLOBAL_CSS).toMatch(/--shadow-e0\s*:\s*none\s*;/);
  });
});
