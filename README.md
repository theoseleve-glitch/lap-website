# lap-website

Public marketing site for LAP at `lap.com`. Built with Astro (static-first) for fast loads + great SEO. Deployed to Cloudflare Pages.

## Sprint queue

`C:/Users/Admin/Documents/Telemetry/docs/roadmap/sprint-30day/sprint-marketing.md`

## Purpose

This site is the **storefront**. It:
- Explains the LAP ecosystem (desktop + mobile + webapp + bridge)
- Sells the vision (Driver OS for amateur sim racers)
- Captures trial signups + waitlist
- Hosts SEO content that ranks on "sim to real transfer", "telemetry coaching", etc.
- Links to the authenticated webapp at `app.lap.com`

## Does NOT contain

- The authenticated webapp (that's `lap-webapp`)
- Coaching / session / driver data
- User accounts

## Status

Seeded 2026-04-23. Scaffold comes from marketing sprint task T001.

## Stack

- Astro 5 (static-first)
- Tailwind CSS
- TypeScript strict
- GSAP for motion
- Resend (contact form → email)
- Cloudflare Pages (hosting)
- PostHog (analytics)
- Sentry (error tracking)

## Relationship to legacy `lap-website/` monolith

The old `lap-website/` in the original workspace (elsewhere) is a Next.js monolith mixing marketing + authenticated app. This repo is the cleanly-extracted marketing half per ADR-002. Content migrates over during the sprint.
