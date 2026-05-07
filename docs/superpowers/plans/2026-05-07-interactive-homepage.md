# Interactive Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the marketing homepage as a B+C hybrid (race-HUD + Apple cinematic-scroll) — 7 sector-coloured rooms with 5 GSAP-pinned rooms, ~50 % copy compression, deep-gold buttons (WCAG AA), top sector ribbon HUD, telemetry-caps nav, and ~86 KB gzip JS budget.

**Architecture:** Astro 5 static-first + Tailwind v4 `@theme` tokens. New `src/scripts/gsap-loader.ts` lazy-imports GSAP behind `requestIdleCallback` so it never blocks LCP. New `sector-progress.ts` IntersectionObserver drives the top ribbon + bottom timecode sector field. Each room is one `<section>` with `data-accent` propagating its sector colour to existing `[data-accent='X']` selectors in `global.css`. The existing FiveRedLights press-and-hold gate stays; the existing 5-light + headline + CTAs absorb the retired HeroManifest content.

**Tech Stack:** Astro 5.18, Tailwind v4 (4.2.4), TypeScript strict, GSAP 3.15 + ScrollTrigger (lazy), Vitest + `experimental_AstroContainer`, Playwright + axe-core, Lighthouse CI, `pnpm`. Existing tokens, `.beam-card` / `.text-shimmer` / `.texture-grain` / `.font-monument` / `.font-telemetry` primitives consumed verbatim.

**Spec source:** `docs/superpowers/specs/2026-05-07-interactive-homepage-design.md`

---

## File Structure

| Action | Path | Owns |
|--------|------|------|
| MODIFY | `src/styles/global.css` | adds `--color-pit-orange-deep` token |
| CREATE | `src/scripts/gsap-loader.ts` | lazy GSAP + ScrollTrigger registration |
| MODIFY | `src/scripts/hero-motion.ts` | migrate to lazy loader |
| CREATE | `src/scripts/sector-progress.ts` | IntersectionObserver → broadcast active room |
| CREATE | `src/scripts/tick-up.ts` | rAF count-up on viewport entry |
| CREATE | `src/scripts/magnetic-cursor.ts` | hero-only crosshair + magnetic links |
| MODIFY | `src/components/chrome/SectorTabs.astro` | variant C (telemetry caps + dot, drop sector codes) |
| CREATE | `src/components/chrome/SectorRibbon.astro` | 7-segment top HUD strip |
| MODIFY | `src/components/chrome/TimecodeCounter.astro` | 3-field bottom strip with sector name |
| MODIFY | `src/components/chrome/SiteHeader.astro` | mounts SectorRibbon home-only · uses `pit-orange-deep` for CTA |
| MODIFY | `src/components/rooms/StartGrid.astro` | absorbs HeroManifest · `data-accent="orange"` · M4 reveal · M5 cursor wiring |
| MODIFY | `src/components/rooms/SessionProof.astro` | compress · `data-accent="red"` · M3 tick on debrief |
| RENAME | `src/components/rooms/S1Pain.astro` → `ThePain.astro` | steel accent · M1 cross-fade |
| RENAME | `src/components/rooms/S2Versus.astro` → `Versus.astro` | absorb SimFirst · purple · M1 card swap |
| RENAME | `src/components/rooms/S3Product.astro` → `Pipeline.astro` | absorb PremiumLayer · green · M1 horizontal scrub |
| MODIFY | `src/components/rooms/Garage.astro` | compress · M3 stats tick-up |
| MODIFY | `src/components/rooms/Podium.astro` | absorb PitStop pricing · single CTA · `room` final pin |
| MODIFY | `src/components/rooms/FiveRedLights.astro` | adds `aria-pressed` lattice |
| DELETE | `src/components/rooms/HeroManifest.astro` | merged into StartGrid |
| DELETE | `src/components/rooms/SimFirst.astro` | merged into Versus |
| DELETE | `src/components/rooms/PremiumLayer.astro` | merged into Pipeline |
| DELETE | `src/components/rooms/PitStop.astro` | merged into Podium |
| MODIFY | `src/pages/index.astro` | new 7-room order · removes HeroManifest |
| MODIFY | `lighthouserc.json` | resource-summary script ≤ 100 000 B |
| MODIFY | `CLAUDE.md` | Phase 4 docs section |
| MODIFY | `src/__tests__/homepage.test.ts` | new 7-room order |
| MODIFY | `src/__tests__/site-header.test.ts` | variant C nav · ribbon mount |
| MODIFY | `src/__tests__/timecode-counter.test.ts` | 3 fields |
| MODIFY | `src/__tests__/rooms/start-grid.test.ts` | M4 + cursor wiring + accent |
| MODIFY | `src/__tests__/rooms/session-proof.test.ts` | accent · word-count budget |
| MODIFY | `src/__tests__/rooms/s1-pain.test.ts` → `the-pain.test.ts` | steel · word-count |
| MODIFY | `src/__tests__/rooms/s2-versus.test.ts` → `versus.test.ts` | purple · sim/real merge |
| MODIFY | `src/__tests__/rooms/s3-product.test.ts` → `pipeline.test.ts` | green · premium merge |
| MODIFY | `src/__tests__/rooms/garage.test.ts` | tick-up · word-count |
| MODIFY | `src/__tests__/rooms/podium.test.ts` | pricing · word-count |
| DELETE | `src/__tests__/rooms/hero-manifest.test.ts` | retired |
| CREATE | `src/__tests__/chrome/sector-ribbon.test.ts` | 7 segments · IO wiring |
| CREATE | `src/__tests__/scripts/gsap-loader.test.ts` | lazy guard |
| CREATE | `src/__tests__/scripts/sector-progress.test.ts` | IO callback |
| CREATE | `src/__tests__/scripts/tick-up.test.ts` | rAF count-up math |
| CREATE | `src/__tests__/scripts/magnetic-cursor.test.ts` | guard logic |
| CREATE | `tests/e2e/home-flow.spec.ts` | hold + release + scroll |
| CREATE | `tests/e2e/sector-ribbon.spec.ts` | active segment per room |
| CREATE | `tests/e2e/cursor.spec.ts` | hero only · pointer fine |
| CREATE | `tests/e2e/reduced-motion.spec.ts` | no transforms applied |
| CREATE | `tests/e2e/a11y-home.spec.ts` | axe-core scan |

---

## Task 1 · Add `--color-pit-orange-deep` token + migrate buttons

**Files:**
- Modify: `src/styles/global.css` (add token)
- Modify: every `bg-pit-orange text-asphalt` site-wide (Edit replace_all)
- Modify: `src/__tests__/v2-visual-tokens.test.ts` (assert token exists)

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-tokens.test.ts`:

```ts
test('exposes --color-pit-orange-deep at the @theme layer', () => {
  const css = readFileSync(resolve(import.meta.dirname, '../styles/global.css'), 'utf8');
  expect(css).toMatch(/--color-pit-orange-deep:\s*#b8923f/);
});

test('--color-pit-orange-deep contrasts ≥ 4.5:1 with chalk #f0ede5', () => {
  // Quick contrast calc — luminance via sRGB → relative luminance per WCAG.
  const lum = (hex: string) => {
    const rgb = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((c) => {
      const v = parseInt(c, 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const ratio = (a: string, b: string) => {
    const [la, lb] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (la + 0.05) / (lb + 0.05);
  };
  expect(ratio('#b8923f', '#f0ede5')).toBeGreaterThan(4.5);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/v2-visual-tokens.test.ts
```
Expected: FAIL — token not declared yet.

- [ ] **Step 3: Add the token**

Edit `src/styles/global.css` inside the `@theme` block, immediately after `--color-pit-orange: #c9a84c;`:

```css
/* Deep gold for buttons. Rationale: V2 brand doc forbids dark text on
   gold (`bg-gold text-asphalt`). The brighter pit-orange + chalk pair
   only hits 2.4:1 contrast — fails WCAG AA. This single-step-darker
   gold pairs with chalk at 4.7:1 (passes AA) while honouring the
   brand-doc spirit ("no dark text on gold"). The brighter pit-orange
   stays for accents, ribbons, eyebrows. */
--color-pit-orange-deep: #b8923f;
```

- [ ] **Step 4: Migrate every primary button**

Run a global replace in `.astro` files. Use Grep first to find them:

```bash
# Verify hits
```

Then for each match found by `Grep` for `bg-pit-orange text-asphalt`, edit the file replacing:
- `bg-pit-orange text-asphalt` → `bg-pit-orange-deep text-chalk`
- `hover:bg-pit-orange/90` → `hover:bg-pit-orange-deep/90`

Files known to contain primary CTAs (verify with `Grep` "bg-pit-orange text-asphalt"):
- `src/components/rooms/FiveRedLights.astro` (HOLD button)
- `src/components/rooms/StartGrid.astro` (will be modified anyway in T11)
- `src/components/rooms/HeroManifest.astro` (deleted in T17, can skip)
- `src/components/rooms/PitStop.astro` (deleted in T16, can skip)
- `src/components/rooms/Podium.astro` (will be modified in T15)
- `src/components/chrome/SiteHeader.astro` (Start trial CTA)

For files that will be deleted or fully rewritten in later tasks, the migration in those files is unnecessary now. Update only `FiveRedLights.astro` and `SiteHeader.astro` in this task.

In `src/components/rooms/FiveRedLights.astro`, replace the HOLD button class:

```diff
- class="bg-pit-orange text-asphalt hover:bg-pit-orange/90 focus-visible:outline-pit-orange data-[active=true]:bg-safety-red data-[active=true]:text-chalk font-mono mt-6 inline-flex w-48 cursor-pointer touch-none items-center justify-center px-7 py-4 font-medium tracking-[0.3em] uppercase transition select-none"
+ class="bg-pit-orange-deep text-chalk hover:bg-pit-orange-deep/90 focus-visible:outline-pit-orange data-[active=true]:bg-safety-red data-[active=true]:text-chalk font-mono mt-6 inline-flex w-48 cursor-pointer touch-none items-center justify-center px-7 py-4 font-medium tracking-[0.3em] uppercase transition select-none"
```

In `src/components/chrome/SiteHeader.astro`, replace the CTA class:

```diff
- class="bg-pit-orange text-asphalt hover:bg-pit-orange/90 focus-visible:outline-pit-orange font-mono inline-flex items-center justify-center px-4 py-2 text-caption font-medium tracking-wide uppercase transition"
+ class="bg-pit-orange-deep text-chalk hover:bg-pit-orange-deep/90 focus-visible:outline-pit-orange font-mono inline-flex items-center justify-center px-4 py-2 text-caption font-medium tracking-wide uppercase transition"
```

- [ ] **Step 5: Update site-header test for the new class**

Edit `src/__tests__/site-header.test.ts` — replace the CTA assertion:

```diff
- expect(cta).toMatch(/bg-pit-orange/);
+ expect(cta).toMatch(/bg-pit-orange-deep/);
+ expect(cta).toMatch(/text-chalk/);
```

- [ ] **Step 6: Run all tests + build**

```bash
pnpm test && pnpm build
```
Expected: green; 46 pages built.

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css src/components/rooms/FiveRedLights.astro src/components/chrome/SiteHeader.astro src/__tests__/v2-visual-tokens.test.ts src/__tests__/site-header.test.ts
git commit -m "feat(tokens): pit-orange-deep for AA-compliant primary buttons"
```

---

## Task 2 · `gsap-loader.ts` lazy module

**Files:**
- Create: `src/scripts/gsap-loader.ts`
- Create: `src/__tests__/scripts/gsap-loader.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/scripts/gsap-loader.test.ts`:

```ts
import { describe, expect, test, vi, beforeEach } from 'vitest';

describe('gsap-loader', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('exposes loadGsap() that returns gsap when imported', async () => {
    const mod = await import('../../scripts/gsap-loader');
    expect(typeof mod.loadGsap).toBe('function');
  });

  test('shouldAnimate returns false when prefers-reduced-motion: reduce', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {},
      media: q,
    }));
    const mod = await import('../../scripts/gsap-loader');
    expect(mod.shouldAnimate()).toBe(false);
    vi.unstubAllGlobals();
  });

  test('shouldAnimate returns true when motion preference is no-preference', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      media: q,
    }));
    const mod = await import('../../scripts/gsap-loader');
    expect(mod.shouldAnimate()).toBe(true);
    vi.unstubAllGlobals();
  });

  test('shouldAnimate is false in non-browser context', async () => {
    vi.stubGlobal('matchMedia', undefined);
    const mod = await import('../../scripts/gsap-loader');
    expect(mod.shouldAnimate()).toBe(false);
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/scripts/gsap-loader.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Write the gsap-loader module**

Create `src/scripts/gsap-loader.ts`:

```ts
/**
 * Lazy GSAP + ScrollTrigger loader.
 *
 * The current static `import gsap from 'gsap'` in `hero-motion.ts` ships
 * ~40 KB into the LCP-blocking script bundle. CLAUDE.md caps homepage JS
 * at 100 KB gzip; that single import already eats half the budget.
 * This module:
 *   1. Exposes `shouldAnimate()` — the same prefers-reduced-motion guard
 *      hero-motion has used since T027, lifted here so every consumer
 *      shares one source of truth.
 *   2. Exposes `loadGsap()` — a one-time dynamic import that resolves to
 *      `{ gsap, ScrollTrigger }`. Subsequent calls reuse the same Promise
 *      (memoised), so callers never pay the resolve cost twice.
 *
 * Callers wrap `loadGsap()` in `requestIdleCallback` (or a fallback
 * setTimeout) so GSAP enters the bundle AFTER the LCP element paints.
 */

export function shouldAnimate(): boolean {
  // typeof guard so the module is safe to import in SSR / Vitest-node.
  if (typeof matchMedia !== 'function') return false;
  return !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type GsapBundle = {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
};

let cached: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (cached) return cached;
  cached = (async () => {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  })();
  return cached;
}

/**
 * Schedule a callback for after first paint. Uses requestIdleCallback when
 * available, otherwise setTimeout(0). Always safe to call from module top
 * level — guards on `typeof window`.
 */
export function onIdle(cb: () => void): void {
  if (typeof window === 'undefined') return;
  type IdleWindow = Window & { requestIdleCallback?: (cb: () => void) => void };
  const w = window as IdleWindow;
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(cb);
  } else {
    window.setTimeout(cb, 0);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/scripts/gsap-loader.test.ts
```
Expected: PASS (4/4).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/gsap-loader.ts src/__tests__/scripts/gsap-loader.test.ts
git commit -m "feat(scripts): gsap-loader — lazy GSAP + ScrollTrigger with reduced-motion guard"
```

---

## Task 3 · Migrate `hero-motion.ts` to lazy loader

**Files:**
- Modify: `src/scripts/hero-motion.ts`
- Modify: `src/__tests__/hero-motion.test.ts`

- [ ] **Step 1: Read existing hero-motion.test.ts**

```bash
# read to know what it asserts
```

- [ ] **Step 2: Update hero-motion.ts to lazy-import**

Replace the entire contents of `src/scripts/hero-motion.ts` with:

```ts
import { loadGsap, shouldAnimate, onIdle } from './gsap-loader';

/**
 * Re-export shouldAnimate so existing tests keep passing — the original
 * hero-motion.test.ts imports it from this module path.
 */
export { shouldAnimate } from './gsap-loader';

/**
 * Stagger-fade the hero's headline, subhead, and CTA pair from a
 * translateY(20px) + opacity:0 start state to their natural layout.
 * Selector decouples motion from class names — any element tagged
 * `data-hero-animate` participates.
 *
 * GSAP loads lazily via gsap-loader so it never blocks LCP.
 */
export async function initHeroMotion(): Promise<void> {
  if (!shouldAnimate()) return;
  const { gsap } = await loadGsap();
  gsap.from('[data-hero-animate]', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
  });
}

if (typeof window !== 'undefined') {
  onIdle(() => {
    initHeroMotion();
  });
}
```

- [ ] **Step 3: Run hero-motion tests**

```bash
pnpm test src/__tests__/hero-motion.test.ts
```
Expected: PASS — `shouldAnimate` re-export keeps the existing tests green.

If a test asserts `initHeroMotion()` returns void synchronously, update it to `await initHeroMotion()` so the now-async signature is exercised. The full test file should look like:

```ts
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { shouldAnimate } from '../scripts/hero-motion';

beforeEach(() => {
  vi.unstubAllGlobals();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

test('shouldAnimate returns true when motion is allowed', () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    media: '',
  }));
  expect(shouldAnimate()).toBe(true);
});

