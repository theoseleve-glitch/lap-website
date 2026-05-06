# V2 March Chrome & Marquee Implementation Plan (Phase 2 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the V2 March (commit `324c5830`, 2026-03-27) marketing-site **chrome** layer — persistent wordmark, sector tabs, timecode strip, MarqueeStrip, and V2-styled footer — into the Astro `lap-website/`, building on the Phase 1 visual foundation. After Phase 2, the site's *frame* (header, footer, between-section marquees) reads as V2; pages still use their current Astro composition (Phase 3 rebuilds the homepage).

**Architecture:** Astro components, server-rendered first paint, minimal client-side JS. The persistent chrome lives in `BaseLayout.astro` so every page picks it up automatically. The MarqueeStrip is a server-rendered Astro component with CSS-only animation (consumes the `@keyframes marquee-scroll` Phase-1 added). All new components reference Phase-1 tokens (`--space-*`, `--z-nav`, `--z-timecode`, `--font-display`, `--font-mono`, `--ls-wide`, etc.) and utility classes (`.font-monument`, `.font-telemetry`).

**Tech Stack:** Astro 5.18, Tailwind v4 (4.2.4), TypeScript strict, Vitest with `experimental_AstroContainer` for component tests, Playwright for navigation/interaction tests. Zero new dependencies.

**Source of truth:** `Analysis/V2_claude_ai/` repo at `324c5830`. To inspect any V2 component:
```bash
git -C "C:\Users\Admin\Documents\Telemetry\Analysis\V2_claude_ai" show 324c5830:lap-website/src/components/chrome/<file>.tsx
```

**Working directory for all commands:** `C:\Users\Admin\Documents\Telemetry\lap-website`

**Commit prefix:** `restyle(marketing): C##` — distinguishes Phase-2 chrome commits from Phase-1's V## tokens. Each task ends in exactly one commit, subject-line only.

**Out of scope for Phase 2 (deferred):**
- DeltaStrip / DeltaHud (in-page racing-data overlay) — Phase 3 if homepage rooms need it
- DrsLabel, FinishLine, PitWheel, IndexOverlay, SectorGateSweep, TimingTower, CustomCursor, MiniTrackMap (V2-thematic but secondary to identity) — Phase 4 if budget allows
- AnnouncementBar, PromoCountdown, CookieConsentBanner — only if launch needs surface them; Phase 1 + chrome covers GDPR via cookieless tracking

**Critical environment fix (same as Phase 1):**
```bash
export PATH="/c/Program Files/nodejs:/c/Users/Admin/AppData/Roaming/npm:$PATH"
cd "C:/Users/Admin/Documents/Telemetry/lap-website"
# Use pnpm.cmd not pnpm
```

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `src/components/chrome/LapWordmark.astro` | Create | Brand mark — "LAP" in `font-monument`, sized for header |
| `src/components/chrome/SectorTabs.astro` | Create | Top-of-page sector-style nav (Pricing / How it works / Demo / Blog / For Schools), with active-state highlight |
| `src/components/chrome/TimecodeCounter.astro` | Create | Bottom-of-page running clock strip — UTC time + page-time-since-load, in `font-telemetry` |
| `src/components/chrome/SiteHeader.astro` | Create | Composes LapWordmark + SectorTabs into a sticky top bar at `--z-nav` |
| `src/components/chrome/SiteFooter.astro` | Create | V2-styled footer — column links + legal + brand stamp, all in `font-telemetry`/`font-body` |
| `src/components/ui/MarqueeStrip.astro` | Create | Marquee text scroll consuming Phase-1 `@keyframes marquee-scroll` |
| `src/layouts/BaseLayout.astro` | Modify | Mount SiteHeader before `<slot />`, SiteFooter after, TimecodeCounter at bottom |
| `src/__tests__/lap-wordmark.test.ts` | Create | Vitest container test — renders, has correct text + classes |
| `src/__tests__/sector-tabs.test.ts` | Create | Vitest — renders all 5 nav links, active-state pulled from current path |
| `src/__tests__/timecode-counter.test.ts` | Create | Vitest — renders mono font + telemetry styling, includes a `<time>` element |
| `src/__tests__/site-header.test.ts` | Create | Vitest — composes LapWordmark + SectorTabs, has `role="banner"`, sticky positioning |
| `src/__tests__/site-footer.test.ts` | Create | Vitest — has `role="contentinfo"`, all required link sections present |
| `src/__tests__/marquee-strip.test.ts` | Create | Vitest — renders given items, animation CSS references `marquee-scroll` keyframe |
| `src/__tests__/base-layout-chrome.test.ts` | Create | Vitest — BaseLayout includes header + footer + timecode in correct order |
| `tests/e2e/chrome-nav.spec.ts` | Create | Playwright — header is sticky on scroll, sector-tabs link work, footer present on every public page |

**Why per-component test files instead of one chrome.test.ts?** Each component has independent failure modes (LapWordmark could render without SectorTabs working, etc.). Per-component tests keep failures localized and let Phase 3 implementers add chrome variants without touching omnibus tests.

---

## Task C0: Pre-flight

- [ ] **Step 1: Verify Phase 1 is the current state**

```bash
git -C "C:/Users/Admin/Documents/Telemetry/lap-website" log -1 --pretty=format:"%H %s"
```
Expected: latest commit is `restyle(marketing): V23 …` or later. If still on a pre-V01 commit, Phase 1 hasn't landed — STOP.

