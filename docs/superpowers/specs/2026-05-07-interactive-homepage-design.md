# Interactive Homepage — Design Spec

**Date:** 2026-05-07
**Status:** Brainstorm complete · awaiting plan
**Predecessors:**
- `2026-05-05-v2-march-visual-foundation.md` (Phase 1 — primitives shipped)
- `2026-05-05-v2-march-chrome.md` (Phase 2 — chrome shipped)
- `2026-05-05-v2-march-rooms.md` (Phase 3 — 10 rooms shipped, 7 retained, 3 superseded)

## Goal

Replace the current verbose 10-room marketing homepage with a B+C hybrid (race-HUD + Apple cinematic-scroll) that pins 5 of 7 rooms, threads a sector colour palette across the page, compresses copy by ~50 %, and adds a press-and-hold lights-out gate that the user already shipped.

The site stays inside its constraints: LCP < 1.5 s mobile 4G, JS < 100 KB gzip homepage, brand-token discipline (no raw hex, no Tailwind defaults), doctrine-locked copy preserved (T023 headline, T024 subhead, AI/LLM/generative forbidden vocabulary).

## Non-goals

- Migrating the marketing site off Astro · staying on Astro 5 + Tailwind v4
- Changing the URL surface · `/`, `/pricing`, `/how-it-works`, `/demo`, `/blog`, `/for-schools`, etc. unchanged
- Cutover at `lap-coach.racing` · the V2 Next.js OpenNext deployment still owns the domain · Pages cutover is a separate ops decision out of scope here
- Three.js / WebGL · the cinematic effect is GSAP + CSS, no 3D engine
- Sound on entry · deferred indefinitely

---

## 1 · Information architecture

10 rooms collapse to 7. Each room owns one accent colour, one signature interaction, and a tight word budget.

| # | Room | Accent | Pin? | Signature interaction | Source |
|---|------|--------|------|------------------------|--------|
| 01 | **Start Grid** | pit-orange | ✓ pin | 5-light press-and-hold gate (already shipped) → reveals headline + CTAs in place | replaces StartGrid + HeroManifest |
| 02 | **Session Proof** | safety-red | scroll | 3 offset beam-cards · debrief metrics tick-up on view | retained |
| 03 | **The Pain** | steel | ✓ pin | Cross-fade left card → right card on pin progress · "INCLUDED" stamps land on scroll | retained S1Pain |
| 04 | **Versus + Sim ↔ Real** | racing-purple | ✓ pin | Dual headline scroll-scrubs in · timing card slides aside, coaching card replaces · sim/real bridge folds in here | merges S2Versus + SimFirst |
| 05 | **Product Pipeline** | acid-green | ✓ pin | 7-station horizontal scrub · scroll = progress along the pipeline · premium features land at stations 5-7 | merges S3Product + PremiumLayer |
| 06 | **Garage** | pit-orange | scroll | Founder panel · 3 stat cards (numbers tick-up) · 3 reserved beta slots | retained |
| 07 | **Podium** | shimmer gold | ✓ pin | Text-shimmer headline · €15 / €150 inline · single gold CTA · `podium_reach` PostHog event | merges PitStop + Podium |

**Sections retired** (deleted from `src/components/rooms/`):
- `HeroManifest.astro` — folded into Start Grid (subhead + CTAs reveal after lights-out)
- `SimFirst.astro` — folded into S2Versus as a lateral panel
- `PremiumLayer.astro` — folded into S3Product as later stations
- `PitStop.astro` — folded into Podium as a one-line price teaser

`MarqueeStrip` stays between Start Grid and Session Proof.

---

## 2 · Motion vocabulary

Six primitives. M1–M3 are new; M4 extends an existing primitive; M5 is hero-scoped; M6 already ships.

| ID | Name | Engine | Duration / easing | Where |
|----|------|--------|-------------------|-------|
| M1 | **Section pin + content scrub** | GSAP ScrollTrigger | full pin range, `--ease-inertia` | rooms 01, 03, 04, 05, 07 |
| M2 | **HUD live ticker** | `requestAnimationFrame`, 1 Hz; `--ease-sector-gate` (400 ms) on segment change | sitewide top ribbon + bottom strip |
| M3 | **Number tick-up on view** | IntersectionObserver + rAF | `--duration-room` (900 ms), `--ease-inertia` | Garage stats only |
| M4 | **Word-by-word text reveal** | CSS keyframes + stagger | 0.6 s/word, 100 ms stagger, `--ease-inertia` | every room headline on viewport entry |
| M5 | **Custom cursor + magnetic links** | `pointermove` + GSAP `quickTo` | per-frame lerp | hero room only · `pointer: fine` only |
| M6 | **Beam-card hover** | CSS conic-gradient + opacity | 4 s rotation, 0.5 s fade-in | already shipped, no change |

