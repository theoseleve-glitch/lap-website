# Pillar 2: What is Trail Braking (and how to measure it) — Outline

> Planning artifact for T141. Subsequent sprint tasks (T142–T150)
> draft sections of this article from the structure below.
> Outline is the contract; section drafts must hit their target
> word count and doctrine anchors.

## Metadata

| Field | Value |
|------|-------|
| Block | H — SEO pillar pages |
| Pillar | 2 of 4 (trail braking) |
| Sprint range | T141 (this) — T150 |
| Target final word count | 2,800–3,200 words (excluding FAQ) |
| Sections | 7 (1 intro + 5 numbered + 1 conclusion) |
| Primary search intent | "What is trail braking, why does it work, and how do I measure whether I'm doing it right?" |
| Secondary search intent | "How do I get better at trail braking?" (drill-oriented; conversion path to /product/coaching) |
| Doctrine anchors | ADR-005 §5.2 WeaknessEpisode (`subcategory` = canonical mistake name) + §5.5 TransferLink, ADR-013 coaching library `transfer_profile` field, 01-STRATEGIC-DOCTRINE.md §1 cross-platform mission, §5 DOES-capture roster |
| Voice | Technical without math; honest about what's hard; second-person for the reader ("you"); first-person plural where appropriate ("we"); no marketing exclamations |
| Forbidden vocab (ADR-004) | "AI coach", "LLM", "generative", "neural"; also "magic" (a trick is not magic), "secret" (not a secret), and "realistic" (subjective overclaim — use "fidelity"/"transfer") |

## Primary keyword cluster

Search terms an actual sim racer / track-day driver would Google.
Use these naturally in headings and body — never stuffed.

**Head terms**:
- "what is trail braking"
- "trail braking technique"
- "how to trail brake"
- "trail braking explained"

**Long-tail variants**:
- "trail braking telemetry"
- "how to measure trail braking"
- "trail braking iRacing"
- "trail braking ACC"
- "trail braking GT3"
- "trail braking signature"
- "trail braking too early"
- "trail braking pressure decay"
- "trail braking drill"
- "trail braking practice"

**Question-form long-tail (FAQ candidates for T149)**:
- "Why does trail braking make a car rotate?"
- "How do I know if I'm trail braking too long?"
- "Is trail braking the same in a sim as in a real car?"
- "What's the data signature of good trail braking?"
- "Should I trail brake every corner?"

**Keyword anchors per section** are listed inside each section
brief below. Aim for one head-term + 1–2 long-tail variants per
section heading or first paragraph. No section should reach for a
keyword that isn't naturally already in its content.

## Internal cross-links (target page → expected anchor text)

The article is the SEO acquisition surface for the technique-
focused reader; product-page cross-links are how converted
readers reach the conversion funnel. Pillar 1 cross-link is how
the article connects to the broader article cluster.

| Internal link | Anchor copy hint | Where it should appear |
|---|---|---|
| `/product/bridge` | "the bridge" / "our sim-to-real transfer algorithm" | Section 4 (how LAP detects it) |
| `/product/coaching` | "the coaching library" / "rule library" | Section 5 (drill progression) and Section 6 (examples → prescription pattern) |
| `/product/driver-profile` | "your driver profile" | Section 6 (real telemetry examples surface here) and Section 7 (conclusion) |
| `/product/desktop` | "the desktop client" | Section 5 (capture surface for sim drills) |
| `/product/mobile` | "the mobile app for real-world capture" | Section 5 (capture surface for real drills) |
| `/blog/sim-to-real-transfer` | "the sim-to-real transfer article" / "shape vs intensity" | Section 3 (mistakes carry between platforms — uses framework from Pillar 1) and Section 6 (intensity-is-platform-specific reminder) |
| `/waitlist` | "the waitlist" / "join the LAP waitlist" | Section 7 (conclusion CTA) |

Cross-pillar discipline: Pillar 1 link in Section 3 and Section 6
is what keeps the four-pillar article cluster acting as a hub
rather than seven separate landing pages. When Pillar 3 (T151–
T160) and Pillar 4 (T161–T170) ship, this article picks up
return links from those.

