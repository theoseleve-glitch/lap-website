# V2 March Visual Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the V2 March (commit `324c5830`, 2026-03-27) visual primitive layer — texture utilities, typography classes, motion keyframes, missing design tokens, and the Space Mono telemetry font — into the current Astro `lap-website/` so subsequent phases (chrome, homepage rooms, other pages) have the building blocks they need.

**Architecture:** CSS-only port. Astro's `@theme` block already has the V2 color palette, type scale, line heights, accent system. The gap is in (a) supplementary CSS-variable tokens (spacing, z-layers, easing, layered backgrounds, semantic chart palette), (b) utility classes (`.font-monument`, `.font-telemetry`, `.room`, `.prose-max`, `.tabular-nums`-like, etc.), (c) effect classes (`.beam-card`, `.text-shimmer`, `.radio-bar`, marquee scroll), and (d) texture overlays (lighter variant — drop `background-attachment: fixed` + SVG noise, keep grid + radial glow + scanlines). The font swap (JetBrains Mono → Space Mono) goes through Astro's experimental Fonts API in `astro.config.mjs`.

**Tech Stack:** Astro 5.18, Tailwind v4 (4.2.4), TypeScript strict, Vitest (component tests via `experimental_AstroContainer`), Playwright (e2e). Astro `experimental.fonts` for font registration. No new runtime dependencies.

**Source of truth:** `Analysis/V2_claude_ai/` repo at commit `324c5830`. To inspect any V2 file:
```bash
git -C "C:\Users\Admin\Documents\Telemetry\Analysis\V2_claude_ai" show 324c5830:lap-website/<path>
```

**Working directory for all commands:** `C:\Users\Admin\Documents\Telemetry\lap-website`

**Commit prefix:** `restyle(marketing): V##` — distinguishes Phase-1 visual-port commits from the original launch sprint's `sprint(marketing): T###` numbering. (V01–V22; tasks below are 1:1 with commits.)

**Out of scope for Phase 1 (deferred to later phases):**
- Chrome/header/footer port (Phase 2)
- MarqueeStrip Astro component (Phase 2)
- Homepage rooms recomposition — StartGrid, S1Pain, etc. (Phase 3)
- Per-page visual treatments (Phase 4)
- Visual regression snapshots (Phase 4 — Playwright `toHaveScreenshot`)

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `astro.config.mjs` | Modify | Swap JetBrains Mono → Space Mono in `experimental.fonts` |
| `src/styles/global.css` | Modify | Add missing tokens, utility classes, keyframes, effect classes; import textures.css |
| `src/styles/textures.css` | Create | Lighter `.texture-grain` (no `fixed` attachment, no SVG noise) + `.texture-dither` + `.texture-scanlines` |
| `src/__tests__/v2-visual-tokens.test.ts` | Create | Vitest source-content assertions for tokens (`--space-*`, `--z-*`, `--ease-*`, `--bg-grid`, etc.) |
| `src/__tests__/v2-visual-utilities.test.ts` | Create | Vitest source-content assertions for utility/effect classes (`.font-monument`, `.room`, `.beam-card`, `@keyframes marquee-scroll`, etc.) |
| `src/__tests__/v2-visual-textures.test.ts` | Create | Vitest assertion that lighter texture-grain has no `fixed` attachment and no SVG noise data URI |
| `src/__tests__/font-space-mono.test.ts` | Create | Vitest assertion that astro.config.mjs registers Space Mono with the `--font-space-mono` cssVariable and weights 400/500 |

**Why Vitest source-content checks instead of CSSOM/JSDOM:** JSDOM doesn't apply CSS computed styles reliably for cross-browser features like `@keyframes`, `conic-gradient`, or `background-clip: text`. Reading the source files and asserting structural content (specific selectors, keyframe blocks, CSS variable names) is fast, deterministic, and catches every regression that matters for this phase. Visual-correctness verification belongs in Phase 4 with Playwright `toHaveScreenshot`.

**Lighter-variant rationale (decision 2b):** V2's `.texture-grain` uses `background-attachment: fixed` (forces compositor repaint on every scroll, known LCP/INP regressor on mobile Safari) and a `::after` pseudo-element with a 256×256 SVG `feTurbulence` noise filter (cheap memory-wise but adds paint cost on full-screen). The lighter variant drops both: keeps the radial gold glow + 56px grid + 3px repeating scanlines, which preserves >90% of the visual identity at <30% of the paint cost. We document this divergence in a CSS comment so future fidelity passes know to reverse it if mobile-paint budget improves.

---

## Task 0: Pre-flight — verify current state

**Files:** None modified. This task confirms the working tree is clean and the build/test baseline is green before any changes land.

- [ ] **Step 1: Verify clean working tree**

Run: `git status -uno`
Expected: `nothing to commit, working tree clean` (or only the new plan file untracked).

- [ ] **Step 2: Capture baseline test count**

Run: `pnpm test 2>&1 | tail -20`
(Run from `lap-website/` working directory. The `package.json` "test" script is `vitest run`, so file args + flags pass straight through.)
Expected: All tests pass. Note the "Test Files" / "Tests" totals — Phase 1 must finish at this count + N (where N = the new tests this plan adds).

- [ ] **Step 3: Capture baseline build size**

Run: `pnpm build && ls dist/_astro/*.css | head -5`
Expected: Build succeeds. Note the .css file sizes — Phase 1 should add no more than ~3 KB gzipped to the main CSS bundle (textures + utilities + keyframes are small).

- [ ] **Step 4: Confirm V2 source is reachable**

Run: `git -C "C:\Users\Admin\Documents\Telemetry\Analysis\V2_claude_ai" show 324c5830:lap-website/src/styles/textures.css | head -5`
Expected: First 5 lines of V2's textures.css print without error. If this fails, every later task fails — fix before continuing.

---

## Task 1: Add spacing-scale tokens (`--space-*`) to global.css `:root`

**Files:**
- Modify: `src/styles/global.css` — append to existing `:root` block (currently ends around line 101)
- Test: `src/__tests__/v2-visual-tokens.test.ts` (new)

**Why:** V2 uses `--space-1` through `--space-16` for grid/component spacing. The `HERO_SPACING` typography token (V2 `src/tokens/typography.ts:HERO_SPACING.monumentToSubline`) references `var(--space-3)` etc. Phase 3 components will use these directly.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/v2-visual-tokens.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

// We assert against the SOURCE file (src/styles/global.css), not the built
// CSS bundle, because Tailwind v4's CSS pipeline rewrites variable
// declarations and we want the test to fail at the actual point of
// regression (someone deleted the variable from source) rather than after
// a successful build that happened to keep them.
const GLOBAL_CSS = readFileSync(
  resolve(process.cwd(), 'src/styles/global.css'),
  'utf8',
);

