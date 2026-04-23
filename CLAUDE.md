# CLAUDE.md — lap-website

Repo-scoped instructions. Extends `C:/Users/Admin/CLAUDE.md`.

## Context
Marketing site. Static-first. Must be fast, accessible, SEO-strong.

## Conventions
- Astro + Tailwind + TypeScript strict.
- Every page has: title, description, OG image, JSON-LD structured data.
- LCP <1.8s on homepage (tighter than webapp's 2.5s).
- Total JS per page <150KB gzip. Prefer no JS unless interactivity needed.
- GSAP only for above-the-fold motion; defer below-fold.
- Copy governance: every claim traceable to a shippable feature (no AI-coach-now claims).

## Forbidden
- No tracking that requires consent on initial page-load (GDPR-friendly: Plausible or PostHog with cookieless mode).
- No authenticated routes in this repo — those live in `lap-webapp`.
- No raw hex colors — use Tailwind tokens.
- No `any` in TS.
- No `--no-verify`.

## /loop rules
- Read sprint file, pick next `[ ]`, complete fully.
- Build verification: `pnpm build && pnpm preview` must succeed.
- Tests: `pnpm test` must be green.
- Commit: `sprint(marketing): T### <short>`.
- Invoke superpowers:test-driven-development for new components.
- Invoke superpowers:verification-before-completion before claim-done.
