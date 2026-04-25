// T170 (publish) — contract test for the published Pillar 4
// article page at /blog/driver-development-plan. Same shape as
// the T140 / T150 / T160 publish contracts: the page must
// import all 7 canonical-source markdown sections, pull
// PILLAR_4_FAQS for the accordion, emit Article + FAQPage
// JSON-LD scripts, and route through BaseLayout. Locking these
// invariants here means a future edit cannot accidentally drop
// a section import (silently shrinking the published article)
// or break the JSON-LD emission (silently breaking Google's
// rich-snippet eligibility).
//
// T170 closes the four-pillar cluster: this is the final pillar
// publish task. The published surface ships at the locked slug
// /blog/driver-development-plan per the T161 outline.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const PAGE_PATH = join(
  process.cwd(),
  'src',
  'pages',
  'blog',
  'driver-development-plan.astro',
);

const loadPage = (): string => readFileSync(PAGE_PATH, 'utf8');

describe('T170: Pillar 4 publish — driver-development-plan.astro', () => {
  test('page file exists at the expected blog slug', async () => {
    // The slug locks the URL: /blog/driver-development-plan/
    // matches the outline's primary head term cluster ("driver
    // development plan" / "development plan") and is stable —
    // no year embedded; article is dated via JSON-LD
    // datePublished/dateModified instead.
    expect(() => loadPage()).not.toThrow();
  });

  test('page imports all 7 canonical-source section markdown files', async () => {
    // Canonical-source pattern: docs/pillar-articles/
    // driver-development-plan/section-XX.md is the editorial
    // workspace AND the rendered content. A future edit that
    // drops a section import would shrink the published
    // article; lock all 7.
    const page = loadPage();
    const expectedSections = [
      'section-01-intro',
      'section-02-what-is',
      'section-03-framework',
      'section-04-cadences',
      'section-05-automation',
      'section-06-diy-template',
      'section-07-conclusion',
    ];
    for (const section of expectedSections) {
      expect(
        page,
        `Page must import docs/pillar-articles/driver-development-plan/${section}.md`,
      ).toMatch(
        new RegExp(
          `from\\s+['"]\\.\\./\\.\\./\\.\\./docs/pillar-articles/driver-development-plan/${section}\\.md['"]`,
        ),
      );
    }
  });

  test('page imports PILLAR_4_FAQS and pillar4FaqJsonLd from the FAQ data module', async () => {
    const page = loadPage();
    expect(page).toMatch(/import\s+\{[^}]*PILLAR_4_FAQS[^}]*\}\s+from\s+['"][^'"]*pillar-4-faq['"]/);
    expect(page).toMatch(/import\s+\{[^}]*pillar4FaqJsonLd[^}]*\}\s+from\s+['"][^'"]*pillar-4-faq['"]/);
  });

  test('page emits Article JSON-LD script', async () => {
    // Google's Article rich-snippet eligibility requires a
    // JSON-LD block with @type:Article. The publish page must
    // emit one or the article does not earn the rich-snippet
    // surface.
    const page = loadPage();
    expect(page).toMatch(/['"@]type['"]?:\s*['"]Article['"]/);
    expect(page).toMatch(/datePublished/);
    expect(page).toMatch(/headline/);
  });

  test('page emits FAQPage JSON-LD via pillar4FaqJsonLd factory', async () => {
    const page = loadPage();
    expect(page).toMatch(/pillar4FaqJsonLd\(\)/);
  });

  test('page routes through BaseLayout', async () => {
    const page = loadPage();
    expect(page).toMatch(/import\s+BaseLayout/);
    expect(page).toMatch(/<BaseLayout/);
  });

  test('page renders FAQ accordion from PILLAR_4_FAQS', async () => {
    // FAQ accordion uses the zero-JS <details>/<summary> idiom
    // (PricingFaq.astro pattern). Lock that the page iterates
    // PILLAR_4_FAQS and emits accordion markup, not a static
    // placeholder.
    const page = loadPage();
    expect(page).toMatch(/PILLAR_4_FAQS\.map/);
    expect(page).toMatch(/<details/);
    expect(page).toMatch(/<summary/);
  });

  test('page sets explicit title and description metadata', async () => {
    // BaseLayout consumes title + description for <title> and
    // <meta name="description">. Both must be substantive (not
    // placeholder) so the SERP snippet renders. Pillar 4 is the
    // article that closes the cluster — the metadata sets the
    // SERP first impression for the highest-intent keyword
    // ("driver development plan" / "how to improve at sim
    // racing systematically").
    const page = loadPage();
    const titleMatch = page.match(/const\s+TITLE\s*=\s*['"]([^'"]+)['"]/);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1].length).toBeGreaterThanOrEqual(20);

    const descMatch = page.match(
      /const\s+DESCRIPTION\s*=\s*['"`]([^'"`]+)['"`]/,
    );
    expect(descMatch).not.toBeNull();
    expect(descMatch![1].length).toBeGreaterThanOrEqual(60);
  });
});