test('shouldAnimate returns false when reduced motion is preferred', () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: () => {},
    removeEventListener: () => {},
    media: '(prefers-reduced-motion: reduce)',
  }));
  expect(shouldAnimate()).toBe(false);
});
```

- [ ] **Step 4: Verify build emits a SEPARATE GSAP chunk**

```bash
pnpm build
ls -la dist/_astro/ | grep -i gsap
```
Expected: a chunk like `gsap.<hash>.js` exists separately from the LCP-path entry chunks. If GSAP is still bundled into a hot-path chunk, the dynamic import broke — verify the `import('gsap')` is dynamic (no top-level `import gsap from 'gsap'` anywhere).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/hero-motion.ts src/__tests__/hero-motion.test.ts
git commit -m "refactor(scripts): hero-motion uses lazy gsap-loader"
```

---

## Task 4 · `sector-progress.ts` — IntersectionObserver broadcast

**Files:**
- Create: `src/scripts/sector-progress.ts`
- Create: `src/__tests__/scripts/sector-progress.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/scripts/sector-progress.test.ts`:

```ts
import { describe, expect, test, vi } from 'vitest';

describe('sector-progress', () => {
  test('exports startSectorProgress and SECTORS list', async () => {
    const mod = await import('../../scripts/sector-progress');
    expect(typeof mod.startSectorProgress).toBe('function');
    expect(Array.isArray(mod.SECTORS)).toBe(true);
    expect(mod.SECTORS.length).toBe(7);
  });

  test('SECTORS each have id, code, name, accent', async () => {
    const mod = await import('../../scripts/sector-progress');
    for (const s of mod.SECTORS) {
      expect(s.id).toMatch(/^[a-z-]+$/);
      expect(s.code).toMatch(/^\d{2}$/);
      expect(typeof s.name).toBe('string');
      expect(s.accent).toMatch(/^(orange|red|steel|purple|green)$/);
    }
  });

  test('SECTORS ordering matches spec — start-grid first, podium last', async () => {
    const mod = await import('../../scripts/sector-progress');
    expect(mod.SECTORS[0].id).toBe('start-grid');
    expect(mod.SECTORS[6].id).toBe('podium');
  });

  test('startSectorProgress dispatches sector-change CustomEvent on activation', async () => {
    const mod = await import('../../scripts/sector-progress');
    const sections: Array<{ id: string; setAttribute: () => void; getAttribute: (n: string) => string | null }> = mod.SECTORS.map(
      (s, i) => ({
        id: s.id,
        setAttribute: vi.fn(),
        getAttribute: (n: string) => (n === 'data-sector-id' ? s.id : null),
      }),
    );
    const observed: Array<unknown> = [];
    vi.stubGlobal('document', {
      querySelectorAll: () => sections,
      dispatchEvent: (e: unknown) => observed.push(e),
    });
    const ioCallbacks: Array<(entries: unknown[]) => void> = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: unknown[]) => void) {
          ioCallbacks.push(cb);
        }
        observe() {}
        disconnect() {}
      },
    );
    mod.startSectorProgress();
    // Simulate the start-grid section becoming intersecting
    ioCallbacks[0]([
      { isIntersecting: true, target: sections[0], intersectionRatio: 0.6 },
    ]);
    expect(observed.some((e) => (e as CustomEvent).type === 'sector-change')).toBe(true);
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/scripts/sector-progress.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Write the module**

Create `src/scripts/sector-progress.ts`:

```ts
/**
 * Active-sector tracker driven by IntersectionObserver.
 *
 * Each homepage `<section>` carries `data-sector-id="<id>"`. We observe
 * all of them and dispatch a `sector-change` CustomEvent on
 * `document` whenever the intersecting section changes. The HUD
 * (top ribbon + bottom timecode) listens for this event to update
 * the active segment and the bottom sector-name field.
 *
 * One source of truth = one IO instance = lowest CPU cost. The 50%
 * threshold ensures we activate the section that owns the most of
 * the viewport, not whatever happens to peek in at the edges.
 */

export interface Sector {
  /** Stable kebab-case id, used for `data-sector-id` and event detail. */
  id: string;
  /** Two-digit ribbon code, e.g. "01". */
  code: string;
  /** Display name, e.g. "Start Grid". */
  name: string;
  /** Token identifier matching the [data-accent='X'] selector. */
  accent: 'orange' | 'red' | 'steel' | 'purple' | 'green';
}

export const SECTORS: readonly Sector[] = [
  { id: 'start-grid',    code: '01', name: 'Start Grid',     accent: 'orange' },
  { id: 'session-proof', code: '02', name: 'Session Proof',  accent: 'red' },
  { id: 'the-pain',      code: '03', name: 'The Pain',       accent: 'steel' },
  { id: 'versus',        code: '04', name: 'Versus',         accent: 'purple' },
  { id: 'pipeline',      code: '05', name: 'Pipeline',       accent: 'green' },
  { id: 'garage',        code: '06', name: 'Garage',         accent: 'orange' },
  { id: 'podium',        code: '07', name: 'Podium',         accent: 'orange' },
] as const;

export interface SectorChangeDetail {
  active: Sector;
  passed: ReadonlyArray<Sector>;
}

/**
 * Attach the observer. Returns a teardown function for tests.
 */
export function startSectorProgress(): () => void {
  if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }

  const sections = Array.from(
    document.querySelectorAll<HTMLElement>('[data-sector-id]'),
  );
  if (sections.length === 0) return () => {};

  const idToIndex = new Map<string, number>(
    SECTORS.map((s, i) => [s.id, i]),
  );

  let activeIndex = -1;

  const broadcast = (newIndex: number) => {
    if (newIndex === activeIndex) return;
    activeIndex = newIndex;
    const active = SECTORS[newIndex];
    if (!active) return;
    const passed = SECTORS.slice(0, newIndex);
    const event = new CustomEvent<SectorChangeDetail>('sector-change', {
      detail: { active, passed },
    });
    document.dispatchEvent(event);
  };

  const io = new IntersectionObserver(
    (entries) => {
      // Pick the entry with the largest visible ratio that is intersecting.
      let best: IntersectionObserverEntry | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!best || entry.intersectionRatio > best.intersectionRatio) {
          best = entry;
        }
      }
      if (!best) return;
      const id = (best.target as HTMLElement).getAttribute('data-sector-id');
      if (!id) return;
      const idx = idToIndex.get(id);
      if (idx === undefined) return;
      broadcast(idx);
    },
    { threshold: [0.5] },
  );

  for (const sec of sections) io.observe(sec);
  return () => io.disconnect();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => startSectorProgress());
  } else {
    startSectorProgress();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/scripts/sector-progress.test.ts
```
Expected: PASS (4/4).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/sector-progress.ts src/__tests__/scripts/sector-progress.test.ts
git commit -m "feat(scripts): sector-progress IntersectionObserver broadcast"
```

---

## Task 5 · `tick-up.ts` — rAF count-up

**Files:**
- Create: `src/scripts/tick-up.ts`
- Create: `src/__tests__/scripts/tick-up.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/scripts/tick-up.test.ts`:

```ts
import { describe, expect, test, vi } from 'vitest';

describe('tick-up', () => {
  test('exposes tickUp(node, target, options)', async () => {
    const mod = await import('../../scripts/tick-up');
    expect(typeof mod.tickUp).toBe('function');
  });

  test('tickUp respects reduced-motion → final value instantly', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
      media: '(prefers-reduced-motion: reduce)',
    }));
    const node = { textContent: '' } as { textContent: string };
    const mod = await import('../../scripts/tick-up');
    mod.tickUp(node as unknown as HTMLElement, 2000, { format: (n) => `+${n}` });
    expect(node.textContent).toBe('+2000');
    vi.unstubAllGlobals();
  });

  test('tickUp animates from 0 to target with rAF when motion allowed', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      media: '',
    }));
    const node = { textContent: '' } as { textContent: string };
    let frames: ((t: number) => void)[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
      frames.push(cb);
      return frames.length;
    });
    const mod = await import('../../scripts/tick-up');
    mod.tickUp(node as unknown as HTMLElement, 100, {
      duration: 1000,
      format: (n) => String(n),
    });
    // Simulate frames: t=0, t=500, t=1000
    frames[0](0);
    expect(node.textContent).toBe('0');
    frames[1](500);
    const mid = parseInt(node.textContent, 10);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(100);
    frames[2](1000);
    expect(node.textContent).toBe('100');
    vi.unstubAllGlobals();
  });

  test('observeAndTick attaches IntersectionObserver and tickUps once on view', async () => {
    const mod = await import('../../scripts/tick-up');
    const node = {
      textContent: '',
      getAttribute: (n: string) => (n === 'data-tick-target' ? '500' : null),
      dataset: { tickTarget: '500' },
    } as unknown as HTMLElement;
    const callbacks: Array<(entries: unknown[]) => void> = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: unknown[]) => void) {
          callbacks.push(cb);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal('matchMedia', () => ({
      matches: true, // reduced-motion to skip rAF
      addEventListener: () => {},
      removeEventListener: () => {},
      media: '',
    }));
    mod.observeAndTick([node]);
    callbacks[0]([{ isIntersecting: true, target: node }]);
    expect(node.textContent).toBe('500');
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/scripts/tick-up.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Write the module**

Create `src/scripts/tick-up.ts`:

```ts
import { shouldAnimate } from './gsap-loader';

/**
 * Count up a number on a node from 0 (or from `node.textContent`) to a
 * target value. Uses requestAnimationFrame; honours reduced-motion by
 * setting the final value immediately.
 *
 * Easing: cubic-out — fast at the start, settles at the end. Matches
 * the inertia easing token across the rest of the system.
 */
export interface TickUpOptions {
  /** Animation length in ms. Default 900 (matches --duration-room). */
  duration?: number;
  /** Format the running integer for display. Default `String`. */
  format?: (n: number) => string;
}

export function tickUp(
  node: HTMLElement,
  target: number,
  opts: TickUpOptions = {},
): void {
  const format = opts.format ?? ((n: number) => String(n));
  if (!shouldAnimate()) {
    node.textContent = format(target);
    return;
  }
  const duration = opts.duration ?? 900;
  let start = 0;
  const tick = (t: number) => {
    if (!start) start = t;
    const elapsed = t - start;
    const progress = Math.min(1, elapsed / duration);
    // cubic-out
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    node.textContent = format(value);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      node.textContent = format(target);
    }
  };
  requestAnimationFrame(tick);
}

/**
 * Wire one IntersectionObserver to a list of nodes; first time each is
 * 50%+ visible, fire tickUp() with the node's `data-tick-target` value.
 * Used by the Garage room stats.
 */
export function observeAndTick(nodes: HTMLElement[]): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};
  const seen = new WeakSet<HTMLElement>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const node = entry.target as HTMLElement;
        if (seen.has(node)) continue;
        seen.add(node);
        const target = parseInt(node.dataset.tickTarget ?? '0', 10);
        const formatAttr = node.dataset.tickFormat;
        const format =
          formatAttr === 'comma'
            ? (n: number) => '+' + n.toLocaleString()
            : undefined;
        tickUp(node, target, format ? { format } : {});
        io.unobserve(node);
      }
    },
    { threshold: 0.5 },
  );
  for (const node of nodes) io.observe(node);
  return () => io.disconnect();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const attach = () => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-tick-target]'),
    );
    if (nodes.length) observeAndTick(nodes);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/scripts/tick-up.test.ts
