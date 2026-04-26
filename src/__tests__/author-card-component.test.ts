// T193 — contract test for AuthorCard.astro. Source-level
// invariants since Astro components SSR at build time; the
// rendered output is verified by the build step (which
// fails on invalid syntax).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const AUTHOR_CARD_PATH = join(
  process.cwd(),
  'src',
  'components',
  'AuthorCard.astro',
);

const loadComponent = (): string => readFileSync(AUTHOR_CARD_PATH, 'utf8');

describe('T193: AuthorCard component', () => {
  test('component file exists at src/components/AuthorCard.astro', () => {
    expect(() => loadComponent()).not.toThrow();
  });

  test('component declares Props with author or authorId field', () => {
    // Component takes either an Author object OR an authorId
    // string that resolves through getAuthor(). Either shape
    // is acceptable — what matters is that the component is
    // typed.
    const src = loadComponent();
    expect(src).toMatch(/interface\s+Props/);
    expect(src).toMatch(/author|authorId/);
  });

  test('component renders the author name', () => {
    // The minimum visible card content. A card without the
    // author name is broken UX.
    const src = loadComponent();
    expect(src).toMatch(/\.name|author\.name|\{name\}/);
  });

  test('component renders the author role/tagline', () => {
    const src = loadComponent();
    expect(src).toMatch(/\.role|author\.role|\{role\}/);
  });

  test('component renders the author bio', () => {
    const src = loadComponent();
    expect(src).toMatch(/\.bio|author\.bio|\{bio\}/);
  });
});
