// T160 (publish) — contract test for the published Pillar 3
// article page at /blog/best-sim-racing-telemetry-app. Same
// shape as the implicit T140 / T150 publish contract: the page
// must import all 7 canonical-source markdown sections, pull
// PILLAR_3_FAQS for the accordion, emit Article + FAQPage
// JSON-LD scripts, and route through BaseLayout. Locking these
// invariants here means a future edit cannot accidentally drop
// a section import (silently shrinking the published article)
// or break the JSON-LD emission (silently breaking Google's
// rich-snippet eligibility).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const PAGE_PATH = join(
  process.cwd(),
  'src',
  'pages',
  'blog',
  'best-sim-racing-telemetry-app.astro',
);

const loadPage = (): string => readFileSync(PAGE_PATH, 'utf8');

describe('T160: Pillar 3 publish — best-sim-racing-telemetry-app.astro', () => {
  test('page file exists at the expected blog slug', async () => {
    // The slug locks the URL: /blog/best-sim-racing-
    // telemetry-app/ matches the outline's primary head term
    // and is stable (no year embedded in URL — the article is
    // dated via JSON-LD datePublished/dateModified instead).
    expect(() => loadPage()).not.toThrow();
  });

  test('page imports all 7 canonical-source section markdown files', async () => {
    // Canonical-source pattern: docs/pillar-articles/
    // telemetry-apps-comparison/section-XX.md is the
    // editorial workspace AND the rendered content. A future
    // edit that drops a section import would shrink the
    // published article; lock all 7.
    const page = loadPage();
    const expectedSections = [
      'section-01-intro',
      'section-02-strengths',
      'section-03-limits',
      'section-04-pricing',
      'section-05-personas',
      'section-06-limitations',
      'section-07-conclusion',
    ];
    for (const section of expectedSections) {
      expect(
        page,
        `Page must import docs/pillar-articles/telemetry-apps-comparison/${section}.md`,
      ).toMatch(
        new RegExp(
          `from\\s+['"]\\.\\./\\.\\./\\.\\./docs/pillar-articles/telemetry-apps-comparison/${section}\\.md['"]`,
        ),
      );
    }
  });

  test('page imports PILLAR_3_FAQS and pillar3FaqJsonLd from the FAQ data module', async () => {
    const page = loadPage();
    expect(page).toMatch(/import\s+\{[^}]*PILLAR_3_FAQS[^}]*\}\s+from\s+['"][^'"]*pillar-3-faq['"]/);
    expect(page).toMatch(/import\s+\{[^}]*pillar3FaqJsonLd[^}]*\}\s+from\s+['"][^'"]*pillar-3-faq['"]/);
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

  test('page emits FAQPage JSON-LD via pillar3FaqJsonLd factory', async () => {
    const page = loadPage();
    expect(page).toMatch(/pillar3FaqJsonLd\(\)/);
  });

  test('page routes through BaseLayout', async () => {
    const page = loadPage();
    expect(page).toMatch(/import\s+BaseLayout/);
    expect(page).toMatch(/<BaseLayout/);
  });

  test('page renders FAQ accordion from PILLAR_3_FAQS', async () => {
    // FAQ accordion uses the zero-JS <details>/<summary>
    // idiom (PricingFaq.astro pattern). Lock that the page
    // iterates PILLAR_3_FAQS and emits accordion markup, not
    // a static placeholder.
    const page = loadPage();
    expect(page).toMatch(/PILLAR_3_FAQS\.map/);
    expect(page).toMatch(/<details/);
    expect(page).toMatch(/<summary/);
  });

  test('page sets explicit title and description metadata', async () => {
    // BaseLayout consumes title + description for <title> and
    // <meta name="description">. Both must be substantive
    // (not placeholder) so the SERP snippet renders.
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