- [ ] **Step 2: Capture baseline test count**

```bash
pnpm.cmd test 2>&1 | tail -5
```
Expected: 165 test files / 2318 tests pass (Phase-1 final state). Note this — Phase 2 will land 7 new test files (~30-40 new tests).

- [ ] **Step 3: Confirm V2 chrome source is reachable**

```bash
git -C "C:/Users/Admin/Documents/Telemetry/Analysis/V2_claude_ai" show 324c5830:lap-website/src/components/chrome/LapWordmark.tsx | head -5
```
Expected: first 5 lines of V2's LapWordmark print without error.

---

## Task C1: LapWordmark Astro component

**Files:**
- Create: `src/components/chrome/LapWordmark.astro`
- Test: `src/__tests__/lap-wordmark.test.ts`

**Why:** The "LAP" wordmark is the single most identifiable V2 element — a tight monument-style typeface with letter-spacing tuned for racing-team aesthetics. Used in header (top-left) and as a watermark in footer.

#### Reference (V2)

```bash
git -C "C:/Users/Admin/Documents/Telemetry/Analysis/V2_claude_ai" show 324c5830:lap-website/src/components/chrome/LapWordmark.tsx
```

Read this before implementing. Note the font choice (Space Grotesk + 700 + uppercase + tight tracking — i.e. `.font-monument`), the sizing (typically clamp), the optional pulse / hover state, and any href behaviour.

#### Step 1: Write the failing test

Create `src/__tests__/lap-wordmark.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import LapWordmark from '../components/chrome/LapWordmark.astro';

const render = (props?: { href?: string; ariaLabel?: string }) =>
  AstroContainer.create().then((c) => c.renderToString(LapWordmark, { props: props ?? {} }));

describe('LapWordmark', () => {
  test('renders the literal text "LAP" inside an anchor', async () => {
    const html = await render();
    expect(html).toMatch(/<a[^>]*>[\s\S]*?LAP[\s\S]*?<\/a>/);
  });
  test('default href is "/" (home)', async () => {
    const html = await render();
    expect(html).toMatch(/<a[^>]*href="\/"/);
  });
  test('href can be overridden via prop (Phase-3 scroll-link to home StartGrid)', async () => {
    const html = await render({ href: '/#start-grid' });
    expect(html).toMatch(/<a[^>]*href="\/#start-grid"/);
  });
  test('uses font-monument class (display + 700 + uppercase + tight tracking from Phase 1)', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*font-monument[^"]*"/);
  });
  test('has aria-label for screen readers (default "LAP — home")', async () => {
    const html = await render();
    expect(html).toMatch(/aria-label="LAP\s*—\s*home"/);
  });
  test('aria-label is overridable', async () => {
    const html = await render({ ariaLabel: 'LAP — back to start' });
    expect(html).toMatch(/aria-label="LAP\s*—\s*back to start"/);
  });
});
```

#### Step 2: Run test, verify it fails (component not yet created — module-not-found is acceptable failure mode):

```bash
pnpm.cmd test src/__tests__/lap-wordmark.test.ts 2>&1 | tail -10
```

#### Step 3: Create `src/components/chrome/LapWordmark.astro`:

```astro
---
interface Props {
  href?: string;
  ariaLabel?: string;
}

const { href = '/', ariaLabel = 'LAP — home' } = Astro.props;
---

<a
  href={href}
  aria-label={ariaLabel}
  class="font-monument text-h3 inline-block text-chalk hover:text-chalk/80 transition-colors"
>
  LAP
</a>
```

#### Step 4: Run test, all 6 should pass.

#### Step 5: Commit:

```bash
git add src/components/chrome/LapWordmark.astro src/__tests__/lap-wordmark.test.ts
git commit -m "restyle(marketing): C01 LapWordmark Astro component ported from V2 March"
```

---

## Task C2: SectorTabs Astro component

**Files:**
- Create: `src/components/chrome/SectorTabs.astro`
- Test: `src/__tests__/sector-tabs.test.ts`

**Why:** V2's SectorTabs was a small horizontal nav stylized as the timing-tower's sector-tab UI — tight font-telemetry, accent underline on active. This is the primary in-site navigation for Phase 2; Phase 3 home rooms will optionally replace this on the home page only.

#### Reference (V2)

```bash
git -C "C:/Users/Admin/Documents/Telemetry/Analysis/V2_claude_ai" show 324c5830:lap-website/src/components/chrome/SectorTabs.tsx
```

#### Step 1: Define the nav vocabulary

The Astro lap-website's public pages (excluding 404/500/og/admin):
- `/` (home)
- `/pricing`
- `/how-it-works`
- `/demo`
- `/blog` (and posts)
- `/for-schools`
- `/waitlist`
- `/launch`, `/v1`, `/press` (launch-window pages)

For SectorTabs, expose the FIVE primary nav: Pricing, How it works, Demo, Blog, For schools. Waitlist + launch pages are CTA-driven, not nav-driven.

Each tab gets a 1-character "sector" label (`P`, `H`, `D`, `B`, `S`) rendered in `font-telemetry` above the tab text — matches V2's racing-sector-tab visual.

#### Step 2: Write the failing test

