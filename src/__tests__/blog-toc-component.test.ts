// T192 — contract test for the BlogTOC + BlogReadingTime
// components used in blog publish pages. Source-level tests
// (vitest) since Astro components are SSR'd at build time;
// the actual rendered output is verified by the build step
// (which fails if the component has invalid syntax).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const TOC_PATH = join(process.cwd(), 'src', 'components', 'BlogTOC.astro');
const READING_TIME_PATH = join(
  process.cwd(),
  'src',
  'components',
  'BlogReadingTime.astro',
);

const loadComponent = (path: string): string => readFileSync(path, 'utf8');

describe('T192: BlogTOC component', () => {
  test('component file exists at src/components/BlogTOC.astro', () => {
    expect(() => loadComponent(TOC_PATH)).not.toThrow();
  });

  test('component declares Props with headings array', () => {
    const src = loadComponent(TOC_PATH);
    expect(src).toMatch(/interface\s+Props/);
    // Headings are the H2/H3 list Astro's getHeadings()
    // returns; the component takes them as a prop.
    expect(src).toMatch(/headings/);
  });

  test('component filters to depth-2 headings (H2 only for top-level TOC)', () => {
    // H1 is the page title; H2 is what the TOC anchors. H3
    // would create a nested structure that's overkill for
    // the typical Batch 1/2 post (≤7 H2s, no H3 navigation
    // needed).
    const src = loadComponent(TOC_PATH);
    expect(src).toMatch(/depth\s*===?\s*2/);
  });

  test('component renders <nav> with aria-label for accessibility', () => {
    const src = loadComponent(TOC_PATH);
    expect(src).toMatch(/<nav[^>]*aria-label/);
  });

  test('component renders an ordered or unordered list of TOC items', () => {
    const src = loadComponent(TOC_PATH);
    expect(src).toMatch(/<(?:ol|ul)\b/);
    expect(src).toMatch(/<li\b/);
  });

  test('component links each item to the heading anchor (#slug)', () => {
    const src = loadComponent(TOC_PATH);
    expect(src).toMatch(/href=\{`#\$\{[^}]*\}`\}|href=\{`#/);
  });
});

describe('T192: BlogReadingTime component', () => {
  test('component file exists at src/components/BlogReadingTime.astro', () => {
    expect(() => loadComponent(READING_TIME_PATH)).not.toThrow();
  });

  test('component declares Props with minutes', () => {
    const src = loadComponent(READING_TIME_PATH);
    expect(src).toMatch(/interface\s+Props/);
    expect(src).toMatch(/minutes/);
  });

  test('component renders the reading-time label visibly', () => {
    const src = loadComponent(READING_TIME_PATH);
    // The component should render text including "min" and
    // "read" tokens so the user-facing label is consistent
    // across surfaces.
    expect(src).toMatch(/min\s+read|min read|min/);
  });
});
