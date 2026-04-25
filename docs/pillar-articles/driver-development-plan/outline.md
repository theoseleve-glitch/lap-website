# Pillar 4: How to Build a Driver Development Plan — Outline

> Planning artifact for T161. Subsequent sprint tasks
> (T162–T170) draft sections of this article from the
> structure below. Outline is the contract; section drafts
> must hit their target word count and doctrine anchors. The
> article's structural commitment is **the loop closes** —
> Doctrine §6 lifted directly into reader-facing prose, with a
> mandatory DIY template (T166) that proves the loop is not
> LAP-exclusive.

## Metadata

| Field | Value |
|------|-------|
| Block | H — SEO pillar pages |
| Pillar | 4 of 4 (driver development plan; cluster closer) |
| Sprint range | T161 (this) — T170 |
| Target final word count | 2,800–3,300 words (excluding FAQ) |
| Sections | 7 (1 intro + 5 numbered + 1 conclusion) |
| Primary search intent | "How do I make a sim racing development plan?" / "Driver development plan" / "How to improve at sim racing systematically" |
| Secondary search intent | Long-tail action-oriented queries — "weekly sim racing practice schedule", "track day prep routine", "iRacing improvement plan" |
| Doctrine anchors | 01-STRATEGIC-DOCTRINE.md §3 (personas — serious sim racer + track-day driver both need a structured loop), §4 (the seven principles — especially principle 6 the-loop-closes), ADR-004 (no LLM coaching framing — plans are structured loops not generated text), ADR-013 (rule-library hand-curation — each prescription traces to a written rule) |
| Voice | Declarative, framework-anchored; second-person where the framework verbs call for it; first-person plural ("we") only where doctrine §10 commitments carry through (T165 LAP automation framing — minor) |
| Forbidden vocab (ADR-004 + Pillar 2 + Pillar 3 carry-over + Pillar 4 extension) | "AI coach", "LLM", "generative", "neural", "realistic", "magic", "secret", "trick" + Pillar 3 carry-over: "clearly worse", "outdated", "bloated", "overhyped", "obviously inferior" + Pillar 4 extension: "guru", "secret formula", "shortcut", "overnight", "hack", "system that guarantees" — development plans are sustained loops, not magic shortcuts |

## Primary keyword cluster

Search terms an actual sim racer / track-day driver would
Google when shopping for a development framework. Use these
naturally in headings and body — never stuffed.

**Head terms**:
- "driver development plan"
- "sim racing development plan"
- "how to improve at sim racing"
- "structured sim racing practice"

**Long-tail action-oriented variants** (the article's
acquisition surface — these are individual long-tail searches
that all converge on this one framework page):
- "weekly sim racing practice schedule"
- "iRacing improvement plan"
- "ACC training schedule"
- "track day preparation routine"
- "how to practice sim racing effectively"
- "telemetry-driven practice plan"
- "race weekend practice plan"

**Question-form long-tail (FAQ candidates for T169)**:
- "How do I structure my sim racing practice?"
- "How long should a sim racing practice session be?"
- "What's the difference between practice and a development plan?"
- "How do I prepare for a track day?"
- "Should I review my telemetry every session?"

**Keyword anchors per section** are listed inside each section
brief below.

## The five framework verbs

The article's structural vocabulary is fixed. Five verbs map
1:1 to Doctrine §6's the-loop-closes commitment:

| Verb | Doctrine §6 phrase | Reader-facing meaning |
|---|---|---|
| Diagnose | observation + evidence | Read the data; identify the weakness shape |
| Prescribe | likely cause + prescribed action | Pick ONE thing to drill, with a success criterion |
| Execute | (the drill itself) | Run the drill in the next session |
| Measure | measurable success condition | Did the metric land? Quantitative not subjective |
| Adapt | review-next-session | Decide whether to advance, repeat, or re-diagnose |