Create `src/__tests__/sector-tabs.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SectorTabs from '../components/chrome/SectorTabs.astro';

const render = (currentPath: string) =>
  AstroContainer.create().then((c) =>
    c.renderToString(SectorTabs, {
      // currentPath comes from Astro.url.pathname — pass via props for tests.
      props: { currentPath },
    }),
  );

describe('SectorTabs', () => {
  test('renders all 5 primary nav links', async () => {
    const html = await render('/');
    expect(html).toMatch(/href="\/pricing"/);
    expect(html).toMatch(/href="\/how-it-works"/);
    expect(html).toMatch(/href="\/demo"/);
    expect(html).toMatch(/href="\/blog"/);
    expect(html).toMatch(/href="\/for-schools"/);
  });
  test('uses <nav role="navigation" aria-label="Primary"> as root', async () => {
    const html = await render('/');
    expect(html).toMatch(/<nav[^>]+role="navigation"[^>]+aria-label="Primary"/);
  });
  test('marks the current path with aria-current="page"', async () => {
    const html = await render('/pricing');
    // Whichever <a> wraps /pricing should have aria-current="page".
    expect(html).toMatch(/<a[^>]+href="\/pricing"[^>]+aria-current="page"/);
  });
  test('renders sector labels (P/H/D/B/S) in font-telemetry', async () => {
    const html = await render('/');
    expect(html).toMatch(/<span[^>]*class="[^"]*font-telemetry[^"]*"[^>]*>P<\/span>/);
    expect(html).toMatch(/<span[^>]*class="[^"]*font-telemetry[^"]*"[^>]*>H<\/span>/);
  });
  test('blog match is path-prefix not exact (so /blog/some-post still highlights Blog)', async () => {
    const html = await render('/blog/why-not-motec-clone');
    expect(html).toMatch(/<a[^>]+href="\/blog"[^>]+aria-current="page"/);
  });
});
```

#### Step 3: Run test, verify failure.

#### Step 4: Create `src/components/chrome/SectorTabs.astro`:

```astro
---
interface SectorTab {
  label: string;
  sector: string;
  href: string;
}

interface Props {
  currentPath?: string;
}

const TABS: SectorTab[] = [
  { label: 'Pricing', sector: 'P', href: '/pricing' },
  { label: 'How it works', sector: 'H', href: '/how-it-works' },
  { label: 'Demo', sector: 'D', href: '/demo' },
  { label: 'Blog', sector: 'B', href: '/blog' },
  { label: 'For schools', sector: 'S', href: '/for-schools' },
];

const { currentPath = Astro.url.pathname } = Astro.props;

// Path-prefix match — so /blog/<slug> highlights /blog. Exclude root '/' so
// every nested path doesn't match the home tab (we don't have a home tab in
// SectorTabs — home is owned by LapWordmark).
const isCurrent = (href: string) => href === '/' ? currentPath === '/' : currentPath.startsWith(href);
---

<nav role="navigation" aria-label="Primary" class="flex gap-grid-gutter">
  {TABS.map((tab) => (
    <a
      href={tab.href}
      class:list={[
        'group flex flex-col items-center gap-1 px-3 py-2 text-chalk transition-opacity hover:opacity-80',
        isCurrent(tab.href) && 'border-b-2 border-pit-orange',
      ]}
      aria-current={isCurrent(tab.href) ? 'page' : undefined}
    >
      <span class="font-telemetry text-tiny text-steel group-hover:text-chalk">
        {tab.sector}
      </span>
      <span class="font-body text-caption">{tab.label}</span>
    </a>
  ))}
</nav>
```

#### Step 5: Run test, all 5 should pass.

#### Step 6: Commit:

```bash
git add src/components/chrome/SectorTabs.astro src/__tests__/sector-tabs.test.ts
git commit -m "restyle(marketing): C02 SectorTabs primary nav component ported from V2 March"
```

---

## Task C3: TimecodeCounter Astro component

**Files:**
- Create: `src/components/chrome/TimecodeCounter.astro`
- Test: `src/__tests__/timecode-counter.test.ts`

**Why:** A live-clock strip running along the bottom of every page — UTC time + page-load timestamp — in `font-telemetry`, fixed-position at `--z-timecode`. Adds the racing-data-HUD identity to every page without modifying page content.

#### Step 1: Failing test

Create `src/__tests__/timecode-counter.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import TimecodeCounter from '../components/chrome/TimecodeCounter.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(TimecodeCounter, {}));

describe('TimecodeCounter', () => {
  test('renders a <time> element (semantic HTML for clock)', async () => {
    const html = await render();
    expect(html).toMatch(/<time/);
  });
  test('uses font-telemetry class (mono + uppercase + wide tracking from Phase 1)', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*font-telemetry[^"]*"/);
  });
  test('positions fixed at the bottom (uses bottom-0 or fixed positioning)', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*fixed[^"]*"/);
  });
  test('aria-hidden — decorative; the live-clock is not a screen-reader landmark', async () => {
    const html = await render();
    expect(html).toMatch(/aria-hidden="true"/);
  });
  test('inline script tag is present to drive the live update (client-side only)', async () => {
    const html = await render();
    expect(html).toMatch(/<script/);
  });
});
```

#### Step 2: Run test, verify failure.

#### Step 3: Create `src/components/chrome/TimecodeCounter.astro`:

```astro
---
// Server-renders a placeholder time (00:00:00 UTC) — the inline script
// (deferred, client-side) replaces it on first tick. We don't pre-render the
// real UTC because the build is static and a stale "20:42:18 UTC" baked into
// every page would be misleading. The placeholder keeps layout stable; the
// script swaps it within ~16ms of first paint.
---

<aside
  aria-hidden="true"
  class="fixed bottom-0 left-0 right-0 z-timecode flex items-center justify-between px-4 py-2 font-telemetry text-tiny text-steel border-t border-steel/20 bg-asphalt/85 backdrop-blur-sm"
>
  <span data-timecode-utc>
    <time>00:00:00</time> UTC
  </span>
  <span data-timecode-elapsed>
    SESSION <time>+00:00</time>
  </span>
</aside>

<script>
  const utcEl = document.querySelector('[data-timecode-utc] time');
  const elapsedEl = document.querySelector('[data-timecode-elapsed] time');
  const start = performance.now();
  const tick = () => {
    if (utcEl) {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const mm = String(now.getUTCMinutes()).padStart(2, '0');
      const ss = String(now.getUTCSeconds()).padStart(2, '0');
      utcEl.textContent = `${hh}:${mm}:${ss}`;
    }
    if (elapsedEl) {
      const elapsed = Math.floor((performance.now() - start) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      elapsedEl.textContent = `+${m}:${s}`;
    }
  };
  tick();
  setInterval(tick, 1000);
</script>
```

NB: the inline script is small (under 1 KB gzipped) and runs only after first paint. It does NOT block LCP. Verify against `homepage-js-budget.test.ts` after integration.

#### Step 4: Run test, all 5 should pass.

#### Step 5: Commit:

```bash
git add src/components/chrome/TimecodeCounter.astro src/__tests__/timecode-counter.test.ts
git commit -m "restyle(marketing): C03 TimecodeCounter live UTC + session-elapsed strip ported from V2 March"
```

---

## Task C4: SiteHeader composer

**Files:**
- Create: `src/components/chrome/SiteHeader.astro`
- Test: `src/__tests__/site-header.test.ts`

**Why:** Composes LapWordmark (left) + SectorTabs (right) into a sticky top bar at `--z-nav`.

#### Step 1: Failing test

Create `src/__tests__/site-header.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SiteHeader from '../components/chrome/SiteHeader.astro';

const render = (currentPath = '/') =>
  AstroContainer.create().then((c) =>
    c.renderToString(SiteHeader, { props: { currentPath } }),
  );

describe('SiteHeader', () => {
  test('uses <header role="banner"> as root', async () => {
    const html = await render();
    expect(html).toMatch(/<header[^>]+role="banner"/);
  });
  test('contains the LapWordmark text "LAP"', async () => {
    const html = await render();
    expect(html).toMatch(/LAP/);
  });
  test('contains the SectorTabs nav (5 primary links)', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/pricing"/);
    expect(html).toMatch(/href="\/how-it-works"/);
    expect(html).toMatch(/href="\/demo"/);
    expect(html).toMatch(/href="\/blog"/);
    expect(html).toMatch(/href="\/for-schools"/);
  });
  test('uses sticky positioning at z-nav', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*sticky[^"]*"/);
    // z-nav from Phase-1 tokens — match either Tailwind utility (z-nav) or inline style.
    expect(html).toMatch(/z-nav|z-\[var\(--z-nav\)\]/);
  });
  test('current path flows through to SectorTabs aria-current', async () => {
    const html = await render('/blog/some-post');
    expect(html).toMatch(/<a[^>]+href="\/blog"[^>]+aria-current="page"/);
  });
});
```

#### Step 2: Failing run.

#### Step 3: Create `src/components/chrome/SiteHeader.astro`:

```astro
---
import LapWordmark from './LapWordmark.astro';
import SectorTabs from './SectorTabs.astro';

interface Props {
  currentPath?: string;
}

const { currentPath = Astro.url.pathname } = Astro.props;
---

<header
  role="banner"
  class="sticky top-0 z-nav flex items-center justify-between gap-4 border-b border-steel/20 bg-asphalt/90 px-grid-margin py-3 backdrop-blur-sm"
>
  <LapWordmark />
  <SectorTabs currentPath={currentPath} />
</header>
```

#### Step 4: Tests pass (5/5).

#### Step 5: Commit:

```bash
git add src/components/chrome/SiteHeader.astro src/__tests__/site-header.test.ts
git commit -m "restyle(marketing): C04 SiteHeader composes LapWordmark + SectorTabs"
```

---

## Task C5: SiteFooter

**Files:**
- Create: `src/components/chrome/SiteFooter.astro`
- Test: `src/__tests__/site-footer.test.ts`

**Why:** Replaces the implicit/missing footer on Astro pages with a V2-styled column-link footer — Product, Company, Legal columns + brand stamp.

#### Step 1: Reference V2 footer structure

```bash
git -C "C:/Users/Admin/Documents/Telemetry/Analysis/V2_claude_ai" show 324c5830:lap-website/src/components/ui/AppFooter.tsx
```

Extract the column structure (Product / Company / Legal links). Astro pages need adapted column content:
- **Product:** `/pricing`, `/how-it-works`, `/demo`, `/v1` (changelog), `/launch` (release notes if live)
- **Company:** `/for-schools`, `/press`, `/blog`
- **Legal:** `/privacy`, `/refund-policy`

(These are all paths that already exist in `src/pages/`.)

#### Step 2: Failing test