## Sections

### Section 1 — The question (~200 words) [introduces, no T-task]

**Premise**: open with the actual reader question. Two distinct
readers arrive here:

- The sim racer who has heard "trail brake more" from a coach
  or a forum reply and isn't sure what they're being told to
  do — or how to tell whether they're already doing it.
- The track-day driver who has watched a YouTube clip showing a
  pro's brake pressure trace overlapping with steering input
  and wants to know whether their own data shows the same
  thing.

**Frame**: trail braking is not a trick or a secret. It's a
disciplined release of brake pressure into corner entry that
exploits a physics property of the tire. The article unpacks the
physics, names the common mistakes and their telemetry
signatures, explains how LAP detects the mistakes automatically,
sketches a practice progression, and works through three real
examples from captured telemetry.

**Closing line**: should define trail braking in one plain
sentence and preview the article's structure. No marketing
lead-in.

**Doctrine anchor**: 01-STRATEGIC-DOCTRINE.md §1 — sim and
real-life as one progression for one driver. The article's
authority comes from treating both surfaces as the same
technique.

**Forbidden**: "magic", "secret", "trick", "the one weird trick".

### Section 2 — Physics of trail braking [T142] (~450 words)

**Brief**: explain the physics in plain language. No math
formulae; named concepts only. The reader should leave
understanding *why* the technique works, not just *what* it is.

**Key claims**:
- When the brakes are applied, vehicle weight transfers forward
  onto the front axle.
- A more heavily-loaded tire has a larger contact patch and
  generates more lateral grip — at the cost of being closer to
  its longitudinal grip limit.
- Therefore: keeping *some* brake pressure on as you turn into a
  corner means the front tires are loaded enough to rotate the
  car cleanly, instead of the rear-loaded under-rotated geometry
  that "all-brake-released-before-turn-in" produces.
- The friction circle: a tire has a finite total grip, divided
  between longitudinal (braking/acceleration) and lateral
  (cornering). Trail braking is the disciplined trade — bleed
  off longitudinal as you ask for lateral, never demanding more
  total grip than the tire can deliver.
- Why it transfers between sim and real: the physics is the
  physics. Same load transfer, same friction circle. The
  difference between sim and real is in pedal-pressure
  calibration and the seat-of-pants signal — the *shape* of
  good trail braking is identical in both.

**Honest framing**: trail braking is not always the right
technique. Big-stop hairpins (Sebring T17) and second-gear
chicanes are often better with more brake released earlier and
clean steering input. The article should name "when to trail
brake" so readers don't over-apply.

**Doctrine anchor**: ADR-005 §5.2 WeaknessEpisode (the
canonical `subcategory` value `trail_brake_release` is what the
detector emits when this technique goes wrong); ADR-013 coaching
library transfer_profile field (=cross_platform for this
technique).

**Keyword anchors**: "physics of trail braking", "weight transfer
braking", "tire contact patch", "friction circle braking", "why
trail braking works".

**Internal link**: optional brief mention of `/blog/sim-to-real-
transfer` only if the cross-platform claim sits naturally in the
prose. Section 3 is the more natural cross-link landing point.

### Section 3 — Common mistakes and their data signatures [T143] (~600 words)

**Brief**: this is the article's most concrete section. List the
common trail-brake mistakes, each paired with its TELEMETRY
signature in plain language.

**Mistakes to cover** (in order from most-common to least):

1. **Trail-brake released too early** — the canonical mistake.
   Brake pressure drops to zero before turn-in is complete; car
   under-rotates; apex line opens up; throttle reapplied late.
   Signature: brake pressure trace hits zero >0.5s before the
   apex; throttle trace shows a "dwell" between brake-zero and
   throttle-on; apex speed runs 3–8% under driver's own
   reference.

2. **Trail-brake held too late** — opposite mistake; car
   understeers at the apex because front tires are already at
   the longitudinal limit when steering peaks. Signature: brake
   pressure still 5–15% past the apex point; throttle
   re-application starts after the apex with steering still at
   max angle; consistent across multiple laps in a session.

