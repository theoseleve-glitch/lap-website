# PostHog conversion funnel dashboards

A configuration spec for the conversion-funnel dashboards the founder provisions in the PostHog UI ahead of public-beta launch on 2026-07-23. PostHog free tier has no dashboards-as-code API, so this artefact is the input the founder copies into PostHog's funnel builder and dashboard creator. Funnel step ordering, time windows, breakdown properties, and panel layouts are locked here so the dashboards are reproducible if a PostHog reset or re-init is ever needed.

The events that feed each funnel are wired in the site source — `signup_clicked`, `demo_viewed`, and `pricing_viewed` from `src/scripts/marketing-events.ts` (T218); `waitlist_submitted` and `waitlist_confirmed` from `src/scripts/waitlist-events.ts` (T103); `download_clicked` from `src/scripts/download-events.ts` (T128 + T218). PostHog is initialised cookieless (`persistence: 'memory'` per ADR-019 and the CLAUDE.md GDPR-friendly mandate), so every funnel below is anonymous-session-scoped — no consent banner is required, and no cross-session identity links visitors over time. That posture is why PostHog earned the kilobyte cost over Plausible (ADR-019) and is also why the dashboards focus on rates rather than per-user journeys.

## Dashboard 1 — Top-of-funnel pageview health

**Purpose:** Surface daily and weekly pageview volume plus unique-visitor counts per page so the founder spots traffic spikes (positive or negative) within a few hours of them happening. This is the early-warning panel — if any of the launch artefacts (T212 Reddit, T213 Discord, T214 YouTube, T215 Twitter, T216 LinkedIn, T217 Product Hunt) drives or fails to drive traffic, this dashboard shows it first.

**Panels:**

- Pageviews — line chart, 7-day rolling window, breakdown by `$current_url`, top 20 paths. Tracks whether organic and referral traffic is growing, flat, or dropping.
- Unique visitors — line chart, same window, same breakdown. Detects bot floods (pageviews up but uniques flat) and cache misses (uniques up but pageviews flat per visitor).
- Top referrers — table, last 30 days, group by `$initial_referrer`. Reveals which channels (Reddit, Twitter, LinkedIn, Product Hunt, YouTube) actually deliver traffic versus just absorb posting effort.
- /pricing pageview rate — single number, last 7 days. Surfaces pricing-page reach because it is the first revealed-intent signal a visitor produces.
- /demo pageview rate — single number, last 7 days. Mirrors the pricing tile for the demo-page on-ramp.

## Dashboard 2 — Waitlist conversion funnel

**Purpose:** Measure how the visitors-to-confirmed-subscribers path converts. This is the pre-launch growth metric that matters; if it decays week over week, the founder investigates before public beta opens.

**Funnel definition (Funnel A — Waitlist conversion):**

- Step 1: pageview on any path
- Step 2: `signup_clicked` (T218; from any source)
- Step 3: pageview on `/waitlist`
- Step 4: `waitlist_submitted` (T103; fired by /waitlist when URL has `?status=submitted`, the 303 destination of the form POST)
- Step 5: `waitlist_confirmed` (T103; fired by /waitlist/welcome, the 303 destination of the email confirm link)

**Time window:** 14 days. The upper bound of "if a visitor is going to confirm, they will within two weeks of first hitting the site." Anything longer dilutes the funnel with returning-visitor noise.

**Panels:**

- Funnel A end-to-end conversion rate — single number. The headline metric.
- Funnel A drop-off table — one row per step, showing entry count, exit count, drop-off percentage. Highlights which step bleeds the most users so the founder fixes the right step first.
- Submitted-to-confirmed rate — single number, isolated. The gap between submitted and confirmed is the deliverability and inbox-trust proxy: if this drops, the founder investigates SPF / DKIM / domain reputation, not the form itself.
- `signup_clicked` source breakdown — pie chart, last 30 days, group by the `source` property (homepage, launch-page, v1-page, pricing, for-schools, demo-page, other). Which page actually drives sign-up intent.

## Dashboard 3 — Page-level engagement and intent

**Purpose:** Per-page intent metrics for the two highest-intent pages (/pricing and /demo) plus the in-progress download-CTA pages.

**Funnel definition (Funnel B — Pricing → signup):**

- Step 1: `pricing_viewed` (T218; fires on /pricing pageview)
- Step 2: `signup_clicked` with `source = 'pricing'`

**Funnel definition (Funnel C — Demo → signup):**

- Step 1: `demo_viewed` with `source = 'demo-page'` (T218; fires on /demo pageview)
- Step 2: `signup_clicked` with `source = 'demo-page'`

**Time window:** 24 hours. Intent decays fast; if a /pricing visitor has not clicked the primary CTA the same day, count the visit as research-only and move on.

**Panels:**

- Funnel B conversion rate — single number.
- Funnel C conversion rate — single number.
- `download_clicked` event volume — line chart, last 30 days, breakdown by `platform` property (windows / macos / android / ios). Dormant pre-launch (T110 + T114 are BLOCKED on shipped artefacts), but the panel exists so it auto-populates the day downloads ship.
- `download_clicked` source breakdown — pie chart, group by `source` property (product-desktop / product-mobile / homepage). Mirrors the `signup_clicked` source breakdown for the download path.

## Acceptance criteria

The dashboards are "configured" when the founder can answer all six questions below from the PostHog UI in under one minute each, without re-running a query or building an ad-hoc filter:

- [ ] What was site traffic (pageviews and uniques) the last 7 days?
- [ ] What are the top 5 referrer sources the last 30 days?
- [ ] What is the end-to-end Waitlist conversion rate (Funnel A)?
- [ ] At which Funnel A step do most visitors drop off?
- [ ] What is the Pricing → signup conversion rate (Funnel B)?
- [ ] What is the Demo → signup conversion rate (Funnel C)?

If any item takes more than a minute to find, the dashboard layout needs a panel adjustment before T219 closes. The acceptance bar is sub-minute lookup, not "a query exists somewhere in the workspace" — sub-minute is the threshold at which the founder will actually check the metric daily, which is the threshold at which the metric will catch a problem before it compounds.