Create `src/__tests__/site-footer.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SiteFooter from '../components/chrome/SiteFooter.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(SiteFooter, {}));

describe('SiteFooter', () => {
  test('uses <footer role="contentinfo">', async () => {
    const html = await render();
    expect(html).toMatch(/<footer[^>]+role="contentinfo"/);
  });
  test('Product column: links to /pricing, /how-it-works, /demo, /v1', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/pricing"/);
    expect(html).toMatch(/href="\/how-it-works"/);
    expect(html).toMatch(/href="\/demo"/);
    expect(html).toMatch(/href="\/v1"/);
  });
  test('Company column: /for-schools, /press, /blog', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/for-schools"/);
    expect(html).toMatch(/href="\/press"/);
    expect(html).toMatch(/href="\/blog"/);
  });
  test('Legal column: /privacy, /refund-policy', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/privacy"/);
    expect(html).toMatch(/href="\/refund-policy"/);
  });
  test('contains LAP brand stamp at the bottom', async () => {
    const html = await render();
    expect(html).toMatch(/LAP/);
    expect(html).toMatch(/©|copyright/i);
  });
});
```

#### Step 3: Failing run.

#### Step 4: Create `src/components/chrome/SiteFooter.astro`. Use a 4-column grid (or single-column on mobile via Tailwind responsive utilities). All link text is `font-body`, headings are `font-telemetry`. Brand stamp uses `font-monument`. No JS — server-rendered only.

#### Step 5: Tests pass (5/5).

#### Step 6: Commit:

```bash
git add src/components/chrome/SiteFooter.astro src/__tests__/site-footer.test.ts
git commit -m "restyle(marketing): C05 SiteFooter Product/Company/Legal columns + brand stamp"
```

---

## Task C6: MarqueeStrip Astro component

**Files:**
- Create: `src/components/ui/MarqueeStrip.astro`
- Test: `src/__tests__/marquee-strip.test.ts`

**Why:** V2's signature element — repeating racing-keyword scroll between sections (TELEMETRY • LAP ANALYSIS • CORNER COACHING • …). Server-rendered Astro component, animation via Phase-1's `@keyframes marquee-scroll`. Phase 3 home rooms will sandwich rooms with these.

#### Reference (V2)

```bash
git -C "C:/Users/Admin/Documents/Telemetry/Analysis/V2_claude_ai" show 324c5830:lap-website/src/components/ui/MarqueeStrip.tsx
```

#### Step 1: Failing test

Create `src/__tests__/marquee-strip.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import MarqueeStrip from '../components/ui/MarqueeStrip.astro';

const ITEMS = ['TELEMETRY', 'LAP ANALYSIS', 'CORNER COACHING'];

const render = (props: Record<string, unknown> = {}) =>
  AstroContainer.create().then((c) =>
    c.renderToString(MarqueeStrip, {
      props: { items: ITEMS, ...props },
    }),
  );

describe('MarqueeStrip', () => {
  test('renders each item in the strip', async () => {
    const html = await render();
    expect(html).toMatch(/TELEMETRY/);
    expect(html).toMatch(/LAP ANALYSIS/);
    expect(html).toMatch(/CORNER COACHING/);
  });
  test('default speed is 30 seconds (per V2 default)', async () => {
    const html = await render();
    expect(html).toMatch(/animation:\s*marquee-scroll\s+30s/);
  });
  test('speed prop overrides default', async () => {
    const html = await render({ speed: 45 });
    expect(html).toMatch(/animation:\s*marquee-scroll\s+45s/);
  });
  test('reverse prop sets animation-direction: reverse', async () => {
    const html = await render({ reverse: true });
    expect(html).toMatch(/animation-direction:\s*reverse/);
  });
  test('aria-hidden — decorative scrolling text', async () => {
    const html = await render();
    expect(html).toMatch(/aria-hidden="true"/);
  });
  test('uses font-monument with reduced opacity (text-chalk/20 in V2)', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*font-monument[^"]*"/);
  });
});
```

#### Step 2: Failing run.

#### Step 3: Create `src/components/ui/MarqueeStrip.astro`:

```astro
---
interface Props {
  items: string[];
  speed?: number;
  separator?: string;
  reverse?: boolean;
  className?: string;
}

const {
  items,
  speed = 30,
  separator = '•',
  reverse = false,
  className = '',
} = Astro.props;

const text = items.join(` ${separator} `) + ` ${separator} `;
const animationStyle = `animation: marquee-scroll ${speed}s linear infinite; animation-direction: ${reverse ? 'reverse' : 'normal'};`;
---

<div
  aria-hidden="true"
  class:list={[
    'overflow-hidden whitespace-nowrap border-y border-chalk/10 py-3',
    className,
  ]}
>
  <div class="inline-flex" style={animationStyle}>
    {[0, 1, 2, 3].map(() => (
      <span class="font-monument text-[clamp(14px,2vw,20px)] text-chalk/20 tracking-[0.08em] px-4">
        {text}
      </span>
    ))}
  </div>
</div>
```

(Four duplicate spans give the loop continuous wrap-around — same approach as V2.)

#### Step 4: Tests pass (6/6).

#### Step 5: Commit:

```bash
git add src/components/ui/MarqueeStrip.astro src/__tests__/marquee-strip.test.ts
git commit -m "restyle(marketing): C06 MarqueeStrip Astro component (consumes Phase-1 marquee-scroll keyframe)"
```

---

## Task C7: Wire chrome into BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Test: `src/__tests__/base-layout-chrome.test.ts`
- Update affected existing tests if any check rendered HTML structure