3. **Inconsistent pressure decay** — stab-and-release pattern
   instead of a smooth taper. The car loads and unloads
   repeatedly; tire never settles into the rotation. Signature:
   brake trace shows two or more inflection points in the
   release phase; lap-to-lap variance is much higher than for
   the other mistakes.

4. **Brake too gentle to begin with** — peak pressure is too low
   for meaningful weight transfer; "trail braking" achieves
   nothing because there's not enough load on the front tires.
   Signature: peak brake pressure <60% of available; entry speed
   too high for the rotation actually achieved; under-steer
   throughout.

5. **Brake too aggressive at start** — peak pressure spike
   produces lockup or near-lockup; the car is rotating from
   grip overload, not weight transfer. Signature: peak brake
   pressure >95% with characteristic lockup signature on tire-
   load data; ABS-active flag in series that have it.

6. **Simultaneous longitudinal-plus-lateral peaks** — asks the
   tire for both at once instead of trading them. Loses both.
   Signature: brake-pressure peak coincides with steering-input
   peak; both at maxima within ±0.1s.

**Pattern across all six**: the *shape* of each mistake (what
the trace looks like) carries between sim and real driving
cleanly — this is the shape-vs-intensity framework from Pillar 1
applied to one specific technique. The intensity (how much time
each mistake costs) is platform-specific.

**Doctrine anchor**: ADR-005 §5.2 WeaknessEpisode `subcategory`
enum — these mistake shapes are exactly what the detector emits;
the article's six-mistake list maps onto the WeaknessEpisode
subcategory canonical names.

**Keyword anchors**: "trail braking mistakes", "trail braking
too early", "trail braking signature", "trail braking telemetry".

**Internal link**: `/blog/sim-to-real-transfer` (the shape-vs-
intensity framework underlies why these mistake shapes carry
between platforms — single sentence with the link).

### Section 4 — How LAP detects it [T144] (~400 words)

**Brief**: technical explainer of the automated detection
pipeline. Plain language; honest framing; no LLM/AI claims
(ADR-004 lock).

**Key claims**:
- The detection is a rule-based pipeline, not a language model
  or a neural net. Every detected mistake corresponds to a
  written rule in the coaching library (ADR-013).
- Three signal sources feed the detector: the brake-trace
  gradient (rate of pressure release), the steering-input trace
  (when does steering peak vs when does brake hit zero?), and
  the apex-speed deficit measured against the driver's own
  reference lap on the same platform.