Section drafts (T162–T166) MUST use this exact vocabulary.
Synonyms ("identify" / "fix" / "test") drift the framework
out of doctrine and dilute the article's structural argument.

## Internal cross-links (target page → expected anchor text)

Pillar 4 closes the four-pillar cluster. Cross-links are
denser than any prior pillar — the article references all
three sibling pillars by design.

| Internal link | Anchor copy hint | Where it should appear |
|---|---|---|
| `/product` (overview) | "the LAP five-pillar surface" / "our five-pillar architecture" | Section 5 (T165 — LAP automation overview) |
| `/product/desktop` | "the desktop client" / "live coaching prompts" | Section 4 (T164 — per-session cadence) |
| `/product/mobile` | "the mobile app" | Section 4 (T164 — track-day cadence) |
| `/product/bridge` | "our cross-platform unification" / "the bridge" | Section 3 (T163 — diagnose step covers both surfaces) and Section 4 (T164 — cross-platform cadence) |
| `/product/coaching` | "the coaching library" / "our rule library" | Section 2 (T162 — what a plan is, prescription concept), Section 3 (T163 — prescribe step), Section 5 (T165 — automation surface) |
| `/product/driver-profile` | "the driver profile" / "your progression view" | Section 3 (T163 — measure step), Section 4 (T164 — weekly review cadence), Section 5 (T165) |
| `/pricing` | "our pricing" | Section 5 (T165 — what subscription buys) |
| `/blog/sim-to-real-transfer` | "the sim-to-real transfer article" | Section 4 (T164 — cross-platform cadence naturally references the transfer model) |
| `/blog/what-is-trail-braking` | "the trail-braking explainer" | Section 3 (T163 — diagnose step worked example uses trail-braking weakness shape) |
| `/blog/best-sim-racing-telemetry-app` | "the telemetry app comparison" | Section 6 (T166 — DIY template needs a tool; comparison is the shopping reference) |
| `/waitlist` | "the waitlist" | Section 7 (conclusion CTA) |

Cross-pillar discipline: linking ALL THREE sibling pillars in
this article is what closes the four-pillar cluster as a hub.
Pillars 1+2 currently link forward only to Pillar 3 (via
T148/T158); a follow-up retro pass after T170 should add
forward links to Pillar 4 in Pillars 1+2 to complete the
mesh, but that retro work is OUT OF SCOPE for T161–T170.

## Sections

### Section 1 — The question (~250 words) [introduces, no T-task]

**Premise**: open with the actual reader question. Two
distinct readers arrive here:

- The serious sim racer who has trained hundreds of hours,
  has plateaued at a specific licence class, and is wondering
  why more practice is not producing more progress. They
  suspect the issue is not effort but structure.
- The track-day driver who runs 4–8 events a year and wants
  to compress each weekend's learning into the next event,
  not lose half the lessons between events.

**Frame**: aimless practice is the default. A development
plan is a structured feedback loop tied to data. The article
walks through what a plan IS, the five-verb framework that
makes it work, the cadences that anchor it on a calendar,
how LAP automates each step, and a DIY template for readers
who use a different tool.

**Closing line**: previews the framework verbs (diagnose →
prescribe → execute → measure → adapt) and notes that
Section 6 carries the DIY template for readers who do not use
LAP — the article's trust signal that the loop is universal,
not LAP-exclusive.