**Why:** Without this, the new chrome components don't actually appear on any page.

#### Step 1: Inventory existing BaseLayout-rendered-HTML test assertions

```bash
grep -rn "<header\|<footer\|role=\"banner\"\|role=\"contentinfo\"" src/__tests__/ | head -20
```

Note any test that asserts the absence of header/footer — those will need to be updated. Most likely candidates: hero.test.ts, homepage.test.ts, page-specific tests.

#### Step 2: Write the integration test

Create `src/__tests__/base-layout-chrome.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import BaseLayout from '../layouts/BaseLayout.astro';

const render = () =>
  AstroContainer.create().then((c) =>
    c.renderToString(BaseLayout, {
      props: { title: 'Test page' },
      slots: { default: '<main>page content</main>' },
    }),
  );

describe('BaseLayout chrome integration', () => {
  test('renders SiteHeader (role="banner") before slot', async () => {
    const html = await render();
    const headerIdx = html.search(/<header[^>]+role="banner"/);
    const slotIdx = html.indexOf('page content');
    expect(headerIdx).toBeGreaterThan(-1);
    expect(slotIdx).toBeGreaterThan(headerIdx);
  });
  test('renders SiteFooter (role="contentinfo") after slot', async () => {
    const html = await render();
    const slotIdx = html.indexOf('page content');
    const footerIdx = html.search(/<footer[^>]+role="contentinfo"/);
    expect(footerIdx).toBeGreaterThan(slotIdx);
  });
  test('renders TimecodeCounter (aria-hidden + fixed) outside the main flow', async () => {
    const html = await render();
    expect(html).toMatch(/<aside[^>]+aria-hidden="true"[^>]*class="[^"]*fixed[^"]*"/);
  });
  test('chrome elements live inside <body>, not <head>', async () => {
    const html = await render();
    const bodyIdx = html.indexOf('<body');
    const headerIdx = html.search(/<header[^>]+role="banner"/);
    expect(headerIdx).toBeGreaterThan(bodyIdx);
  });
});
```

#### Step 3: Modify `src/layouts/BaseLayout.astro`. Currently the body is just `<slot />`. Wrap it:

Before:
```astro
  <body class="bg-asphalt text-chalk min-h-screen">
    <slot />
  </body>
```

After:
```astro
---
// add at top with other imports
import SiteHeader from '../components/chrome/SiteHeader.astro';
import SiteFooter from '../components/chrome/SiteFooter.astro';
import TimecodeCounter from '../components/chrome/TimecodeCounter.astro';
---

  <body class="bg-asphalt text-chalk min-h-screen pb-12">
    <SiteHeader />
    <slot />
    <SiteFooter />
    <TimecodeCounter />
  </body>
```

(`pb-12` ensures content above the TimecodeCounter has bottom padding.)

#### Step 4: Run the new integration test:

```bash
pnpm.cmd test src/__tests__/base-layout-chrome.test.ts 2>&1 | tail -10
```

Expected: 4/4 pass.

#### Step 5: Run the FULL test suite — many existing tests render BaseLayout-wrapped pages and their assertions may now see SiteHeader/SiteFooter content:

```bash
pnpm.cmd test 2>&1 | tail -30
```

Expected outcomes:
- All Phase-1 tests still pass (untouched files).
- Tests that assert `aria-current="page"` on SectorTabs links may newly succeed.
- Tests that asserted "no `<header>`" or counted `<a>` tags in rendered HTML may now fail with off-by-N.
- `homepage-js-budget.test.ts` — verify TimecodeCounter inline script doesn't push gzip JS over 100 KB. If it does, escalate; the script is so small (<1 KB) that this should not happen.

For each existing failing test: triage as either (a) Phase-2 introduced new chrome links/text the test should now expect → update the test, or (b) genuine regression → fix the chrome.

#### Step 6: Commit:

```bash
git add src/layouts/BaseLayout.astro src/__tests__/base-layout-chrome.test.ts
git commit -m "restyle(marketing): C07 mount SiteHeader + SiteFooter + TimecodeCounter in BaseLayout"
```

If Step 5 surfaced existing-test updates, commit those AS A SEPARATE follow-up:

```bash
git add src/__tests__/<the-test-files-you-updated>
git commit -m "restyle(marketing): C07a update existing tests for new chrome content"
```

---

## Task C8: e2e — chrome navigation works on every page

**Files:**
- Create: `tests/e2e/chrome-nav.spec.ts`

**Why:** Vitest container tests verify component contracts; an e2e Playwright check verifies that navigating the SectorTabs actually loads the right page with the right header/footer surviving.

#### Step 1: Create `tests/e2e/chrome-nav.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const PRIMARY_PAGES = [
  '/',
  '/pricing',
  '/how-it-works',
  '/demo',
  '/blog',
  '/for-schools',
];

