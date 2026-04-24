import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

// Contract tests for the Lighthouse CI performance budget. The
// ubuntu-latest CI job is the gate of record (the sprint comment on
// T017 flagged that Windows local LHCI hits an EPERM cleanup issue),
// so these tests codify the *intent* of the config — CI then
// measures whether the actual site meets it.

interface LhciConfig {
  ci: {
    collect: {
      numberOfRuns: number;
      settings?: {
        preset?: string;
        formFactor?: string;
        onlyCategories?: string[];
      };
    };
    assert: {
      assertions: Record<string, [string, { maxNumericValue?: number }]>;
    };
  };
}

const configPath = resolve(process.cwd(), 'lighthouserc.json');
const config: LhciConfig = JSON.parse(readFileSync(configPath, 'utf8'));

test('T036: LCP assertion is tightened to 1500ms (mobile 4G budget)', () => {
  // 01-STRATEGIC-DOCTRINE.md §9 ships the homepage as the front
  // conversion surface; CLAUDE.md sets the ceiling at 1.8s on
  // desktop, and T036 tightens the mobile-4G target to 1500ms.
  // Any relaxation of this budget (bumping to 1800 / 2000 "just for
  // now") fails CI before it ships.
  const assertion = config.ci.assert.assertions['largest-contentful-paint'];
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
