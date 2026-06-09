# Pillar 3: Best Sim Racing Telemetry Apps Compared (2026) — Outline

> Planning artifact for T151. Subsequent sprint tasks (T152–T160)
> draft sections of this article from the structure below.
> Outline is the contract; section drafts must hit their target
> word count and doctrine anchors. The article's structural
> commitment is **honest comparison** — feature-based, not
> opinion-based.

## Metadata

| Field | Value |
|------|-------|
| Block | H — SEO pillar pages |
| Pillar | 3 of 4 (telemetry apps comparison) |
| Sprint range | T151 (this) — T160 |
| Target final word count | 3,000–3,500 words (excluding FAQ) |
| Sections | 7 (1 intro + 5 numbered + 1 conclusion) |
| Primary search intent | "Which sim racing telemetry app should I use?" |
| Secondary search intent | "Comparison of LAP / Garage61 / RaceLab / MoTeC / Track Attack / STINT" (long-tail per-competitor searches converge here) |
| Doctrine anchors | 01-STRATEGIC-DOCTRINE.md §3 (personas — defines T155 framework), §5 (DOES capture roster — names exactly which sim platforms LAP captures from), §10 (commitments — anchors T156 honest-limitations section), ADR-004 (no LLM coaching framing) |
| Voice | Declarative, comparative, fact-based; second-person where the persona section calls for it; first-person plural ("we") only in T156 honest-limitations section where it carries trust weight |
| Forbidden vocab (ADR-004 + Pillar 2 carry-over + Pillar 3 extension) | "AI coach", "LLM", "generative", "neural", "realistic", "magic", "secret", "trick" + Pillar 3 extensions: "clearly worse", "outdated", "bloated", "overhyped" — subjective competitor disparagements that we cannot substantiate |

## Primary keyword cluster

Search terms an actual sim racer / track-day driver would Google
when shopping for telemetry tools. Use these naturally in
headings and body — never stuffed.

**Head terms**:
- "best sim racing telemetry app"
- "sim racing telemetry comparison"
- "telemetry apps compared 2026"
- "iRacing telemetry tools"

**Long-tail per-competitor variants** (the article's main
acquisition surface — these are individual long-tail searches
that all converge on this one comparison page):
- "Garage61 vs MoTeC"
- "RaceLab telemetry review"
- "MoTeC for sim racing"
- "Track Attack vs Garage61"
- "STINT telemetry app"
- "free sim racing telemetry"
- "telemetry analyzer ACC"

**Question-form long-tail (FAQ candidates for T159)**:
- "Which telemetry app is best for iRacing?"
- "Is MoTeC worth it for sim racing?"
- "What is the difference between LAP and Garage61?"
- "Which app captures both sim and real telemetry?"
- "Is Track Attack still maintained?"

**Keyword anchors per section** are listed inside each section
brief below.

## The six telemetry apps in scope

The sprint task names six apps. The outline lists them with
**only the publicly verifiable framing** — the actual feature
inventories belong to T152 (what each does well) and T153 (what
each lacks). Section drafts MUST verify each claim against the
app's current product pages or documentation; outline does not
assert capability, only naming.

| App | Primary surface | Pricing model class |
|---|---|---|
| **LAP** (us) | Sim + real-world capture; cross-platform driver profile | Subscription (€19.90/mo standard, €14.90/mo founding-50) |
| **Garage61** | Sim telemetry + lap sharing; iRacing-heavy | Freemium |
| **RaceLab** | Sim racing app suite incl. telemetry features | Freemium / one-time |
| **MoTeC** | Professional motorsport data analysis (i2 Pro etc.) | One-time licence (paid) |
| **Track Attack** | Real-world track-day capture (phone GPS / OBD) | Subscription / freemium |
| **STINT** | Sim telemetry analysis (recent entrant) | Freemium |

LAP appears first by alphabetical accident (the L sorts before
M/R/S/T) and the sprint listing — not because the article
declares LAP best. T156 (honest LAP limitations) is the section
that earns the right to lead with our own product.

## Comparison axes