test.describe('chrome navigation', () => {
  for (const path of PRIMARY_PAGES) {
    test(`${path} renders header + footer + timecode strip`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('header[role="banner"]')).toBeVisible();
      await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
      await expect(page.locator('aside[aria-hidden="true"][class*="fixed"]')).toBeAttached();
      // The TimecodeCounter is decorative — toBeAttached, not toBeVisible
      // (mobile layouts may hide it, and we don't fail e2e on that).
    });
  }

  test('SectorTabs Pricing link navigates to /pricing', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: /pricing/i }).click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('SectorTabs marks /pricing as aria-current="page" when on /pricing', async ({ page }) => {
    await page.goto('/pricing');
    const currentLink = page.getByRole('navigation', { name: 'Primary' }).locator('a[aria-current="page"]');
    await expect(currentLink).toContainText(/pricing/i);
  });

  test('LapWordmark click returns to home', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('link', { name: /LAP — home/i }).click();
    await expect(page).toHaveURL(/\/$|^\/$/);
  });
});
```

#### Step 2: Run:

```bash
pnpm.cmd test:e2e tests/e2e/chrome-nav.spec.ts 2>&1 | tail -20
```

Expected: all tests pass (Playwright's webServer config auto-starts the preview server).

#### Step 3: Commit:

```bash
git add tests/e2e/chrome-nav.spec.ts
git commit -m "restyle(marketing): C08 e2e — chrome navigation works across all primary pages"
```

---

## Task C9: Insert MarqueeStrip into pages that benefit (homepage + 1-2 others)

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/how-it-works.astro` (optional — only if it adds value without harming LCP)

