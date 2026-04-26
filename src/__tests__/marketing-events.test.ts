// T218 — unit tests for the three new PostHog marketing events
// (signup_clicked, demo_viewed, pricing_viewed) plus the
// signup-click source-derivation helper. Mirrors the
// download-events / waitlist-events test pattern: small typed
// modules with mocked posthog.capture; pure helpers tested
// directly + page-level wiring verified by source-string match.
//
// Sprint spec locks the canonical event-name set: signup_clicked,
// demo_viewed, pricing_viewed, waitlist_submitted (already wired
// by T103), download_clicked (renamed from downloads_initiated by
// T218 — see download-events.test.ts).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const captureMock = vi.fn();
vi.mock('posthog-js', () => ({
  default: {
    capture: captureMock,
  },
}));

beforeEach(() => {
  captureMock.mockReset();
});

afterEach(() => {
  vi.resetModules();
});

describe('T218: captureSignupClicked — fires signup_clicked with source', () => {
  test.each([
    'homepage',
    'launch-page',
    'v1-page',
    'pricing',
    'for-schools',
    'demo-page',
    'other',
  ] as const)('source=%s fires signup_clicked', async (source) => {
    const { captureSignupClicked } = await import(
      '../scripts/marketing-events'
    );
    captureSignupClicked(source);
    expect(captureMock).toHaveBeenCalledTimes(1);
    expect(captureMock).toHaveBeenCalledWith('signup_clicked', { source });
  });

  test('two sequential clicks on same source fire independently (no de-dup)', async () => {
    const { captureSignupClicked } = await import(
      '../scripts/marketing-events'
    );
    captureSignupClicked('homepage');
    captureSignupClicked('homepage');
    expect(captureMock).toHaveBeenCalledTimes(2);
  });
});

describe('T218: signupSourceFromPathname — derives source from page path', () => {
  test.each([
    ['/', 'homepage'],
    ['/index.html', 'homepage'],
    ['/launch', 'launch-page'],
    ['/launch/', 'launch-page'],
    ['/v1', 'v1-page'],
    ['/v1/', 'v1-page'],
    ['/pricing', 'pricing'],
    ['/pricing/', 'pricing'],
    ['/for-schools', 'for-schools'],
    ['/for-schools/', 'for-schools'],
    ['/demo', 'demo-page'],
    ['/demo/', 'demo-page'],
  ] as const)('%s → %s', async (path, expected) => {
    const { signupSourceFromPathname } = await import(
      '../scripts/marketing-events'
    );
    expect(signupSourceFromPathname(path)).toBe(expected);
  });

  test('unknown path → other', async () => {
    const { signupSourceFromPathname } = await import(
      '../scripts/marketing-events'
    );
    expect(signupSourceFromPathname('/blog/some-post')).toBe('other');
    expect(signupSourceFromPathname('/press')).toBe('other');
    expect(signupSourceFromPathname('/how-it-works')).toBe('other');
  });
});

describe('T218: captureDemoViewed — fires demo_viewed with source', () => {
  test.each(['demo-page', 'homepage', 'product-page'] as const)(
    'source=%s fires demo_viewed',
    async (source) => {
      const { captureDemoViewed } = await import(
        '../scripts/marketing-events'
      );
      captureDemoViewed(source);
      expect(captureMock).toHaveBeenCalledWith('demo_viewed', { source });
    },
  );
});

describe('T218: capturePricingViewed — fires pricing_viewed (no properties)', () => {
  test('fires pricing_viewed once per call, no extra properties', async () => {
    const { capturePricingViewed } = await import(
      '../scripts/marketing-events'
    );
    capturePricingViewed();
    expect(captureMock).toHaveBeenCalledTimes(1);
    expect(captureMock).toHaveBeenCalledWith('pricing_viewed');
  });
});

// Page-level wiring is verified via source-string match. The
// build pipeline bundles each `<script>` block into a separate
// chunk, so the matcher checks the .astro source directly to
// lock that the right import + call is present.

describe('T218: pricing.astro fires pricing_viewed on page load', () => {
  test('pricing.astro source imports capturePricingViewed and calls it', () => {
    const src = readFileSync(
      join(process.cwd(), 'src', 'pages', 'pricing.astro'),
      'utf8',
    );
    expect(src).toMatch(
      /import\s*\{\s*capturePricingViewed\s*\}\s*from\s*['"][^'"]*marketing-events['"]/,
    );
    expect(src).toMatch(/capturePricingViewed\s*\(\s*\)/);
  });
});

describe('T218: demo.astro fires demo_viewed on page load', () => {
  test('demo.astro source imports captureDemoViewed and calls it with demo-page source', () => {
    const src = readFileSync(
      join(process.cwd(), 'src', 'pages', 'demo.astro'),
      'utf8',
    );
    expect(src).toMatch(
      /import\s*\{\s*captureDemoViewed\s*\}\s*from\s*['"][^'"]*marketing-events['"]/,
    );
    expect(src).toMatch(/captureDemoViewed\s*\(\s*['"]demo-page['"]\s*\)/);
  });
});

describe('T218: BaseLayout installs the global signup-click listener', () => {
  test('BaseLayout.astro imports marketing-events (for the auto-installed signup listener)', () => {
    const src = readFileSync(
      join(process.cwd(), 'src', 'layouts', 'BaseLayout.astro'),
      'utf8',
    );
    expect(src).toMatch(
      /import\s+['"][^'"]*scripts\/marketing-events['"]/,
    );
  });
});