**Doctrine anchor**: 01-STRATEGIC-DOCTRINE.md §4 principle 6
(the loop closes or the feature doesn't ship). The article
lifts this principle from product doctrine into reader-facing
prose because the reader and the product team share the same
loop.

**Forbidden**: "transform your driving in 30 days" / "secret
to fast laps" / any time-to-result promise. Development plans
require sustained practice. Honest framing forbids speed-of-
results overclaim.

### Section 2 — What a development plan is [T162] (~400 words)

**Brief**: contrast aimless practice ("I drove four hours, my
times got worse, I don't know why") with a structured plan
("I diagnosed weakness X on Tuesday, prescribed drill Y for
Wednesday's session, executed and measured outcome on
Thursday — the metric improved 2.3%, adapt next week").

**Per-paragraph structure**:
- Define aimless practice — the default state, observable
  symptoms (plateau, frustration, no record of what was
  attempted)
- Define a development plan — three properties: tied to
  data (not to mood), structured by a framework (not by a
  drill list), reviewed on a cadence (not when motivation
  strikes)
- The doctrinal anchor — the loop closes or the feature
  doesn't ship. The same principle that governs LAP's
  coaching insight ships also governs whether a plan is
  worth executing.

**Doctrine discipline (section-specific)**:
- The framework verbs (diagnose / prescribe / execute /
  measure / adapt) are previewed but not unpacked — that's
  T163's job
- The phrase "the loop closes" must appear at least once;
  it is the article's structural anchor
- Forbidden vocab guardrail extended for the section: no
  "secret formula", "guru system", "shortcut to fast laps" —
  any framing that suggests the plan replaces sustained
  practice

**Keyword anchors**: "driver development plan", "structured
sim racing practice", "what a development plan is".

**Internal links**: /product/coaching (the prescription
concept lives in our rule library).

### Section 3 — The framework: diagnose → prescribe → execute → measure → adapt [T163] (~600 words)

**Brief**: the five-verb framework, ~100 words per verb plus
opening framing. Each verb is the article's structural
vocabulary; section drafters MUST use the exact verbs (no
synonym drift).

**Per-verb structure**:

1. **Diagnose** (~110w). Read the data; identify the weakness
   shape. The shape comes from telemetry — brake-pressure
   trace, steering input, throttle application, line
   reference. "I'm slow at Sebring T1" is not a diagnosis;
   "my brake-pressure trace shows a stab pattern with three
   inflection points where the reference shows one continuous
   taper" is. The diagnose step happens after the session, in
   front of the data — never in the seat.

2. **Prescribe** (~110w). Pick ONE thing to drill, with a
   success criterion that is observable and measurable. Not
   "smooth it out"; "achieve a single-derivative brake
   pressure trace through release with two-tenths overlap on
   steering input by Thursday's session." Rule-based
   prescription draws from a coaching library — every
   prescription traces to a written rule, never to a
   language model output.

3. **Execute** (~110w). Run the drill in the next session.
   The drill is one corner, one repetition pattern, one
   focus. Capture is offline-first; the data lands locally
   and syncs when network is available. The execute step is
   the only step where the driver is in the seat — the rest
   are at the desk.

4. **Measure** (~110w). Did the success criterion land? The
   metric must be observable and quantifiable. "Felt better"
   is not a measure. "Brake-pressure trace overlap with
   steering input crossed 0.20s on three of five attempts"
   is. If you cannot measure the prescribed change, the
   prescription was malformed and you should re-prescribe
   before re-executing.

5. **Adapt** (~110w). Review the result. Three branches: if
   the criterion landed, advance to the next prescription
   in the progression. If it landed partially, repeat the
   prescription with refinement. If it did not land, re-
   diagnose — the prescription may have been treating a
   downstream symptom of a deeper weakness shape. The adapt
   step closes the loop and feeds the next diagnose step.

**Doctrine discipline (section-specific)**:
- ADR-004 negation appears at least once: "every prescription
  traces to a written rule, never to a language model
  output." Pillar 4's strongest version of the negation
  because the prescribe step is where the temptation to
  delegate to language-model coaching is highest.
- Doctrine §6 phrase "the loop closes" appears in the adapt
  paragraph
- Trail-braking worked example anchors the diagnose step,
  with cross-pillar link to /blog/what-is-trail-braking

**Keyword anchors**: "development plan framework", "five
steps to improvement", "diagnose prescribe execute measure
adapt".

**Internal links**: /product/coaching (prescribe step),
/product/driver-profile (measure step), /product/bridge
(diagnose covers sim+real), /blog/what-is-trail-braking
(diagnose worked example).

### Section 4 — Cadences [T164] (~500 words)

**Brief**: three cadences anchor the framework on a calendar.
Without cadences, the loop is theoretically sound but
practically abandoned. Each cadence has a different time
horizon and a different decision granularity.

**Three cadences (~150w each)**:

1. **The per-session loop** (~150w). Diagnose → prescribe →
   execute → measure inside ONE session, with adapt deferred
   to the post-session review. Real-time coaching prompts
   from the desktop client run this loop on the live data.
   The driver does not need to consciously think about it —
   the prompt arrives mid-session when a weakness shape
   triggers the rule.

2. **The weekly review** (~150w). Aggregate the week's
   sessions, pick ONE focus for next week. The weekly cadence
   is where individual sessions become a progression. Without
   it, every session is its own island. With it, week N+1
   inherits a prescription from week N's measure step.

3. **The event/race-cycle** (~200w). Four to six weeks of
   build-up to a target event with a structured plan. Sim
   side: an iRacing weekly race series. Real-world side: a
   track day or club race. Cross-platform side: a season
   plan that uses sim sessions as practice for real-world
   events ([the sim-to-real transfer article](/blog/sim-to-
   real-transfer) develops the cross-platform argument). The
   event-cycle cadence is where the bridge between sim and
   real-world becomes a calendar fact, not a feature claim.

**Doctrine discipline (section-specific)**:
- Cross-platform discipline — every cadence applies to BOTH
  sim and real-world, not just sim. A draft that treats real-
  world as an afterthought breaks the bridge promise and
  lands wrong with the secondary persona.
- The event-cycle cadence is the longest paragraph because
  it carries the cross-platform load. Section drafter MUST
  reference the transfer article cross-link.

**Keyword anchors**: "weekly sim racing practice schedule",
"track day preparation routine", "race weekend practice
plan".

**Internal links**: /product/desktop (per-session live
coaching prompts), /product/driver-profile (weekly review
surface), /product/mobile (track-day execute path),
/product/bridge (cross-platform cadence), /blog/sim-to-real-
transfer (cross-platform argument).

### Section 5 — How LAP automates this [T165] (~500 words)

**Brief**: walk through how LAP automates each of the five
framework verbs. This is the article's commercial section —
mandatory honest framing per the §6 DIY-template
counterweight (without that, this section reads as a sales
pitch).

**Per-verb automation (~80w each)**:

- **Diagnose**: post-session WeaknessEpisode generation. The
  desktop client extracts shape patterns from the trace; the
  backend matches them against the rule library and emits
  a WeaknessEpisode with observation + evidence. The driver
  opens the app and sees what to look at first.
- **Prescribe**: ActionPrescription generation. Each
  WeaknessEpisode that has a matching rule gets an
  ActionPrescription — drill name, success criterion, target
  session count. Every prescription traces to a written rule
  in our [coaching library](/product/coaching), never to a
  language-model output.
- **Execute**: live coaching prompts during the session. The
  desktop client overlays the prompt in real time when the
  weakness shape recurs; the mobile app does the same for
  real-world capture.
- **Measure**: ActionOutcome + DriverProgressSnapshot. Each
  drill execution gets an outcome record; the driver's
  [progression view](/product/driver-profile) shows the
  metric over time, across sim and real-world surfaces.
- **Adapt**: next-session plans with measurable success
  conditions. The backend reads recent ActionOutcomes and
  emits the next ActionPrescription; the loop closes
  automatically.

**Doctrine discipline (section-specific)**:
- ADR-004 negation MUST appear ("every prescription traces
  to a written rule, never to a language-model output") —
  Pillar 4's strongest version of the negation appears here
- §10 honest-framing — automate doesn't mean replace; the
  driver still has to execute, and the rule library still
  has gaps (T156 / Pillar 3 §6 honest limitations apply)
- Sales-pitch resistance — declarative voice, no
  superlatives, no "transform your driving" framing

**Keyword anchors**: "automated driver development",
"telemetry-driven practice plan", "coaching automation".

**Internal links**: /product (overview), /product/coaching,
/product/driver-profile, /product/bridge, /pricing.

### Section 6 — DIY template for non-LAP users [T166] (~400 words)

**Brief**: the article's trust signal. Development plans are
not LAP-exclusive — the framework runs on any telemetry tool
that exports brake-pressure, steering, throttle, and lap-
reference traces. This section gives the reader a concrete
template they can use today with Garage61, MoTeC i2, RaceLab,
Track Attack, or even a spreadsheet plus a pen.

**Template structure**:

- **A weekly diagnose worksheet** (3-5 fields): date, session
  IDs reviewed, observed weakness shape (one sentence), trace
  evidence (file path or screenshot reference)
- **A prescription line** (one sentence): drill name, success
  criterion, target session count
- **An execute log** (per-session): which session was the
  drill attempt, what the conditions were
- **A measure cell**: did the success criterion land? Yes /
  partial / no
- **An adapt decision** (one sentence): advance / repeat /
  re-diagnose

**Tooling notes**: link to [the telemetry app
comparison](/blog/best-sim-racing-telemetry-app) for readers
who have not chosen a tool yet. The template works with all
six apps in that comparison.

**Doctrine discipline (section-specific)**:
- Mandatory section — without the DIY template, §5 reads as
  a sales pitch. Section length floor is 400 words; ≥400 is
  the test-enforced floor that proves §5 did not over-claim.
- Tone is generous, not defensive. The framework belongs to
  the reader regardless of which tool they pay for.
- Forbidden vocab guardrail — "or use LAP for the easier
  path" / "without LAP you are missing out" — both are off-
  doctrine. The DIY template stands on its own.

**Keyword anchors**: "DIY sim racing development plan",
"telemetry development plan template", "manual practice plan".

**Internal links**: /blog/best-sim-racing-telemetry-app
(which tool to choose for DIY).

### Section 7 — Conclusion (~150 words)

**Brief**: closing the four-pillar cluster. Pillar 4's
conclusion is the cluster's closer; forward-pointers reach
all three sibling pillars + product surface + waitlist.

**Three closing lines**:

1. The development plan IS the loop. Diagnose → prescribe →
   execute → measure → adapt. The framework is portable
   across tools, surfaces, and skill levels.
2. The article walked through what a plan is, the five-verb
   framework, the three cadences, how LAP automates each
   step, and a DIY template that works with any telemetry
   tool.
3. Forward-pointers: [`/product`](/product) for the LAP
   five-pillar surface,
   [`/blog/sim-to-real-transfer`](/blog/sim-to-real-transfer)
   for the cross-platform argument,
   [`/blog/what-is-trail-braking`](/blog/what-is-trail-braking)
   for the technique-depth example, and
   [`/blog/best-sim-racing-telemetry-app`](/blog/best-sim-racing-telemetry-app)
   for the shopping reference. For early access to LAP, see
   [`/waitlist`](/waitlist).

**Voice**: declarative, not promotional. The credibility
comes from §6 DIY template — keep the conclusion measured.

**Doctrine anchor**: 01-STRATEGIC-DOCTRINE.md §4 principle 6
(the loop closes) — the closing line lifts the principle one
last time so a reader who skipped to the bottom still leaves
with the framework anchor.

**Keyword anchors**: "driver development plan summary",
"how to build a development plan", "structured practice
summary".

## Quality bar (locks all section drafts)

Every section must satisfy:

1. **Framework-verb discipline** — diagnose / prescribe /
   execute / measure / adapt are the exact words; no
   synonyms ("identify" / "fix" / "test") allowed. The
   framework is the article's spine.
2. **Cross-platform reach** — every section that names sim
   sessions also addresses real-world capture; the bridge
   thread runs all the way through.
3. **DIY proof** — every section that names LAP automation
   pairs with an honest acknowledgement that the framework
   itself is tool-agnostic. T166 is the load-bearer; T162–
   T165 must not undercut it.
4. **Cross-link density** — 1–2 internal cross-links per
   section per the plan above; ≥3 internal links across
   §3+§5 alone (the LAP-heavy sections).
5. **Forbidden vocab guardrails** — ADR-004 base ("AI
   coach"/"LLM"/"generative"/"neural"); Pillar 2 carry-
   over ("magic"/"secret"/"trick"/"realistic"); Pillar 3
   carry-over ("clearly worse"/"outdated"/"bloated"/
   "overhyped"/"obviously inferior"); Pillar 4 extension
   ("guru"/"secret formula"/"shortcut"/"overnight"/"hack" —
   any framing that suggests the plan replaces sustained
   practice).

## Section assembly

Article assembly task lives at T170 (the publish surface).
Same Pillar 1 / Pillar 2 / Pillar 3 pattern: section files
live in `docs/pillar-articles/driver-development-plan/
section-XX-name.md`; the published page lives at
`/blog/driver-development-plan` (slug locked at T170) and
renders the markdown via Astro's `import { Content }`
syntax. Editorial source and published artifact stay in
lockstep.

The FAQ data module for Pillar 4 (T169) follows
`src/data/pillar-4-faq.ts` matching Pillar 1+2+3 patterns;
the publish page (T170) emits Article + FAQPage JSON-LD
using the factory pattern. Faq + FaqPageJsonLd types still
imported from `pillar-1-faq.ts`; with three consumers now
on that import path (Pillars 2/3/4), T169 is the right time
to extract types to a dedicated `src/data/faq.ts` module —
the third consumer adds enough noise to justify the
abstraction. T169 commit message must call out the type-
extraction refactor.

Cumulative test surface: each section gets its own contract
test (T162-T166 each ship one); intro and conclusion get
their own per-T157-precedent under T167 editing umbrella;
internal-linking T168 ships a cross-link audit;
article-level cumulative test ships under T170 (analogous to
T160 article-level). Total test count for Pillar 4: ~55-65
across 9 files.

## Article-specific risks (Pillar 4-only)

Three risks the section drafters must navigate:

1. **Sales-pitch drift in §5.** The how-LAP-automates section
   is the article's highest temptation for marketing-voice
   regression. Mandatory mitigation: §6 DIY template at equal
   or greater word budget than §5. Test-enforced via §6 word
   count floor (400+ words) and via §5 verb-coverage check
   that must EQUAL §6's verb-coverage (both unpack all five
   framework verbs at comparable depth).
2. **Speed-of-results overclaim.** Development plans require
   sustained practice. The forbidden-vocab list extension
   ("overnight" / "shortcut" / "hack" / "secret formula" /
   "transform your driving in 30 days") catches the
   marketing temptation to promise compressed timelines.
3. **Audience split — serious sim racer vs track-day
   driver.** Doctrine §3 names both as in-scope personas
   (primary + secondary). The framework MUST be tool-
   agnostic and surface-agnostic. A draft that addresses
   only sim or only real-world breaks the bridge promise
   and lands wrong with one persona. Cross-platform
   discipline test enforces "sim" AND "real" both appear in
   every framework / cadence section.

## Out of scope for this outline

- No actual section drafts. T162–T166 own those.
- No specific coaching-library rule names. The outline
  describes the rule-based prescription concept; the actual
  rule names belong to product surfaces, not the article.
- No prescriptive word-by-word phrasing.
- No FAQ content — that's T169.
- No published page — that's T170.
- No retro pass to add forward links from Pillars 1+2 to
  Pillar 4 (recommended but separate sprint task).

## What does ship from T161

A `docs/pillar-articles/driver-development-plan/outline.md`
planning artifact (this file) committed to the repo as the
contract that T162–T170 must satisfy. No published surface,
no public-facing content. Subsequent tasks consume this
outline as their source of truth.