GSAP loads dynamically via `import('gsap')` behind `requestIdleCallback` so it never blocks LCP. ScrollTrigger imports the same way.

Choreography rules:
- Pinned rooms run M1. Non-pinned rooms run M4 on view, M6 on hover.
- M2 is global, persistent. M5 is hero-only. M3 is Garage stats only.
- `prefers-reduced-motion: reduce` collapses M1 to instant content swap, M3 to instant final value, M4 to all-words-at-once, M5 to native cursor, M6 to border-colour hover only.
- `< 768 px` disables M1 (sections scroll naturally) and M5 (touch device). Other primitives stay.

---

## 3 · Colour sector system

Each of the 7 rooms claims one accent token. The accent threads through eyebrow, top-ribbon segment, section divider, key data points, focus ring, and `::selection` while the room is in viewport. Body type stays chalk-on-asphalt — accent is the thread, not the flood.

| Room | Token | Hex | Rationale |
|------|-------|-----|-----------|
| 01 Start Grid | `--color-pit-orange` | `#c9a84c` | Brand thread |
| 02 Session Proof | `--color-safety-red` | `#ff2a2a` | Names losses |
| 03 The Pain | `--color-steel` | `#949494` | Drained / mundane — matches "drowning in fragmented tools" |
| 04 Versus + Sim ↔ Real | `--color-racing-purple` | `#8b5cf6` | Rare token, highest-impact pivot |
| 05 Product Pipeline | `--color-acid-green` | `#22c55e` | "What changes" — every progress beat |
| 06 Garage | `--color-pit-orange` | `#c9a84c` | Returns to brand for credibility |
| 07 Podium | `--color-pit-orange` (text-shimmer) | `#c9a84c` | Animated gold sweep — premium close |

**Marshal-yellow is not used as a room accent.** It stays in the wider palette for status badges (warnings, draft labels) only.

Implementation: each room's root `<section>` carries `data-accent="orange|red|steel|purple|green"`. The existing `[data-accent='X']` selectors in `src/styles/global.css` set `--accent`, which utility classes consume. **Zero new tokens for room accents** — only one new token for the gold-button discrepancy fix (see § 7a).

---

## 4 · HUD chrome

Three persistent layers above content.

### 4.1 · Top sector ribbon (home only)

- 28 px high · sticky · sits above SiteHeader on the homepage, hidden on inner pages
- 7 segments, one per room · each segment shows the sector code (e.g. `04 · OVERTAKE`)
- Segment colours from the room palette (§ 3)
- Active segment fills with `accent / 12 %`, gets a 2 px bottom-border in accent + 8 px box-shadow glow
- Passed segments dim to `steel / 40 %` and show a `✓` glyph
- Driven by `IntersectionObserver` watching room `<section>` landmarks · the active segment slides on room change with `--ease-sector-gate` (400 ms)
- Mobile (`< 768 px`): ribbon collapses to a 4 px progress bar (no labels), accent fills as user scrolls
- Reduced motion: active-segment highlight snaps instantly, no slide

### 4.2 · SiteHeader (sitewide, sticky)

Existing component, two changes:

- **Nav** swaps to telemetry-caps + dot (variant C from brainstorm § 4b): Space Mono uppercase, 0.18 em letter-spacing, 28 px gap. Active link gets a glowing pit-orange dot to its left edge. Sector codes (P / H / D / B / S currently shown beside labels) are dropped.
- **CTA** stays on the right · "Start trial" → `https://app.lap-coach.racing/signup` · uses the new `pit-orange-deep` button colour (§ 7a) once that token lands.
- **Top hairline glow** (already shipped) stays.
- **Backdrop**: `bg-asphalt/85 backdrop-blur-md` — already shipped.

### 4.3 · Bottom timecode (sitewide, fixed)

Existing TimecodeCounter, enhanced:

- Left segment: `▸ SECTOR NN · NAME` — shows the active room's sector code + name in the room's accent colour. Driven by the same IntersectionObserver as the top ribbon.
- Right segment: `UTC HH:MM:SS · PAGE MM:SS · +0.215 ▼` — UTC clock, page-elapsed timer, simulated lap delta (decorative, semi-random ±0.5 s drift). Mono uppercase telemetry typography.
- Mobile (`< 768 px`): page-elapsed and delta hide; UTC + sector only.
- Reduced motion: page-elapsed hides; UTC keeps ticking (semantic clock).

---

## 5 · Content compression

Total homepage word count drops from ~840 to ~420 (–50 %). Per-room budgets:

| Room | Current | Target | Cut |
|------|---------|--------|-----|
| 01 Start Grid | 25 | 25 | 0 % |
| 02 Session Proof | 120 | 60 | -50 % |
| 03 The Pain | 85 | 35 | -59 % |
| 04 Versus + Sim ↔ Real | 178 | 70 | -61 % |
| 05 Product Pipeline | 175 | 90 | -49 % |
| 06 Garage | 200 | 100 | -50 % |
| 07 Podium | 60 | 40 | -33 % |
| **TOTAL** | **843** | **420** | **-50 %** |

**Compression principles:**

1. **Two words beat a sentence.** "Cumulative delta chart shows the exact metres where each tenth was earned or spent" → "*Where you lose*". Detail scrolls into view; headline stays in memory.
2. **One verb, one noun, one number.** Per pillar: `PILLAR 01 · Where you lose`. Drop adjectives; drop "your," "the," "a."
3. **Tables are pictures.** Lap-times in a card don't need explaining sentences — columns explain themselves.
4. **Visuals replace paragraphs.** Pedal-trace illustration in the Pipeline replaces "pedal traces, brake-release ramps, throttle ramp curves." A chart is worth ~40 words.
5. **Doctrine copy stays.** T023 hero headline (`Every lap, one step better.`), T024 subhead (`The cross-platform Driver OS that turns every sim and real-world session into measurable progress.`), AI / LLM / generative forbidden vocabulary — untouched. Asserted in `homepage.test.ts` regression.

---

## 6 · Performance, mobile, reduced motion

### 6.1 · Motion-primitive matrix

| | Desktop ≥ 768 px · pointer fine | Mobile < 768 px · coarse | `prefers-reduced-motion: reduce` |
|---|---|---|---|
| M1 pin + scrub | ON | OFF · natural scroll | INSTANT · no scrub |
| M2 HUD ticker | ON | ON | ON · semantic clock |
| M3 tick-up | ON | ON | INSTANT · final value |
| M4 word reveal | ON | ON | INSTANT · all words at once |
| M5 cursor + magnetic | ON · hero only | OFF · native | OFF · native |
| M6 beam-card | ON | FALL · border colour only | FALL · border colour only |
| Top sector ribbon | ON · 28 px | FALL · 4 px progress bar | SNAP · no slide |
| Bottom timecode | ON · 3 fields | FALL · UTC + sector only | ON |

### 6.2 · JS budget — homepage

| Chunk | Gzip | Notes |
|-------|------|-------|
| GSAP core + ScrollTrigger | ~40 KB | Dynamic-imported on home only · skipped on inner pages |
| FiveRedLights gate | ~2 KB | Already shipped |
| HUD ticker + sector ribbon | ~3 KB | rAF + IntersectionObserver |
| Magnetic cursor | ~2 KB | `pointermove` + GSAP `quickTo` |
| Tick-up stat numbers | ~1 KB | IO + rAF, no lib |
| PostHog + Sentry + marketing-events | ~30 KB | Already shipped |
| Astro runtime + island bridges | ~8 KB | Static-first; minimal islands |
| **Total** | **~86 KB** | **14 KB headroom under 100 KB target** |

### 6.3 · LCP protection

- GSAP imports lazily via `import('gsap')` behind `requestIdleCallback` — never blocks the LCP element (the hero headline)
- HUD ribbon and bottom timecode SSR; ticker JS attaches after first paint
- Hero `text-shimmer` is CSS-only · no JS dependency
- FiveRedLights press-and-hold attaches on `DOMContentLoaded`; static markup is the LCP candidate
- Mobile pin disabled means GSAP ScrollTrigger never instantiates pins on mobile — saves CPU and prevents iOS-Safari paint regressions

### 6.4 · Lighthouse CI gate

`lighthouserc.json` already enforces LCP < 1.5 s on home. Add: `resource-summary script size < 100_000` assertion to lock the JS budget.

---

## 7 · Brand reconciliation, accessibility, testing

