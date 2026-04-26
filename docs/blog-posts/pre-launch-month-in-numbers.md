# The Pre-launch Month in Numbers

This is the first of what I plan to make a recurring
monthly post: the build-in-public update for LAP, written
plainly with concrete counts, including the parts that are
not flattering. The roadmap commits to a public beta by
end of Month 3 and a paid product by Month 6, which makes
this — Month 1 — the foundational month. The numbers below
are what foundational looks like in practice, before any
of the customer-facing surface exists.

I want the format established correctly from the first
edition. A monthly update that only ships in months when
the numbers are flattering is exactly what builds distrust
later, when the unflattering month inevitably arrives. So:
what we did, what we did not do, the numerals behind both,
and what's next.

## What Month 1 actually was

Foundational design work. The strategic doctrine was
ratified — 198 questions answered across product,
positioning, persona, scope, and commitments — and the
ratification turned into the source-of-truth document the
rest of the build runs against. This is the document that
locks the deliberate scope choices, including the ones the
project has committed not to revisit without an ADR
amendment.

Architecture decisions: 19 ADRs landed in Month 1, each one
tracing a scope choice to its evidence. ADR-001 (deep
agentic-flow integration), ADR-004 (every coaching
prescription must trace to a hand-curated written rule),
ADR-026 (3-tier model routing), and 16 others. The ADR
discipline is the mechanism by which doctrine becomes
enforceable in code review and in agent behavior, rather
than living only as prose.

## The publishing surface in numbers

The marketing site has 4 pillar articles published —
sim-to-real transfer, what-is-trail-braking, the telemetry
app comparison, and the [driver development plan](
/blog/driver-development-plan) framework piece. Each one
is the long-form anchor for one pillar of the content
cluster.

8 supporting posts shipped to date, structured into two
batches. Batch 1 was 5 technique deep-dives — late braking
at T1, throttle pickup, apex speed, consistency, tire
management — each one expanding on a coaching rule the
rule library will diagnose. Batch 2 is in progress; 3
founder/product stories shipped this month with 2 more
queued. The 5-post batch structure is itself a deliberate
choice — it forces the cluster to produce internal links
in volumes that justify a Pillar page rather than a single
hero article.

Internal linking discipline is locked by contract test on
every published post. Each post contains at least one link
to a sibling pillar; the cluster as a whole reaches all
4 pillars cumulatively across the batch. The discipline
runs on test infrastructure, not on remembering, which is
how a 1-person publishing operation avoids the broken-
link decay that catches up with most blogs around month 6.

## Test coverage on the marketing site

156 marketing-sprint tasks completed in Month 1, each one
shipping with the contract tests that lock the post or
component against drift. The contract test pattern is the
load-bearing one: a post is shipped only when its word
count is in band, its forbidden-vocabulary lists pass, its
cross-pillar reach hits the floor, and its anti-overclaim
guardrails are clean. The patterns developed for Batch 1
were reused (and adapted) for Batch 2, with topic-specific
guardrails added per post.

The test suite for the marketing site reached over 1200
tests passing this month. Typecheck clean across 200+
files. Lighthouse budgets enforced in CI: LCP under 1.5s
on mobile 4G for the homepage, total JS under 150KB
gzipped per page. The discipline is not "tests for
testing's sake" — every contract test was added because a
specific drift was caught manually first and the test was
written to prevent the drift from re-emerging.

## What Month 1 was NOT

This is the section that distinguishes the format from a
brag list. The pre-launch reality, plainly:

- No paying customers. There is no product to pay for yet.
- No public beta. Beta is end of Month 3, sim-only at
  first, with a closed driver cohort.
- No revenue. Founder savings, not pre-orders.
- No real-world driver beta cohort assembled. The persona
  work is done; the recruitment surface is not yet live.
- No marketing claims about features that have not
  shipped. The site links to the doctrine, the framework,
  and the rule library design — not to a product surface
  that does not exist.

I did not assemble a waitlist counter to put on the
homepage, because the waitlist signups in Month 1 are
small enough that the number would be more flattering as a
private datapoint than as a public counter. The counter
ships when the number tells a story worth telling.

I also did not commission stock photography, write
homepage copy that names features the rule library cannot
yet diagnose, or stand up a comparison page that makes
claims the product cannot back up the day after a visitor
takes a free trial. The pre-launch surface ships only the
parts of the argument that are already true — the
doctrine, the framework, and the publishing cluster — and
holds the rest until the rule library has earned the right
to make the next claim. This is the same scope discipline
that shows up in the [framework
post](/blog/driver-development-plan) under a different
name: do not prescribe what the rule library cannot
diagnose.

## What changed in the doctrine this month

The 198-question ratification was the headline change. The
follow-on changes were the ADRs that turned doctrine into
build constraints — most consequentially ADR-004 (the
rule-traceability mandate that determines what the rule
library has to be) and ADR-026 (the 3-tier model routing
that
determines how internal agent work is priced). Doctrine
without ADRs is editorial; doctrine with 19 ADRs behind it
is a build contract.

## What Month 2 looks like, in numbers I can commit to

- 1 rule library v0 — the hand-curated coaching rules that
  the prescription anatomy depends on, scoped to the
  weakness shapes the four pillar articles already name.
- 5+ Batch 3 supporting posts — early-driver onboarding
  edition, building toward the public beta cohort.
- Month 2 monthly update, shipped on the same cadence
  this one establishes — including whatever numbers
  Month 2 produces, flattering or not.

The cadence of these posts is the commitment. The numbers
in any one of them are a snapshot. The discipline of
running the [framework](/blog/driver-development-plan)
that LAP applies to its drivers — diagnose, prescribe,
execute, measure, adapt — is the same discipline the
build itself runs under, and the monthly update is the
public-facing measurement step.

## Why "in numbers" is the format

A pre-launch month with no numerals reads as wishful
thinking dressed up as marketing. A pre-launch month
with numerals attached, including the unflattering ones,
reads as a project that knows where it is. That is the
position I want this product to be argued from from the
first month onward, and it is why "in numbers" rather
than "in narrative" is the format the recurring update
ships under.
