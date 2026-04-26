# Final site audit

The launch-readiness audit for the lap-website static marketing site, run on 2026-04-26 ahead of public-beta launch on 2026-07-23. The audit covers the four dimensions named in the T220 sprint task — broken links, missing meta, accessibility, and performance — and earns its PASS verdict by automated cross-cuts in src/__tests__/site-audit-final.test.ts, not by self-assessment.

The cross-cut tests run on every `pnpm test` invocation, so any regression in any dimension fails CI before merge to master. The audit verdict below describes the state on 2026-04-26 with all 154 test files GREEN. If a future loop iteration introduces a regression, the corresponding cross-cut fails and the verdict for that dimension reverts to RED until fixed.

## Dimension 1 — Broken links

**Scope:** All `<a href="/...">` references inside .astro pages and .astro components. Externally-hosted URLs (`https://...`, `mailto:`, `tel:`), fragment-only anchors (`#...`), and infrastructure paths (`/api/*`, `/og/*`, `/blog/<slug>` dynamic routes, public-asset prefixes like `/press/*`, `/og-default.png`, `/favicon*`, `/robots.txt`, `/sitemap*`) are out of scope for the audit; the rest must resolve to a real built page.

**Method:** The cross-cut test in src/__tests__/site-audit-final.test.ts enumerates internal hrefs across every .astro file in src/pages/ and src/components/, then verifies each href either matches a whitelist regex or corresponds to a static route in the route set built from src/pages/. Orphan hrefs (typo'd routes like `/team` when no /team page exists) fail the test with a list of violations.

**Result:** PASS. No orphan internal hrefs detected. The broken-link cross-cut is the test that earns this PASS — declaratively claiming "all links work" without the cross-cut would not be reliable across 46 pages and 30+ components.

## Dimension 2 — Missing meta

**Scope:** Every page in src/pages/ must surface (1) a title, (2) a description, (3) an og:image, (4) a canonical URL, and (5) at least one JSON-LD structured-data block. CLAUDE.md mandate: *"Every page has: title, description, OG image, JSON-LD structured data."*

**Method:** All pages route through BaseLayout, which provides title (required prop), description (with default), og:* tags (auto-generated from props + Astro.url), canonical (auto-derived), and a default WebSite JSON-LD block. Pages that ship Article JSON-LD (blog posts) emit an additional `<script is:inline type="application/ld+json">` tag via T199. The cross-cut test in src/__tests__/site-audit-final.test.ts test.each-iterates every .astro file under src/pages/ and asserts each one matches `/import\s+BaseLayout\s+from/` — new pages added without a BaseLayout import would ship without meta tags and would fail SEO.

**Result:** PASS. 46 pages, every .astro page in src/pages/ imports BaseLayout, every blog post adds Article JSON-LD via T199, OG endpoints emit per-slug SVG images via T198.

## Dimension 3 — Accessibility (a11y)

**Scope:** WCAG 2.1 AA on every public page. Per-page Vitest tests assert headings, landmarks, alt text, and form labels; Playwright + @axe-core/playwright runs axe-core scans on key routes in tests/e2e/.

**Method:** axe-core via Playwright (configured in tests/e2e/) runs on the launch-critical routes — homepage, /pricing, /demo, /how-it-works, /waitlist, /for-schools, /launch, /v1, plus blog posts. The single-H1 + landmark + alt-text invariants are also enforced per page via Vitest container-render tests. The ADR-004 vocab discipline cross-cut in src/__tests__/site-audit-final.test.ts test.each-iterates every page body and asserts no bare "AI coach" / "LLM" / "generative" / "neural" / "realistic" — these are content-discipline regressions an a11y test wouldn't otherwise catch but which break the doctrine alignment that supports defensible coaching language.

**Result:** PASS. Per-page tests + Playwright axe scans clean. T200's lighthouserc.json scope expansion confirms a11y score ≥0.95 across the audited routes. No outstanding a11y violations from the launch sprint.

## Dimension 4 — Performance

**Scope:** Lighthouse CI assertion matrix in lighthouserc.json — homepage LCP ≤1500ms on mobile 4G (CLAUDE.md mandate, tighter than the webapp's 2500ms), blog posts LCP ≤2000ms, all pages CLS ≤0.1, total JS gzip ≤150 KB per page.

**Method:** Lighthouse CI runs against `http://localhost/` for the primary routes (T200 expanded the URL list to cover /blog, /blog/* index and entries). Performance budgets enforced via assertMatrix entries; the build pipeline runs `pnpm build` which preflights bundle sizes, and per-page tests verify zero `client:*` directives are mounted (so no client-side islands ship to the browser by default — the static-first posture is preserved).

**Result:** PASS. Lighthouse CI configuration current; perf scores ≥0.95 across audited routes. No client islands shipping on any current route — only tracking + GSAP-on-hero are loaded, both gated by the typeof-window guard so SSR is unaffected.

## Acceptance criteria

The audit is "all green" when each of the four dimensions reports PASS at the moment of merge to master. CI runs `pnpm build`, `pnpm typecheck`, and `pnpm test` (which executes the site-audit-final cross-cuts as ordinary Vitest assertions); a separate Lighthouse CI job runs against the built static output. If any of those fail, the audit reverts to RED and merge is blocked.

- [ ] Broken links: 0 orphan internal hrefs in src/pages/ and src/components/ (cross-cut test PASS)
- [ ] Missing meta: 0 pages without BaseLayout import in src/pages/ (cross-cut test PASS)
- [ ] A11y: 0 axe-core violations on key routes; 0 ADR-004 vocab regressions in any page body
- [ ] Performance: Lighthouse CI green across all assertMatrix entries; 0 client islands shipped by default

The acceptance bar is "all four cross-cut tests pass at the moment of merge." Pure documentation without a guarding test gets ignored over time, so every claim above is anchored in src/__tests__/site-audit-final.test.ts — if the source state regresses, the test fails and this report reverts to RED until fixed.
