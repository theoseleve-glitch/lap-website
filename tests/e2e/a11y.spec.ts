import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

// T038 — homepage must be axe-clean against WCAG 2.0/2.1 A + AA
// rulesets. Inline/best-practice "review" rules are NOT included —
// those are advisory and return findings that require human judgement
// (e.g., "landmark-one-main" on pages that intentionally omit <main>).
// The WCAG A/AA pair is the same gate the EU Accessibility Act 2025
// targets, which is the relevant regulatory surface for a EU-targeted
// marketing site.

test('T038: homepage has zero WCAG 2.1 A/AA axe violations', async ({ page }) => {
  await page.goto('/');

  // Hero GSAP fade-in tweens [data-hero-animate] elements from
  // opacity:0 → 1 over ~1.2s. Running axe mid-animation samples a
  // transparent element and fires a false-positive color-contrast
  // failure. Wait until every animated element has reached opacity
  // 1 before handing off to axe. If the animation never completes
  // (regression), the 5-second budget kicks in and the test fails
  // with a clear timeout, not a confusing contrast error.
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll('[data-hero-animate]')).every(
        (el) => parseFloat(getComputedStyle(el).opacity) >= 0.99,
      ),
    undefined,
    { timeout: 5000 },
  );

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  // Emit a compact breakdown when something fails so the error
  // message names which rule fired and on which element — saves the
  // 10-minute roundtrip through the raw Playwright report.
  const summary = results.violations
    .map((v) => {
      const where = v.nodes
        .map((n) => `${n.target.join(' ')} — ${n.failureSummary?.split('\n')[0] ?? ''}`)
        .join('\n      · ');
      return `${v.id} (${v.impact}): ${v.description}\n      · ${where}`;
    })
    .join('\n  - ');

  expect(
    results.violations,
    results.violations.length ? `axe violations:\n  - ${summary}` : 'clean',
  ).toEqual([]);
});