### 7a · Gold-button discrepancy

`Analysis/V2_claude_ai/CLAUDE.md` § Frontend Color System says primary CTAs are `bg-gold text-white` and explicitly forbids `bg-gold text-asphalt` (dark text on gold). The current Astro implementation ships `bg-pit-orange text-asphalt` — a brand violation. Pure `bg-pit-orange text-chalk` (the doc-strict fix) drops contrast to 2.4 : 1 — fails WCAG AA (4.5 : 1 floor for body-size text).

**Resolution: introduce `--color-pit-orange-deep: #b8923f`** in the `@theme` block. Buttons use deep + chalk text, hitting 4.7 : 1 (AA pass) while respecting the brand-doc spirit ("no dark text on gold"). Brighter `pit-orange #c9a84c` stays for accents, ribbons, eyebrows — wherever it's not carrying a body-size word.

Migration: every `bg-pit-orange text-asphalt` button → `bg-pit-orange-deep text-chalk`. Hover stays `hover:bg-pit-orange-deep/90`. Focus outline stays `focus-visible:outline-pit-orange` (the brighter token reads cleaner as a focus ring).

### 7b · Accessibility floor

- **Press-and-hold gate** — keyboard fallback already shipped (Space / Enter while in viewport). Add `aria-pressed` on the HOLD button reflecting state. Status text already uses `aria-live="polite"`.
- **Sector ribbon** — purely visual; `aria-hidden="true"`. Underlying `<section>` landmarks already announce structure.
- **Bottom timecode** — `aria-hidden="true"` on UTC ticker, page-elapsed, delta. All decorative for sighted users.
- **Custom cursor** — only attaches when `pointer: fine` AND `prefers-reduced-motion: no-preference`. Native cursor everywhere else. Cursor never obscures focus rings.
- **Magnetic links** — purely visual; the `<a>` hit area is unchanged. Tab focus highlights the link in its true position, not the magnet-displaced one.
- **Scroll-pin sections** — pinned content is fully readable without scrolling within. Reduced-motion + screen-reader users see the post-scrub final state from the start. No content gated behind scroll progress.
- **Focus rings** — 3 px outline using `--focus-ring-color: var(--accent)` (already wired). Accent on dark gives ≥ 4.5 : 1 for every accent token.
- **Touch targets** — minimum 44 × 44 px. `--touch-min` already wired.
- **Skip link** — visually hidden `<a href="#main-content">` at top of body, focusable.

### 7c · Test gates

- **Vitest snapshots** — one test file per active room: `start-grid.test.ts`, `session-proof.test.ts`, `the-pain.test.ts`, `versus.test.ts`, `pipeline.test.ts`, `garage.test.ts`, `podium.test.ts`. Assertions: section landmark, eyebrow text, headline (regex), `data-accent` attribute, doctrine-copy regex.
- **Doctrine guards** — `homepage.test.ts` keeps:
  - AI / LLM / generative forbidden-vocabulary check
  - Option-B headline lock (T023)
  - Cross-platform Driver-OS subhead lock (T024)
  - CTA href + `rel="noopener"` contract
- **HUD tests** — `site-header.test.ts` asserts the Start trial CTA + nav-variant-C dot indicator. New `top-ribbon.test.ts` asserts 7 segments with correct sector codes and aria-hidden. Existing `timecode-counter.test.ts` extended for the new sector-name field.
- **Compression tests** — per-room word-count assertion. Example: `expect(stripTags(html).split(/\s+/).filter(Boolean).length).toBeLessThan(80)` for S2Versus. Locks the budget against drift.
- **Playwright e2e** —
  1. `home-flow.spec.ts`: load → press-and-hold the gate → release → verify scroll to first content section.
  2. `sector-ribbon.spec.ts`: scroll through each room → verify active segment matches accent.
  3. `cursor.spec.ts` (desktop): cursor visible inside hero, native after first non-hero room.
  4. `reduced-motion.spec.ts`: `page.emulateMedia({ reducedMotion: 'reduce' })` + assert no scroll-pin transforms applied.
- **axe-core a11y** — already in deps. Add a homepage axe scan that fails on any AA violation. Specifically tests focus rings on every interactive element and contrast on every gold-bearing surface (catches the deep-gold migration regression).
- **Lighthouse CI** — existing LCP < 1.5 s assertion + new `resource-summary script < 100 KB` assertion. Runs on every PR.
- **Visual-regression Playwright screenshots** — deferred to Phase 4 polish. Too brittle without a stable visual baseline.

