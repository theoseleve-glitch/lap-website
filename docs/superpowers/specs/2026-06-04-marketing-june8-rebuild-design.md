# LAP Marketing Site — June-8 Rebuild (design spec)

**Date:** 2026-06-04 · **Branch:** `feat/marketing-june8-rebuild` · **Repo:** `lap-website` (Astro 5, Cloudflare Pages → `lap-coach.racing/`). Branch only, **no deploy**.

## Goal

Rebuild the marketing site **from scratch** (lean, static, minimal-motion) for the June-8 launch around the **single membership**, with branded **placeholder** product visuals now (real "studio" captures swapped in later, step 3). Reuse only the design-token layer, the blog tree + OG generator, the legal pages, and the SEO/JSON-LD scaffold. **The waitlist (`functions/` + its pages) is frozen and untouched.**

## Locked decisions

- **From scratch** — drop the 7-room scroll narrative + HUD chrome + GSAP + all motion scripts; build up from tokens.
- **Consolidated IA** — no B2B; fold future-dated landings; one `/product`.
- **EUR only** on pricing.
- **Waitlist frozen** — do not edit `functions/**`, `waitlist*.astro`, `WaitlistForm`, `WaitlistCount`, `ForSchoolsForm`, `export-waitlist.mjs`, or any Pages secret/trigger. (It still recites the old €12 offer; that is intentionally left as-is.)

## Pricing canon (single source of truth — from the webapp `pricing.ts`)

