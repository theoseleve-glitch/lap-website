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

## /loop rules
- Read sprint file, pick next `[ ]`, complete fully.
- Build verification: `pnpm build && pnpm preview` must succeed.
- Tests: `pnpm test` must be green.
- Commit: `sprint(marketing): T### <short>`.
- Invoke superpowers:test-driven-development for new components.
- Invoke superpowers:verification-before-completion before claim-done.
