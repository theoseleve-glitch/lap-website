import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

// Contract tests for the Lighthouse CI performance budget. The
// ubuntu-latest CI job is the gate of record (the sprint comment on
// T017 flagged that Windows local LHCI hits an EPERM cleanup issue),
// so these tests codify the *intent* of the config — CI then
// measures whether the actual site meets it.
//
// Shape (updated at T081): the config uses `assertMatrix` so
// different URLs can carry different budgets. The homepage runs on
// a tighter 1500ms LCP target (T036); /demo runs at 2000ms (T081)
// because it embeds a lazy-loaded walkthrough video and the budget
// has to absorb the iframe's first-paint work when a visitor hits
// play (or auto-pre-connect activates).

interface AssertionDefinition {
  0: 'error' | 'warn' | 'off';
  1: { maxNumericValue?: number };
}

interface MatrixEntry {
  matchingUrlPattern: string;
  assertions: Record<string, AssertionDefinition>;
}

interface LhciConfig {
  ci: {
    collect: {
      numberOfRuns: number;
      url?: string[];
      settings?: {
        preset?: string;
        formFactor?: string;
        onlyCategories?: string[];
      };
    };
    assert: {
      assertions?: Record<string, AssertionDefinition>;
      assertMatrix?: MatrixEntry[];
    };
  };
}

const configPath = resolve(process.cwd(), 'lighthouserc.json');
const config: LhciConfig = JSON.parse(readFileSync(configPath, 'utf8'));

function matrixEntry(pattern: string): MatrixEntry | undefined {
  return (config.ci.assert.assertMatrix ?? []).find((e) => e.matchingUrlPattern === pattern);
}

const HOMEPAGE_PATTERN = '^http://localhost/index\\.html$';
const DEMO_PATTERN = '^http://localhost/demo/index\\.html$';

test('T036: homepage LCP budget stays at 1500ms (mobile 4G)', () => {
  // 01-STRATEGIC-DOCTRINE.md §9 ships the homepage as the front
  // conversion surface; CLAUDE.md sets the ceiling at 1.8s on
  // desktop, and T036 tightens the mobile-4G target to 1500ms.
  // Any relaxation of this budget (bumping to 1800 / 2000 "just for
  // now") fails CI before it ships.
  const homepage = matrixEntry(HOMEPAGE_PATTERN);
  expect(homepage).toBeDefined();
  const assertion = homepage!.assertions['largest-contentful-paint'];
  expect(assertion).toBeDefined();
  expect(assertion[0]).toBe('error');
  expect(assertion[1].maxNumericValue).toBe(1500);
});

test('T036: LHCI runs in mobile form factor (desktop preset removed)', () => {
  // The T017 config was `preset: desktop` which suppresses
  // Lighthouse's default mobile + simulated 4G throttling. T036
  // requires the mobile profile — either explicit `formFactor:
  // mobile` or no preset at all (mobile is the default). Using
  // `preset: desktop` would silently move the goalposts so the
  // 1500ms threshold is trivially easy to hit.
  const settings = config.ci.collect.settings ?? {};
  expect(settings.preset).not.toBe('desktop');
});

test('T036: performance category is still the only category gated', () => {
  // Keeps the CI gate focused on LCP (performance). A11y and SEO are
  // covered by other tests (axe-playwright is T038 scope; SEO is
  // locked in seo.test.ts). Broadening LHCI to all categories would
  // muddy the signal and slow the gate.
  const settings = config.ci.collect.settings ?? {};
  expect(settings.onlyCategories).toEqual(['performance']);
});

test('T036: LHCI runs at least 3 times to smooth out variance', () => {
  // Mobile-4G simulated runs are noisier than desktop. Keep
  // numberOfRuns >= 3 so the median-of-runs LCP reading is stable
  // enough to gate on.
  expect(config.ci.collect.numberOfRuns).toBeGreaterThanOrEqual(3);
});

test('T081: /demo is collected by LHCI (not just the homepage)', () => {
  // Block E sprint plan: /demo is the second conversion surface
  // after the homepage. Leaving it out of the LHCI URL list means a
  // future video embed (T074) could silently blow past the budget
  // with no signal in CI. Pinning it into collect.url locks /demo
  // into every LHCI run.
  expect(config.ci.collect.url).toContain('http://localhost/demo/index.html');
});

test('T081: /demo LCP budget is 2000ms (looser than homepage, accounts for lazy video)', () => {
  // Sprint T081: "/demo LCP <2s (video lazy)". The budget is
  // looser than the homepage's 1500ms because the 16:9 iframe
  // placeholder — and, once T074 lands, the actual video embed —
  // carry more first-paint work than the homepage hero. 2000ms
  // is still within Google's "Good" LCP band (≤2500ms) and tight
  // enough to block a regression that lazy-load is misconfigured.
  const demo = matrixEntry(DEMO_PATTERN);
  expect(demo).toBeDefined();
  const assertion = demo!.assertions['largest-contentful-paint'];
  expect(assertion).toBeDefined();
  expect(assertion[0]).toBe('error');
  expect(assertion[1].maxNumericValue).toBe(2000);
});

test('T081: /demo budget is strictly looser than homepage budget', () => {
  // Invariant: if someone accidentally tightens /demo to 1500ms,
  // T074's iframe will blow the budget and the whole build fails
  // pointlessly. Conversely, if someone accidentally relaxes the
  // homepage to 2000ms, the performance promise drops. Encoding
  // the *relationship* (/demo > homepage by a sensible margin)
  // catches either drift.
  const homepageBudget =
    matrixEntry(HOMEPAGE_PATTERN)!.assertions['largest-contentful-paint'][1].maxNumericValue!;
  const demoBudget =
    matrixEntry(DEMO_PATTERN)!.assertions['largest-contentful-paint'][1].maxNumericValue!;
  expect(demoBudget).toBeGreaterThan(homepageBudget);
  expect(demoBudget - homepageBudget).toBeLessThanOrEqual(600);
});
