// T127 — Performance budget contract for the six product pages.
// lighthouserc.json is the durable artefact that CI enforces on
// every push; this file locks its shape so a future edit cannot
// silently weaken or drop the per-product-page LCP budget.
//
// Budget rationale:
//   - homepage: 1500ms LCP on simulated 4G (CLAUDE.md, existing
//     in lighthouserc.json from earlier sprint work)
//   - product pages: 2000ms LCP — slightly looser than homepage
//     because sub-pages carry more body content and don't anchor
//     the first-impression tax. Same 2000ms band as the existing
//     /demo page assertion.
//
// What this file does NOT do: actually measure LCP. That's lhci's
// job (`pnpm lhci`), runs in CI on every push. The vitest contract
// here only verifies the config shape — that the budget exists
// and is set correctly. A regression in the actual rendered
// performance would fail in CI, not here.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

interface AssertMatrixEntry {
  matchingUrlPattern: string;
  assertions: Record<string, [string, { maxNumericValue?: number }]>;
}

interface LighthouseConfig {
  ci: {
    collect: {
      url: string[];
      [key: string]: unknown;
    };
    assert: {
      assertMatrix: AssertMatrixEntry[];
    };
    [key: string]: unknown;
  };
}

const CONFIG_PATH = join(process.cwd(), 'lighthouserc.json');

const PRODUCT_URLS = [
  'http://localhost/product/index.html',
  'http://localhost/product/desktop/index.html',
  'http://localhost/product/mobile/index.html',
  'http://localhost/product/bridge/index.html',
  'http://localhost/product/coaching/index.html',
  'http://localhost/product/driver-profile/index.html',
];

const PRODUCT_LCP_BUDGET_MS = 2000;

function loadConfig(): LighthouseConfig {
  const raw = readFileSync(CONFIG_PATH, 'utf8');
  return JSON.parse(raw) as LighthouseConfig;
}

describe('T127: product pages performance budget', () => {
  test('lighthouserc.json includes all six product URLs in collect.url', async () => {
    const config = loadConfig();
    for (const url of PRODUCT_URLS) {
      expect(config.ci.collect.url).toContain(url);
    }
  });

  test.each(PRODUCT_URLS)('%s has an LCP assertion matching it in assertMatrix', async (url) => {
    // Each product URL must be matched by at least one
    // assertMatrix entry whose matchingUrlPattern resolves to
    // it. Walking the matrix here is what catches a stray URL
    // that was added to collect.url but never wired into
    // assertions — a silent perf-budget hole.
    const config = loadConfig();
    const matched = config.ci.assert.assertMatrix.filter((entry) => {
      const re = new RegExp(entry.matchingUrlPattern);
      return re.test(url);
    });
    expect(matched.length).toBeGreaterThan(0);
  });

  test.each(PRODUCT_URLS)(
    '%s LCP assertion is at or below the 2000ms product budget',
    async (url) => {
      // Lock the actual numeric ceiling. A future edit that loosens
      // the budget to e.g. 5000ms would silently let regressions
      // through — this test catches that. Allow values < 2000ms
      // (tighter is fine), reject anything above.
      const config = loadConfig();
      const matched = config.ci.assert.assertMatrix.filter((entry) =>
        new RegExp(entry.matchingUrlPattern).test(url),
      );
      expect(matched.length).toBeGreaterThan(0);
      for (const entry of matched) {
        const lcp = entry.assertions['largest-contentful-paint'];
        expect(lcp).toBeDefined();
        const [severity, opts] = lcp;
        expect(severity).toBe('error');
        expect(opts.maxNumericValue).toBeLessThanOrEqual(PRODUCT_LCP_BUDGET_MS);
      }
    },
  );

  test('homepage LCP budget remains at 1500ms (T127 must not regress homepage tightness)', async () => {
    // Cross-check: T127 is about adding product-page budgets,
    // NOT loosening the existing homepage budget. If a future
    // edit accidentally rewrites the matrix and bumps the
    // homepage from 1500 to 2000, this test catches it.
    const config = loadConfig();
    const homepageEntry = config.ci.assert.assertMatrix.find((entry) =>
      new RegExp(entry.matchingUrlPattern).test('http://localhost/index.html'),
    );
    expect(homepageEntry).toBeDefined();
    const [severity, opts] = homepageEntry!.assertions['largest-contentful-paint'];
    expect(severity).toBe('error');
    expect(opts.maxNumericValue).toBe(1500);
  });
});