- Each rule names: a brake-trace signature pattern, a steering-
  trace correlation criterion, and a magnitude floor (so the
  detector doesn't false-positive on a 0.05-second hesitation).
- Cross-platform consistency: the same rule runs against sim
  telemetry from iRacing/ACC/AMS2 desktop captures and against
  real-world telemetry from RaceBox + iPhone captures. The rule
  matches *shape*, not absolute pressure values, so the same
  mistake gets the same diagnosis whether the driver is on a
  Tuesday-evening iRacing session or at a real Spa track day.
- The article's earlier mistake-list (Section 3) maps one-to-one
  onto the detector's `subcategory` enum (ADR-005 §5.2). What
  the reader saw as "the canonical mistake" in plain language is
  what the detector emits as `trail_brake_release_too_early`
  programmatically.

**Honest framing**: the rule library is hand-curated. Not every
trail-brake mistake is detected today; the library grows
session-by-session as new patterns get codified. ADR-004 makes
this explicit: hand-written rules, not language-model output, in
this 6-month plan.

**Doctrine anchor**: ADR-004 (no LLM in coaching), ADR-005 §5.5
TransferLink (cross-platform matching), ADR-013 (coaching library
rule structure).

**Keyword anchors**: "trail braking detection", "automated
telemetry analysis", "trail braking algorithm", "how is trail
braking measured".

**Internal links**: `/product/bridge` (the technical artifact
that runs the detection); `/product/coaching` (the rule library
the detector reads from).

### Section 5 — Drill progression to improve [T145] (~400 words)

**Brief**: three-tier progression from beginner to advanced. Each
drill maps to a specific coaching-library prescription pattern
(ADR-005 §5.3 ActionPrescription).

**Drills**:

1. **Beginner — One-corner focus**. Pick a slow-medium corner
   you know well (e.g. Spa La Source, Brands Hatch Druids, a
   home-track hairpin). Goal: brake pressure non-zero at turn-
   in. Run 20+ laps focused only on this one corner. Success
   criterion: brake-trace overlaps with steering-input by ≥0.2
   seconds.

2. **Intermediate — Decay-shape drill**. Same one corner. Goal:
   smooth taper from peak to zero, no inflection points. Run
   the corner with the brake-trace overlay visible after each
   lap. Success criterion: single-derivative brake trace through
   the release phase (no visible "stab" pattern). This drills
   the consistency mistake from Section 3.

3. **Advanced — Cross-corner consistency**. Pick five corners
   of different speeds on the same circuit. Goal: the SHAPE of
   the brake-trace release should be the same across all five
   (the magnitudes will differ). Success criterion: within-
   driver shape variance (a defined coaching-library metric)
   below threshold across the five corners. This is the
   technique transferring from one corner to the rest of the
   lap.

**Cross-platform**: any of these three drills runs identically on
sim telemetry and real-track telemetry. The desktop client
captures sim sessions; the mobile app + RaceBox captures real
sessions. Same drill, same success criterion, same metric.

**Quarterly progression**: section should mention that running
this loop weekly across one quarter is the durable benefit.
Single-session focus on trail-braking can produce noise that
washes back out next session; quarter-scale progression is what
the driver profile (cross-link below) makes legible.

**Doctrine anchor**: ADR-013 coaching library prescription
pattern; ADR-005 §5.3 ActionPrescription (`drill_template_id` +
`success_condition` are the fields that operationalise these
drills).

**Keyword anchors**: "trail braking drill", "trail braking
practice", "improve trail braking", "trail braking exercises".

**Internal links**: `/product/coaching` (the source of the
drills); `/product/desktop` and/or `/product/mobile` (the
capture surfaces the drills depend on); `/product/driver-profile`
(the quarterly progression framing).

### Section 6 — Examples from real telemetry [T146] (~450 words)

**Brief**: three concrete examples from captured telemetry. Real
named circuits and corners; anonymised driver references ("a sim
racer in their second iRacing season", "a track-day driver on
their third event of the season"). The numbers should be
illustrative — directional, not source-attributed precision.

**Example 1 — Spa La Source, release-too-early**:
- Setup: GT3 class on iRacing; driver of intermediate skill.
- Reference vs. attempt: brake-pressure trace hits zero 0.7
  seconds before apex on the attempt vs. 0.2 on the reference;
  apex speed reads 5 km/h under reference.
- Diagnosis: trail-brake-released-too-early; same shape that
  Section 3 named as canonical.
- Prescription: the Beginner drill from Section 5.

**Example 2 — Suzuka Hairpin, brake-too-gentle**:
- Setup: GT3 class on AMS2; driver new to the circuit.
- Trace: peak brake pressure 52% of available; entry speed too
  high for the rotation achieved; understeer through the
  hairpin's mid-corner phase.
- Diagnosis: brake-too-gentle-to-begin-with; the trail-braking
  intent is right but the predicate (enough load on the front
  axle) was missing.
- Prescription: increase peak pressure target before working on
  the release shape; sequence matters in coaching.

**Example 3 — Brands Hatch Druids, held-too-late**:
- Setup: real-track day; track-day driver in a 911 GT3 RS.
- Trace: brake pressure still 11% at apex; throttle re-applied
  after the apex; understeer at apex point.
- Diagnosis: trail-brake-held-too-late.
- Prescription: the Intermediate drill from Section 5.

**Pattern across all three examples**: the *shape* of each
mistake is platform-agnostic; the same diagnosis lands on a
desktop iRacing capture, an AMS2 capture, and a real-track
RaceBox capture. The intensity (how much time each costs) is
platform-specific and within-driver-comparable only against the
driver's own reference lap on the same surface.

**Doctrine anchor**: ADR-005 §5.2 WeaknessEpisode + §5.4
ActionOutcome (the loop closes when a driver re-runs the same
corner with the prescribed drill and the WeaknessEpisode tagging
flips from `open` to `improving` or `resolved`).

**Keyword anchors**: "trail braking telemetry examples", "trail
braking data analysis", "Spa La Source trail braking", "Brands
Hatch Druids trail braking".

**Internal links**: `/product/driver-profile` (where these
diagnoses surface for the actual driver); brief reference back
to `/blog/sim-to-real-transfer` for the shape-vs-intensity
pattern.

### Section 7 — Conclusion (~150 words)

**Brief**: tie the technique back to the article's promise.

**Three closing lines** (the article's "stick"):
1. Trail braking is a technique, not a secret — and a technique
   you can practice with intent, not by accident.
2. The legibility of practice is what compounds; a single
   session has too much noise to be diagnostic.
3. Forward-pointer: `/product/bridge`, `/product/coaching`,
   `/product/driver-profile`, and a `/waitlist` CTA for readers
   who want the full LAP product surface.

**Voice**: don't oversell. The article's credibility comes from
the honest framing in Sections 3 and 4 (named mistakes,
hand-curated rules) — keep the conclusion declarative, not
hyped.

**Doctrine anchor**: 01-STRATEGIC-DOCTRINE.md §10 (deliverables
and durability commitments).

**Keyword anchors**: "trail braking summary", "trail braking
LAP", "racing telemetry trail braking".

## Quality bar (locks all section drafts)

Every section must satisfy:

1. **Doctrine voice** — declarative, technical without math
   formulae, second-person for the reader, honest about limits.
2. **Specificity** — at least one named circuit, corner, or sim
   platform per section. Generic "modern GT racing" prose is a
   draft red flag.
3. **Honest limits** — every "this is true" claim paired with
   either a constraint, a counterexample, or an explicit "not
   always" framing. Same discipline as Pillar 1's "carries vs
   doesn't" treatment.
4. **Cross-link density** — 1–2 internal cross-links per section
   per the plan above. Not zero, not five.
5. **Forbidden vocab guardrails** — no "AI coach now" / "LLM" /
   "generative" / "neural" / "magic" / "secret" / "trick" /
   "realistic" (the last is a subjective overclaim — replace
   with "fidelity"/"transfer"/"carry-over").

## Section assembly

Article assembly task lives post-T150 (the publish surface).
Same pattern as Pillar 1: section files live in
`docs/pillar-articles/trail-braking/section-XX-name.md`; the
published page lives at `/blog/trail-braking-explained` (or
similar slug, locked at T150) and renders the markdown via
Astro's `import { Content }` syntax. Editorial source and
published artifact stay in lockstep — single source of truth.

The FAQ data module for Pillar 2 (T149) follows the
`src/data/pillar-2-faq.ts` pattern from Pillar 1 (T139); the
publish page (T150) emits Article + FAQPage JSON-LD using the
factory pattern from `pillar1FaqJsonLd()`.

Cumulative test surface: each section gets its own contract test
(T142-T146 each ship one); editing pass T147 ships an article-
level test (analogous to T137's pillar-1-article.test.ts);
internal-linking T148 ships a cross-link test (analogous to
T138's pillar-1-cross-links.test.ts). Total test count for
Pillar 2: ~50–60 across 8 files, mirroring Pillar 1's 64-test
shape.

## Out of scope for this outline

- No actual section drafts. T142–T146 own those.
- No prescriptive word-by-word phrasing. The outline locks the
  *what*; section drafts own the *how*.
- No FAQ content — that's T149.
- No published page — that's T150.

## What does ship from T141

This outline document. It is a planning artifact and lives in
`docs/` alongside the Pillar 1 outline. It does not appear on
the public site. Section drafts (T142–T146) treat it as the
canonical contract.
