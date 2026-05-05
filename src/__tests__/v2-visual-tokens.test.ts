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
