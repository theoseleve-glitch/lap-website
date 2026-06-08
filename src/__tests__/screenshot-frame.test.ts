// Source-level contract tests for the ScreenshotFrame + AnnotationCallout
// broadcast primitives. Rendering is verified by the build step.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const FRAME = join(
  process.cwd(),
  'src',
  'components',
  'cinematic',
  'ScreenshotFrame.astro',
);
const CALLOUT = join(
  process.cwd(),
  'src',
  'components',
  'cinematic',
  'AnnotationCallout.astro',
);
const load = (p: string): string => readFileSync(p, 'utf8');

describe('ScreenshotFrame', () => {
  test('declares Props with src/alt/width/height', () => {
    const src = load(FRAME);
    expect(src).toMatch(/interface\s+Props/);
    expect(src).toMatch(/\bsrc\b/);
    expect(src).toMatch(/\balt\b/);
    expect(src).toMatch(/width/);
    expect(src).toMatch(/height/);
  });

  test('exposes a named annotations slot', () => {
    expect(load(FRAME)).toMatch(/name="annotations"/);
  });

  test('renders explicit width/height on the image (CLS-safe)', () => {
    const src = load(FRAME);
    expect(src).toMatch(/width=\{width\}/);
    expect(src).toMatch(/height=\{height\}/);
  });
});

describe('AnnotationCallout', () => {
  test('declares label/value/tone props', () => {
    const src = load(CALLOUT);
    expect(src).toMatch(/interface\s+Props/);
    expect(src).toMatch(/label/);
    expect(src).toMatch(/value/);
    expect(src).toMatch(/tone/);
  });

  test('uses bcast-figure for the numeral value', () => {
    expect(load(CALLOUT)).toMatch(/bcast-figure/);
  });

  test('maps tone to a class and data-tone', () => {
    const src = load(CALLOUT);
    expect(src).toMatch(/tone-\$\{tone\}/);
    expect(src).toMatch(/data-tone/);
  });
});