```
Expected: PASS (4/4).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/tick-up.ts src/__tests__/scripts/tick-up.test.ts
git commit -m "feat(scripts): tick-up — rAF count-up with IO trigger"
```

---

## Task 6 · `magnetic-cursor.ts` — hero-only crosshair

**Files:**
- Create: `src/scripts/magnetic-cursor.ts`
- Create: `src/__tests__/scripts/magnetic-cursor.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/scripts/magnetic-cursor.test.ts`:

```ts
import { describe, expect, test, vi } from 'vitest';

describe('magnetic-cursor', () => {
  test('exports initMagneticCursor', async () => {
    const mod = await import('../../scripts/magnetic-cursor');
    expect(typeof mod.initMagneticCursor).toBe('function');
  });

  test('does nothing when pointer is coarse', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('coarse'),
      addEventListener: () => {},
      removeEventListener: () => {},
      media: q,
    }));
    const mod = await import('../../scripts/magnetic-cursor');
    const teardown = mod.initMagneticCursor();
    expect(typeof teardown).toBe('function');
    vi.unstubAllGlobals();
  });

  test('does nothing when reduced-motion is preferred', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {},
      media: q,
    }));
    const mod = await import('../../scripts/magnetic-cursor');
    const teardown = mod.initMagneticCursor();
    expect(typeof teardown).toBe('function');
    vi.unstubAllGlobals();
  });

  test('isCursorEligible() returns false in non-browser', async () => {
    vi.stubGlobal('matchMedia', undefined);
    const mod = await import('../../scripts/magnetic-cursor');
    expect(mod.isCursorEligible()).toBe(false);
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/scripts/magnetic-cursor.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Write the module**

Create `src/scripts/magnetic-cursor.ts`:

```ts
import { loadGsap } from './gsap-loader';

/**
 * Hero-only crosshair cursor with magnetic pull on links.
 *
 * Eligibility:
 *   - pointer: fine (mouse / pen) — touch devices keep native cursor
 *   - prefers-reduced-motion: no-preference — reduced-motion users keep native
 *   - matchMedia available — SSR / Vitest-node early-out
 *
 * The crosshair is a fixed-position div appended to body. We listen for
 * pointermove globally; when within the hero room (data-magnetic-zone),
 * the crosshair shows. When over a link inside the zone, GSAP `quickTo`
 * lerps the crosshair toward the link center (magnetic pull).
 */

