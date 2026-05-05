import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const ASTRO_CONFIG = readFileSync(
  resolve(process.cwd(), 'astro.config.mjs'),
  'utf8',
);

describe('Astro fonts — Space Mono registration (decision 1a)', () => {
  test('astro.config.mjs registers Space Mono via fontProviders.google()', () => {
    // Match the name field — a single-line check is enough; Astro's fonts
    // array uses object literals, and `name: 'Space Mono'` is the unique
    // discriminator.
    expect(ASTRO_CONFIG).toMatch(/name\s*:\s*['"]Space\s+Mono['"]/);
  });
  test('Space Mono uses cssVariable --font-space-mono', () => {
    // This is the name we'll alias --font-mono to in Task 19.
    expect(ASTRO_CONFIG).toMatch(/cssVariable\s*:\s*['"]--font-space-mono['"]/);
  });
  test('Space Mono registers weights 400 and 500 (or 700 fallback)', () => {
    // Match a weights array — Space Mono on Google Fonts has only 400/700,
    // so we settle for 400 + 700 if 500 isn't available. Allow either pair.
    const m = ASTRO_CONFIG.match(/name\s*:\s*['"]Space Mono['"][\s\S]*?weights\s*:\s*\[([^\]]+)\]/);
    expect(m).not.toBeNull();
    const weights = m![1];
    expect(weights).toMatch(/400/);
    expect(weights).toMatch(/(500|700)/);
  });
  test('JetBrains Mono is NOT removed yet (Task 19 swaps the alias)', () => {
    // Sanity check — Task 18 only adds Space Mono. The existing JetBrains
    // Mono entry must still be present so consumers that currently use
    // var(--font-jetbrains-mono) keep working until Task 19's alias swap.
    expect(ASTRO_CONFIG).toMatch(/name\s*:\s*['"]JetBrains\s+Mono['"]/);
  });
});
