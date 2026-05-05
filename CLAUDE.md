# CLAUDE.md — lap-website

Repo-scoped instructions. Extends `C:/Users/Admin/CLAUDE.md`.

## Context
Marketing site. Static-first. Must be fast, accessible, SEO-strong.

## Conventions
- Astro + Tailwind + TypeScript strict.
- Every page has: title, description, OG image, JSON-LD structured data.
- LCP <1.5s on mobile 4G (homepage, enforced in lighthouserc.json; tighter than webapp's 2.5s).
- Total JS per page <150KB gzip. Prefer no JS unless interactivity needed.
- GSAP only for above-the-fold motion; defer below-fold.
- Copy governance: every claim traceable to a shippable feature (no AI-coach-now claims).

## Forbidden
- No tracking that requires consent on initial page-load (GDPR-friendly: Plausible or PostHog with cookieless mode).
- No authenticated routes in this repo — those live in `lap-webapp`.
- No raw hex colors — use Tailwind tokens.
- No `any` in TS.
- No `--no-verify`.

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

## Chrome — V2 March port (Phase 2 complete 2026-05-05)

Persistent chrome wired into `src/layouts/BaseLayout.astro`. Every page picks
this up automatically. Phase-2 plan:
`docs/superpowers/plans/2026-05-05-v2-march-chrome.md`.

- **`src/components/chrome/LapWordmark.astro`** — brand mark, `font-monument`. Default href `/`, overridable via `href`/`ariaLabel` props.
- **`src/components/chrome/SectorTabs.astro`** — primary nav (Pricing / How / Demo / Blog / For schools), with `aria-current="page"` highlight on path-prefix match. Sector labels (P/H/D/B/S) in `font-telemetry`.
- **`src/components/chrome/TimecodeCounter.astro`** — bottom-fixed UTC clock + page-elapsed strip; ~600 B inline script, runs after first paint.
- **`src/components/chrome/SiteHeader.astro`** — sticky `<header role="banner">` composing LapWordmark + SectorTabs at `--z-nav`.
- **`src/components/chrome/SiteFooter.astro`** — `<footer role="contentinfo">` with Product / Company / Legal columns + brand stamp.
- **`src/components/ui/MarqueeStrip.astro`** — server-rendered scrolling text strip; consumes Phase-1 `@keyframes marquee-scroll`. Props: `items`, `speed` (default 30s), `separator` (default `•`), `reverse`. Mounted on homepage between StartGrid and SessionProof.

**Phase-2 explicitly does NOT include:** racing-HUD elements (DeltaStrip, DrsLabel, FinishLine, PitWheel, IndexOverlay, SectorGateSweep, TimingTower, MiniTrackMap, CustomCursor) — these are V2 components but not core identity. Phase 3 home rooms add some of these in-flow; Phase 4 fits remaining ones to other pages if budget allows.

## Homepage rooms — V2 March port (Phase 3 complete 2026-05-05)

The April-23 home sections (`Hero`, `AfterEverySession`, `SimAndReal`,
`BuiltForSeriousSimRacers`, `ToolComparison`, `NotForYouIf`) are retired.
The homepage now flows through ten V2 March rooms in canonical order, all
under `src/components/rooms/`. Phase-3 plan:
`docs/superpowers/plans/2026-05-05-v2-march-rooms.md`.

- **`StartGrid.astro`** (T01) — replaces Hero. `.room.texture-grain` wrapper, V2 SIM-RACING badge, `font-monument text-shimmer` headline, gold pit-orange CTA, embedded DriverProfilePreview. Keeps doctrine-locked headline / subhead (T023 / T024). Imports `scripts/hero-motion.ts` for the data-hero-animate stagger.
- **`SessionProof.astro`** (T02) — three offset `.beam-card` tiles: YOUR SCORE / YOUR DEBRIEF / YOUR PROGRESSION with semantic colour coding (`text-safety-red` for losses, `text-acid-green` for fixes).
- **`S1Pain.astro`** (T03) — 2-card "typical driver stack vs LAP ecosystem" with INCLUDED acid-green badges on every LAP module.
- **`S2Versus.astro`** (T04) — dual-headline "They time laps. We coach drivers." with overlapping TIMING-FIRST / COACHING-FIRST cards and three pillar `.beam-card`s below.
- **`S3Product.astro`** (T05) — vertical sequence of 7 `.beam-card` stages (01 LOG → 07 PREPARE) with telemetry codes and monument body headings. (V2's GSAP horizontal scroll-pin deferred to Phase 4.)
- **`SimFirst.astro`** (T06) — 4 rationale cards with `font-monument text-pit-orange/20` ghost numerals + ACTIVE NOW / EXPANDING NEXT platform split.
- **`PremiumLayer.astro`** (T07) — 3-column 6-card feature grid with kicker-headline-body and corner-numeral ghost glyphs.
- **`Garage.astro`** (T08) — founder narrative panel with offset gold "L" badge + 3 stat cards + 3 testimonial slots reserved for July beta (`BETA SLOT 1/2/3 · July 2026`, no fabricated names per Doctrine §10).
- **`PitStop.astro`** (T09) — single-tier pricing card with both billing options (BEST VALUE acid-green badge on annual), feature list, gold CTA, GDPR-COMPLIANT trust strip, "See full pricing →" link to `/pricing`. (V2's billing toggle / FAQ accordion / feature matrix deferred to Phase 4.)
- **`Podium.astro`** (T10) — `.room.texture-grain` chequered-flag close. `font-monument text-shimmer` headline, gold CTA, IntersectionObserver fires `podium_reach` PostHog event at 50% visibility.

`FinalCta.astro` and `SocialProof.astro` are kept (used by `/demo`, `/how-it-works`); their Phase-2.5 atmospheric uplift stays. `DriverProfilePreview.astro` is kept (embedded inside StartGrid).

**Phase-3 explicitly does NOT include:** GSAP scroll-pinning in S3Product, count-up animation on Garage stats, billing toggle / FAQ accordion / feature matrix in PitStop, magnetic cursor / split-text / custom cursor anywhere. These are Phase-4 polish if JS budget allows.

## /loop rules
- Read sprint file, pick next `[ ]`, complete fully.
- Build verification: `pnpm build && pnpm preview` must succeed.
- Tests: `pnpm test` must be green.
- Commit: `sprint(marketing): T### <short>`.
- Invoke superpowers:test-driven-development for new components.
- Invoke superpowers:verification-before-completion before claim-done.