**Why:** MarqueeStrip alone in the component tree achieves nothing. Land it in the homepage between the hero and the next section (matching V2's pattern) and gauge effect.

#### Step 1: Modify `src/pages/index.astro`. Currently the home composition is:

```astro
<BaseLayout title="LAP — Every lap, one step better.">
  <main>
    <Hero ...>...</Hero>
    <AfterEverySession />
    <SimAndReal />
    ...
```

Add a MarqueeStrip BETWEEN Hero and AfterEverySession:

```astro
---
import MarqueeStrip from '../components/ui/MarqueeStrip.astro';
// ... other existing imports
---

<BaseLayout title="LAP — Every lap, one step better.">
  <main>
    <Hero ...>...</Hero>
    <MarqueeStrip
      items={['TELEMETRY', 'LAP ANALYSIS', 'CORNER COACHING', 'PERFORMANCE SCORING', 'SESSION DEBRIEF', 'DATA ENGINEERING', 'TRACK MAPPING']}
      speed={35}
    />
    <AfterEverySession />
    ...
```

#### Step 2: Verify LCP isn't harmed:

```bash
pnpm.cmd build
pnpm.cmd lhci 2>&1 | tail -20
```

Expected: LCP still <1.5s. The MarqueeStrip has zero JS and only one extra DOM region; it should not shift LCP. If it does, the `border-y` on the strip might be reflowing — try `border-y border-chalk/10` (which Phase-1 tokens cover) or remove the border.

#### Step 3: Update `src/__tests__/homepage.test.ts` (or add a new test) to assert the strip appears:

Append a test:
```ts
test('renders MarqueeStrip between Hero and AfterEverySession sections', async () => {
  // The exact positional check depends on existing test fixture conventions;
  // a substring search for one of the marquee items is sufficient.
  const html = await render(); // existing render helper
  expect(html).toMatch(/TELEMETRY/);
  expect(html).toMatch(/CORNER COACHING/);
});
```

#### Step 4: Commit:

```bash
git add src/pages/index.astro src/__tests__/homepage.test.ts
git commit -m "restyle(marketing): C09 mount MarqueeStrip on homepage between Hero and section flow"
```

(Skip /how-it-works for now — it has its own diagram structure that may conflict; revisit in Phase 4.)

---

## Task C10: Full harness verification

- [ ] **Step 1: Run all tests**
```bash
pnpm.cmd test 2>&1 | tail -10
```
Expected: ~165+9 = 174 test files pass; ~2318 + 30-40 new = 2350-2360 tests.

- [ ] **Step 2: Typecheck**
```bash
pnpm.cmd typecheck 2>&1 | tail -10
```
Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Build**
```bash
pnpm.cmd build 2>&1 | tail -15
```
Expected: 46 pages still build (or 47+ if any new pages were added). No new warnings.

- [ ] **Step 4: JS budget regression**
```bash
pnpm.cmd test src/__tests__/homepage-js-budget.test.ts 2>&1 | tail -10
```
Expected: PASS — homepage gzip JS still <100 KB. The TimecodeCounter inline script (~600 B) plus MarqueeStrip (CSS only, 0 JS) leave plenty of headroom.

- [ ] **Step 5: Lighthouse CI**
```bash
pnpm.cmd lhci 2>&1 | tail -20
```
Expected: LCP <1.5s on mobile-4G profile, all thresholds met.

- [ ] **Step 6: e2e on representative pages**
```bash
pnpm.cmd test:e2e tests/e2e/chrome-nav.spec.ts tests/e2e/home.spec.ts 2>&1 | tail -20
```
Expected: all pass.

- [ ] **Step 7: Manual smoke check**

```bash
pnpm.cmd preview &
# Open http://localhost:4321/ in a browser; verify:
# - LAP wordmark top-left, sticky on scroll
# - SectorTabs to the right of wordmark
# - TimecodeCounter at the bottom, ticking
# - MarqueeStrip on home between hero and AfterEverySession, scrolling
# - Footer renders at bottom of every page
# Then kill the preview.
```

- [ ] **Step 8: If all green, no commit needed (verification step).** If any incidental fix landed: commit as `C10 incidental fixes from full-harness verification`.

---

## Task C11: Update CLAUDE.md with Phase 2 chrome

#### Modify `CLAUDE.md` — append (above /loop rules) a Phase-2 section parallel to the Phase-1 one:

```markdown
## Chrome — V2 March port (Phase 2 complete YYYY-MM-DD)

Persistent chrome wired into `src/layouts/BaseLayout.astro`. Every page picks
this up automatically. Phase-2 plan:
`docs/superpowers/plans/2026-05-05-v2-march-chrome.md`.

- **`src/components/chrome/LapWordmark.astro`** — brand mark, `font-monument`. Default href `/`.
- **`src/components/chrome/SectorTabs.astro`** — primary nav (Pricing / How / Demo / Blog / For schools), with `aria-current="page"` highlight on path-prefix match. Sector labels (P/H/D/B/S) in `font-telemetry`.
- **`src/components/chrome/TimecodeCounter.astro`** — bottom-fixed UTC clock + page-elapsed strip; ~600 B inline script, runs after first paint.
- **`src/components/chrome/SiteHeader.astro`** — sticky `<header role="banner">` composing LapWordmark + SectorTabs at `--z-nav`.
- **`src/components/chrome/SiteFooter.astro`** — `<footer role="contentinfo">` with Product / Company / Legal columns + brand stamp.
- **`src/components/ui/MarqueeStrip.astro`** — server-rendered scrolling text strip; consumes Phase-1 `@keyframes marquee-scroll`. Props: `items`, `speed` (default 30s), `separator` (default `•`), `reverse`.

**Phase-2 explicitly does NOT include:** racing-HUD elements (DeltaStrip, DrsLabel, FinishLine, PitWheel, IndexOverlay, SectorGateSweep, TimingTower, MiniTrackMap, CustomCursor) — these are V2 components but not core identity. Phase 3 home rooms add some of these in-flow; Phase 4 fits remaining ones to other pages if budget allows.
```

#### Commit:

```bash
git add CLAUDE.md
git commit -m "restyle(marketing): C11 document Phase-2 chrome in CLAUDE.md"
```

---

## Self-Review (before claiming Phase 2 done)

**1. Spec coverage:**
- [x] LapWordmark created + tested + integrated
- [x] SectorTabs created + tested + integrated
- [x] TimecodeCounter created + tested + integrated
- [x] SiteHeader composer
- [x] SiteFooter
- [x] MarqueeStrip (UI component, separate from chrome)
- [x] BaseLayout integration (chrome wired into every page)
- [x] e2e chrome-nav test
- [x] Homepage MarqueeStrip integration
- [x] Full harness verification
- [x] CLAUDE.md docs

**2. Phase-1 dependencies actually used:**
- LapWordmark uses `.font-monument` (Phase 1)
- SectorTabs uses `.font-telemetry` and `font-body` (Phase 1)
- TimecodeCounter uses `.font-telemetry` and `--z-timecode` (Phase 1)
- SiteHeader uses `--z-nav` (Phase 1) and `--grid-margin` (Phase 1)
- MarqueeStrip uses `.font-monument` and `@keyframes marquee-scroll` (Phase 1)

If any of these references break (e.g. `--z-nav` token absent), Phase-1 tests should have already failed. If they pass but Phase-2 components don't render the expected styling, the issue is naming drift — verify against the Phase-1 token list in `CLAUDE.md`.

**3. Pages NOT modified (intentional):**
The plan only modifies `src/pages/index.astro` (Task C9 inserts the MarqueeStrip). All other pages — `/pricing`, `/how-it-works`, `/demo`, `/for-schools`, `/blog/...`, `/waitlist`, `/launch`, `/v1`, `/press`, `/refund-policy`, `/privacy`, `/product/*` — get the chrome via BaseLayout but their internal content is unchanged. Phase 4 applies Phase-1 visual language to them.

**4. JS budget:**
Tasks C3 (TimecodeCounter ~600 B) and C9 (MarqueeStrip is CSS-only) are the only JS additions. Combined: ~600 B gzip. Homepage budget is 100 KB; we have ~99% headroom. The `homepage-js-budget.test.ts` regression test in Step 4 of C10 catches any unintentional bloat.

---

## Phase 2 → Phase 3 transition

After Phase 2 ships, the site has:
- V2 visual primitives (Phase 1)
- V2 chrome shell (Phase 2)
- Astro-default page composition (unchanged from current)

Phase 3 then replaces the homepage composition with the V2 narrative — StartGrid → S1Pain → MarqueeStrip → S1DeepSculpture → S2Pipeline → S2Versus → S3Product → S4WorkflowCoverage → MarqueeStrip → PitStop → Garage → Podium. Each room is an Astro component with `client:visible` boundary so JS only loads when scrolled into view, keeping the JS budget under 100 KB even with Canvas2D telemetry sculptures.

Plan file: `2026-05-XX-v2-march-homepage-rooms.md` (write after Phase 2 lands, when Phase-2 lessons inform the Phase-3 plan).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-05-v2-march-chrome.md`.

If the user is ready to execute Phase 2:

**1. Subagent-Driven (recommended)** — same workflow as Phase 1, fresh subagent per task with two-stage review.

**2. Inline Execution** — execute tasks in this session.

**3. Pause/redirect** — review the plan, edit, then start.

Phase 2's substantive risk (vs. Phase 1's CSS-only port) is in Task C7 (BaseLayout integration), which may surface existing-test updates. Budget extra time for that task. Phase 2's smaller risk is the TimecodeCounter inline script — the test pins `<time>` semantic + `font-telemetry` styling but not the live-update behaviour; visual smoke check in C10 catches any client-side regressions.