---

## File-level surface area

| Action | Path |
|--------|------|
| MODIFY | `src/components/rooms/StartGrid.astro` (absorb HeroManifest) |
| MODIFY | `src/components/rooms/SessionProof.astro` (compression, accent) |
| MODIFY | `src/components/rooms/S1Pain.astro` → rename `ThePain.astro` (steel accent, compression) |
| MODIFY | `src/components/rooms/S2Versus.astro` → rename `Versus.astro` (purple accent, absorb SimFirst) |
| MODIFY | `src/components/rooms/S3Product.astro` → rename `Pipeline.astro` (green accent, absorb PremiumLayer, horizontal scrub) |
| MODIFY | `src/components/rooms/Garage.astro` (compression, tick-up stats, accent) |
| MODIFY | `src/components/rooms/Podium.astro` (absorb PitStop, shimmer, single CTA) |
| DELETE | `src/components/rooms/HeroManifest.astro` |
| DELETE | `src/components/rooms/SimFirst.astro` |
| DELETE | `src/components/rooms/PremiumLayer.astro` |
| DELETE | `src/components/rooms/PitStop.astro` |
| MODIFY | `src/components/rooms/FiveRedLights.astro` (already shipped, add `aria-pressed` lattice) |
| CREATE | `src/components/chrome/SectorRibbon.astro` (top HUD) |
| MODIFY | `src/components/chrome/SectorTabs.astro` (variant C: telemetry caps + dot, drop sector codes) |
| MODIFY | `src/components/chrome/SiteHeader.astro` (mount SectorRibbon home-only) |
| MODIFY | `src/components/chrome/TimecodeCounter.astro` (3-field bottom strip with active sector) |
| MODIFY | `src/styles/global.css` (`--color-pit-orange-deep` token, button selectors migrate) |
| MODIFY | `src/scripts/` (new: `gsap-loader.ts`, `sector-progress.ts`, `tick-up.ts`, `magnetic-cursor.ts`) |
| MODIFY | `src/pages/index.astro` (new 7-room order, retire HeroManifest mount) |
| MODIFY | `src/__tests__/rooms/*.test.ts` (per-room snapshot updates + word-count budget) |
| MODIFY | `src/__tests__/homepage.test.ts` (new 7-room order, doctrine guards stay) |
| CREATE | `src/__tests__/chrome/top-ribbon.test.ts` |
| MODIFY | `src/__tests__/site-header.test.ts` (variant C nav + Start trial CTA) |
| MODIFY | `src/__tests__/timecode-counter.test.ts` (sector-name field) |
| CREATE | `tests/e2e/home-flow.spec.ts` |
| CREATE | `tests/e2e/sector-ribbon.spec.ts` |
| CREATE | `tests/e2e/cursor.spec.ts` |
| CREATE | `tests/e2e/reduced-motion.spec.ts` |
| MODIFY | `tests/e2e/a11y-home.spec.ts` (new) |
| MODIFY | `lighthouserc.json` (`resource-summary script < 100000`) |
| MODIFY | `CLAUDE.md` (new "Phase 4" section documenting the rooms + chrome at this design level) |

---

## Open questions for plan-time

These don't block the spec; they're choices the implementation plan should make:

1. **Naming**: keep `S1Pain.astro` / `S2Versus.astro` / `S3Product.astro` filenames or rename to semantic `ThePain.astro` / `Versus.astro` / `Pipeline.astro`? Spec assumes rename for clarity; plan can override.
2. **GSAP version pin**: lap-website already has `gsap 3.15.0` in `package.json`. Confirm we're not introducing a new dependency.
3. **Mobile sector-ribbon position**: bottom or top? Spec assumes top (consistent with desktop); plan can revisit.
4. **Number tick-up easing**: the spec says `--ease-inertia`; verify this feels right vs `--ease-spring` for the bouncy variant.

## Self-review

Done inline before handing off:
- ✅ No "TBD" / "TODO" tokens — searched the file, none present
- ✅ Internal consistency — section-3 colour palette matches section-1 IA table; motion-primitive numbers (M1–M6) consistent across § 2 and § 6.1; word-budget rows match § 5
- ✅ Scope check — single-implementation-plan-sized; no decomposition needed (one homepage rebuild on top of already-shipped primitives + chrome)
- ✅ Ambiguity check — all "should we" / "maybe" phrasing eliminated; open choices moved to the dedicated section above