- **One membership.** Name: **LAP COACH**.
- **€19.90/mo** standard.
- **€14.90/mo for the first 50 founding members** (Founding-50; a real discounted price, hard stop at #51 enforced server-side).
- **30-day free trial**, no card charged until it ends.
- **Monthly only.** No annual. **No free tier. No B2B.** Cancel anytime.
- **EUR is the charged currency** (display EUR only on the site).
- Primary CTA everywhere: **"Start 30-day free trial" → `/billing`** (the canonical webapp target).
- **Included (full access):** unlimited session analysis · race strategy (all optimizer modes, unlimited duration) · visualization & comparison · coaching plans & drills · gamification & achievements · live pace & stint monitoring · PDF reports & API access · logger auto-sync · 3 linked devices · 12-month raw telemetry retention · 5-year report retention.
- **Loggers:** RaceChrono, RaceBox, AiM, MoTeC (CSV w/ GPS). **Scope:** kart + car.
- **Positioning:** rule-based coaching, *not* an LLM chat box; "they time laps, we coach drivers." Every claim must trace to a shippable feature — no "available now / live coaching now" overclaims; product visuals are labelled **"Preview — representative UI."**

## Principles

- Static Astro, **token-only** styling (no raw hex), TS strict, no `any`.
- **Minimal motion:** one-shot entrance choreography only. **Forbidden:** live clock, marquee, GSAP scroll-pins/scrub, magnetic cursor, count-ups, infinite shimmer, any ambient/looping animation. `prefers-reduced-motion` fully static.
- Budgets: homepage LCP ≤1.5s, script ≤100 KB, JS <150 KB/page. Prefer zero JS per page.
- Every page: title, meta description, canonical, OG image, JSON-LD.

## Reuse vs. build vs. remove

**Reuse:** `src/styles/global.css` `@theme` tokens (asphalt/concrete/chalk/steel + pit-orange-deep gold + accents; Space Grotesk / Space Mono / Inter; `.room`, `.grid-lap`, spacing/radius/elevation; `--chart-series-1..6`), the `LapWordmark`, the blog tree + per-blog OG generator (`og/blog/[slug].svg.ts`, `utils/og-svg.ts`), legal pages, BaseLayout's SEO/JSON-LD/font scaffold.

**Build fresh:** a lean `BaseLayout` (no motion scripts, no TimecodeCounter/SectorRibbon), a static `SiteHeader` + `SiteFooter`, all pages below, a `PricingCard` + `MembershipFeatures` + `FoundingFifty` + `FaqList`, and branded placeholder media components.

**Remove / redirect:** TimecodeCounter, SectorRibbon, `home-pins.ts`, `magnetic-cursor.ts`, `tick-up.ts`, `gsap-loader.ts`, `sector-progress.ts` + GSAP dep; `marquee-scroll` / `radio-wave` / shimmer-loop keyframes; all `Pricing*` old components, `PricingFounderOffer`, `PricingB2bTeaser`, the old rooms; pages `/for-schools`, `/launch`, `/v1`, the six `/product/*` pillars → **301 redirect** to the nearest new anchor (preserve inbound links).

## Information architecture

Global: `texture-grain` bg, static header/footer, one-shot hero entrance only, CTA "Start 30-day free trial" → `/billing`, pricing line "€19.90/mo · €14.90/mo for the first 50 founding members · 30-day free trial, no card until it ends."

- **`/` Home** — (1) Hero: H1 (one-shot stagger), honest status sub-line (no "early access open" badge), primary + secondary CTA. (2) Static value strip. (3) Session proof: 3 static cards (score / debrief / progression) + placeholder telemetry mock. (4) Problem → LAP ecosystem (static two-pane). (5) "They time laps. We coach drivers." (static). (6) The loop: capture → analyze → plan → improve (static) + placeholder UI. (7) Pricing teaser → `/pricing`. (8) Founder note + reserved beta-testimonial slots (no fabricated names).
- **`/pricing`** — H1 "One membership. One price." → `PricingCard` (€19.90, Founding-50 €14.90 first-50 callout, 30-day trial, monthly-only, cancel anytime, no card until trial ends) → `MembershipFeatures` (full checklist) → `FoundingFifty` block → `FaqList` (trial, billing, cancellation at period end, no annual, no free tier, supported loggers) → refund link. No yearly, no B2B, no €150 value-anchor.
- **`/product`** — 5 anchored sections w/ placeholder media each: (1) session analysis & 4-pillar scoring; (2) corner coaching & coaching library (rule-based, anti-LLM); (3) race strategy (unlimited duration, all modes, pit/stint); (4) sim↔real bridge (illustrative, labelled); (5) capture & devices (RaceChrono/RaceBox/AiM/MoTeC CSV; kart+car; 3 devices; 12-mo telemetry / 5-yr report).
- **`/how-it-works`** — diagram + 4 steps + honest "today vs roadmap"; final CTA.
- **`/demo`** — "see it before you sign up"; honest reserved 16:9 video slot + placeholder stills; final CTA.
- **`/press`** — keep; pricing fact → new model; "screenshots ship at public beta."
- **`/privacy`, `/refund-policy`** — keep; refund-policy rewritten to **30-day** trial + EU statutory copy re-keyed to 30 days; remove old €12 grandfather section.
- **Blog tree** — keep; pricing pass on `introducing-lap`, `pillar-3-faq`, `blog-batch-2-faq`; OG generator unchanged.
- **`/404`, `/500`** — keep (restyled to new chrome).
- **`/waitlist` (+ welcome/unsubscribed)** — **frozen, untouched.**

## Media (placeholders now → real captures step 3)

- Generate **`public/og-default.png` + `public/og-default-twitter.png`** (1200×630) from brand tokens (extend `og-svg.ts` for a site default, rasterize). Filenames must match `__tests__/site-audit-final.test.ts`.
- Wire **favicons + manifest** from sibling `brand/` into `public/` + `<link>`s in BaseLayout.
- Branded **SVG/PNG product mockups** using `--chart-series-*` tokens, each labelled "Preview — representative UI", slotted into **fixed footprints** so step-3 real captures swap in with zero layout shift. No motion on placeholders.
- Demo video: keep an honest reserved slot ("walkthrough lands at public beta"); no placeholder video.

## Quality / definition of done

- `pnpm build` succeeds; `pnpm preview` serves; **Lighthouse budget honored** (homepage LCP ≤1.5s, JS <150 KB/page).
- `pnpm test` (vitest) green — the ~19 old-price test files rewritten in lockstep with the new copy; axe/Playwright e2e pass.
- No old-pricing string remains in `src/` outside the frozen waitlist (€15/€150/€9/€12/annual/14-day/B2B/€10-seat).
- No motion-doctrine violation remains; `prefers-reduced-motion` static.
- `functions/**` + waitlist pages byte-identical to `master`.
- Branch only, no deploy. Commits: `feat(marketing): <area> — <short>`.

## Build phases (ultracode workflows)

1. **Foundation** — lean BaseLayout, SiteHeader/SiteFooter, global.css motion-keyframe cleanup, pricing data + `PricingCard`/`MembershipFeatures`/`FoundingFifty`/`FaqList`, OG-default + favicons.
2. **Pages (parallel)** — Home, /pricing, /product, /how-it-works, /demo (+ press/legal updates).
3. **Placeholder media** — branded SVG mockups into fixed footprints.
4. **Redirects + test lockstep + verify** — 301s for removed pages; rewrite old-price tests; `pnpm build` + lighthouse + vitest green.