The article uses six explicit dimensions for every claim. Every
section MUST locate its claims on these axes — no vague "feel"
comparisons.

1. **Capture surface — sim platforms supported.** Which sim
   titles does the app capture telemetry from? (iRacing, ACC,
   AMS2, rFactor 2, Le Mans Ultimate, F1 24, etc.) An app that
   lists "iRacing only" lands in a different persona bucket
   than one supporting six titles.
2. **Capture surface — real-world.** Does the app capture from
   real-world driving (RaceBox / phone GPS / OBD-II)? Yes/no
   for each app.
3. **Data depth.** What does it do with the data? Raw trace
   visualisation only / lap comparison / weakness detection /
   coaching prescription / driver profile over time.
4. **Cross-platform unification.** Does it treat sim and real
   sessions as one driver progression, or separate silos?
5. **Pricing model.** One-time / freemium / subscription /
   professional-licence; with the actual public price stated.
6. **Persona fit.** Casual sim racer / competitive sim racer /
   track-day driver / team coach / pro driver. Each app has a
   strongest persona; T155 names them.

These axes are the SHARED VOCABULARY across sections T152-T156.
A section that introduces a new dimension without grounding it
in this list breaks article-level coherence.

## Internal cross-links (target page → expected anchor text)

The article is the SEO acquisition surface for the
shopping-comparison reader. Cross-links are how the converted
reader reaches the LAP product surface and the broader article
cluster.

