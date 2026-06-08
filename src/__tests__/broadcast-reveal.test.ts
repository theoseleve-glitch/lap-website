// Contract tests for the cinematic BroadcastReveal primitive + its controller.
// Source-level (vitest) per repo convention — rendered output is verified by the
// build step, which fails on invalid component syntax.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const COMPONENT = join(
  process.cwd(),
  'src',
  'components',
  'cinematic',
  'BroadcastReveal.astro',
);
const SCRIPT = join(process.cwd(), 'src', 'scripts', 'reveal.ts');
const load = (p: string): string => readFileSync(p, 'utf8');

describe('BroadcastReveal component', () => {
  test('file exists', () => {
    expect(() => load(COMPONENT)).not.toThrow();
  });

  test('declares Props with a variant', () => {
    const src = load(COMPONENT);
    expect(src).toMatch(/interface\s+Props/);
    expect(src).toMatch(/variant\??:/);
  });

  test('emits data-reveal bound to the variant', () => {
    expect(load(COMPONENT)).toMatch(/data-reveal=\{variant\}/);
  });

  test('ships global reveal CSS keyed off .reveal-ready + .is-revealed', () => {
    const src = load(COMPONENT);
    expect(src).toMatch(/is:global/);
    expect(src).toMatch(/reveal-ready/);
    expect(src).toMatch(/is-revealed/);
  });

  test('honours reduced-motion (no hidden state)', () => {
    expect(load(COMPONENT)).toMatch(/prefers-reduced-motion/);
  });
});

describe('reveal controller', () => {
  test('file exists', () => {
    expect(() => load(SCRIPT)).not.toThrow();
  });

  test('uses IntersectionObserver and arms only when motion is allowed', () => {
    const src = load(SCRIPT);
    expect(src).toMatch(/IntersectionObserver/);
    expect(src).toMatch(/prefers-reduced-motion/);
    expect(src).toMatch(/reveal-ready/);
    expect(src).toMatch(/is-revealed/);
  });
});
