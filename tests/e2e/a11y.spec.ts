import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

// T038 — homepage must be axe-clean against WCAG 2.0/2.1 A + AA
// rulesets. Inline/best-practice "review" rules are NOT included —
// those are advisory and return findings that require human judgement
// (e.g., "landmark-one-main" on pages that intentionally omit <main>).
// The WCAG A/AA pair is the same gate the EU Accessibility Act 2025
// targets, which is the relevant regulatory surface for a EU-targeted
// marketing site.

function buildSummary(
  violations: Awaited<ReturnType<InstanceType<typeof AxeBuilder>['analyze']>>['violations'],
): string {
  return violations
    .map((v) => {
      const where = v.nodes
        .map((n) => `${n.target.join(' ')} — ${n.failureSummary?.split('\n')[0] ?? ''}`)
        .join('\n      · ');
      return `${v.id} (${v.impact}): ${v.description}\n      · ${where}`;
    })
    .join('\n  - ');
}

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
  const summary = buildSummary(results.violations);

  expect(
    results.violations,
    results.violations.length ? `axe violations:\n  - ${summary}` : 'clean',
  ).toEqual([]);
});

test('T053: /how-it-works has zero WCAG 2.1 A/AA axe violations', async ({ page }) => {
  // /how-it-works has no hero GSAP (the page is static — T043 hero
  // is plain HTML), so no opacity-wait is needed before the scan.
  // Any axe failures here are genuine — not animation timing
  // artefacts. Axe gates the SVG diagram's figure+labelledby
  // pattern, the H3 hierarchy across four section steps, and the
  // honesty section's ✓/→ symbols marked aria-hidden.
  await page.goto('/how-it-works');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const summary = buildSummary(results.violations);
  expect(
    results.violations,
    results.violations.length ? `axe violations:\n  - ${summary}` : 'clean',
  ).toEqual([]);
});

test('T068: /pricing has zero WCAG 2.1 A/AA axe violations', async ({ page }) => {
  // /pricing is static (no GSAP) so no opacity-wait is needed.
  // Axe gates the tier-card structure (trial-badge contrast,
  // CTA button contrast), the native <details>/<summary> FAQ
  // (browser-owned ARIA), the acid-green ✓ markers on the 12-bullet
  // checklist (aria-hidden so no text-alt is needed), and the
  // value-anchor section's plain-prose paragraphs.
  await page.goto('/pricing');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const summary = buildSummary(results.violations);
  expect(
    results.violations,
    results.violations.length ? `axe violations:\n  - ${summary}` : 'clean',
  ).toEqual([]);
});

test('T083: /demo has zero WCAG 2.1 A/AA axe violations', async ({ page }) => {
  // /demo is static (no GSAP) — the T072 shell + T073 walkthrough
  // placeholder are plain HTML. Axe gates the single <main>
  // landmark + <section aria-labelledby> wiring, the H1 → H2
  // hierarchy, and the muted-card placeholder's text-steel on
  // bg-concrete/20 contrast (same token pairing T035 SocialProof
  // passes axe with; a regression in either direction fails this
  // test before it ships to prod). When T074 lands the lazy-loaded
  // iframe, this gate also catches missing title attributes / iframe
  // accessibility regressions in the same CI pass.
  await page.goto('/demo');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const summary = buildSummary(results.violations);
  expect(
    results.violations,
    results.violations.length ? `axe violations:\n  - ${summary}` : 'clean',
  ).toEqual([]);
});
