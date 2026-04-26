// T193 — contract test for the authors registry data module
// + AuthorCard component. Registry uses Organization-typed
// authorship for LAP (per the publish-page JSON-LD already
// emitted at T179/T189) so the human-rendered card surface
// matches the structured data the search engine sees.

import { describe, expect, test } from 'vitest';
import { AUTHORS, getAuthor, type Author } from '../data/authors';

describe('T193: authors registry data module', () => {
  test('exports AUTHORS record and getAuthor helper', () => {
    expect(typeof AUTHORS).toBe('object');
    expect(AUTHORS).not.toBeNull();
    expect(typeof getAuthor).toBe('function');
  });

  test('LAP author exists with Organization type', () => {
    // The default authorship for the cluster is the
    // Organization "LAP" — matches the Article JSON-LD
    // already emitted on every publish page. Tests below
    // depend on this entry being present.
    const lap = AUTHORS['lap'];
    expect(lap, 'authors registry must include "lap" entry').toBeDefined();
    expect(lap.id).toBe('lap');
    expect(lap.type).toBe('Organization');
  });

  test('every author has the required fields populated', () => {
    for (const id in AUTHORS) {
      const a: Author = AUTHORS[id]!;
      expect(typeof a.id).toBe('string');
      expect(a.id.length).toBeGreaterThan(0);
      expect(typeof a.name).toBe('string');
      expect(a.name.length).toBeGreaterThan(0);
      expect(typeof a.role).toBe('string');
      expect(a.role.length).toBeGreaterThan(0);
      expect(typeof a.bio).toBe('string');
      expect(a.bio.length).toBeGreaterThanOrEqual(40);
      expect(['Organization', 'Person']).toContain(a.type);
    }
  });

  test('getAuthor returns the author for a known id', () => {
    const lap = getAuthor('lap');
    expect(lap.id).toBe('lap');
    expect(lap.name).toBe('LAP');
  });

  test('getAuthor throws for unknown id (fail-loud, not silent fallback)', () => {
    expect(() => getAuthor('nonexistent-author-id')).toThrow();
  });

  test('every author bio respects ADR-004 (asymmetric: bare LLM/AI-coach/generative banned)', () => {
    const prose = Object.values(AUTHORS)
      .map((a) => `${a.name} ${a.role} ${a.bio}`)
      .join(' ')
      .toLowerCase();
    expect(prose).not.toMatch(/\bai\s+coach\b/);
    expect(prose).not.toMatch(/\bllm\b/);
    expect(prose).not.toMatch(/\bgenerative\b/);
    expect(prose).not.toMatch(/\bneural\b/);
    expect(prose).not.toMatch(/\brealistic\b/);
  });

  test('every author bio respects Pillar 2/3/4 forbidden vocab', () => {
    const prose = Object.values(AUTHORS)
      .map((a) => `${a.name} ${a.role} ${a.bio}`)
      .join(' ')
      .toLowerCase();
    expect(prose).not.toMatch(/\bmagic\b/);
    expect(prose).not.toMatch(/\bsecret\b/);
    expect(prose).not.toMatch(/\btrick\b/);
    expect(prose).not.toMatch(/\boutdated\b/);
    expect(prose).not.toMatch(/\bbloated\b/);
    expect(prose).not.toMatch(/\bguru\b/);
    expect(prose).not.toMatch(/\bshortcut\b/);
    expect(prose).not.toMatch(/\bovernight\b/);
    expect(prose).not.toMatch(/\bhack\b/);
  });
});
