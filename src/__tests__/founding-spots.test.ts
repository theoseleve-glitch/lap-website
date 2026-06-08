import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const COMP = join(
  process.cwd(),
  'src',
  'components',
  'pricing',
  'FoundingSpots.astro',
);
const load = (): string => readFileSync(COMP, 'utf8');

describe('FoundingSpots', () => {
  test('declares a claimed prop and validates it', () => {
    const src = load();
    expect(src).toMatch(/interface\s+Props/);
    expect(src).toMatch(/claimed/);
    expect(src).toMatch(/Number\.isFinite/);
  });

  test('renders live "spots left" only with a real count', () => {
    const src = load();
    expect(src).toMatch(/founding spots left/);
    expect(src).toMatch(/hasReal/);
    expect(src).toMatch(/bcast-figure/);
  });

  test('falls back to a static label (never a fabricated number)', () => {
    expect(load()).toMatch(/First \{limit\} members/);
  });

  test('uses no animated countdown / timer (ethical scarcity)', () => {
    const src = load();
    expect(src).not.toMatch(/setInterval/);
    expect(src).not.toMatch(/countdown/i);
  });
});