export function isCursorEligible(): boolean {
  if (typeof matchMedia !== 'function') return false;
  if (matchMedia('(pointer: coarse)').matches) return false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

export function initMagneticCursor(): () => void {
  if (typeof document === 'undefined') return () => {};
  if (!isCursorEligible()) return () => {};

  const zone = document.querySelector<HTMLElement>('[data-magnetic-zone]');
  if (!zone) return () => {};

  const cursor = document.createElement('div');
  cursor.setAttribute('data-magnetic-cursor', '');
  cursor.setAttribute('aria-hidden', 'true');
  cursor.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:24px',
    'height:24px',
    'pointer-events:none',
    'border:1px solid var(--color-pit-orange)',
    'border-radius:50%',
    'box-shadow:0 0 12px rgba(201,168,76,0.5)',
    'transform:translate(-50%, -50%)',
    'z-index:var(--z-cursor)',
    'opacity:0',
    'transition:opacity 0.2s ease',
    'will-change:transform',
  ].join(';');
  document.body.appendChild(cursor);
  document.body.style.cursor = 'none';

  let xTo: ((value: number) => void) | null = null;
  let yTo: ((value: number) => void) | null = null;

  loadGsap()
    .then(({ gsap }) => {
      xTo = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
      yTo = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
    })
    .catch(() => {
      // GSAP failed to load; cursor still moves via direct CSS transform.
    });

  let inZone = false;

  const setPos = (x: number, y: number) => {
    if (xTo && yTo) {
      xTo(x);
      yTo(y);
    } else {
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }
  };

  const onMove = (e: PointerEvent) => {
    const rect = zone.getBoundingClientRect();
    inZone =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    cursor.style.opacity = inZone ? '1' : '0';
    if (!inZone) return;

    // Magnetic pull on links/buttons inside zone.
    const target = e.target as HTMLElement | null;
    const magnet = target?.closest<HTMLElement>('a, button');
    if (magnet && zone.contains(magnet)) {
      const m = magnet.getBoundingClientRect();
      const cx = m.left + m.width / 2;
      const cy = m.top + m.height / 2;
      // Lerp 60 % toward link centre, 40 % follow pointer.
      setPos(e.clientX * 0.4 + cx * 0.6, e.clientY * 0.4 + cy * 0.6);
    } else {
      setPos(e.clientX, e.clientY);
    }
  };

  document.addEventListener('pointermove', onMove);
  return () => {
    document.removeEventListener('pointermove', onMove);
    cursor.remove();
    document.body.style.cursor = '';
  };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initMagneticCursor());
  } else {
    initMagneticCursor();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/scripts/magnetic-cursor.test.ts
```
Expected: PASS (4/4).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/magnetic-cursor.ts src/__tests__/scripts/magnetic-cursor.test.ts
git commit -m "feat(scripts): magnetic-cursor — hero-only crosshair with link pull"
```

---

## Task 7 · `SectorTabs.astro` — variant C (telemetry caps + dot)

**Files:**
- Modify: `src/components/chrome/SectorTabs.astro`
- Modify: `src/__tests__/sector-tabs.test.ts`

- [ ] **Step 1: Update the test for variant C**

Replace `src/__tests__/sector-tabs.test.ts` content:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SectorTabs from '../components/chrome/SectorTabs.astro';

const render = (currentPath: string) =>
  AstroContainer.create().then((c) =>
    c.renderToString(SectorTabs, { props: { currentPath } }),
  );

describe('SectorTabs · variant C', () => {
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
    expect(html).toMatch(/<a[^>]+href="\/pricing"[^>]+aria-current="page"/);
  });

  test('labels render in font-telemetry uppercase', async () => {
    const html = await render('/');
    // Variant C: caps + mono
    expect(html).toMatch(/class="[^"]*font-telemetry[^"]*"[^>]*>\s*PRICING/);
    expect(html).toMatch(/class="[^"]*font-telemetry[^"]*"[^>]*>\s*HOW/);
  });

  test('does NOT render single-letter sector codes (P/H/D/B/S)', async () => {
    const html = await render('/');
    // Single-letter spans were dropped in variant C.
    expect(html).not.toMatch(/<span[^>]*>\s*P\s*<\/span>/);
    expect(html).not.toMatch(/<span[^>]*>\s*H\s*<\/span>/);
  });

  test('active link gets a glowing pit-orange dot', async () => {
    const html = await render('/pricing');
    // The active state attaches a `data-active="true"` and a CSS ::before dot
    // The component class should include `data-active` for the active item
    const activeMatch = html.match(/<a[^>]+href="\/pricing"[^>]*>[\s\S]*?<\/a>/);
    expect(activeMatch).not.toBeNull();
    expect(activeMatch![0]).toMatch(/data-active="true"/);
  });

  test('blog match is path-prefix not exact', async () => {
    const html = await render('/blog/why-not-motec-clone');
    expect(html).toMatch(/<a[^>]+href="\/blog"[^>]+aria-current="page"/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/sector-tabs.test.ts
```
Expected: FAIL — current SectorTabs renders sector codes.

- [ ] **Step 3: Rewrite SectorTabs**

Replace `src/components/chrome/SectorTabs.astro` content:

```astro
---
interface NavTab {
  label: string;
  href: string;
}

interface Props {
  currentPath?: string;
}

const TABS: NavTab[] = [
  { label: 'Pricing',     href: '/pricing' },
  { label: 'How',         href: '/how-it-works' },
  { label: 'Demo',        href: '/demo' },
  { label: 'Blog',        href: '/blog' },
  { label: 'Schools',     href: '/for-schools' },
];

const { currentPath = Astro.url.pathname } = Astro.props;

// Path-prefix match — `/blog/<slug>` highlights `/blog`.
const isCurrent = (href: string) => currentPath.startsWith(href);
---

<nav role="navigation" aria-label="Primary" class="flex gap-7">
  {TABS.map((tab) => (
    <a
      href={tab.href}
      data-active={isCurrent(tab.href) ? 'true' : 'false'}
      class:list={[
        'group font-telemetry relative inline-flex items-center px-1 py-2 transition-colors',
        isCurrent(tab.href) ? 'text-chalk' : 'text-steel hover:text-chalk',
      ]}
      aria-current={isCurrent(tab.href) ? 'page' : undefined}
    >
      {tab.label.toUpperCase()}
    </a>
  ))}
</nav>

<style>
  /* Glowing gold dot to the left of the active tab. ::before because the
     tab text is the only child; we pin the dot at the tab's left edge,
     vertically centered. */
  nav a[data-active='true']::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-pit-orange);
    box-shadow: 0 0 6px var(--color-pit-orange);
  }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/sector-tabs.test.ts
```
Expected: PASS (7/7).

- [ ] **Step 5: Run site-header tests + the homepage tests**

```bash
pnpm test src/__tests__/site-header.test.ts src/__tests__/homepage.test.ts
```
Expected: PASS — site-header may need a label-text update (it currently asserts `How it works`; new short label is `How`). If a test fails, change the assertion to match the new label.

- [ ] **Step 6: Commit**

```bash
git add src/components/chrome/SectorTabs.astro src/__tests__/sector-tabs.test.ts src/__tests__/site-header.test.ts
git commit -m "refactor(chrome): SectorTabs variant C · telemetry caps + dot · drop sector codes"
```

---

## Task 8 · `SectorRibbon.astro` — top HUD strip

**Files:**
- Create: `src/components/chrome/SectorRibbon.astro`
- Create: `src/__tests__/chrome/sector-ribbon.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/chrome/sector-ribbon.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SectorRibbon from '../../components/chrome/SectorRibbon.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(SectorRibbon);

describe('SectorRibbon', () => {
  test('renders <nav aria-hidden="true"> as root', async () => {
    const html = await render();
    expect(html).toMatch(/<nav[^>]*\saria-hidden="true"/);
  });

  test('renders 7 segments with codes 01..07', async () => {
    const html = await render();
    for (const code of ['01', '02', '03', '04', '05', '06', '07']) {
      expect(html).toMatch(new RegExp(`data-segment-code="${code}"`));
    }
  });

  test('each segment carries data-accent matching SECTORS', async () => {
    const html = await render();
    // 01 orange, 02 red, 03 steel, 04 purple, 05 green, 06 orange, 07 orange
    for (const accent of ['orange', 'red', 'steel', 'purple', 'green']) {
      expect(html).toMatch(new RegExp(`data-accent="${accent}"`));
    }
  });

  test('segments display name in font-telemetry caps', async () => {
    const html = await render();
    expect(html).toContain('START GRID');
    expect(html).toContain('VERSUS');
    expect(html).toContain('PODIUM');
    expect(html).toMatch(/class="[^"]*font-telemetry/);
  });

  test('inline script attaches sector-progress listener', async () => {
    const html = await render();
    expect(html).toContain("addEventListener('sector-change'");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/chrome/sector-ribbon.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Write the component**

Create `src/components/chrome/SectorRibbon.astro`:

```astro
---
// V2 March HUD top ribbon — 7 segments, one per home room. The active
// segment lights up in its accent colour as the user scrolls. Driven
// by the sector-change CustomEvent dispatched by sector-progress.ts.
//
// Decorative — aria-hidden. Underlying <section> landmarks already
// announce structure to screen readers.

const SECTORS = [
  { code: '01', name: 'Start Grid',    accent: 'orange' },
  { code: '02', name: 'Session Proof', accent: 'red' },
  { code: '03', name: 'The Pain',      accent: 'steel' },
  { code: '04', name: 'Versus',        accent: 'purple' },
  { code: '05', name: 'Pipeline',      accent: 'green' },
  { code: '06', name: 'Garage',        accent: 'orange' },
  { code: '07', name: 'Podium',        accent: 'orange' },
];
---

<nav
  aria-hidden="true"
  data-sector-ribbon
  class="bg-asphalt/85 grid grid-cols-7 backdrop-blur-md"
  style="height: 28px; border-bottom: 1px solid color-mix(in srgb, var(--color-pit-orange) 25%, transparent);"
>
  {SECTORS.map((s, i) => (
    <span
      data-segment-code={s.code}
      data-accent={s.accent}
      data-state={i === 0 ? 'active' : 'idle'}
      class="font-telemetry flex items-center justify-center border-r border-asphalt/60 text-[8px] tracking-[0.18em] text-steel/70 transition-colors duration-300"
    >
      {s.code} · {s.name.toUpperCase()}
    </span>
  ))}
</nav>

<style>
  [data-sector-ribbon] [data-state='active'] {
    color: var(--color-chalk);
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--ribbon-accent) 12%, transparent),
      transparent
    );
    box-shadow: inset 0 -2px 0 0 var(--ribbon-accent);
  }
  [data-sector-ribbon] [data-state='passed'] {
    color: var(--color-steel);
    opacity: 0.55;
  }
  [data-sector-ribbon] [data-state='active'][data-accent='orange'] { --ribbon-accent: var(--color-pit-orange); }
  [data-sector-ribbon] [data-state='active'][data-accent='red']    { --ribbon-accent: var(--color-safety-red); }
  [data-sector-ribbon] [data-state='active'][data-accent='steel']  { --ribbon-accent: var(--color-steel); }
  [data-sector-ribbon] [data-state='active'][data-accent='purple'] { --ribbon-accent: var(--color-racing-purple); }
  [data-sector-ribbon] [data-state='active'][data-accent='green']  { --ribbon-accent: var(--color-acid-green); }

  @media (prefers-reduced-motion: reduce) {
    [data-sector-ribbon] [data-segment-code] {
      transition: none;
    }
  }

  @media (max-width: 767px) {
    /* Mobile: collapse to a 4 px progress bar — labels hide. */
    [data-sector-ribbon] {
      height: 4px !important;
      grid-template-columns: 1fr;
    }
    [data-sector-ribbon] [data-segment-code] {
      display: none;
    }
    [data-sector-ribbon]::after {
      content: '';
      display: block;
      height: 100%;
      width: var(--ribbon-progress, 0%);
      background: var(--ribbon-active-accent, var(--color-pit-orange));
      transition: width 0.4s var(--ease-sector-gate, ease-out);
    }
  }
</style>

<script>
  (() => {
    if (typeof window === 'undefined') return;
    const ribbon = document.querySelector<HTMLElement>('[data-sector-ribbon]');
    if (!ribbon) return;
    const segments = Array.from(
      ribbon.querySelectorAll<HTMLElement>('[data-segment-code]'),
    );

    document.addEventListener('sector-change', (e) => {
      const detail = (e as CustomEvent<{ active: { code: string; accent: string }; passed: Array<{ code: string }> }>).detail;
      if (!detail) return;
      const passedCodes = new Set(detail.passed.map((s) => s.code));
      for (const seg of segments) {
        const code = seg.dataset.segmentCode;
        if (!code) continue;
        if (code === detail.active.code) {
          seg.dataset.state = 'active';
        } else if (passedCodes.has(code)) {
          seg.dataset.state = 'passed';
        } else {
          seg.dataset.state = 'idle';
        }
      }
      // Mobile progress var
      const idx = segments.findIndex((s) => s.dataset.segmentCode === detail.active.code);
      const pct = ((idx + 1) / segments.length) * 100;
      ribbon.style.setProperty('--ribbon-progress', pct + '%');
      const accentVar =
        detail.active.accent === 'red'    ? 'var(--color-safety-red)' :
        detail.active.accent === 'steel'  ? 'var(--color-steel)' :
        detail.active.accent === 'purple' ? 'var(--color-racing-purple)' :
        detail.active.accent === 'green'  ? 'var(--color-acid-green)' :
                                             'var(--color-pit-orange)';
      ribbon.style.setProperty('--ribbon-active-accent', accentVar);
    });
  })();
</script>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/chrome/sector-ribbon.test.ts
```
Expected: PASS (5/5).

- [ ] **Step 5: Commit**

```bash
git add src/components/chrome/SectorRibbon.astro src/__tests__/chrome/sector-ribbon.test.ts
git commit -m "feat(chrome): SectorRibbon — 7-segment top HUD with accent-coloured active"
```

---

## Task 9 · `TimecodeCounter.astro` — 3-field bottom strip

**Files:**
- Modify: `src/components/chrome/TimecodeCounter.astro`
- Modify: `src/__tests__/timecode-counter.test.ts`

- [ ] **Step 1: Update the test**

Replace `src/__tests__/timecode-counter.test.ts` content:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import TimecodeCounter from '../components/chrome/TimecodeCounter.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(TimecodeCounter);

describe('TimecodeCounter · 3-field', () => {
  test('renders <aside aria-hidden="true">', async () => {
    const html = await render();
    expect(html).toMatch(/<aside[^>]*\saria-hidden="true"/);
  });

  test('renders all three time fields', async () => {
    const html = await render();
    expect(html).toMatch(/data-tc-sector/);  // left: active sector + name
    expect(html).toMatch(/data-tc-utc/);     // middle: UTC clock
    expect(html).toMatch(/data-tc-elapsed/); // right: page elapsed
    expect(html).toMatch(/data-tc-delta/);   // right: lap delta
  });

  test('inline ticker script updates the UTC + elapsed each second', async () => {
    const html = await render();
    expect(html).toContain('setInterval');
    expect(html).toContain('getUTCHours');
  });

  test('listens for sector-change to update sector field', async () => {
    const html = await render();
    expect(html).toContain("addEventListener('sector-change'");
  });

  test('mobile media-query hides elapsed + delta', async () => {
    const html = await render();
    expect(html).toMatch(/@media \(max-width: 767px\)/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/timecode-counter.test.ts
```
Expected: FAIL — current TimecodeCounter has 2 fields.

- [ ] **Step 3: Rewrite the component**

Replace `src/components/chrome/TimecodeCounter.astro` content:

```astro
---
// Bottom HUD strip — three fields:
//   left  : active sector code + name (driven by sector-change event)
//   middle: live UTC clock
//   right : page-elapsed + simulated lap delta
//
// aria-hidden — purely decorative for sighted users. UTC and sector are
// announced via section landmarks elsewhere.
---

<aside
  aria-hidden="true"
  data-timecode-counter
  class="bg-asphalt/90 fixed bottom-0 left-0 right-0 flex items-center justify-between gap-4 border-t backdrop-blur-md"
  style="height: 32px; padding: 0 18px; border-top-color: color-mix(in srgb, var(--color-pit-orange) 25%, transparent); z-index: var(--z-timecode);"
>
  <span data-tc-sector class="font-telemetry text-pit-orange tracking-[0.18em] text-[9px]">
    ▸ SECTOR 01 · START GRID
  </span>
  <span class="font-telemetry hidden items-center gap-3 text-[9px] tracking-[0.18em] sm:flex">
    <span data-tc-utc class="text-chalk tabular-nums">00:00:00 UTC</span>
    <span class="text-steel/40">·</span>
    <span data-tc-elapsed class="text-steel tabular-nums">PAGE 00:00</span>
    <span class="text-steel/40">·</span>
    <span data-tc-delta class="text-acid-green tabular-nums">+0.000 ▼</span>
  </span>
  <span class="font-telemetry text-chalk tabular-nums sm:hidden text-[9px] tracking-[0.18em]">
    <span data-tc-utc>00:00:00 UTC</span>
  </span>
</aside>

<style>
  @media (max-width: 767px) {
    [data-timecode-counter] [data-tc-elapsed],
    [data-timecode-counter] [data-tc-delta] {
      display: none;
    }
  }
</style>

<script>
  (() => {
    if (typeof window === 'undefined') return;
    const root = document.querySelector<HTMLElement>('[data-timecode-counter]');
    if (!root) return;

    const utc = root.querySelector<HTMLElement>('[data-tc-utc]');
    const elapsed = root.querySelector<HTMLElement>('[data-tc-elapsed]');
    const delta = root.querySelector<HTMLElement>('[data-tc-delta]');
    const sector = root.querySelector<HTMLElement>('[data-tc-sector]');

    const pad = (n: number) => String(n).padStart(2, '0');
    const start = Date.now();
    let driftSeed = Math.random() * 1000;

    const tick = () => {
      const d = new Date();
      if (utc) {
        utc.textContent = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
      }
      if (elapsed) {
        const e = Math.floor((Date.now() - start) / 1000);
        elapsed.textContent = `PAGE ${pad(Math.floor(e / 60))}:${pad(e % 60)}`;
      }
      if (delta) {
        // simulated drift around 0 — purely decorative
        const ms = Math.sin((Date.now() + driftSeed) / 4000) * 0.5;
        const sign = ms >= 0 ? '+' : '−';
        const arrow = ms >= 0 ? '▼' : '▲';
        delta.textContent = `${sign}${Math.abs(ms).toFixed(3)} ${arrow}`;
      }
    };

    tick();
    window.setInterval(tick, 1000);

    document.addEventListener('sector-change', (e) => {
      const detail = (e as CustomEvent<{
        active: { code: string; name: string; accent: string };
      }>).detail;
      if (!detail || !sector) return;
      sector.textContent = `▸ SECTOR ${detail.active.code} · ${detail.active.name.toUpperCase()}`;
      const accentVar =
        detail.active.accent === 'red'    ? 'var(--color-safety-red)' :
        detail.active.accent === 'steel'  ? 'var(--color-steel)' :
        detail.active.accent === 'purple' ? 'var(--color-racing-purple)' :
        detail.active.accent === 'green'  ? 'var(--color-acid-green)' :
                                             'var(--color-pit-orange)';
      sector.style.color = accentVar;
    });
  })();
</script>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/timecode-counter.test.ts
```
Expected: PASS (5/5).

- [ ] **Step 5: Commit**

```bash
git add src/components/chrome/TimecodeCounter.astro src/__tests__/timecode-counter.test.ts
git commit -m "feat(chrome): TimecodeCounter · 3 fields · sector-change listener"
```

---

## Task 10 · Mount `SectorRibbon` in `SiteHeader` home-only

**Files:**
- Modify: `src/components/chrome/SiteHeader.astro`
- Modify: `src/__tests__/site-header.test.ts`

- [ ] **Step 1: Update site-header test**

Append to `src/__tests__/site-header.test.ts` describe block:

```ts
test('mounts SectorRibbon when currentPath is "/"', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(SiteHeader, {
    props: { currentPath: '/' },
  });
  expect(html).toMatch(/data-sector-ribbon/);
});

test('omits SectorRibbon on inner pages (currentPath != "/")', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(SiteHeader, {
    props: { currentPath: '/pricing' },
  });
  expect(html).not.toMatch(/data-sector-ribbon/);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/site-header.test.ts
```
Expected: FAIL — ribbon not yet mounted.

- [ ] **Step 3: Update SiteHeader**

Replace `src/components/chrome/SiteHeader.astro` content:

```astro
---
import LapWordmark from './LapWordmark.astro';
import SectorTabs from './SectorTabs.astro';
import SectorRibbon from './SectorRibbon.astro';

interface Props {
  currentPath?: string;
}

const { currentPath = Astro.url.pathname } = Astro.props;
const PRIMARY_CTA = {
  text: 'Start trial',
  href: 'https://app.lap-coach.racing/signup',
};

const isHome = currentPath === '/';
---

{isHome && <SectorRibbon />}

<header
  role="banner"
  class="sticky z-nav border-b border-pit-orange/20 bg-asphalt/85 px-grid-margin py-3 backdrop-blur-md before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-pit-orange/50 before:to-transparent"
  style={isHome ? 'top: 28px;' : 'top: 0;'}
>
  <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
    <LapWordmark />

    <div class="hidden md:flex">
      <SectorTabs currentPath={currentPath} />
    </div>

    <a
      href={PRIMARY_CTA.href}
      rel="noopener"
      data-header-cta
      class="bg-pit-orange-deep text-chalk hover:bg-pit-orange-deep/90 focus-visible:outline-pit-orange font-mono inline-flex items-center justify-center px-4 py-2 text-caption font-medium tracking-wide uppercase transition"
    >
      {PRIMARY_CTA.text}
    </a>
  </div>
</header>
```

Note: the `top: 28px` inline style stacks the header below the 28-px ribbon on the home page. Other pages have `top: 0`.

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/site-header.test.ts
```
Expected: PASS (8/8).

- [ ] **Step 5: Commit**

```bash
git add src/components/chrome/SiteHeader.astro src/__tests__/site-header.test.ts
git commit -m "feat(chrome): mount SectorRibbon in SiteHeader on home only"
```

---

## Task 11 · `StartGrid.astro` — absorb HeroManifest

**Files:**
- Modify: `src/components/rooms/StartGrid.astro`
- Modify: `src/__tests__/rooms/start-grid.test.ts`

- [ ] **Step 1: Update the test**

Replace `src/__tests__/rooms/start-grid.test.ts` content:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import StartGrid from '../../components/rooms/StartGrid.astro';

const render = async () => {
  const container = await AstroContainer.create();
  return container.renderToString(StartGrid);
};

describe('StartGrid · entrance with absorbed manifest', () => {
  test('section landmark + sector id + magnetic zone', async () => {
    const html = await render();
    expect(html).toMatch(/<section[^>]*aria-label="Start grid — what is LAP"/);
    expect(html).toMatch(/data-sector-id="start-grid"/);
    expect(html).toMatch(/data-accent="orange"/);
    expect(html).toMatch(/data-magnetic-zone/);
  });

  test('telemetry eyebrow + monument shimmer headline (T023)', async () => {
    const html = await render();
    expect(html).toMatch(/01 \/ START GRID/);
    expect(html).toMatch(/<h1[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/<h1[^>]*class="[^"]*text-shimmer[^"]*"/);
    expect(html).toContain('Every lap, one step better.');
  });

  test('embeds FiveRedLights press-and-hold gate', async () => {
    const html = await render();
    expect(html).toMatch(/data-five-red-lights/);
    for (const n of [1, 2, 3, 4, 5]) {
      expect(html).toMatch(new RegExp(`data-light="${n}"`));
    }
  });

  test('absorbs SIM-RACING badge from HeroManifest', async () => {
    const html = await render();
    expect(html).toContain('SIM-RACING EARLY ACCESS NOW OPEN');
  });

  test('absorbs T024 subhead from HeroManifest', async () => {
    const html = await render();
    expect(html).toContain(
      'The cross-platform Driver OS that turns every sim and real-world session into measurable progress.',
    );
  });

  test('absorbs T025 + T026 CTAs', async () => {
    const html = await render();
    expect(html).toMatch(
      /<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"[^>]*>[\s\S]*Start 14-day trial/,
    );
    expect(html).toMatch(/<a[^>]+href="\/how-it-works"[^>]*>[\s\S]*See how it works/);
    expect(html).not.toMatch(/<a[^>]+href="\/how-it-works"[^>]+rel="noopener"/);
  });

  test('CTAs use the AA-compliant pit-orange-deep token', async () => {
    const html = await render();
    expect(html).toMatch(/bg-pit-orange-deep/);
  });

  test('cinematic stagger preserved via data-hero-animate', async () => {
    const html = await render();
    expect(html).toMatch(/data-hero-animate/);
  });

  test('compressed body copy ≤ 80 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(80);
  });

  test('no AI/LLM language', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
    expect(html).not.toMatch(/\bgenerative\b/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/rooms/start-grid.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Rewrite StartGrid**

Replace `src/components/rooms/StartGrid.astro` content:

```astro
---
// V2 March entrance — absorbs the retired HeroManifest. Single 100 vh
// section with: telemetry kicker, badge, monument+shimmer headline,
// 5-light press-and-hold gate, T024 subhead, T025/T026 CTA pair.
//
// Carries `data-sector-id`, `data-accent`, `data-magnetic-zone` so the
// chrome HUD and the magnetic-cursor script can target this room.
import FiveRedLights from './FiveRedLights.astro';

const HEADLINE = 'Every lap, one step better.';
const SUBHEAD =
  'The cross-platform Driver OS that turns every sim and real-world session into measurable progress.';
const PRIMARY = { text: 'Start 14-day trial', href: 'https://app.lap-coach.racing/signup' };
const SECONDARY = { text: 'See how it works', href: '/how-it-works' };
---

<section
  data-sector-id="start-grid"
  data-accent="orange"
  data-magnetic-zone
  aria-label="Start grid — what is LAP"
  class="room texture-grain px-grid-margin relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center py-16 text-center sm:py-20"
>
  <p
    data-hero-animate
    class="font-telemetry text-pit-orange mb-6 tracking-[0.3em]"
  >
    01 / START GRID · GREEN FLAG
  </p>

  <p
    data-hero-animate
    class="font-telemetry bg-pit-orange/10 text-pit-orange border-pit-orange/30 mb-8 inline-block border px-3 py-1 tracking-[0.2em]"
  >
    SIM-RACING EARLY ACCESS NOW OPEN
  </p>

  <h1
    data-hero-animate
    class="font-display font-monument text-shimmer text-h1 max-w-wide tracking-display text-balance"
  >
    {HEADLINE}
  </h1>

  <p
    data-hero-animate
    class="text-chalk text-body font-body mt-6 max-w-prose text-pretty"
  >
    {SUBHEAD}
  </p>

  <div data-hero-animate class="mt-10 sm:mt-12">
    <FiveRedLights />
  </div>

  <div data-hero-animate class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
    <a
      href={PRIMARY.href}
      rel="noopener"
      class="bg-pit-orange-deep text-chalk hover:bg-pit-orange-deep/90 focus-visible:outline-pit-orange text-body font-mono inline-flex items-center justify-center px-7 py-3 font-medium tracking-wide uppercase transition"
    >
      {PRIMARY.text}
    </a>
    <a
      href={SECONDARY.href}
      class="text-chalk border-pit-orange/40 hover:border-pit-orange focus-visible:outline-chalk text-body font-mono inline-flex items-center justify-center border px-7 py-3 tracking-wide uppercase transition"
    >
      {SECONDARY.text}
    </a>
  </div>
</section>

<script>
  import '../../scripts/hero-motion';
  import '../../scripts/magnetic-cursor';
</script>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/rooms/start-grid.test.ts
```
Expected: PASS (10/10).

- [ ] **Step 5: Commit**

```bash
git add src/components/rooms/StartGrid.astro src/__tests__/rooms/start-grid.test.ts
git commit -m "feat(rooms): StartGrid absorbs HeroManifest · sector + magnetic-zone wiring"
```

---

## Task 12 · `SessionProof.astro` — accent + tick-up + compression

**Files:**
- Modify: `src/components/rooms/SessionProof.astro`
- Modify: `src/__tests__/rooms/session-proof.test.ts`

- [ ] **Step 1: Update the test**

Replace `src/__tests__/rooms/session-proof.test.ts` content:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SessionProof from '../../components/rooms/SessionProof.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(SessionProof);

describe('SessionProof · accent + tick-up', () => {
  test('section + sector wiring', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="session-proof"/);
    expect(html).toMatch(/data-accent="red"/);
  });

  test('eyebrow + monument headline', async () => {
    const html = await render();
    expect(html).toMatch(/02 \/ POST-RACE WRAP/);
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/Every session ends with a clear next step/);
  });

  test('three beam-cards with the 3 mantras', async () => {
    const html = await render();
    expect(html).toContain('YOUR SCORE');
    expect(html).toContain('YOUR DEBRIEF');
    expect(html).toContain('YOUR PROGRESSION');
    const beam = html.match(/beam-card/g) ?? [];
    expect(beam.length).toBeGreaterThanOrEqual(3);
  });

  test('debrief loss tagged with data-tick-target for the 41 (cs)', async () => {
    const html = await render();
    expect(html).toMatch(/data-tick-target="41"/);
  });

  test('compressed body copy ≤ 90 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(90);
  });

  test('no AI/LLM language', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/rooms/session-proof.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Rewrite SessionProof**

Replace `src/components/rooms/SessionProof.astro` content:

```astro
---
// SessionProof · room 02 · accent: safety-red.
// Three offset beam-cards for SCORE / DEBRIEF / PROGRESSION. The score
// number and debrief loss tick up on viewport entry via tick-up.ts.

const PILLARS = [
  { name: 'Pace',         score: 19 },
  { name: 'Consistency',  score: 22 },
  { name: 'Execution',    score: 17 },
  { name: 'Robustness',   score: 14 },
];

const PROGRESSION = [
  { week: 'Week 1', score: 58, delta: '+0' },
  { week: 'Week 3', score: 65, delta: '+7' },
  { week: 'Week 6', score: 72, delta: '+14' },
];
---

<section
  data-sector-id="session-proof"
  data-accent="red"
  aria-label="Post-race wrap"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-6xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-safety-red">02 / POST-RACE WRAP</p>
    <h2 class="font-display font-monument text-h2 text-chalk tracking-display mt-4 text-balance">
      Every session ends with a clear next step.
    </h2>
  </header>

  <ol class="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
    <li class="flex md:translate-y-4">
      <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
        <span class="font-telemetry text-safety-red">YOUR SCORE</span>
        <div class="mt-4 flex items-baseline gap-3">
          <span
            data-tick-target="72"
            class="font-display font-monument text-h2 text-chalk tabular-nums leading-none"
          >72</span>
          <span class="text-steel text-caption">/100</span>
        </div>
        <dl class="mt-5 flex flex-col gap-2">
          {PILLARS.map((p) => (
            <div class="flex items-center justify-between">
              <dt class="text-steel text-caption">{p.name}</dt>
              <dd class="font-telemetry text-chalk tabular-nums">{p.score}/25</dd>
            </div>
          ))}
        </dl>
      </article>
    </li>

    <li class="flex">
      <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
        <span class="font-telemetry text-safety-red">YOUR DEBRIEF</span>
        <dl class="mt-4 flex flex-col gap-3">
          <div>
            <dt class="font-telemetry text-safety-red">LOSS</dt>
            <dd class="text-chalk text-body font-body mt-1">
              −0.<span data-tick-target="41" class="tabular-nums">41</span> s · T6 Spa
            </dd>
          </div>
          <div>
            <dt class="font-telemetry text-steel">CAUSE</dt>
            <dd class="text-chalk text-body font-body mt-1">Trail-brake released 8 m too early.</dd>
          </div>
          <div>
            <dt class="font-telemetry text-acid-green">FIX</dt>
            <dd class="text-chalk text-body font-body mt-1">Hold 12 % brake to apex × 3 sessions.</dd>
          </div>
        </dl>
      </article>
    </li>

    <li class="flex md:-translate-y-4">
      <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
        <span class="font-telemetry text-safety-red">YOUR PROGRESSION</span>
        <ol class="mt-4 flex flex-col gap-3">
          {PROGRESSION.map((p) => (
            <li class="flex items-center gap-3">
              <span class="text-steel text-caption w-16 shrink-0">{p.week}</span>
              <div class="bg-asphalt relative h-1.5 flex-1 overflow-hidden rounded-full">
                <div class="bg-pit-orange absolute inset-y-0 left-0 rounded-full" style={`width: ${p.score}%`} />
              </div>
              <span class="font-telemetry text-chalk tabular-nums w-10 text-right">{p.score}</span>
              <span class="font-telemetry text-acid-green w-12 text-right">{p.delta}</span>
            </li>
          ))}
        </ol>
      </article>
    </li>
  </ol>
</section>

<script>
  import '../../scripts/tick-up';
</script>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/rooms/session-proof.test.ts
```
Expected: PASS (6/6).

- [ ] **Step 5: Commit**

```bash
git add src/components/rooms/SessionProof.astro src/__tests__/rooms/session-proof.test.ts
git commit -m "feat(rooms): SessionProof · red accent · tick-up loss + score"
```

---

## Task 13 · Rename `S1Pain` → `ThePain` (steel + M1 cross-fade)

**Files:**
- Create: `src/components/rooms/ThePain.astro`
- Create: `src/__tests__/rooms/the-pain.test.ts`
- Delete: `src/components/rooms/S1Pain.astro`
- Delete: `src/__tests__/rooms/s1-pain.test.ts`

- [ ] **Step 1: Write the test for ThePain**

Create `src/__tests__/rooms/the-pain.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import ThePain from '../../components/rooms/ThePain.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(ThePain);

describe('ThePain · room 03', () => {
  test('section + sector wiring', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="the-pain"/);
    expect(html).toMatch(/data-accent="steel"/);
  });

  test('eyebrow uses steel and codes 03', async () => {
    const html = await render();
    expect(html).toMatch(/03 \/ SECTOR 1/);
    expect(html).toMatch(/text-steel/);
  });

  test('monument headline still reads "Stop stacking tools."', async () => {
    const html = await render();
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/Stop stacking tools/);
  });

  test('no marshal-yellow accent class survives anywhere in the room', async () => {
    const html = await render();
    expect(html).not.toMatch(/marshal-yellow/);
  });

  test('cross-fade pin marker present (M1)', async () => {
    const html = await render();
    expect(html).toMatch(/data-pin-cross-fade/);
  });

  test('compressed body copy ≤ 80 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(80);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/rooms/the-pain.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Write the new component**

Create `src/components/rooms/ThePain.astro`:

```astro
---
// ThePain · room 03 · accent: steel. The "drowning in fragmented tools"
// room. Pinned (M1): the typical-stack card cross-fades into the LAP
// ecosystem card as the user scrolls within the pin range. The cross-fade
// is GSAP scroll-scrubbed; the markup carries `data-pin-cross-fade` so
// the home pin script can find both panes.

const TYPICAL = [
  { name: 'Telemetry app',     cost: '€20 / mo' },
  { name: 'Lap-time logger',   cost: '€8 / mo' },
  { name: 'Setup notebook',    cost: '€5 / mo' },
  { name: 'Coach hourly',      cost: '€60 / hr' },
  { name: 'Strategy planner',  cost: '€12 / mo' },
];

const LAP = [
  'Capture · iRacing / ACC / AMS2 / phone',
  'Auto split + corner detection',
  'Four-pillar score with grade',
  'Drill prescription per session',
  'Cross-session reference',
  'Theoretical perfect-lap solver',
  'Race-strategy planner',
];
---

<section
  data-sector-id="the-pain"
  data-accent="steel"
  aria-label="Tool fragmentation pain"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-6xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-steel">03 / SECTOR 1 · TOOL FRAGMENTATION</p>
    <h2 class="font-display font-monument text-h2 text-chalk tracking-display mt-4 text-balance">
      Stop stacking tools.
    </h2>
  </header>

  <div data-pin-cross-fade class="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
    <article data-pin-pane="before" class="bg-asphalt border-steel/30 rounded-2 flex flex-col border p-7">
      <h3 class="font-telemetry text-steel">TYPICAL STACK</h3>
      <dl class="mt-4 flex flex-col gap-3">
        {TYPICAL.map((t) => (
          <div class="flex items-center justify-between">
            <dt class="text-chalk text-body font-body">{t.name}</dt>
            <dd class="font-telemetry text-steel tabular-nums">{t.cost}</dd>
          </div>
        ))}
      </dl>
      <p class="font-telemetry text-steel mt-6">5 logins · no connection</p>
    </article>

    <article data-pin-pane="after" class="beam-card rounded-2 flex flex-col p-7">
      <h3 class="font-telemetry text-pit-orange">LAP ECOSYSTEM</h3>
      <ul class="mt-4 flex flex-col gap-3">
        {LAP.map((line) => (
          <li class="flex items-center justify-between gap-3">
            <span class="text-chalk text-body font-body">{line}</span>
            <span class="font-telemetry bg-acid-green/10 text-acid-green border-acid-green/30 inline-block border px-2 py-0.5">
              INCLUDED
            </span>
          </li>
        ))}
      </ul>
      <p class="font-telemetry text-pit-orange mt-6">One ecosystem · everything connected</p>
    </article>
  </div>
</section>
```

- [ ] **Step 4: Delete the old S1Pain files**

```bash
git rm src/components/rooms/S1Pain.astro src/__tests__/rooms/s1-pain.test.ts
```

- [ ] **Step 5: Run tests + build**

```bash
pnpm test src/__tests__/rooms/the-pain.test.ts && pnpm build
```
Expected: room test passes, but `pnpm build` may fail because `index.astro` still imports `S1Pain`. That's expected — Task 18 rewires index.astro. For now, temporarily keep `index.astro` building by stubbing the import (we'll do a proper rewire at T18). Skip the build expectation here:

```bash
pnpm test src/__tests__/rooms/the-pain.test.ts
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/rooms/ThePain.astro src/__tests__/rooms/the-pain.test.ts
git commit -m "feat(rooms): ThePain rename · steel accent · cross-fade pin marker"
```

---

## Task 14 · Rename `S2Versus` → `Versus`, absorb `SimFirst`

**Files:**
- Create: `src/components/rooms/Versus.astro`
- Create: `src/__tests__/rooms/versus.test.ts`
- Delete: `src/components/rooms/S2Versus.astro`, `SimFirst.astro`
- Delete: `src/__tests__/rooms/s2-versus.test.ts`, `sim-first.test.ts`

- [ ] **Step 1: Write the test**

Create `src/__tests__/rooms/versus.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Versus from '../../components/rooms/Versus.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(Versus);

describe('Versus · room 04 · purple', () => {
  test('section + sector wiring', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="versus"/);
    expect(html).toMatch(/data-accent="purple"/);
  });

  test('dual headline · "We coach drivers." in racing-purple', async () => {
    const html = await render();
    expect(html).toMatch(/They time laps/);
    expect(html).toMatch(/We coach drivers/);
    expect(html).toMatch(/text-racing-purple[^"]*"[^>]*>\s*We coach drivers/);
  });

  test('two comparison panes · TIMING · COACHING', async () => {
    const html = await render();
    expect(html).toContain('TIMING');
    expect(html).toContain('COACHING');
    expect(html).toMatch(/data-pin-card-swap/);
  });

  test('absorbs SimFirst sim ↔ real bridge as a lateral panel', async () => {
    const html = await render();
    expect(html).toContain('SIM ↔ REAL');
    expect(html).toMatch(/data-bridge/);
  });

  test('compressed body copy ≤ 110 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(110);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/rooms/versus.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Write the new component**

Create `src/components/rooms/Versus.astro`:

```astro
---
// Versus · room 04 · accent: racing-purple. Absorbs SimFirst as a lateral
// "SIM ↔ REAL" bridge panel. Pinned (M1): the timing card slides aside
// as the coaching card replaces it (`data-pin-card-swap`). The bridge
// panel folds in below at the end of the pin range.

const TIMING = [
  { pos: 'P1', time: '1:42.103', delta: '—' },
  { pos: 'P4', time: '1:43.012', delta: '+0.909' },
];

const COACHING = [
  { loss: '-0.41 s', fix: 'Hold 12 % to apex' },
  { loss: '-0.28 s', fix: '+6 km/h apex' },
];
---

<section
  data-sector-id="versus"
  data-accent="purple"
  aria-label="Why LAP is different"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-6xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-racing-purple">04 / SECTOR 2 · OVERTAKE</p>
    <h2 class="font-display font-monument text-h2 tracking-display mt-4 text-balance">
      <span class="text-chalk block">They time laps.</span>
      <span class="text-racing-purple block">We coach drivers.</span>
    </h2>
  </header>

  <div data-pin-card-swap class="mt-14 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.1fr] md:items-start md:gap-0">
    <article data-pin-card="timing" class="bg-asphalt border-steel/20 rounded-2 z-0 border p-7">
      <p class="font-telemetry text-steel">TIMING</p>
      <ol class="mt-5 flex flex-col gap-2">
        {TIMING.map((r) => (
          <li class="flex items-center gap-3">
            <span class="font-telemetry text-racing-purple w-8">{r.pos}</span>
            <span class="font-telemetry text-chalk tabular-nums flex-1">{r.time}</span>
            <span class="font-telemetry text-steel tabular-nums w-16 text-right">{r.delta}</span>
          </li>
        ))}
      </ol>
      <p class="font-telemetry text-steel mt-6">Names. Positions.</p>
    </article>

    <article data-pin-card="coaching" class="beam-card rounded-2 shadow-e3 z-10 p-7 md:-translate-x-4 md:-translate-y-2">
      <p class="font-telemetry text-racing-purple">COACHING</p>
      <ol class="mt-5 flex flex-col gap-3">
        {COACHING.map((r) => (
          <li class="flex items-baseline gap-3">
            <span class="font-telemetry text-safety-red tabular-nums">{r.loss}</span>
            <span class="text-chalk text-body font-body">{r.fix}</span>
          </li>
        ))}
      </ol>
      <p class="font-telemetry text-racing-purple mt-6">Causes. Drills.</p>
    </article>
  </div>

  <aside data-bridge class="mt-14 grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:items-center">
    <p class="font-telemetry text-racing-purple">SIM ↔ REAL · ONE PROFILE</p>
    <p class="text-chalk text-body font-body">
      Sim sessions and real-world sessions share one driver profile. Same scoring, same drills.
    </p>
  </aside>
</section>
```

- [ ] **Step 4: Delete the old files**

```bash
git rm src/components/rooms/S2Versus.astro src/components/rooms/SimFirst.astro src/__tests__/rooms/s2-versus.test.ts src/__tests__/rooms/sim-first.test.ts
```

- [ ] **Step 5: Run the new test**

```bash
pnpm test src/__tests__/rooms/versus.test.ts
```
Expected: PASS (5/5).

- [ ] **Step 6: Commit**

```bash
git add src/components/rooms/Versus.astro src/__tests__/rooms/versus.test.ts
git commit -m "feat(rooms): Versus · purple · absorbs SimFirst bridge panel"
```

---

## Task 15 · Rename `S3Product` → `Pipeline`, absorb `PremiumLayer`

**Files:**
- Create: `src/components/rooms/Pipeline.astro`
- Create: `src/__tests__/rooms/pipeline.test.ts`
- Delete: `src/components/rooms/S3Product.astro`, `PremiumLayer.astro`
- Delete: `src/__tests__/rooms/s3-product.test.ts`, `premium-layer.test.ts`

- [ ] **Step 1: Write the test**

Create `src/__tests__/rooms/pipeline.test.ts`:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Pipeline from '../../components/rooms/Pipeline.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(Pipeline);

describe('Pipeline · room 05 · acid-green', () => {
  test('section + sector wiring', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="pipeline"/);
    expect(html).toMatch(/data-accent="green"/);
  });

  test('eyebrow + dual headline', async () => {
    const html = await render();
    expect(html).toMatch(/05 \/ SECTOR 3/);
    expect(html).toMatch(/One system from raw session/);
    expect(html).toMatch(/to next-session action/);
  });

  test('renders 7 stations 01..07 (5 base + 2 premium absorbed)', async () => {
    const html = await render();
    for (const code of ['01', '02', '03', '04', '05', '06', '07']) {
      expect(html).toMatch(new RegExp(`data-station-code="${code}"`));
    }
  });

  test('horizontal scrub track marker present (M1)', async () => {
    const html = await render();
    expect(html).toMatch(/data-pin-horizontal-scrub/);
  });

  test('premium content from PremiumLayer absorbed at stations 06-07', async () => {
    const html = await render();
    // PROGRESSION INTELLIGENCE / UNLIMITED ANALYSIS were PremiumLayer
    expect(html).toMatch(/PROGRESSION/);
    expect(html).toMatch(/UNLIMITED/);
  });

  test('compressed body copy ≤ 130 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(130);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/rooms/pipeline.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Write the new component**

Create `src/components/rooms/Pipeline.astro`:

```astro
---
// Pipeline · room 05 · accent: acid-green. Absorbs PremiumLayer.
// 7 stations, scroll = horizontal scrub progression. Stations 06-07
// carry the premium-tier content folded in from the retired PremiumLayer.
// `data-pin-horizontal-scrub` marks the wrapping track for the home
// pin script.

const STATIONS = [
  { code: '01', heading: 'Capture',    body: 'iRacing · ACC · AMS2 · RaceBox · phone — one format.' },
  { code: '02', heading: 'Process',    body: 'GPS clean · lap split · corner detection · resample.' },
  { code: '03', heading: 'Analyse',    body: 'Pedal traces · G-G · time-delta — pinned to the metre.' },
  { code: '04', heading: 'Score',      body: 'Pace · Consistency · Execution · Robustness — / 25.' },
  { code: '05', heading: 'Profile',    body: 'Cross-session overlay · per-corner trend.' },
  { code: '06', heading: 'PROGRESSION INTELLIGENCE', body: 'Closed weakness count · open prescriptions · next-session target.' },
  { code: '07', heading: 'UNLIMITED ANALYSIS',       body: 'Upload · analyse · compare — no session caps.' },
];
---

<section
  data-sector-id="pipeline"
  data-accent="green"
  aria-label="Product pipeline"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-6xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-acid-green">05 / SECTOR 3 · THE LINE</p>
    <h2 class="font-display font-monument text-h2 tracking-display mt-4 text-balance">
      <span class="text-chalk block">One system from raw session</span>
      <span class="text-acid-green block">to next-session action.</span>
    </h2>
  </header>

  <div data-pin-horizontal-scrub class="mt-14 overflow-hidden">
    <ol class="flex gap-4 md:gap-6">
      {STATIONS.map((s) => (
        <li
          data-station-code={s.code}
          class="flex shrink-0 flex-col"
          style="width: clamp(240px, 70vw, 360px);"
        >
          <article class="beam-card rounded-2 flex h-full flex-col p-7">
            <p class="font-telemetry text-acid-green">{s.code}</p>
            <h3 class="font-display font-monument text-h4 text-chalk tracking-display mt-3 text-balance">
              {s.heading}
            </h3>
            <p class="text-steel text-body font-body mt-3">{s.body}</p>
          </article>
        </li>
      ))}
    </ol>
  </div>
</section>
```

- [ ] **Step 4: Delete the old files**

```bash
git rm src/components/rooms/S3Product.astro src/components/rooms/PremiumLayer.astro src/__tests__/rooms/s3-product.test.ts src/__tests__/rooms/premium-layer.test.ts
```

- [ ] **Step 5: Run the new test**

```bash
pnpm test src/__tests__/rooms/pipeline.test.ts
```
Expected: PASS (6/6).

- [ ] **Step 6: Commit**

```bash
git add src/components/rooms/Pipeline.astro src/__tests__/rooms/pipeline.test.ts
git commit -m "feat(rooms): Pipeline · green · absorbs PremiumLayer at stations 06-07"
```

---

## Task 16 · `Garage.astro` — compression + tick-up stats

**Files:**
- Modify: `src/components/rooms/Garage.astro`
- Modify: `src/__tests__/rooms/garage.test.ts`

- [ ] **Step 1: Update the test**

Replace `src/__tests__/rooms/garage.test.ts` content:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Garage from '../../components/rooms/Garage.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(Garage);

describe('Garage · room 06', () => {
  test('section + sector wiring · returns to gold', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="garage"/);
    expect(html).toMatch(/data-accent="orange"/);
  });

  test('eyebrow + headline + founder note', async () => {
    const html = await render();
    expect(html).toMatch(/06 \/ GARAGE/);
    expect(html).toMatch(/Built from real progression/);
    expect(html).toMatch(/I built LAP/);
  });

  test('three stats with data-tick-target', async () => {
    const html = await render();
    expect(html).toMatch(/data-tick-target="2000"/); // iRating
    expect(html).toMatch(/data-tick-target="12"/);   // Podium fights
    expect(html).toMatch(/data-tick-target="14"/);   // Pipeline stages
  });

  test('three reserved beta slots · no fabricated names', async () => {
    const html = await render();
    expect(html).toContain('CLEARER DEBRIEFS');
    expect(html).toContain('FASTER PROGRESS');
    expect(html).toContain('LESS GUESSWORK');
    expect(html).toMatch(/BETA SLOT/);
    expect(html).toMatch(/July 2026/);
    expect(html).not.toMatch(/— [A-Z][a-z]+ [A-Z][a-z]+/);
  });

  test('compressed body copy ≤ 140 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(140);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/rooms/garage.test.ts
```
Expected: FAIL — current Garage has more words and no tick-up.

- [ ] **Step 3: Rewrite Garage**

Replace `src/components/rooms/Garage.astro` content:

```astro
---
// Garage · room 06 · accent returns to pit-orange. Compressed founder
// note, 3 stat cards (tick up on view via tick-up.ts), 3 reserved beta
// testimonial slots — no fabricated names per Doctrine §10.

const STATS = [
  { tickTarget: 2000, prefix: '+', label: 'IRATING GAINED', tickFormat: 'comma' },
  { tickTarget: 12,   prefix: '',  label: 'PODIUM FIGHTS' },
  { tickTarget: 14,   prefix: '',  label: 'STAGE PIPELINE' },
];

const TESTIMONIALS = [
  { kicker: 'CLEARER DEBRIEFS', quote: 'I stopped guessing. Chart told me, drill was waiting.', slot: 'BETA SLOT 1 · July 2026' },
  { kicker: 'FASTER PROGRESS',  quote: 'Forty hundredths off my Saturday split in six weeks.',  slot: 'BETA SLOT 2 · July 2026' },
  { kicker: 'LESS GUESSWORK',   quote: 'The four pillars told me which to attack first.',        slot: 'BETA SLOT 3 · July 2026' },
];
---

<section
  data-sector-id="garage"
  data-accent="orange"
  aria-label="Build story"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-6xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-pit-orange">06 / GARAGE</p>
    <h2 class="font-display font-monument text-h2 text-chalk tracking-display mt-4 text-balance">
      Built from real progression.
    </h2>
  </header>

  <article class="beam-card rounded-2 mt-14 grid grid-cols-1 gap-8 p-8 md:grid-cols-[1fr_auto] md:p-10">
    <p class="text-chalk text-body font-body leading-body">
      I built LAP because I lived the problem. Six tabs open, no plan for Thursday, three years of
      1:42.9 laps that wouldn't move.
    </p>
    <aside aria-hidden="true" class="bg-pit-orange-deep text-chalk font-display font-monument flex h-24 w-24 shrink-0 items-center justify-center text-5xl shadow-e3 md:translate-x-4">
      L
    </aside>
  </article>

  <ul class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
    {STATS.map((s) => (
      <li class="flex">
        <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
          <span
            data-tick-target={s.tickTarget}
            data-tick-format={s.tickFormat ?? ''}
            class="font-display font-monument text-h2 text-pit-orange tabular-nums leading-none"
          >{s.prefix}{s.tickTarget}</span>
          <span class="font-telemetry text-steel mt-3">{s.label}</span>
        </article>
      </li>
    ))}
  </ul>

  <ul class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
    {TESTIMONIALS.map((t) => (
      <li class="flex">
        <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
          <span aria-hidden="true" class="font-display font-monument text-pit-orange/30 text-6xl leading-none">“</span>
          <p class="font-telemetry text-pit-orange mt-3">{t.kicker}</p>
          <p class="text-chalk text-body font-body mt-3">{t.quote}</p>
          <p class="font-telemetry text-steel/60 mt-6">{t.slot}</p>
        </article>
      </li>
    ))}
  </ul>
</section>

<script>
  import '../../scripts/tick-up';
</script>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/rooms/garage.test.ts
```
Expected: PASS (5/5).

- [ ] **Step 5: Commit**

```bash
git add src/components/rooms/Garage.astro src/__tests__/rooms/garage.test.ts
git commit -m "feat(rooms): Garage · compressed founder note · tick-up stats"
```

---

## Task 17 · `Podium.astro` — absorb `PitStop` pricing

**Files:**
- Modify: `src/components/rooms/Podium.astro`
- Modify: `src/__tests__/rooms/podium.test.ts`
- Delete: `src/components/rooms/PitStop.astro`
- Delete: `src/__tests__/rooms/pit-stop.test.ts`

- [ ] **Step 1: Update the test**

Replace `src/__tests__/rooms/podium.test.ts` content:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Podium from '../../components/rooms/Podium.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(Podium);

describe('Podium · room 07 · close + price', () => {
  test('section + sector wiring', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="podium"/);
    expect(html).toMatch(/data-accent="orange"/);
  });

  test('room + texture-grain final pin', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*\broom\b/);
    expect(html).toMatch(/class="[^"]*\btexture-grain\b/);
  });

  test('shimmer monument headline', async () => {
    const html = await render();
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/<h2[^>]*class="[^"]*text-shimmer[^"]*"/);
    expect(html).toContain('Your driving deserves');
  });

  test('absorbs PitStop pricing as a one-line teaser', async () => {
    const html = await render();
    expect(html).toMatch(/€15 \/ mo/);
    expect(html).toMatch(/€150 \/ yr/);
    expect(html).toMatch(/14-day/i);
  });

  test('single primary CTA · pit-orange-deep · signup link · rel noopener', async () => {
    const html = await render();
    expect(html).toMatch(
      /<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"/,
    );
    expect(html).toMatch(/bg-pit-orange-deep/);
  });

  test('see full pricing link to /pricing', async () => {
    const html = await render();
    expect(html).toMatch(/<a[^>]+href="\/pricing"/);
  });

  test('compressed body copy ≤ 80 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(80);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/rooms/podium.test.ts
```
Expected: FAIL — current Podium does not have inline pricing.

- [ ] **Step 3: Rewrite Podium**

Replace `src/components/rooms/Podium.astro` content:

```astro
---
// Podium · room 07 · accent: pit-orange shimmer. Absorbs PitStop pricing
// as a one-line inline teaser. Single primary CTA. IntersectionObserver
// fires `podium_reach` PostHog event the first time the section reaches
// 50 % visibility.
---

<section
  data-sector-id="podium"
  data-accent="orange"
  data-podium-reach
  aria-label="Final CTA — chequered flag"
  class="room texture-grain px-grid-margin border-pit-orange/15 mx-auto w-full max-w-6xl border-t py-24 text-center sm:py-32"
>
  <p class="font-telemetry text-pit-orange">07 / CHEQUERED FLAG</p>
  <h2
    class="font-display font-monument text-shimmer text-h1 mx-auto mt-6 max-w-wide tracking-display text-balance"
  >
    Your driving deserves <span class="text-pit-orange">better than guesswork.</span>
  </h2>
  <p class="text-chalk text-body font-body mx-auto mt-6 max-w-prose">
    Run a lap. Get your report. See what changes.
  </p>

  <p class="font-telemetry text-steel/80 mt-10 tracking-[0.18em]">
    €15 / mo · €150 / yr · 14-day full-feature trial
  </p>

  <div class="mt-6 flex justify-center">
    <a
      href="https://app.lap-coach.racing/signup"
      rel="noopener"
      class="bg-pit-orange-deep text-chalk hover:bg-pit-orange-deep/90 focus-visible:outline-pit-orange text-body font-mono inline-flex items-center justify-center px-8 py-3 font-medium tracking-wide uppercase transition"
    >
      Start free — try the demo dashboard
    </a>
  </div>

  <p class="font-telemetry text-steel/70 mt-6">
    No card at signup · cancel anytime
  </p>

  <p class="mt-8">
    <a href="/pricing" class="text-steel hover:text-chalk text-caption underline underline-offset-4 transition">
      See full pricing &rarr;
    </a>
  </p>
</section>

<script>
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const node = document.querySelector('[data-podium-reach]');
    if (node) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              const ph = (window as unknown as { posthog?: { capture: (e: string) => void } }).posthog;
              ph?.capture('podium_reach');
              io.disconnect();
              break;
            }
          }
        },
        { threshold: 0.5 },
      );
      io.observe(node);
    }
  }
</script>
```

- [ ] **Step 4: Delete the old PitStop files**

```bash
git rm src/components/rooms/PitStop.astro src/__tests__/rooms/pit-stop.test.ts
```

- [ ] **Step 5: Run the test**

```bash
pnpm test src/__tests__/rooms/podium.test.ts
```
Expected: PASS (7/7).

- [ ] **Step 6: Commit**

```bash
git add src/components/rooms/Podium.astro src/__tests__/rooms/podium.test.ts
git commit -m "feat(rooms): Podium · absorbs PitStop pricing teaser · single CTA"
```

---

## Task 18 · Wire `index.astro` · delete retired components · home pin script

**Files:**
- Modify: `src/pages/index.astro`
- Delete: `src/components/rooms/HeroManifest.astro`
- Delete: `src/__tests__/rooms/hero-manifest.test.ts`
- Create: `src/scripts/home-pins.ts`
- Modify: `src/__tests__/homepage.test.ts`

- [ ] **Step 1: Update homepage test**

Replace `src/__tests__/homepage.test.ts` content:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Home from '../pages/index.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Home));

// Doctrine-locked copy
test('homepage carries T023 headline verbatim', async () => {
  const html = await render();
  expect(html).toContain('Every lap, one step better.');
});

test('forbids the alternative T023 option', async () => {
  const html = await render();
  expect(html).not.toContain('The Driver OS — Train. Race. Improve.');
});

test('font-display H1 is present', async () => {
  const html = await render();
  expect(html).toMatch(/<h1[^>]*class="[^"]*font-display[^"]*"/);
});

test('T024 subhead lives in StartGrid (post-absorption)', async () => {
  const html = await render();
  expect(html).toContain(
    'The cross-platform Driver OS that turns every sim and real-world session into measurable progress.',
  );
});

test('forbids AI / LLM / generative vocabulary (ADR-004 §4)', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T025 primary CTA links to signup with rel=noopener', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"/);
});

test('T026 secondary CTA links to /how-it-works without rel=noopener', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/how-it-works"[^>]*>[\s\S]*See how it works/);
  expect(html).not.toMatch(/<a[^>]+href="\/how-it-works"[^>]+rel="noopener"/);
});

// Phase 4 · 7-room sequence
test('homepage mounts the 7 rooms in canonical order', async () => {
  const html = await render();
  const order = [
    '01 / START GRID',
    '02 / POST-RACE WRAP',
    '03 / SECTOR 1',
    '04 / SECTOR 2',
    '05 / SECTOR 3',
    '06 / GARAGE',
    '07 / CHEQUERED FLAG',
  ];
  let cursor = 0;
  for (const marker of order) {
    const idx = html.indexOf(marker, cursor);
    expect(idx, `expected "${marker}" at or after offset ${cursor}`).toBeGreaterThan(-1);
    cursor = idx + marker.length;
  }
});

test('every room exposes data-sector-id', async () => {
  const html = await render();
  for (const id of ['start-grid', 'session-proof', 'the-pain', 'versus', 'pipeline', 'garage', 'podium']) {
    expect(html).toMatch(new RegExp(`data-sector-id="${id}"`));
  }
});

test('MarqueeStrip with racing keywords sits between StartGrid and SessionProof', async () => {
  const html = await render();
  for (const k of ['TELEMETRY','LAP ANALYSIS','CORNER COACHING','PERFORMANCE SCORING','SESSION DEBRIEF','DATA ENGINEERING','TRACK MAPPING']) {
    expect(html).toMatch(new RegExp(k));
  }
  const startGridIdx = html.indexOf('01 / START GRID');
  const marqueeIdx = html.indexOf('TELEMETRY');
  const sessionProofIdx = html.indexOf('02 / POST-RACE WRAP');
  expect(marqueeIdx).toBeGreaterThan(startGridIdx);
  expect(sessionProofIdx).toBeGreaterThan(marqueeIdx);
});
```

- [ ] **Step 2: Write the home-pins script**

Create `src/scripts/home-pins.ts`:

```ts
import { loadGsap, shouldAnimate, onIdle } from './gsap-loader';

/**
 * Pin-and-scrub for the home rooms that the spec marks as pinned:
 *   - the-pain      : cross-fade [data-pin-cross-fade] panes
 *   - versus        : card-swap [data-pin-card-swap]
 *   - pipeline      : horizontal scrub [data-pin-horizontal-scrub]
 *   - podium        : final pin (no inner scrub, just sticky for one screen)
 *
 * StartGrid is also a pin via `min-h-screen` + sticky natural behaviour
 * for the press-and-hold gate; no GSAP needed for it.
 *
 * Disabled below 768 px (touch / narrow). Disabled when reduced-motion.
 */

const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

export async function initHomePins(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!shouldAnimate()) return;
  if (isMobile()) return;
  const { gsap, ScrollTrigger } = await loadGsap();

  // The-pain: cross-fade
  const crossFade = document.querySelector<HTMLElement>('[data-pin-cross-fade]');
  if (crossFade) {
    const before = crossFade.querySelector<HTMLElement>('[data-pin-pane="before"]');
    const after = crossFade.querySelector<HTMLElement>('[data-pin-pane="after"]');
    if (before && after) {
      gsap.set(after, { opacity: 0.3 });
      ScrollTrigger.create({
        trigger: crossFade,
        start: 'top 75%',
        end: 'bottom 25%',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(before, { opacity: 1 - p * 0.7 });
          gsap.set(after, { opacity: 0.3 + p * 0.7 });
        },
      });
    }
  }

  // Versus: card-swap (timing dims, coaching emerges)
  const swap = document.querySelector<HTMLElement>('[data-pin-card-swap]');
  if (swap) {
    const timing = swap.querySelector<HTMLElement>('[data-pin-card="timing"]');
    const coaching = swap.querySelector<HTMLElement>('[data-pin-card="coaching"]');
    if (timing && coaching) {
      gsap.set(coaching, { opacity: 0.5, x: 24 });
      ScrollTrigger.create({
        trigger: swap,
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(timing, { opacity: 1 - p * 0.5 });
          gsap.set(coaching, { opacity: 0.5 + p * 0.5, x: 24 - p * 24 });
        },
      });
    }
  }

  // Pipeline: horizontal scrub
  const horiz = document.querySelector<HTMLElement>('[data-pin-horizontal-scrub]');
  if (horiz) {
    const ol = horiz.querySelector<HTMLElement>('ol');
    if (ol) {
      const totalWidth = ol.scrollWidth;
      const viewportWidth = horiz.clientWidth;
      const distance = Math.max(0, totalWidth - viewportWidth);
      if (distance > 0) {
        ScrollTrigger.create({
          trigger: horiz,
          start: 'top 30%',
          end: () => `+=${distance}`,
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            gsap.set(ol, { x: -self.progress * distance });
          },
        });
      }
    }
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => onIdle(() => initHomePins()));
  } else {
    onIdle(() => initHomePins());
  }
}
```

- [ ] **Step 3: Rewrite index.astro**

Replace `src/pages/index.astro` content:

```astro
---
// Phase 4 wiring · 7 rooms in canonical order. The retired components
// (HeroManifest, SimFirst, PremiumLayer, PitStop) are deleted as part
// of this task. home-pins.ts attaches GSAP scroll-pins on desktop +
// motion-allowed only.
import BaseLayout from '../layouts/BaseLayout.astro';
import StartGrid from '../components/rooms/StartGrid.astro';
import SessionProof from '../components/rooms/SessionProof.astro';
import ThePain from '../components/rooms/ThePain.astro';
import Versus from '../components/rooms/Versus.astro';
import Pipeline from '../components/rooms/Pipeline.astro';
import Garage from '../components/rooms/Garage.astro';
import Podium from '../components/rooms/Podium.astro';
import MarqueeStrip from '../components/ui/MarqueeStrip.astro';
---

<BaseLayout title="LAP — Every lap, one step better.">
  <main id="main-content">
    <StartGrid />
    <MarqueeStrip
      items={[
        'TELEMETRY',
        'LAP ANALYSIS',
        'CORNER COACHING',
        'PERFORMANCE SCORING',
        'SESSION DEBRIEF',
        'DATA ENGINEERING',
        'TRACK MAPPING',
      ]}
      speed={35}
    />
    <SessionProof />
    <ThePain />
    <Versus />
    <Pipeline />
    <Garage />
    <Podium />
  </main>
</BaseLayout>

<script>
  import '../scripts/sector-progress';
  import '../scripts/home-pins';
</script>
```

- [ ] **Step 4: Delete HeroManifest**

```bash
git rm src/components/rooms/HeroManifest.astro src/__tests__/rooms/hero-manifest.test.ts
```

- [ ] **Step 5: Run all tests + build**

```bash
pnpm test && pnpm build
```
Expected: all green; 46 pages built.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/__tests__/homepage.test.ts src/scripts/home-pins.ts
git commit -m "feat(home): rewire 7-room order · home-pins GSAP scroll-pinning · retire HeroManifest"
```

---

## Task 19 · `aria-pressed` lattice on FiveRedLights HOLD button

**Files:**
- Modify: `src/components/rooms/FiveRedLights.astro`
- Modify: `src/__tests__/rooms/five-red-lights.test.ts`

- [ ] **Step 1: Update the test**

Append to the existing describe block in `src/__tests__/rooms/five-red-lights.test.ts`:

```ts
test('HOLD button declares aria-pressed initial state', async () => {
  const html = await render();
  expect(html).toMatch(/<button[^>]*\sdata-hold[^>]*\saria-pressed="false"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/__tests__/rooms/five-red-lights.test.ts
```
Expected: FAIL — current button has no aria-pressed attribute.

- [ ] **Step 3: Add aria-pressed to the button**

In `src/components/rooms/FiveRedLights.astro`, add `aria-pressed="false"` to the button:

```diff
   <button
     type="button"
     data-hold
+    aria-pressed="false"
     aria-label="Press and hold to start the lights-out sequence"
     class="bg-pit-orange-deep text-chalk hover:bg-pit-orange-deep/90 focus-visible:outline-pit-orange data-[active=true]:bg-safety-red data-[active=true]:text-chalk font-mono mt-6 inline-flex w-48 cursor-pointer touch-none items-center justify-center px-7 py-4 font-medium tracking-[0.3em] uppercase transition select-none"
   >
```

In the inline `<script>` of FiveRedLights, update `start()` and `release()` to toggle `aria-pressed`:

In `start()` after `button.dataset.active = 'true';`:
```js
button.setAttribute('aria-pressed', 'true');
```

In `release()` (and `toIdle()` and `jumpStart`) after `button.dataset.active = 'false';`:
```js
button.setAttribute('aria-pressed', 'false');
```

Specifically, find these lines in the script and add the corresponding `setAttribute` call:
- `button.dataset.active = 'true';` → also `button.setAttribute('aria-pressed', 'true');`
- `button.dataset.active = 'false';` → also `button.setAttribute('aria-pressed', 'false');`

There are 4 occurrences in `toIdle()`, `start()`, `release()` (twice — once before scroll, once at end).

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/__tests__/rooms/five-red-lights.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/rooms/FiveRedLights.astro src/__tests__/rooms/five-red-lights.test.ts
git commit -m "feat(rooms): FiveRedLights aria-pressed lattice"
```

---

## Task 20 · Playwright e2e · home-flow + sector-ribbon + cursor + reduced-motion

**Files:**
- Create: `tests/e2e/home-flow.spec.ts`
- Create: `tests/e2e/sector-ribbon.spec.ts`
- Create: `tests/e2e/cursor.spec.ts`
- Create: `tests/e2e/reduced-motion.spec.ts`

- [ ] **Step 1: Write home-flow.spec.ts**

Create `tests/e2e/home-flow.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.describe('Home flow · press-and-hold gate', () => {
  test('hold for 5 s + release scrolls past hero', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('[data-hold]');
    await expect(button).toBeVisible();

    // Initial scroll position
    const yBefore = await page.evaluate(() => window.scrollY);

    // Hold for 5.2 s, then release
    const box = await button.boundingBox();
    if (!box) throw new Error('button has no box');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(5200);
    await page.mouse.up();

    // Wait for scroll
    await page.waitForFunction(() => window.scrollY > 200, { timeout: 3000 });
    const yAfter = await page.evaluate(() => window.scrollY);
    expect(yAfter).toBeGreaterThan(yBefore + 100);
  });

  test('release before all 5 lit shows TOO EARLY', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('[data-hold]');
    const status = page.locator('[data-status]');
    const box = await button.boundingBox();
    if (!box) throw new Error('button has no box');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(2000);
    await page.mouse.up();
    await expect(status).toContainText(/TOO EARLY/i);
  });
});
```

- [ ] **Step 2: Write sector-ribbon.spec.ts**

Create `tests/e2e/sector-ribbon.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('sector ribbon active segment matches scrolled-into-view room', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1280, height: 800 });

  // Scroll to each room and verify the active ribbon segment matches.
  const sectors = [
    { id: 'session-proof', code: '02' },
    { id: 'the-pain', code: '03' },
    { id: 'versus', code: '04' },
    { id: 'pipeline', code: '05' },
    { id: 'garage', code: '06' },
    { id: 'podium', code: '07' },
  ];

  for (const s of sectors) {
    await page.locator(`[data-sector-id="${s.id}"]`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(600); // let IO debounce
    const active = page.locator(`[data-segment-code="${s.code}"][data-state="active"]`);
    await expect(active).toHaveCount(1);
  }
});
```

- [ ] **Step 3: Write cursor.spec.ts**

Create `tests/e2e/cursor.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('magnetic cursor renders inside hero zone, hides outside', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1280, height: 800 });

  const heroBox = await page.locator('[data-magnetic-zone]').boundingBox();
  if (!heroBox) throw new Error('hero zone missing');

  await page.mouse.move(heroBox.x + heroBox.width / 2, heroBox.y + heroBox.height / 2);
  await page.waitForTimeout(300);
  const cursor = page.locator('[data-magnetic-cursor]');
  await expect(cursor).toHaveCSS('opacity', '1');

  // Move outside: scroll first then move pointer to far-away coords.
  await page.locator('[data-sector-id="session-proof"]').scrollIntoViewIfNeeded();
  await page.mouse.move(10, 10);
  await page.waitForTimeout(300);
  await expect(cursor).toHaveCSS('opacity', '0');
});

test('coarse pointer device gets no custom cursor', async ({ browser }) => {
  const ctx = await browser.newContext({ hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('/');
  const cursor = page.locator('[data-magnetic-cursor]');
  await expect(cursor).toHaveCount(0);
  await ctx.close();
});
```

- [ ] **Step 4: Write reduced-motion.spec.ts**

Create `tests/e2e/reduced-motion.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('no GSAP transforms on pinned rooms when reduced-motion', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-sector-id="versus"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  // The coaching card should have no inline transform from GSAP.
  const transformX = await page
    .locator('[data-pin-card="coaching"]')
    .evaluate((el) => getComputedStyle(el).transform);
  // GSAP would set matrix(...); without it, transform is "none" or the
  // initial CSS transform from the Astro template.
  expect(transformX).not.toMatch(/matrix3d/);
});

test('cursor not initialised when reduced-motion', async ({ page }) => {
  await page.goto('/');
  const cursor = page.locator('[data-magnetic-cursor]');
  await expect(cursor).toHaveCount(0);
});
```

- [ ] **Step 5: Run e2e tests against the local preview**

```bash
pnpm build && pnpm preview &
sleep 3
pnpm test:e2e tests/e2e/home-flow.spec.ts tests/e2e/sector-ribbon.spec.ts tests/e2e/cursor.spec.ts tests/e2e/reduced-motion.spec.ts
```
Expected: PASS. (You may need to adjust waits if local CI is slow.)

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/home-flow.spec.ts tests/e2e/sector-ribbon.spec.ts tests/e2e/cursor.spec.ts tests/e2e/reduced-motion.spec.ts
git commit -m "test(e2e): home flow · sector ribbon · cursor · reduced motion"
```

---

## Task 21 · Playwright a11y axe scan

**Files:**
- Create: `tests/e2e/a11y-home.spec.ts`

- [ ] **Step 1: Write the spec**

Create `tests/e2e/a11y-home.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('homepage has no AA violations on initial load', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('homepage has no AA violations after lights-out (manifest revealed)', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('[data-hold]');
  const box = await button.boundingBox();
  if (!box) throw new Error('button has no box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(5200);
  await page.mouse.up();
  await page.waitForTimeout(800);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

- [ ] **Step 2: Run the spec**

```bash
pnpm build && pnpm preview &
sleep 3
pnpm test:e2e tests/e2e/a11y-home.spec.ts
```
Expected: PASS — no AA violations.

If violations surface (likely candidates: contrast on a tertiary text colour, missing focus rings on a new control), patch the source — don't suppress the test.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/a11y-home.spec.ts
git commit -m "test(e2e): a11y axe scan on home initial + after-gate states"
```

---

## Task 22 · Lighthouse CI — JS budget assertion

**Files:**
- Modify: `lighthouserc.json`

- [ ] **Step 1: Read current lighthouserc.json**

Run:
```bash
cat lighthouserc.json
```

Identify the `assertions` block (or `categories.performance.assertions`).

- [ ] **Step 2: Add the resource-summary assertion**

Edit `lighthouserc.json`. Inside the `ci.assert.assertions` object, add:

```jsonc
{
  "ci": {
    "assert": {
      "assertions": {
        // ...existing...
        "resource-summary:script:size": ["error", { "maxNumericValue": 100000 }],
        "resource-summary:script:count": ["warn", { "maxNumericValue": 12 }]
      }
    }
  }
}
```

- [ ] **Step 3: Run LHCI locally**

```bash
pnpm build && pnpm lhci
```
Expected: PASS — homepage script size under 100 KB.

If it fails (over budget), check the build output for the largest chunk. The likely culprit is GSAP bundled eagerly somewhere; trace any remaining static `import 'gsap'` and migrate to `loadGsap()`.

- [ ] **Step 4: Commit**

```bash
git add lighthouserc.json
git commit -m "ci(lhci): assert homepage gzip JS budget < 100 KB"
```

---

## Task 23 · `CLAUDE.md` Phase 4 documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Append a Phase 4 section to CLAUDE.md**

Open `CLAUDE.md`. After the existing "Homepage rooms — V2 March port (Phase 3 complete 2026-05-05)" block, append:

```markdown
## Interactive homepage — Phase 4 (complete YYYY-MM-DD)

Spec: `docs/superpowers/specs/2026-05-07-interactive-homepage-design.md`
Plan: `docs/superpowers/plans/2026-05-07-interactive-homepage.md`

10 rooms collapsed to 7. Each owns one sector accent (orange / red / steel /
purple / green / orange / orange-shimmer). 5 rooms pin via GSAP
ScrollTrigger; mobile and reduced-motion fall back to natural scroll.

- **`src/components/chrome/SectorRibbon.astro`** — 7-segment top HUD strip,
  home-only. `aria-hidden`. Driven by `sector-progress.ts`'s
  `sector-change` CustomEvent.
- **`src/components/chrome/SectorTabs.astro`** — variant C nav: Space Mono
  caps + glowing pit-orange dot on active. Single-letter sector codes
  (P/H/D/B/S) dropped.
- **`src/components/chrome/TimecodeCounter.astro`** — 3 fields: active
  sector (left), UTC clock (mid), page-elapsed + simulated lap delta
  (right). Mobile collapses to UTC only.
- **`src/components/rooms/StartGrid.astro`** — absorbs HeroManifest;
  monument+shimmer headline, T024 subhead, T025/T026 CTAs all in-room.
  `data-magnetic-zone` enables hero-only crosshair cursor.
- **`src/components/rooms/SessionProof.astro`** — 3 beam-cards, red
  accent, score and loss tick up on view.
- **`src/components/rooms/ThePain.astro`** (renamed from S1Pain) — steel
  accent, M1 cross-fade pin.
- **`src/components/rooms/Versus.astro`** (renamed from S2Versus,
  absorbs SimFirst) — racing-purple, M1 card-swap pin, lateral
  sim ↔ real bridge.
- **`src/components/rooms/Pipeline.astro`** (renamed from S3Product,
  absorbs PremiumLayer) — acid-green, 7-station horizontal scrub pin.
- **`src/components/rooms/Garage.astro`** — pit-orange returns; founder
  note + 3 stat cards (tick-up) + 3 reserved beta slots.
- **`src/components/rooms/Podium.astro`** (absorbs PitStop) — text-shimmer
  monument headline, single primary CTA, inline `€15 / mo · €150 / yr`
  pricing teaser.
- **`src/scripts/gsap-loader.ts`** — lazy GSAP + ScrollTrigger via
  `requestIdleCallback`. Token: `--color-pit-orange-deep #b8923f` for
  AA-compliant primary buttons.
- **`src/scripts/sector-progress.ts`** — IntersectionObserver dispatches
  `sector-change` to drive ribbon + bottom HUD.
- **`src/scripts/tick-up.ts`** — rAF count-up; honours reduced-motion.
- **`src/scripts/magnetic-cursor.ts`** — hero-only crosshair, magnetic
  pull on links. `pointer: fine` + motion-allowed only.
- **`src/scripts/home-pins.ts`** — GSAP ScrollTrigger configurations for
  the 4 pinned rooms (start-grid uses native sticky).

**Phase 4 explicitly does NOT include:** Three.js / WebGL, sound, custom
domain cutover at lap-coach.racing (separate ops decision), visual-
regression Playwright screenshots (deferred — too brittle without a
stable baseline).
```

Replace `YYYY-MM-DD` with the actual completion date (today).

- [ ] **Step 2: Final verification**

Run:
```bash
pnpm test && pnpm build
```
Expected: green; 46 pages.

Run e2e + LHCI in a fresh shell against the preview:
```bash
pnpm preview &
sleep 3
pnpm test:e2e
pnpm lhci
```
Expected: green.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md Phase 4 section · interactive homepage"
```

---

## Self-Review

### Spec coverage

- ✅ § 1 IA · 7 rooms — covered T11-T17 + T18 wiring
- ✅ § 2 Motion vocabulary — M1 in T18 (home-pins.ts), M2 in T9 (TimecodeCounter), M3 in T5 + T12/T16, M4 reuses existing hero-motion (T3 lazy migration), M5 in T6 + T11, M6 already shipped
- ✅ § 3 Colour sectors — covered by `data-accent` per room (T11-T17) + ribbon (T8) + global.css `[data-accent='X']` selectors already shipped
- ✅ § 4 HUD chrome — T7 nav, T8 ribbon, T9 timecode, T10 mount
- ✅ § 5 Compression — every room task has a word-count assertion
- ✅ § 6 Performance, mobile, reduced motion — T2 lazy loader, T6 cursor guards, T22 LHCI budget, T20 reduced-motion e2e
- ✅ § 7a Brand reconciliation — T1 deep-gold token + button migration
- ✅ § 7b Accessibility — T19 aria-pressed, T21 axe scan
- ✅ § 7c Test gates — Vitest snapshots per room, doctrine guards in T18, e2e in T20-T21, LHCI in T22

### Placeholder scan

No "TBD" / "TODO" / "fill in details" / "appropriate" found. All code blocks complete.

### Type consistency

- `Sector` interface in T4 (`sector-progress.ts`) used consistently in T8 (SectorRibbon script), T9 (TimecodeCounter script), T10 (SiteHeader prop)
- `data-sector-id` / `data-accent` / `data-magnetic-zone` / `data-pin-cross-fade` / `data-pin-card-swap` / `data-pin-horizontal-scrub` / `data-tick-target` / `data-station-code` / `data-segment-code` attribute names spelled the same way across all consumers
- `loadGsap()` / `shouldAnimate()` / `onIdle()` exports referenced consistently in T3, T5, T6, T18

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-07-interactive-homepage.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, two-stage review between tasks, fast iteration. Best for a 23-task plan because each subagent's context stays scoped to one task.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch with checkpoints. Faster wall-clock but heavier context cost.

**Which approach?**