| Internal link | Anchor copy hint | Where it should appear |
|---|---|---|
| `/product` (overview) | "the LAP five-pillar surface" / "our five-pillar architecture" | Section 2 (T152, when describing what LAP does) and Section 6 (T156) |
| `/product/desktop` | "the desktop client" | Section 2, Section 4 (T154 pricing — desktop is part of subscription) |
| `/product/mobile` | "the mobile app" | Section 2, Section 5 (T155 persona — track-day driver) |
| `/product/bridge` | "the bridge" / "our cross-platform unification" | Section 2 (LAP is the only entry that does this), Section 5 (team coach persona) |
| `/product/coaching` | "the coaching library" / "our rule library" | Section 2, Section 5 (competitive-sim-racer persona) |
| `/product/driver-profile` | "your driver profile" | Section 2, Section 5 |
| `/pricing` | "our pricing" | Section 4 (T154 pricing comparison — link into LAP's actual pricing page for verification) |
| `/blog/sim-to-real-transfer` | "the sim-to-real transfer article" | Section 5 (T155 — track-day driver persona naturally references the cross-platform argument) |
| `/blog/what-is-trail-braking` | "the trail-braking explainer" | Section 5 (T155 — competitive-sim-racer persona references technique-depth) |
| `/waitlist` | "the waitlist" | Section 7 (conclusion CTA) |

Cross-pillar discipline: linking BOTH Pillar 1 AND Pillar 2 in
this article (in section 5's persona discussion) is what makes
the four-pillar cluster a hub rather than four parallel pages.

## Sections

### Section 1 — The question (~250 words) [introduces, no T-task]

**Premise**: open with the actual reader question. Two distinct
readers arrive here:

- The sim racer who has done a season on iRacing without ever
  looking at telemetry, has been told "you should be using
  telemetry," and is shopping for a tool — overwhelmed by the
  options, uncertain what each actually does.
- The track-day driver who already uses a RaceBox or
  phone-based capture for real-world sessions and is wondering
  whether any sim-side tool would give them a single
  cross-platform view of their driving.

**Frame**: there is no single "best" telemetry app. Each app
fits a particular driver persona, and the right shopping
question is "which app fits MY data, MY platform, MY budget,
MY coaching needs?" The article walks through six apps on six
shared dimensions, then maps each persona to a shortlist.

**Closing line**: previews the comparison axes and notes that
Section 5 carries the persona-mapping payoff.

**Doctrine anchor**: 01-STRATEGIC-DOCTRINE.md §3 personas — the
shopping-by-persona framing IS the doctrine, not a marketing
device.

**Forbidden**: "best app" as a winner-declaration. The article
title uses "best" because that is what people search for; the
body never declares one.

### Section 2 — What each does well [T152] (~600 words)

**Brief**: one paragraph per app (six paragraphs). Each
paragraph names 3–5 strengths grounded in OBSERVABLE features
(not "feels polished" — concrete capability claims). Cite the
app's own product page or documentation for any claim that
isn't obvious.

**Per-app paragraph structure**:
- App name + one-sentence positioning
- 3–5 concrete strengths from comparison axes 1–4
- One sentence on the persona this app most directly serves

**Doctrine discipline (section-specific)**:
- LAP's paragraph cites Doctrine §5 (DOES capture roster) for
  sim platform list; cites §1 (cross-platform mission) for
  bridge claim
- Other apps cited from their own current marketing/docs;
  section drafter MUST verify before claiming
- "Best in class" claims forbidden — frame strengths
  comparatively ("X has the broadest sim platform list of the
  six")

**Keyword anchors**: "what each telemetry app does",
"strengths of [app]", "[app] features".

**Internal links**: /product, /product/bridge, /product/coaching,
/product/driver-profile, /product/desktop (LAP's paragraph
clusters its product links).

### Section 3 — What each lacks [T153] (~500 words)

**Brief**: one paragraph per app (six paragraphs). Each names
2–4 specific feature absences or scope limits. NOT subjective
("feels dated"); FACTUAL ("no real-world capture", "no rule-
based coaching", "iRacing only").

**Honest framing requirement**: LAP's paragraph cannot be the
shortest. The credibility of every other app's "what it lacks"
paragraph depends on LAP's being equally honest about its own
gaps — and T156 then carries the deeper limitations
discussion.

**Per-app paragraph structure**:
- App name (consistent ordering with Section 2)
- 2–4 specific scope limits or feature absences
- One sentence on what those limits mean for the persona that
  app would otherwise serve

**Doctrine discipline (section-specific)**:
- "Outdated" / "bloated" / "ugly" forbidden as descriptors
- "Lacks X" or "scope is sim-only / sim-+-iRacing-only" required
  factual framings
- Forbidden vocab guardrail extended for the section: no
  "clearly worse", "objectively worse", "obviously inferior"
  or any normative comparator

**Keyword anchors**: "[app] limitations", "what [app] doesn't
do", "[app] missing features".

### Section 4 — Pricing comparison [T154] (~400 words including a TABLE)

**Brief**: a TABLE with all six apps and their public pricing as
of 2026-04-25 (article publication date). The table is the
section's main artifact; surrounding prose contextualises it.

**Required table columns**:
- App name
- Pricing model class (free / freemium / subscription /
  one-time / professional-licence)
- Entry price (free if free, monthly fee if subscription,
  one-time fee if one-time, contact-sales if professional)
- Free tier exists (yes/no + brief scope)
- Notes (any pricing nuance — e.g., student discount, paid DLC
  for additional sim titles, etc.)

**Required surrounding prose**:
- Opening paragraph: pricing is one of six dimensions, not the
  whole purchase decision. A free tool that solves your
  problem beats a paid tool that doesn't.
- Closing paragraph: link out to /pricing for LAP's full
  pricing details (the article's pricing line is a snapshot;
  the canonical source is /pricing). Reaffirm waitlist
  grandfathering as the trust signal.

**Doctrine discipline**: section MUST cite each app's pricing
from the app's own current pricing page or documentation;
section drafter verifies before commit. "Free" / "premium" are
both doctrine-aligned; "expensive" / "cheap" are subjective
forbidden vocabulary in this section.

**Keyword anchors**: "[app] price", "telemetry app cost",
"sim racing software cost".

**Internal link**: /pricing (LAP's row links to the canonical
pricing page).

### Section 5 — Choosing by persona [T155] (~600 words)

**Brief**: this is the section that earns the article. Map
five reader personas to a shortlist of apps that fit them.
Personas come from 01-STRATEGIC-DOCTRINE.md §3.

**The five personas to cover**:

1. **The casual sim racer** — runs iRacing or ACC for fun a
   few times a week, no real-world driving. Wants to see lap
   data without paying for professional tooling.
2. **The competitive sim racer** — chasing licence-class
   progression on iRacing, focused on lap time on specific
   tracks/cars. Will pay for tools that improve consistency.
3. **The track-day driver** — does 2–6 real track days a year;
   sim-prepares occasionally. Wants the rare cross-platform
   tool that treats both surfaces as one progression.
4. **The team coach** — runs sessions for a sim racing team
   (esports) or a club (real). Needs multi-driver dashboards
   and the ability to compare across drivers.
5. **The pro / semi-pro driver** — has real-world racing
   commitments, uses telemetry as part of professional
   preparation. Will pay for whatever produces the cleanest
   data, including professional licences.

**Per-persona paragraph structure**:
- Persona name + one-sentence definition
- The 1–3 apps that fit this persona, named, with brief reason
- Honest framing: if LAP is the strongest fit, say so AND
  acknowledge what the persona gives up vs the competing
  alternative; if LAP is NOT the strongest fit (e.g., pro
  driver may be better served by MoTeC for now), say that

**Doctrine discipline**: every persona must have an honest
"LAP gives up X versus Y" sentence — without that, the section
becomes a sales pitch dressed as comparison. The
trust-building cost of saying "LAP is not yet the right
answer for the pro persona" is what makes the
casual/competitive/track-day persona claims credible.

**Keyword anchors**: "best telemetry app for [persona]",
"[persona] sim racing tools".

**Internal links**: /product/coaching (competitive sim racer),
/product/mobile (track-day driver), /product/bridge (track-day
+ team coach), /product/driver-profile (all personas where
progression matters), /blog/sim-to-real-transfer (track-day
persona naturally references the cross-platform argument),
/blog/what-is-trail-braking (competitive-sim-racer persona
references technique-depth).

### Section 6 — Honest LAP limitations [T156] (~400 words)

**Brief**: the article's trust earner. List 3–5 things LAP
cannot do today, or does not do as well as a named competitor.
This is not a marketing softener; this is the foundation of
every claim in Sections 2 and 5.

**Required limitations to cover (from
01-STRATEGIC-DOCTRINE.md §10 and the BLOCKED-task surface in
the sprint roadmap)**:

- iOS app not available until V1 (September 2026); track-day
  driver on iPhone-only stack must wait or use the iPad route
- Android closed beta only until M3 (July 2026); only invited
  testers
- Coaching library is hand-curated and growing — not every
  weakness shape has a rule yet (T144 detection section made
  this explicit; pricing/comparison reader should hear it
  again)
- macOS / Linux desktop client not on the 6-month roadmap
- Real-world capture requires RaceBox + iPhone today; not
  every track-day driver wants to add hardware

**Doctrine voice**: first-person plural ("we"). This is the
only section that uses "we" naturally — the limitations are
ours.

**Closing line**: trust framing — "this list is the foundation
of every claim above. If we shrink it next quarter, we will say
so on the same page."

**Doctrine anchor**: 01-STRATEGIC-DOCTRINE.md §10 commitments
(durability, honesty, never-mislead). ADR-004 negation carries
through — limitations include "no language-model coaching" as
a deliberate scope choice.

**Keyword anchors**: "LAP limitations", "LAP vs competitors",
"is LAP for me".

**Internal link**: /product (the five-pillar overview that
maps to current scope) — the link is the verification path
for any limitation claim.

### Section 7 — Conclusion (~150 words)

**Brief**: tie the comparison back to the persona-mapping
framework.

**Three closing lines**:
1. There is no single best telemetry app — the right answer
   depends on your persona, your budget, and your platform
   mix.
2. The article walked through six apps on six shared
   dimensions; Section 5 mapped persona to shortlist; Section
   6 listed our own current limits.
3. Forward-pointer: `/product` for the LAP five-pillar
   surface, `/blog/sim-to-real-transfer` and
   `/blog/what-is-trail-braking` for the technique articles
   in this cluster, and `/waitlist` for the LAP early-access
   path.

**Voice**: don't oversell. The article's credibility comes
from Section 6 (honest limitations) — keep the conclusion
declarative.

**Doctrine anchor**: 01-STRATEGIC-DOCTRINE.md §10
deliverables and durability commitments.

**Keyword anchors**: "telemetry app comparison summary",
"choose telemetry app", "best telemetry app summary".

## Quality bar (locks all section drafts)

Every section must satisfy:

1. **Fact-based comparison** — every claim about a competitor
   must reference an OBSERVABLE feature, current pricing, or
   public capability statement. "Feels nicer" / "more polished"
   are draft red flags.
2. **Specificity** — at least one named feature, sim title,
   real-world capture path, or pricing tier per app per
   section.
3. **Honest LAP framing** — every section that names LAP
   alongside competitors must include either an honest
   limitation or a "LAP gives up X" sentence.
4. **Cross-link density** — 1–2 internal cross-links per
   section per the plan above.
5. **Forbidden vocab guardrails** — ADR-004 base
   ("AI coach"/"LLM"/"generative"/"neural"); Pillar 2 carry-
   over ("magic"/"secret"/"trick"/"realistic"); Pillar 3
   extension ("clearly worse"/"outdated"/"bloated"/
   "overhyped"/"obviously inferior" — any subjective
   competitor disparagement we cannot substantiate).

## Section assembly

Article assembly task lives post-T160 (the publish surface).
Same Pillar 1 / Pillar 2 pattern: section files live in
`docs/pillar-articles/telemetry-apps-comparison/section-XX-
name.md`; the published page lives at
`/blog/telemetry-apps-compared` (or similar slug, locked at
T160) and renders the markdown via Astro's `import { Content }`
syntax. Editorial source and published artifact stay in
lockstep.

The FAQ data module for Pillar 3 (T159) follows
`src/data/pillar-3-faq.ts` matching the Pillar 1+2 patterns;
the publish page (T160) emits Article + FAQPage JSON-LD using
the factory pattern from `pillar1FaqJsonLd()` /
`pillar2FaqJsonLd()`. Faq + FaqPageJsonLd types still
imported from `pillar-1-faq.ts`; if a third pillar consumer
adds noise to that import path, T169 (Pillar 4 FAQ) is the
right time to extract types to a dedicated `src/data/faq.ts`
module — premature abstraction avoided here.

Cumulative test surface: each section gets its own contract
test (T152-T156 each ship one); editing pass T157 ships an
article-level test (analogous to T147 for Pillar 2);
internal-linking T158 ships a cross-link test (analogous to
T148). Total test count for Pillar 3: ~50–60 across 8 files.

## Article-specific risks (Pillar 3-only)

Three risks the section drafters must navigate:

1. **Competitor accuracy.** Every competitor claim — feature
   support, pricing, persona fit — must be verified against
   current public materials (the app's own product page or
   docs). Drafter MUST link / cite the source in the commit
   message of each section. Outdated claims are worse than
   missing ones.
2. **Self-comparison honesty.** LAP's own paragraphs must be
   subject to the same factual-grounded discipline. Section
   drafters MUST cite Doctrine §5 / §10 / ADR-004 / sprint
   BLOCKED tasks for every LAP-side claim.
3. **Tone drift.** The article's whole credibility rests on
   reading as honest comparison rather than self-promotion.
   The forbidden-vocab list extends explicitly into
   marketing-superlative territory because the section drafts
   must resist the temptation to inflate LAP relative to
   competitors. T156 (honest limitations) is the
   structural-load-bearer for this; it is mandatory and
   enforced via test.

## Out of scope for this outline

- No actual section drafts. T152–T156 own those.
- No specific competitor capability claims. The outline names
  the six apps and the comparison axes; section drafts make
  the actual claims after verification.
- No prescriptive word-by-word phrasing.
- No FAQ content — that's T159.
- No published page — that's T160.

## What does ship from T151

This outline document. It is a planning artifact and lives in
`docs/` alongside the Pillar 1 and Pillar 2 outlines. It does
not appear on the public site. Section drafts (T152–T156)
treat it as the canonical contract.