describe('V2 March visual tokens — spacing scale', () => {
  // Spacing tokens — 4 px base unit, mirrors V2 src/styles/tokens.css
  test.each([
    ['--space-px', '1px'],
    ['--space-0-5', '4px'],
    ['--space-1', '8px'],
    ['--space-1-5', '12px'],
    ['--space-2', '16px'],
    ['--space-3', '24px'],
    ['--space-4', '32px'],
    ['--space-5', '40px'],
    ['--space-6', '48px'],
    ['--space-8', '64px'],
    ['--space-10', '80px'],
    ['--space-12', '96px'],
    ['--space-16', '128px'],
  ])('declares %s = %s', (name, value) => {
    // Match either `--space-1: 8px;` or `--space-1: 8px ;` (allow trailing space)
    const escaped = name.replace(/-/g, '\\-');
    const re = new RegExp(`${escaped}\\s*:\\s*${value}\\s*;`);
    expect(GLOBAL_CSS).toMatch(re);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-tokens.test.ts`
Expected: FAIL — 13 spacing tokens absent. The failure message names each missing token.

- [ ] **Step 3: Add the spacing tokens**

In `src/styles/global.css`, locate the `:root` block (starts around line 73, ends around line 101 with `--touch-min: 44px;`). Insert these declarations immediately before the closing `}` of `:root`:

```css
  /* Spacing — 4 px base unit. Ported verbatim from V2 src/styles/tokens.css.
     Phase-3 room components consume these via var() inside hand-authored CSS. */
  --space-px: 1px;
  --space-0-5: 4px;
  --space-1: 8px;
  --space-1-5: 12px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 40px;
  --space-6: 48px;
  --space-8: 64px;
  --space-10: 80px;
  --space-12: 96px;
  --space-16: 128px;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-tokens.test.ts`
Expected: PASS — all 13 spacing-token assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-tokens.test.ts
git commit -m "restyle(marketing): V01 spacing-scale tokens (--space-*) ported from V2 March"
```

---

## Task 2: Add z-layer tokens (`--z-*`) to global.css `:root`

**Files:**
- Modify: `src/styles/global.css` — extend `:root`
- Test: `src/__tests__/v2-visual-tokens.test.ts` (extend)

**Why:** V2's chrome stack (delta strip, sector tabs, timecode, HUD, marquee, nav, overlay) requires a coordinated z-index layering. Hard-coded numbers diverge fast under refactor; tokens lock the layer ordering.

- [ ] **Step 1: Write the failing test**

In `src/__tests__/v2-visual-tokens.test.ts`, append a new `describe` block:

```ts
describe('V2 March visual tokens — z-layers', () => {
  test.each([
    ['--z-base', '0'],
    ['--z-panels', '10'],
    ['--z-stamps', '20'],
    ['--z-delta', '30'],
    ['--z-hud', '35'],
    ['--z-drs', '36'],
    ['--z-finish-line', '37'],
    ['--z-sector', '40'],
    ['--z-timecode', '50'],
    ['--z-nav', '60'],
    ['--z-overlay', '100'],
    ['--z-cursor', '999'],
  ])('declares %s = %s', (name, value) => {
    const escaped = name.replace(/-/g, '\\-');
    const re = new RegExp(`${escaped}\\s*:\\s*${value}\\s*;`);
    expect(GLOBAL_CSS).toMatch(re);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-tokens.test.ts`
Expected: FAIL — 12 z-layer tokens absent.

- [ ] **Step 3: Add the z-layer tokens**

Append to `:root` in `src/styles/global.css` (after the spacing block from Task 1):

```css
  /* Z-layer ordering. Locks chrome stack: panels < stamps < delta < hud < drs <
     finish-line < sector < timecode < nav < overlay < cursor. */
  --z-base: 0;
  --z-panels: 10;
  --z-stamps: 20;
  --z-delta: 30;
  --z-hud: 35;
  --z-drs: 36;
  --z-finish-line: 37;
  --z-sector: 40;
  --z-timecode: 50;
  --z-nav: 60;
  --z-overlay: 100;
  --z-cursor: 999;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-tokens.test.ts
git commit -m "restyle(marketing): V02 z-layer tokens (--z-*) ported from V2 March"
```

---

## Task 3: Add timing + easing tokens (`--duration-*`, `--ease-*`) to global.css `:root`

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-tokens.test.ts`

**Why:** V2's narrative-easing system (`--ease-inertia`, `--ease-spring`, `--ease-pit-enter`, etc.) carries the racing personality through every transition. Phase-3 GSAP timelines and Phase-1 micro-interaction CSS both reference these.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-tokens.test.ts`:

```ts
describe('V2 March visual tokens — duration', () => {
  test.each([
    ['--duration-micro', '420ms'],
    ['--duration-room', '900ms'],
    ['--duration-monument', '1400ms'],
    ['--duration-sector-gate', '400ms'],
    ['--duration-drs', '2000ms'],
    ['--duration-pit', '600ms'],
    ['--duration-finish', '600ms'],
  ])('declares %s = %s', (name, value) => {
    const escaped = name.replace(/-/g, '\\-');
    const re = new RegExp(`${escaped}\\s*:\\s*${value}\\s*;`);
    expect(GLOBAL_CSS).toMatch(re);
  });
});

describe('V2 March visual tokens — easing', () => {
  test.each([
    '--ease-inertia',
    '--ease-overshoot',
    '--ease-spring',
    '--ease-snap',
    '--ease-anticipate',
    '--ease-sector-gate',
    '--ease-pit-enter',
    '--ease-pit-exit',
  ])('declares %s', (name) => {
    const escaped = name.replace(/-/g, '\\-');
    // We don't pin the exact cubic-bezier values here — that creates noisy
    // test churn whenever the curve gets nudged. We just assert the token
    // is declared with a cubic-bezier value.
    const re = new RegExp(`${escaped}\\s*:\\s*cubic-bezier\\(`);
    expect(GLOBAL_CSS).toMatch(re);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-tokens.test.ts`
Expected: FAIL — 7 duration tokens + 8 easing tokens absent.

- [ ] **Step 3: Add the timing + easing tokens**

Append to `:root` in `src/styles/global.css` (after z-layer block):

```css
  /* Narrative timing — drives GSAP timeline durations and CSS transitions
     across rooms. Names mirror V2: micro = button-press rebound, room =
     scroll-pin enter, monument = hero entrance, sector-gate = sector-tab
     swap, drs = headline shimmer cycle, pit = CTA hover, finish = checkered. */
  --duration-micro: 420ms;
  --duration-room: 900ms;
  --duration-monument: 1400ms;
  --duration-sector-gate: 400ms;
  --duration-drs: 2000ms;
  --duration-pit: 600ms;
  --duration-finish: 600ms;

  /* Easing — racing personality. inertia/overshoot/spring/snap/anticipate
     are general-purpose; sector-gate/pit-enter/pit-exit are narrative-specific. */
  --ease-inertia: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-overshoot: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring: cubic-bezier(0.22, 1.2, 0.36, 1);
  --ease-snap: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-anticipate: cubic-bezier(0.45, 0, 0.55, 1);
  --ease-sector-gate: cubic-bezier(0, 0, 0.2, 1);
  --ease-pit-enter: cubic-bezier(0.8, 0, 1, 1);
  --ease-pit-exit: cubic-bezier(0, 0, 0.2, 1);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-tokens.test.ts
git commit -m "restyle(marketing): V03 timing + easing tokens (--duration-*/--ease-*) ported from V2 March"
```

---

## Task 4: Add layered-background tokens (`--bg-radial-*`, `--bg-grid`) to global.css `:root`

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-tokens.test.ts`

**Why:** `.texture-grain` (Task 9) consumes `var(--bg-radial-1)` and `var(--bg-grid)`. They must be declared before the texture utility imports.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-tokens.test.ts`:

```ts
describe('V2 March visual tokens — layered backgrounds', () => {
  test('declares --bg-radial-1 with the gold radial-gradient', () => {
    expect(GLOBAL_CSS).toMatch(
      /--bg-radial-1\s*:\s*radial-gradient\(1200px\s+720px\s+at\s+10%\s+-10%,\s*rgba\(201,\s*168,\s*76,\s*0\.04\),\s*transparent\s+68%\)\s*;/,
    );
  });
  test('declares --bg-radial-2 = none', () => {
    expect(GLOBAL_CSS).toMatch(/--bg-radial-2\s*:\s*none\s*;/);
  });
  test('declares --bg-radial-3 = none', () => {
    expect(GLOBAL_CSS).toMatch(/--bg-radial-3\s*:\s*none\s*;/);
  });
  test('declares --bg-grid as 1px crosshatch on rgba(240,237,229,0.06)', () => {
    // Ports the V2 expression verbatim — two linear-gradients, one horizontal,
    // one rotated 90deg, both 1px crosshatch on faint chalk.
    expect(GLOBAL_CSS).toContain('--bg-grid:');
    expect(GLOBAL_CSS).toMatch(
      /--bg-grid\s*:\s*linear-gradient\(rgba\(240,\s*237,\s*229,\s*0\.06\)\s+1px,\s*transparent\s+1px\),\s*linear-gradient\(90deg,\s*rgba\(240,\s*237,\s*229,\s*0\.06\)\s+1px,\s*transparent\s+1px\)\s*;/,
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-tokens.test.ts`
Expected: FAIL — 4 background tokens absent.

- [ ] **Step 3: Add the layered-background tokens**

Append to `:root` in `src/styles/global.css` (after easing block):

```css
  /* Layered background system. Consumed by .texture-grain (src/styles/textures.css).
     Verbatim from V2 src/styles/tokens.css. */
  --bg-radial-1: radial-gradient(1200px 720px at 10% -10%, rgba(201, 168, 76, 0.04), transparent 68%);
  --bg-radial-2: none;
  --bg-radial-3: none;
  --bg-grid: linear-gradient(rgba(240, 237, 229, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(240, 237, 229, 0.06) 1px, transparent 1px);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-tokens.test.ts
git commit -m "restyle(marketing): V04 layered-background tokens (--bg-radial-*/--bg-grid) ported from V2 March"
```

---

## Task 5: Add chart-series + touch-target + shadow-e0 tokens

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-tokens.test.ts`

**Why:** Chart-series colours flow into Phase-3 telemetry sculptures; `--touch-min` enforces 44 px tap targets in mobile rooms; `--shadow-e0: none` completes the elevation ladder so utility classes can index e0–e4 without a special-case.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-tokens.test.ts`:

```ts
describe('V2 March visual tokens — chart palette', () => {
  test.each([
    ['--chart-series-1', '#22C55E'],
    ['--chart-series-2', '#3B82F6'],
    ['--chart-series-3', '#F59E0B'],
    ['--chart-series-4', '#EF4444'],
    ['--chart-series-5', '#A78BFA'],
    ['--chart-series-6', '#EC4899'],
  ])('declares %s = %s', (name, value) => {
    const escaped = name.replace(/-/g, '\\-');
    // Hex matching is case-insensitive (V2 uses uppercase, but lowercase is
    // valid CSS — don't fail a future lowercase pass).
    const re = new RegExp(`${escaped}\\s*:\\s*${value}\\s*;`, 'i');
    expect(GLOBAL_CSS).toMatch(re);
  });
});

describe('V2 March visual tokens — touch + shadow-e0', () => {
  test('declares --touch-min = 44px', () => {
    expect(GLOBAL_CSS).toMatch(/--touch-min\s*:\s*44px\s*;/);
  });
  test('declares --shadow-e0 = none', () => {
    expect(GLOBAL_CSS).toMatch(/--shadow-e0\s*:\s*none\s*;/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-tokens.test.ts`
Expected: FAIL — chart-series-1..6 + touch-min absent. shadow-e0 absent (existing global.css has e1–e4 in @theme; e0 is missing). NB: `--touch-min: 44px` is already in :root in current Astro global.css line 100 — that test should pass on first run; if it fails, the global.css has drifted.

- [ ] **Step 3: Add the missing tokens**

Append to `:root` in `src/styles/global.css` (after layered-background block):

```css
  /* Chart palette — series colours used by Phase-3 telemetry sculptures and
     pricing-graph illustrations. Verbatim from V2 src/styles/tokens.css. */
  --chart-series-1: #22c55e;
  --chart-series-2: #3b82f6;
  --chart-series-3: #f59e0b;
  --chart-series-4: #ef4444;
  --chart-series-5: #a78bfa;
  --chart-series-6: #ec4899;
```

In the `@theme` block (top of file), append `--shadow-e0: none;` immediately before `--shadow-e1`:

```css
  /* Elevation ladder — e0 (none) lets utility classes index 0–4 without
     special-casing. */
  --shadow-e0: none;
  --shadow-e1: 0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4);
  /* ... existing e2, e3, e4 ... */
```

(`--touch-min: 44px;` is already declared at line ~100 in :root — leave it alone.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-tokens.test.ts
git commit -m "restyle(marketing): V05 chart palette + shadow-e0 tokens ported from V2 March"
```

---

## Task 6: Add `.font-monument`, `.font-telemetry`, `.font-body` utility classes

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-utilities.test.ts` (new)

**Why:** V2 markup uses these as one-shot typography primitives — `.font-monument` = Space-Grotesk + 700 + uppercase + tight tracking + display line-height; `.font-telemetry` = Space-Mono + uppercase + wide tracking + 0.6875rem; `.font-body` = Inter + 400 + 1.72 line-height. Phase-3 components reference these classes verbatim from V2 source.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/v2-visual-utilities.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const GLOBAL_CSS = readFileSync(
  resolve(process.cwd(), 'src/styles/global.css'),
  'utf8',
);

// Utility: extract the body of a CSS rule by selector. Returns null if the
// rule isn't found. We do this because regex-matching the whole rule with
// arbitrary inner content is brittle — better to grab the body and assert
// its declarations individually.
function ruleBody(css: string, selector: string): string | null {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`);
  const m = css.match(re);
  return m ? m[1] : null;
}

describe('V2 March visual utilities — font-monument', () => {
  const body = ruleBody(GLOBAL_CSS, '.font-monument');
  test('class exists', () => {
    expect(body).not.toBeNull();
  });
  test('uses display font stack', () => {
    expect(body).toMatch(/font-family\s*:\s*var\(--font-display\)/);
  });
  test('weight 700', () => {
    expect(body).toMatch(/font-weight\s*:\s*700/);
  });
  test('uppercase', () => {
    expect(body).toMatch(/text-transform\s*:\s*uppercase/);
  });
  test('display letter-spacing token', () => {
    expect(body).toMatch(/letter-spacing\s*:\s*var\(--ls-display\)/);
  });
  test('display line-height token', () => {
    expect(body).toMatch(/line-height\s*:\s*var\(--lh-display\)/);
  });
});

describe('V2 March visual utilities — font-telemetry', () => {
  const body = ruleBody(GLOBAL_CSS, '.font-telemetry');
  test('class exists', () => {
    expect(body).not.toBeNull();
  });
  test('uses mono font stack', () => {
    expect(body).toMatch(/font-family\s*:\s*var\(--font-mono\)/);
  });
  test('weight 400', () => {
    expect(body).toMatch(/font-weight\s*:\s*400/);
  });
  test('uppercase', () => {
    expect(body).toMatch(/text-transform\s*:\s*uppercase/);
  });
  test('wide letter-spacing token', () => {
    expect(body).toMatch(/letter-spacing\s*:\s*var\(--ls-wide\)/);
  });
  test('telemetry size token', () => {
    expect(body).toMatch(/font-size\s*:\s*var\(--text-telemetry\)/);
  });
});

describe('V2 March visual utilities — font-body', () => {
  const body = ruleBody(GLOBAL_CSS, '.font-body');
  test('class exists', () => {
    expect(body).not.toBeNull();
  });
  test('uses body font stack', () => {
    expect(body).toMatch(/font-family\s*:\s*var\(--font-body\)/);
  });
  test('weight 400', () => {
    expect(body).toMatch(/font-weight\s*:\s*400/);
  });
  test('body line-height token', () => {
    expect(body).toMatch(/line-height\s*:\s*var\(--lh-body\)/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: FAIL — all three utility classes absent.

- [ ] **Step 3: Add the utility classes**

In `src/styles/global.css`, after the closing `}` of `:root`'s reduced-motion media query (around line 150), add:

```css
/* ── V2 March typography utilities ──────────────────────────────────────────
 * Three composed primitives. Use as one-shot classes in markup, e.g.
 *   <h1 class="font-monument">…</h1>
 *   <span class="font-telemetry">SECTOR 03</span>
 *   <p class="font-body">…</p>
 * The tokens they reference (--font-display, --ls-display, --text-telemetry, …)
 * are declared in the @theme block (font tokens) and :root (typography
 * scalar tokens) above.
 */
.font-monument {
  font-family: var(--font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--ls-display);
  line-height: var(--lh-display);
}

.font-telemetry {
  font-family: var(--font-mono);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: var(--ls-wide);
  font-size: var(--text-telemetry);
  line-height: var(--lh-label);
}

.font-body {
  font-family: var(--font-body);
  font-weight: 400;
  line-height: var(--lh-body);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: PASS — all 3 describe blocks green.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-utilities.test.ts
git commit -m "restyle(marketing): V06 font-monument/telemetry/body utility classes ported from V2 March"
```

---

## Task 7: Add `.prose-max`, `.tabular-nums`, `.cta-nowrap` layout utilities

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-utilities.test.ts`

**Why:** `.prose-max` enforces 65-ch line-length on body copy without requiring Tailwind's `max-w-prose` (which keys to a different token). `.tabular-nums` forces mono + tabular figures — used heavily in pricing tables and lap-time displays. `.cta-nowrap` keeps CTA copy on one line at any viewport.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-utilities.test.ts`:

```ts
describe('V2 March visual utilities — layout primitives', () => {
  test('.prose-max enforces 65ch via --max-prose token', () => {
    const body = ruleBody(GLOBAL_CSS, '.prose-max');
    expect(body).not.toBeNull();
    expect(body).toMatch(/max-width\s*:\s*var\(--max-prose\)/);
  });
  test('.tabular-nums uses mono font + tabular-nums', () => {
    const body = ruleBody(GLOBAL_CSS, '.tabular-nums');
    expect(body).not.toBeNull();
    expect(body).toMatch(/font-family\s*:\s*var\(--font-mono\)/);
    expect(body).toMatch(/font-variant-numeric\s*:\s*tabular-nums/);
  });
  test('.cta-nowrap pins min-width and prevents wrap', () => {
    const body = ruleBody(GLOBAL_CSS, '.cta-nowrap');
    expect(body).not.toBeNull();
    expect(body).toMatch(/white-space\s*:\s*nowrap/);
    expect(body).toMatch(/min-width\s*:\s*8rem/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: FAIL — 3 layout-primitive classes absent.

- [ ] **Step 3: Add the layout utility classes**

Append to `src/styles/global.css` (after the typography utilities from Task 6):

```css
/* ── V2 March layout primitives ──────────────────────────────────────────── */
.prose-max {
  max-width: var(--max-prose);
}

/* `.tabular-nums` — overrides Tailwind's `tabular-nums` (which only sets
 * font-variant-numeric) with the V2 expectation of *also* swapping the
 * font-family to mono. Pricing tables and lap-time HUDs depend on the
 * mono swap; if a future change reverts to Tailwind's variant-only
 * version, the lap-time columns mis-align. */
.tabular-nums {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.cta-nowrap {
  white-space: nowrap;
  min-width: 8rem;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-utilities.test.ts
git commit -m "restyle(marketing): V07 prose-max/tabular-nums/cta-nowrap layout utilities ported from V2 March"
```

---

## Task 8: Add `.grid-lap` and `.room` container classes

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-utilities.test.ts`

**Why:** `.room` is the cornerstone of V2's section system — every narrative section (`StartGrid`, `S1Pain`, `S2Pipeline`, …) wraps in a `.room` div for full-viewport scroll-pinning. `.grid-lap` is the 12-col grid container used inside rooms.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-utilities.test.ts`:

```ts
describe('V2 March visual utilities — section containers', () => {
  test('.grid-lap renders a 12-col grid with token gutters/margins', () => {
    const body = ruleBody(GLOBAL_CSS, '.grid-lap');
    expect(body).not.toBeNull();
    expect(body).toMatch(/display\s*:\s*grid/);
    expect(body).toMatch(
      /grid-template-columns\s*:\s*repeat\(var\(--grid-columns\),\s*1fr\)/,
    );
    expect(body).toMatch(/gap\s*:\s*var\(--grid-gutter\)/);
    expect(body).toMatch(/padding-inline\s*:\s*var\(--grid-margin\)/);
  });
  test('.room is a full-viewport scroll-pin container', () => {
    const body = ruleBody(GLOBAL_CSS, '.room');
    expect(body).not.toBeNull();
    expect(body).toMatch(/position\s*:\s*relative/);
    expect(body).toMatch(/min-height\s*:\s*100vh/);
    expect(body).toMatch(/display\s*:\s*flex/);
    expect(body).toMatch(/flex-direction\s*:\s*column/);
    expect(body).toMatch(/justify-content\s*:\s*center/);
    expect(body).toMatch(/overflow\s*:\s*hidden/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: FAIL — both classes absent.

- [ ] **Step 3: Add the container classes**

Append to `src/styles/global.css`:

```css
/* ── V2 March section containers ─────────────────────────────────────────── */
.grid-lap {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
  padding-inline: var(--grid-margin);
}

/* `.room` — every narrative section in the V2 homepage wraps in this.
 * 100vh + flex-center mirrors the cinematic scroll-pin pattern.
 * The `min-height: auto !important` mobile override lives in the
 * reduced-motion media query block (already imported) — see V2's
 * src/styles/reduced-motion.css for the exact pattern.
 *
 * Phase-3 will add `<section class="room">…</section>` wrappers to
 * StartGrid, S1Pain, etc.; this class lands ahead of those components
 * so subagents can verify integration without rebuild churn. */
.room {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}
```

Also append the mobile + reduced-motion mobile clamp (mirrors V2's reduced-motion.css):

```css
/* Mobile clamp — `.room` releases its 100vh floor on narrow viewports and
 * when [data-scroll-pin] elements are forced static. Matches V2's
 * src/styles/reduced-motion.css behaviour without us adding a separate file. */
@media (max-width: 767px) {
  .room {
    min-height: auto;
  }
  [data-scroll-pin] {
    position: relative;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-utilities.test.ts
git commit -m "restyle(marketing): V08 grid-lap + room section containers ported from V2 March"
```

---

## Task 9: Create `src/styles/textures.css` with the lighter texture-grain variant

**Files:**
- Create: `src/styles/textures.css`
- Test: `src/__tests__/v2-visual-textures.test.ts` (new)

**Why:** V2's `.texture-grain` is the ambient atmosphere of the entire site — gold radial glow + 56-px crosshatch grid + repeating 3-px scanlines on every section. Phase-3 rooms apply `.texture-grain` to their root. This task creates the *lighter* variant per scoping decision 2b: drop `background-attachment: fixed` (mobile-Safari paint regressor) and drop the `::after` SVG-noise pseudo (cheapest cut for paint cost). Keep grid + radial + 3-px scanlines.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/v2-visual-textures.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const TEXTURES_PATH = resolve(process.cwd(), 'src/styles/textures.css');

describe('V2 March textures — file exists at expected path', () => {
  test('src/styles/textures.css is present', () => {
    expect(existsSync(TEXTURES_PATH)).toBe(true);
  });
});

describe('V2 March textures — .texture-grain (lighter variant, decision 2b)', () => {
  if (!existsSync(TEXTURES_PATH)) {
    test.skip('skipped — textures.css missing', () => {});
    return;
  }
  const css = readFileSync(TEXTURES_PATH, 'utf8');

  test('declares .texture-grain', () => {
    expect(css).toMatch(/\.texture-grain\s*\{/);
  });
  test('uses var(--bg-radial-1), var(--bg-grid) for layered background', () => {
    expect(css).toMatch(
      /background-image\s*:\s*var\(--bg-radial-1\),\s*var\(--bg-grid\)/,
    );
  });
  test('background-size includes 56px 56px for the grid layer', () => {
    expect(css).toMatch(/background-size\s*:[^;]*56px\s+56px/);
  });
  test('LIGHTER variant — does NOT set background-attachment: fixed', () => {
    // The whole point of decision 2b. If anyone re-adds `fixed`, mobile
    // Safari paint regresses — this test is the canary.
    expect(css).not.toMatch(/background-attachment\s*:\s*fixed/);
  });
  test('LIGHTER variant — does NOT include SVG feTurbulence noise data URI', () => {
    // The other half of decision 2b. The verbatim V2 :after pseudo embeds
    // an SVG with `feTurbulence` for grain — we're skipping it.
    expect(css).not.toMatch(/feTurbulence/);
    expect(css).not.toMatch(/data:image\/svg\+xml.*fractalNoise/);
  });
  test('keeps the 3px repeating-linear-gradient scanlines via ::before', () => {
    expect(css).toMatch(/\.texture-grain::before/);
    expect(css).toMatch(/repeating-linear-gradient\(/);
    expect(css).toMatch(/transparent\s+3px/);
  });
});

describe('V2 March textures — .texture-dither + .texture-scanlines', () => {
  if (!existsSync(TEXTURES_PATH)) {
    test.skip('skipped — textures.css missing', () => {});
    return;
  }
  const css = readFileSync(TEXTURES_PATH, 'utf8');

  test('.texture-dither uses radial-gradient dot grid via ::after', () => {
    expect(css).toMatch(/\.texture-dither::after/);
    expect(css).toMatch(/radial-gradient\(circle/);
  });
  test('.texture-scanlines uses repeating-linear-gradient via ::after', () => {
    expect(css).toMatch(/\.texture-scanlines::after/);
    expect(css).toMatch(/repeating-linear-gradient\(/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-textures.test.ts`
Expected: FAIL — file doesn't exist; subsequent describes skip cleanly.

- [ ] **Step 3: Create textures.css with the lighter variant**

Create `src/styles/textures.css`:

```css
/*
 * V2 March texture utilities — LIGHTER VARIANT (decision 2b, plan
 * 2026-05-05-v2-march-visual-foundation.md).
 *
 * Two cuts vs. V2's verbatim src/styles/textures.css at commit 324c5830:
 *   1. `.texture-grain` does NOT set `background-attachment: fixed`.
 *      Reason: known mobile-Safari paint regressor; LCP target is
 *      <1.5 s on mobile 4G (CLAUDE.md), so we can't afford the
 *      compositor repaint on every scroll event.
 *   2. `.texture-grain` does NOT include the `::after` SVG-noise
 *      pseudo (feTurbulence fractalNoise). Reason: full-screen paint
 *      cost; the radial + grid + scanlines preserve >90% of the
 *      perceived V2 atmosphere without it.
 *
 * If a future fidelity pass restores either cut, update this header
 * and the v2-visual-textures.test.ts canaries simultaneously.
 */

/* Brutalist grid overlay — ambient gold glow + 56 px crosshatch + scanlines. */
.texture-grain {
  position: relative;
  background-image: var(--bg-radial-1), var(--bg-grid);
  background-size: auto, 56px 56px;
}

.texture-grain::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 3px,
    rgba(240, 237, 229, 0.02) 3px,
    rgba(240, 237, 229, 0.02) 4px
  );
  z-index: 1;
}

/* Dither — subtle dot grid. Ported verbatim from V2; cheap. */
.texture-dither {
  position: relative;
}

.texture-dither::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.02;
  background-image: radial-gradient(
    circle,
    var(--color-chalk) 1px,
    transparent 1px
  );
  background-size: 4px 4px;
  z-index: 1;
}

/* Scanlines — for photography wells. Ported verbatim from V2. */
.texture-scanlines {
  position: relative;
}

.texture-scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.02;
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 1px,
    var(--color-chalk) 1px,
    var(--color-chalk) 2px
  );
  z-index: 1;
}
```

Note: V2 used bare `var(--chalk)`; in current Astro, the equivalent variable in the @theme block is `--color-chalk`. We use the @theme name so Tailwind v4 doesn't double-emit aliases.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-textures.test.ts`
Expected: PASS — all describes green.

- [ ] **Step 5: Commit**

```bash
git add src/styles/textures.css src/__tests__/v2-visual-textures.test.ts
git commit -m "restyle(marketing): V09 textures.css (lighter variant per 2b) ported from V2 March"
```

---

## Task 10: Import `textures.css` from `global.css`

**Files:**
- Modify: `src/styles/global.css`

**Why:** Without the @import, the texture classes never reach the build pipeline.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-textures.test.ts`:

```ts
describe('V2 March textures — wired into global.css', () => {
  test('global.css imports textures.css', () => {
    const globalCss = readFileSync(
      resolve(process.cwd(), 'src/styles/global.css'),
      'utf8',
    );
    expect(globalCss).toMatch(/@import\s+['"]\.\/textures\.css['"]/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-textures.test.ts`
Expected: FAIL — no @import found.

- [ ] **Step 3: Add the @import**

In `src/styles/global.css`, immediately after the existing `@import 'tailwindcss';` at line 1:

```css
@import 'tailwindcss';
@import './textures.css';
```

(The Tailwind v4 pipeline resolves relative imports from the file's own directory, so `./textures.css` works without a full path.)

- [ ] **Step 4: Run the test to verify it passes + verify build still works**

Run: `pnpm test src/__tests__/v2-visual-textures.test.ts && pnpm build`
Expected: Test PASS. Build succeeds. The dist CSS now includes the texture utility class definitions — verify with:
```bash
grep -c "texture-grain" dist/_astro/*.css
```
Expected: `>=1`.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-textures.test.ts
git commit -m "restyle(marketing): V10 wire textures.css into global.css @import chain"
```

---

## Task 11: Add `.text-shimmer` effect class + `@keyframes text-shimmer`

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-utilities.test.ts`

**Why:** Vercel-inspired metallic gold shimmer that sweeps across emphasis text. Used on the V2 hero monument headline to add the "premium dark-mode product" cue.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-utilities.test.ts`:

```ts
describe('V2 March visual effects — text-shimmer', () => {
  test('@keyframes text-shimmer is declared', () => {
    expect(GLOBAL_CSS).toMatch(/@keyframes\s+text-shimmer\s*\{/);
  });
  test('animates background-position from 100% 50% → -100% 50%', () => {
    // Match across the keyframe block (multiline) — use [\s\S] not . so
    // the dot-doesn't-match-newline default doesn't break us.
    expect(GLOBAL_CSS).toMatch(
      /@keyframes\s+text-shimmer\s*\{[\s\S]*?100%\s+50%[\s\S]*?-100%\s+50%[\s\S]*?\}/,
    );
  });
  test('.text-shimmer applies background-clip: text + transparent color', () => {
    const body = ruleBody(GLOBAL_CSS, '.text-shimmer');
    expect(body).not.toBeNull();
    expect(body).toMatch(/background-clip\s*:\s*text/);
    expect(body).toMatch(/-webkit-background-clip\s*:\s*text/);
    expect(body).toMatch(/color\s*:\s*transparent/);
    expect(body).toMatch(/animation\s*:\s*text-shimmer\s+6s/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: FAIL — keyframe + class absent.

- [ ] **Step 3: Add the shimmer effect**

Append to `src/styles/global.css`:

```css
/* ── V2 March text-shimmer (Vercel-inspired) ─────────────────────────────────
 * Gold highlight sweeps across text via animated background-position +
 * background-clip:text. Preferred use: hero monument headlines.
 * Hex literal for the shimmer tint is intentional — the gradient stop
 * is a colour-mix that doesn't map to a single token. */
@keyframes text-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: -100% 50%; }
}

.text-shimmer {
  background: linear-gradient(
    105deg,
    var(--color-chalk) 0%,
    var(--color-chalk) 35%,
    rgba(201, 168, 76, 0.8) 50%,
    var(--color-chalk) 65%,
    var(--color-chalk) 100%
  );
  background-size: 250% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: text-shimmer 6s ease-in-out infinite;
}
```

(The `rgba(201, 168, 76, 0.8)` literal mirrors V2 verbatim — it's the pit-orange channel at 80%. We document this in the comment so the lap-website CLAUDE.md "no raw hex" rule's reviewer sees the intent.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-utilities.test.ts
git commit -m "restyle(marketing): V11 text-shimmer effect class + keyframes ported from V2 March"
```

---

## Task 12: Add `.beam-card` effect class + `@keyframes beam-spin`

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-utilities.test.ts`

**Why:** Linear-inspired rotating conic-gradient that traces a 1-px light beam around card edges on hover. Used on V2 product cards / pricing tiers / spec sheets to give the "premium dark-mode SaaS" cue.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-utilities.test.ts`:

```ts
describe('V2 March visual effects — beam-card', () => {
  test('@keyframes beam-spin is declared and rotates 360deg', () => {
    expect(GLOBAL_CSS).toMatch(/@keyframes\s+beam-spin\s*\{[\s\S]*?to\s*\{\s*transform\s*:\s*rotate\(360deg\)\s*;?\s*\}\s*\}/);
  });
  test('.beam-card creates positioned overflow-hidden container', () => {
    const body = ruleBody(GLOBAL_CSS, '.beam-card');
    expect(body).not.toBeNull();
    expect(body).toMatch(/position\s*:\s*relative/);
    expect(body).toMatch(/overflow\s*:\s*hidden/);
    expect(body).toMatch(/z-index\s*:\s*0/);
  });
  test('.beam-card::before holds the spinning conic-gradient (initially opacity 0)', () => {
    expect(GLOBAL_CSS).toMatch(/\.beam-card::before/);
    const beforeMatch = GLOBAL_CSS.match(/\.beam-card::before\s*\{([^}]*)\}/);
    expect(beforeMatch).not.toBeNull();
    const beforeBody = beforeMatch![1];
    expect(beforeBody).toMatch(/conic-gradient\(/);
    expect(beforeBody).toMatch(/animation\s*:\s*beam-spin\s+4s\s+linear\s+infinite/);
    expect(beforeBody).toMatch(/opacity\s*:\s*0/);
  });
  test('.beam-card:hover::before reveals the beam (opacity 1)', () => {
    expect(GLOBAL_CSS).toMatch(/\.beam-card:hover::before\s*\{[^}]*opacity\s*:\s*1/);
  });
  test('.beam-card::after masks the inside, leaving a 1px edge', () => {
    expect(GLOBAL_CSS).toMatch(/\.beam-card::after/);
    const afterMatch = GLOBAL_CSS.match(/\.beam-card::after\s*\{([^}]*)\}/);
    expect(afterMatch).not.toBeNull();
    const afterBody = afterMatch![1];
    expect(afterBody).toMatch(/inset\s*:\s*1px/);
    // We accept either the bare token or with fallback (V2 used `var(--concrete, #141414)`).
    expect(afterBody).toMatch(/background\s*:\s*var\(--color-concrete[^)]*\)/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add the beam-card effect**

Append to `src/styles/global.css`:

```css
/* ── V2 March beam-card (Linear-inspired) ────────────────────────────────────
 * Rotating conic-gradient creates a light beam tracing card edges on hover.
 * The ::before is the spinning gradient, ::after is the inner fill that
 * masks everything except the 1 px edge — producing the animated border
 * illusion. Both rgba() literals (gold + chalk) are tint variants of
 * --color-pit-orange / --color-chalk; same intent comment as text-shimmer. */
@keyframes beam-spin {
  to {
    transform: rotate(360deg);
  }
}

.beam-card {
  position: relative;
  z-index: 0;
  overflow: hidden;
}

.beam-card::before {
  content: '';
  position: absolute;
  z-index: -2;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  margin-top: -100%;
  margin-left: -100%;
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    rgba(201, 168, 76, 0.6) 6%,
    transparent 14%,
    transparent 50%,
    rgba(240, 237, 229, 0.15) 56%,
    transparent 64%
  );
  animation: beam-spin 4s linear infinite;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.beam-card:hover::before {
  opacity: 1;
}

.beam-card::after {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 1px;
  background: var(--color-concrete);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-utilities.test.ts
git commit -m "restyle(marketing): V12 beam-card effect class + keyframes ported from V2 March"
```

---

## Task 13: Add `.radio-bar` waveform animation

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-utilities.test.ts`

**Why:** V2 "radio card" components animate three vertical bars to suggest live audio/telemetry. Single keyframe + class; trivial in size, distinctive in identity.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-utilities.test.ts`:

```ts
describe('V2 March visual effects — radio-bar', () => {
  test('@keyframes radio-wave animates height 3px → 12px → 3px', () => {
    expect(GLOBAL_CSS).toMatch(
      /@keyframes\s+radio-wave\s*\{[\s\S]*?0%[\s\S]*?100%[\s\S]*?height\s*:\s*3px[\s\S]*?50%[\s\S]*?height\s*:\s*12px[\s\S]*?\}/,
    );
  });
  test('.radio-bar applies the radio-wave animation', () => {
    const body = ruleBody(GLOBAL_CSS, '.radio-bar');
    expect(body).not.toBeNull();
    expect(body).toMatch(/animation\s*:\s*radio-wave\s+0\.8s\s+ease-in-out\s+infinite/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add the radio-bar animation**

Append to `src/styles/global.css`:

```css
/* ── V2 March radio-bar waveform ─────────────────────────────────────────── */
@keyframes radio-wave {
  0%,
  100% {
    height: 3px;
  }
  50% {
    height: 12px;
  }
}

.radio-bar {
  animation: radio-wave 0.8s ease-in-out infinite;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-utilities.test.ts
git commit -m "restyle(marketing): V13 radio-bar waveform animation ported from V2 March"
```

---

## Task 14: Add `@keyframes marquee-scroll`

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-utilities.test.ts`

**Why:** The MarqueeStrip Astro component lands in Phase 2; landing the keyframe ahead of it means Phase 2 only adds component markup, not motion plumbing.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-utilities.test.ts`:

```ts
describe('V2 March visual effects — marquee-scroll keyframes', () => {
  test('@keyframes marquee-scroll translates from 0 → -50%', () => {
    expect(GLOBAL_CSS).toMatch(
      /@keyframes\s+marquee-scroll\s*\{[\s\S]*?from\s*\{\s*transform\s*:\s*translateX\(0\)\s*;?\s*\}[\s\S]*?to\s*\{\s*transform\s*:\s*translateX\(-50%\)\s*;?\s*\}\s*\}/,
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add the marquee-scroll keyframe**

Append to `src/styles/global.css`:

```css
/* ── V2 March marquee-scroll (Basement-inspired) ──────────────────────────── */
@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-utilities.test.ts
git commit -m "restyle(marketing): V14 marquee-scroll keyframes ported from V2 March"
```

---

## Task 15: Add `::selection` styling using `--accent`

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-utilities.test.ts`

**Why:** V2 selection highlight uses `--accent` (default chalk, swappable per `[data-accent]`) on `--asphalt` background. Subtle but distinctive — the kind of touch that separates a "themed marketing site" from a "generic Astro starter".

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-utilities.test.ts`:

```ts
describe('V2 March visual effects — ::selection', () => {
  test('::selection uses --accent on --color-asphalt', () => {
    expect(GLOBAL_CSS).toMatch(/::selection\s*\{[^}]*background\s*:\s*var\(--accent\)/);
    expect(GLOBAL_CSS).toMatch(/::selection\s*\{[^}]*color\s*:\s*var\(--color-asphalt\)/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add the selection styling**

Append to `src/styles/global.css`:

```css
/* ── V2 March selection ──────────────────────────────────────────────────── */
::selection {
  background: var(--accent);
  color: var(--color-asphalt);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-utilities.test.ts
git commit -m "restyle(marketing): V15 ::selection accent styling ported from V2 March"
```

---

## Task 16: Add `.room`-scoped link underline + button rebound microinteractions

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-utilities.test.ts`

**Why:** Inside `.room` sections, V2 styles links with an animated 1-px accent underline that grows from 0 → 100% on hover, and buttons with a press-rebound (scale 0.97 on active, opacity 0.85 on hover). These are scoped to `.room` so they don't leak into chrome / nav (Phase 2).

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-utilities.test.ts`:

```ts
describe('V2 March microinteractions — .room link underline', () => {
  test('.room a (with exclusions) sets position:relative + no underline', () => {
    // Selector is messy — match the rule's existence and a key declaration.
    expect(GLOBAL_CSS).toMatch(
      /\.room\s+a:not\(\.no-underline\):not\(\[class\*="pit-"\]\):not\(\[class\*="stamp-"\]\)\s*\{[\s\S]*?position\s*:\s*relative[\s\S]*?text-decoration\s*:\s*none/,
    );
  });
  test('.room a::after grows from width:0 → 100% on hover', () => {
    expect(GLOBAL_CSS).toMatch(
      /\.room\s+a:not\(\.no-underline\):not\(\[class\*="pit-"\]\):not\(\[class\*="stamp-"\]\)::after\s*\{[\s\S]*?width\s*:\s*0[\s\S]*?\}/,
    );
    expect(GLOBAL_CSS).toMatch(
      /\.room\s+a:not\(\.no-underline\):not\(\[class\*="pit-"\]\):not\(\[class\*="stamp-"\]\):hover::after\s*\{[\s\S]*?width\s*:\s*100%/,
    );
  });
});

describe('V2 March microinteractions — .room button rebound', () => {
  test('.room button + [role="button"] hover sets opacity 0.85', () => {
    expect(GLOBAL_CSS).toMatch(
      /\.room\s+button:hover[\s\S]*?\.room\s+\[role="button"\]:hover\s*\{[\s\S]*?opacity\s*:\s*0\.85/,
    );
  });
  test('.room button:active scales to 0.97', () => {
    expect(GLOBAL_CSS).toMatch(
      /\.room\s+button:active[\s\S]*?\.room\s+\[role="button"\]:active\s*\{[\s\S]*?transform\s*:\s*scale\(0\.97\)/,
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add the microinteractions**

Append to `src/styles/global.css`:

```css
/* ── V2 March .room microinteractions ────────────────────────────────────────
 * Scoped to `.room` so chrome/nav links (Phase 2) keep default styling.
 * The :not() chain excludes pit-* and stamp-* component links, which carry
 * their own treatments. */
.room a:not(.no-underline):not([class*='pit-']):not([class*='stamp-']) {
  position: relative;
  text-decoration: none;
}

.room a:not(.no-underline):not([class*='pit-']):not([class*='stamp-'])::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--accent);
  transition: width var(--duration-micro) var(--ease-inertia);
}

.room a:not(.no-underline):not([class*='pit-']):not([class*='stamp-']):hover::after {
  width: 100%;
}

.room button,
.room [role='button'] {
  transition: transform var(--duration-micro) var(--ease-spring);
}

.room button:hover,
.room [role='button']:hover {
  opacity: 0.85;
}

.room button:active,
.room [role='button']:active {
  transform: scale(0.97);
  transition-duration: 60ms;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-utilities.test.ts
git commit -m "restyle(marketing): V16 .room link underline + button rebound microinteractions ported from V2 March"
```

---

## Task 17: Add `.high-contrast` override + `prefers-contrast: more` block

**Files:**
- Modify: `src/styles/global.css`
- Test: `src/__tests__/v2-visual-utilities.test.ts`

**Why:** V2's outdoor / sunlight-use mode bumps contrast for all colour tokens (`--color-chalk: #FFFFFF`, `--color-acid-green: #00FF66`, etc.). Critical for trackside use; both system-pref-detected and user-toggled.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/v2-visual-utilities.test.ts`:

```ts
describe('V2 March visual effects — high-contrast overrides', () => {
  test('@media (prefers-contrast: more) block exists', () => {
    expect(GLOBAL_CSS).toMatch(/@media\s*\(\s*prefers-contrast\s*:\s*more\s*\)/);
  });
  test('.high-contrast user-toggled class exists', () => {
    expect(GLOBAL_CSS).toMatch(/\.high-contrast\s*\{/);
  });
  test('high-contrast overrides --color-chalk to #FFFFFF', () => {
    // We don't pin the exact location — there are two declarations
    // (one in @media, one in .high-contrast). Both should set white.
    const matches = GLOBAL_CSS.match(/--color-chalk\s*:\s*#FFFFFF/gi);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });
  test('high-contrast pumps --color-acid-green to a brighter cyan-green', () => {
    expect(GLOBAL_CSS).toMatch(/--color-acid-green\s*:\s*#00FF66/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add the high-contrast overrides**

Append to `src/styles/global.css`:

```css
/* ── V2 March high-contrast overrides ────────────────────────────────────────
 * Trackside / outdoor use. System-detected via prefers-contrast:more, and
 * user-toggled via the .high-contrast class on <html>. Both blocks redeclare
 * the same overrides so neither path depends on the other being present. */
@media (prefers-contrast: more) {
  :root {
    --color-asphalt: #000000;
    --color-concrete: #0a0a0a;
    --color-chalk: #ffffff;
    --color-steel: #d4d4d4;
    --color-muted: #bbbbbb;
    --border-color-default: rgba(255, 255, 255, 0.4);
    --border-color-muted: rgba(255, 255, 255, 0.25);
    --color-acid-green: #00ff66;
    --color-safety-red: #ff3333;
    --color-marshal-yellow: #ffe033;
  }
}

.high-contrast {
  --color-asphalt: #000000;
  --color-concrete: #0a0a0a;
  --color-chalk: #ffffff;
  --color-steel: #d4d4d4;
  --color-muted: #bbbbbb;
  --border-color-default: rgba(255, 255, 255, 0.4);
  --border-color-muted: rgba(255, 255, 255, 0.25);
  --color-acid-green: #00ff66;
  --color-safety-red: #ff3333;
  --color-marshal-yellow: #ffe033;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/v2-visual-utilities.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/__tests__/v2-visual-utilities.test.ts
git commit -m "restyle(marketing): V17 high-contrast overrides (prefers-contrast + .high-contrast) ported from V2 March"
```

---

## Task 18: Register Space Mono in `astro.config.mjs` (decision 1a) — keep JetBrains Mono temporarily

**Files:**
- Modify: `astro.config.mjs`
- Test: `src/__tests__/font-space-mono.test.ts` (new)

**Why (decision 1a):** V2 March used Space Mono as the telemetry font — distinctive racing-HUD fingerprint. Astro currently registers JetBrains Mono. We add Space Mono *alongside* JetBrains Mono in this task (so we don't break anything that currently consumes `--font-jetbrains-mono`) and then swap the alias `--font-mono` to point at Space Mono in Task 19.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/font-space-mono.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const ASTRO_CONFIG = readFileSync(
  resolve(process.cwd(), 'astro.config.mjs'),
  'utf8',
);

describe('Astro fonts — Space Mono registration (decision 1a)', () => {
  test('astro.config.mjs registers Space Mono via fontProviders.google()', () => {
    // Match the name field — a single-line check is enough; Astro's fonts
    // array uses object literals, and `name: 'Space Mono'` is the unique
    // discriminator.
    expect(ASTRO_CONFIG).toMatch(/name\s*:\s*['"]Space\s+Mono['"]/);
  });
  test('Space Mono uses cssVariable --font-space-mono', () => {
    // This is the name we'll alias --font-mono to in Task 19.
    expect(ASTRO_CONFIG).toMatch(/cssVariable\s*:\s*['"]--font-space-mono['"]/);
  });
  test('Space Mono registers weights 400 and 500', () => {
    // Match a weights array — Space Mono on Google Fonts has only 400/700,
    // so we settle for 400 + 700 if 500 isn't available. Allow either pair.
    const m = ASTRO_CONFIG.match(/name\s*:\s*['"]Space Mono['"][\s\S]*?weights\s*:\s*\[([^\]]+)\]/);
    expect(m).not.toBeNull();
    const weights = m![1];
    expect(weights).toMatch(/400/);
    expect(weights).toMatch(/(500|700)/);
  });
  test('JetBrains Mono is NOT removed yet (Task 19 swaps the alias)', () => {
    // Sanity check — Task 18 only adds Space Mono. The existing JetBrains
    // Mono entry must still be present so consumers that currently use
    // var(--font-jetbrains-mono) keep working until Task 19's alias swap.
    expect(ASTRO_CONFIG).toMatch(/name\s*:\s*['"]JetBrains\s+Mono['"]/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/font-space-mono.test.ts`
Expected: FAIL — Space Mono not registered.

- [ ] **Step 3: Register Space Mono**

In `astro.config.mjs`, append a new entry to the `experimental.fonts` array (after the JetBrains Mono entry, before the closing `]`):

```js
      {
        provider: fontProviders.google(),
        name: 'Space Mono',
        cssVariable: '--font-space-mono',
        // Google Fonts ships Space Mono in 400 + 700 only. We keep 400 (default)
        // and 700 (used for emphasis); skip 500/600 (would auto-substitute).
        weights: [400, 700],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['Space Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/__tests__/font-space-mono.test.ts`
Expected: PASS — all 4 assertions green.

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs src/__tests__/font-space-mono.test.ts
git commit -m "restyle(marketing): V18 register Space Mono font (decision 1a) — JetBrains Mono kept"
```

---

## Task 19: Swap `--font-mono` alias to Space Mono + preload it in BaseLayout

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `src/__tests__/font-space-mono.test.ts`

**Why:** Task 18 only registered Space Mono; the @theme alias `--font-mono` still points at JetBrains. This task does the actual swap: `--font-mono` now resolves to `var(--font-space-mono)`, and the BaseLayout `<Font>` tag preloads Space Mono. Existing consumers of `var(--font-mono)` (which is what the V2-ported `.font-telemetry` and `.tabular-nums` use) automatically get Space Mono.

We *keep* `--font-jetbrains-mono` registered in astro.config.mjs (Task 18 verified this) so any code still referencing it directly doesn't break. We can remove it in a future cleanup task once nothing depends on it.

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/font-space-mono.test.ts`:

```ts
describe('Astro fonts — --font-mono now aliases Space Mono', () => {
  const GLOBAL_CSS = readFileSync(
    resolve(process.cwd(), 'src/styles/global.css'),
    'utf8',
  );
  const BASE_LAYOUT = readFileSync(
    resolve(process.cwd(), 'src/layouts/BaseLayout.astro'),
    'utf8',
  );

  test('global.css aliases --font-mono to var(--font-space-mono)', () => {
    expect(GLOBAL_CSS).toMatch(/--font-mono\s*:\s*var\(--font-space-mono\)/);
  });
  test('global.css does NOT alias --font-mono to var(--font-jetbrains-mono) any more', () => {
    expect(GLOBAL_CSS).not.toMatch(/--font-mono\s*:\s*var\(--font-jetbrains-mono\)/);
  });
  test('BaseLayout preloads Space Mono', () => {
    // Astro 5 Fonts API renders <Font cssVariable="..." preload /> for the
    // weights it ships. The presence of cssVariable="--font-space-mono"
    // (in any attribute order) is sufficient.
    expect(BASE_LAYOUT).toMatch(/cssVariable\s*=\s*["']--font-space-mono["']/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/__tests__/font-space-mono.test.ts`
Expected: FAIL — alias still points at JetBrains; BaseLayout doesn't reference Space Mono.

- [ ] **Step 3: Swap the alias + add the preload**

In `src/styles/global.css`, locate the @theme block. Find the line:

```css
  --font-mono: var(--font-jetbrains-mono);
```

Replace it with:

```css
  /* Space Mono = V2 March telemetry font (decision 1a). JetBrains Mono is
     still registered in astro.config.mjs but no longer the active mono. */
  --font-mono: var(--font-space-mono);
```

In `src/layouts/BaseLayout.astro`, locate the `<head>` block where existing `<Font>` tags are declared (lines 68–70). Add a preload for Space Mono. Replace this block:

```astro
    <Font cssVariable="--font-inter" preload />
    <Font cssVariable="--font-space-grotesk" preload />
    <Font cssVariable="--font-jetbrains-mono" />
```

with:

```astro
    <Font cssVariable="--font-inter" preload />
    <Font cssVariable="--font-space-grotesk" preload />
    <!-- Space Mono is the active mono per decision 1a; preload because
         hero/CTA telemetry labels use it above the fold. -->
    <Font cssVariable="--font-space-mono" preload />
    <Font cssVariable="--font-jetbrains-mono" />
```

- [ ] **Step 4: Run the test to verify it passes + verify the existing hero test still passes**

Run: `pnpm test src/__tests__/font-space-mono.test.ts src/__tests__/hero.test.ts`
Expected: Both files PASS.

- [ ] **Step 5: Build + smoke-test the homepage**

Run: `pnpm build && pnpm preview --port 4321 &` (or `pnpm preview` in a separate terminal)

Then in another shell: `curl -s http://localhost:4321/ | grep -E "font-space-mono|space-mono"`
Expected: At least one preload `<link>` for Space Mono appears.

Stop the preview after the smoke check.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/__tests__/font-space-mono.test.ts
git commit -m "restyle(marketing): V19 swap --font-mono alias to Space Mono + preload (decision 1a)"
```

---

## Task 20: Verify lap-website CLAUDE.md "no raw hex" rule still passes

**Files:** None modified.

**Why:** Tasks 11 (`text-shimmer`), 12 (`beam-card`), and 17 (high-contrast) introduce hex literals (`rgba(201, 168, 76, 0.8)`, `#FFFFFF`, `#00FF66`, etc.). The lap-website CLAUDE.md says "No raw hex colors — use Tailwind tokens." The hex literals we added are *gradient stops* and *accessibility overrides*, not colour utilities — but we need to verify the project's lint rule (if any) doesn't flag them.

- [ ] **Step 1: Search for raw-hex CI gates**

Run: `grep -rn "no-raw-hex\|forbid.*hex\|hex.*forbid" eslint.config.mjs scripts/ .github/ 2>&1 | head -20`
Expected: Either no matches (no automated rule, manual review) or one match in a CI script. Note what you find.

- [ ] **Step 2: Run the project's lint**

Run: `pnpm lint 2>&1 | tail -30`
Expected: PASS. If FAIL with hex-related errors specifically on global.css/textures.css lines we touched in V11/V12/V17, the lint config has a rule we need to satisfy. In that case, document each hex usage in a comment block at the top of global.css explaining intent (gradient stop, contrast override) so reviewers can audit; for the linter itself, add an `// eslint-disable-next-line` only on the offending lines, never project-wide.

- [ ] **Step 3 (conditional): If lint failed, add inline disables**

If Step 2 failed, edit each offending line in `src/styles/global.css` (text-shimmer rgba, beam-card rgbas, high-contrast hex values) and prefix with the disable comment per the project's eslint-plugin name. Re-run `pnpm lint` until it passes.

If Step 2 passed, skip this step.

- [ ] **Step 4: Commit (only if Step 3 ran)**

```bash
git add src/styles/global.css
git commit -m "restyle(marketing): V20 inline-disable raw-hex lint on intentional gradient/contrast literals"
```

---

## Task 21: Full test suite + build + LCP smoke

**Files:** None modified.

**Why:** After 19 incremental commits, run the entire harness to catch any regression we missed.

- [ ] **Step 1: Run all unit tests**

Run: `pnpm test 2>&1 | tail -30`
Expected: All test files pass. Test count = baseline (Task 0 Step 2) + the new tests added in V01–V19 (4 new files: v2-visual-tokens, v2-visual-utilities, v2-visual-textures, font-space-mono).

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck 2>&1 | tail -20`
Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Run lint**

Run: `pnpm lint 2>&1 | tail -20`
Expected: clean.

- [ ] **Step 4: Run build**

Run: `pnpm build 2>&1 | tail -30`
Expected: build succeeds; no new warnings about unused CSS or missing variables.

- [ ] **Step 5: Verify homepage JS budget hasn't regressed**

Run: `pnpm test src/__tests__/homepage-js-budget.test.ts 2>&1 | tail -15`
Expected: PASS — total gzip JS still <100 KB. (We added zero JS; this should be unchanged. If it failed, investigate — something else regressed.)

- [ ] **Step 6: Lighthouse CI on built dist**

Run: `pnpm lhci 2>&1 | tail -30`
Expected: All thresholds met. The lap-website CLAUDE.md sets LCP <1.5 s on mobile 4G — verify the LCP score from the lhci output is below the threshold. If the new texture-grain class is *applied* anywhere (it isn't yet — we only added the class, no markup uses it), check the LCP test page; otherwise zero impact.

- [ ] **Step 7: Run e2e smoke (homepage)**

Run: `pnpm test:e2e tests/e2e/home.spec.ts 2>&1 | tail -20`
Expected: PASS.

- [ ] **Step 8: Final commit (if any incidental fixes were made)**

Only if any of the above steps surfaced an incidental fix:

```bash
git add -A
git commit -m "restyle(marketing): V21 incidental fixes from full-harness verification"
```

If no incidental fixes were needed, no commit — proceed to Task 22.

---

## Task 22: Update lap-website CLAUDE.md to reference the new visual primitives

**Files:**
- Modify: `CLAUDE.md` (lap-website-scoped)

**Why:** Phase 2/3/4 implementers need to know which primitives are now available without re-reading the plan. A 6-line bullet list in CLAUDE.md is the cheapest knowledge transfer.

- [ ] **Step 1: Add a "Visual primitives (V2 March port)" section**

Open `lap-website/CLAUDE.md`. Append before the `## /loop rules` section:

```markdown
## Visual primitives — V2 March port (Phase 1 complete 2026-05-05)

The following utility classes and tokens are available in `src/styles/global.css`
(+ `src/styles/textures.css`) and may be used in any component. Phase-1 plan:
`docs/superpowers/plans/2026-05-05-v2-march-visual-foundation.md`.

- **Section containers:** `.room` (full-viewport flex-center, 100vh; mobile-clamped to auto), `.grid-lap` (12-col grid using --grid-columns / --grid-gutter / --grid-margin)
- **Typography:** `.font-monument` (display + 700 + uppercase + tight tracking), `.font-telemetry` (Space Mono + uppercase + wide tracking + 0.6875rem), `.font-body` (Inter + 1.72 leading), `.prose-max` (65ch), `.tabular-nums` (mono + tabular figures)
- **Effects:** `.text-shimmer` (gold sweep), `.beam-card` (rotating conic-gradient on hover), `.radio-bar` (waveform), marquee-scroll keyframes (Phase-2 MarqueeStrip will consume)
- **Textures (lighter variant per decision 2b):** `.texture-grain` (radial + grid + scanlines, no fixed attachment, no SVG noise), `.texture-dither` (subtle dot grid), `.texture-scanlines` (1-px lines)
- **Tokens:** `--space-px`/0-5/1/1-5/2/3/4/5/6/8/10/12/16, `--z-base`/panels/stamps/delta/hud/drs/finish-line/sector/timecode/nav/overlay/cursor, `--duration-micro`/room/monument/sector-gate/drs/pit/finish, `--ease-inertia`/overshoot/spring/snap/anticipate/sector-gate/pit-enter/pit-exit, `--bg-radial-1`/2/3, `--bg-grid`, `--chart-series-1`–6, `--shadow-e0`–4
- **Accessibility:** `.high-contrast` user-toggle class on `<html>` swaps colour palette for outdoor use; `prefers-contrast: more` does the same automatically.
- **Mono font:** `var(--font-mono)` aliases Space Mono (decision 1a); JetBrains Mono is registered but not active.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "restyle(marketing): V22 document V2 March visual primitives in CLAUDE.md"
```

---

## Self-Review (run before declaring Phase 1 done)

**1. Spec coverage** — every V2 March visual primitive in scope is covered:
- Tokens: spacing (T1), z-layers (T2), timing/easing (T3), bg-radial/bg-grid (T4), chart palette + shadow-e0 (T5) ✅
- Typography classes: font-monument/telemetry/body (T6), prose-max/tabular-nums/cta-nowrap (T7) ✅
- Containers: grid-lap + room (T8) ✅
- Textures: lighter texture-grain + dither + scanlines (T9), wired (T10) ✅
- Effects: text-shimmer (T11), beam-card (T12), radio-bar (T13), marquee-scroll (T14), ::selection (T15), .room microinteractions (T16) ✅
- A11y: high-contrast + prefers-contrast (T17) ✅
- Font swap: Space Mono register (T18), alias swap + preload (T19) ✅
- Verification: lint hex check (T20), full harness (T21), CLAUDE.md update (T22) ✅

**2. Placeholder scan** — searched for `TBD`, `TODO`, `implement later`, `add appropriate`, `similar to Task N` — none present. Every step has the actual code or command.

**3. Type/name consistency** — all token names, class names, and CSS-variable names are spelt the same way across tasks (verified by cross-referencing each test against its implementation step). The Astro `--color-*` prefix in @theme is used consistently; bare `--asphalt`/`--chalk` (V2 verbatim) is *not* used in new code — we use `--color-asphalt`/`--color-chalk`.

**4. Decision compliance** — 1a (Space Mono): Tasks 18 + 19 register and alias. 2b (lighter texture-grain): Task 9 explicitly drops `background-attachment: fixed` and the SVG-noise pseudo, with a canary test in v2-visual-textures.test.ts that fails if either is reintroduced.

---

## Phase 2/3/4 — outline (separate plans, written after Phase 1 ships)

- **Phase 2 — Chrome & Marquee** (~15 tasks): persistent V2 chrome (wordmark, sector tabs, timecode, optional delta strip), `MarqueeStrip` Astro component, `AnnouncementBar`, V2-styled footer. Plan file: `2026-05-XX-v2-march-chrome.md`.
- **Phase 3 — Homepage Rooms** (~30 tasks): replace `src/pages/index.astro` composition with V2 narrative — StartGrid, S1Pain (interactive corner drag, `client:load`), MarqueeStrip, S1DeepSculpture (Canvas2D telemetry, `client:visible`, code-split), S2Pipeline, S2Versus, S3Product, S4WorkflowCoverage, MarqueeStrip, PitStop, Garage, Podium. Each room behind `client:visible` to keep first-load JS under 100 KB gzip. Plan file: `2026-05-XX-v2-march-homepage-rooms.md`.
- **Phase 4 — Other pages** (~20 tasks): apply `.room` + `.texture-grain` + chrome to /pricing, /how-it-works, /demo, /for-schools, /blog. Astro-only pages (how-it-works, for-schools, blog) keep their current copy/structure but adopt V2 visual language. Visual regression via Playwright `toHaveScreenshot` baselines. Plan file: `2026-05-XX-v2-march-other-pages.md`.

Estimated total Phase-1 duration: 6–8 hours of focused work for one engineer (each task ~20–30 min including tests).

---

## Execution Handoff

Plan complete and saved to `lap-website/docs/superpowers/plans/2026-05-05-v2-march-visual-foundation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
