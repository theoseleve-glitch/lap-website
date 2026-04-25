# Pillar 1: Sim to Real-Life Racing Transfer — Outline

> Planning artifact for T131. Subsequent sprint tasks (T132–T140)
> draft sections of this article from the structure below.
> Outline is the contract; section drafts must hit their target
> word count and doctrine anchors.

## Metadata

| Field | Value |
|------|-------|
| Block | H — SEO pillar pages |
| Pillar | 1 of 4 (sim-to-real transfer) |
| Sprint range | T131 (this) — T140 |
| Target final word count | 3,000–3,500 words |
| Sections | 10 |
| Primary search intent | "Does sim racing help my real-world track-day driving, and if so, what specifically transfers?" |
| Doctrine anchors | "shape vs intensity" (homepage T030, /product/bridge T117), ADR-005 §5.2 WeaknessEpisode + §5.5 TransferLink, ADR-013 coaching library `transfer_profile` field, 01-STRATEGIC-DOCTRINE.md §1 cross-platform mission |
| Voice | First-person plural where appropriate ("we"), second-person for the reader ("you"), no marketing exclamations |
| Forbidden vocab (ADR-004) | "AI coach", "LLM", "generative", "neural" |

## Primary keyword cluster

Search terms an actual sim racer / track-day driver would Google.
Use these naturally in headings and body — never stuffed.

**Head terms**:
- "sim racing to real racing transfer"
- "does sim racing help real driving"
- "iRacing to track day"
- "sim racing skills transfer"

**Long-tail variants**:
- "what sim racing teaches you about real driving"
- "does iRacing improve track day lap times"
- "limits of sim racing realism"
- "sim racing weaknesses on real track"
- "ACC vs real-life GT racing"
- "sim racing for track day prep"

**Keyword anchors per section** are listed inside each section
brief below. Aim for one head-term + 1–2 long-tail variants per
section heading or first paragraph. No section should reach for a
keyword that isn't naturally already in its content.

## Internal cross-links (target page → expected anchor text)

The article is the SEO acquisition surface for sim-and-real-life
racers; product-page cross-links are how converted readers reach
the conversion funnel.

| Internal link | Anchor copy hint | Where it should appear |
|---|---|---|
| `/product/bridge` | "the bridge" / "our sim-to-real transfer algorithm" | Section 3 (shape vs intensity) and Section 8 (closed loop) |
| `/product/coaching` | "our coaching library" / "rule library" | Section 6 (what sim teaches you) and Section 8 |
| `/product/driver-profile` | "your driver profile" | Section 8 (closed loop), Section 10 (conclusion) |
| `/product/desktop` | "the desktop client" | Section 9 (tools) |
| `/product/mobile` | "the mobile app for real-world capture" | Section 8 and Section 9 |
| `/waitlist` | "the waitlist" / "join the LAP waitlist" | Section 10 (CTA) |

## Sections

### Section 1 — The question (~250 words) [introduces, no T-task]

**Premise**: open with the actual question two distinct readers
arrive with.

- The sim racer who's done five seasons of iRacing GT3 and is
  about to do a track day in a real car for the first time. They
  want to know: does any of this work I've put in actually carry
  over?
- The track-day driver who's heard their lap-time gap is on
  trail-braking and is wondering whether buying a sim rig is a
  better use of money than another track day.

**Frame**: it's not "yes" or "no". Some specific things transfer
strongly, some don't transfer at all, and the difference is
predictable. The article lays out the framework.

**Closing line**: should preview the "shape vs intensity"
framework so readers know the article will not pull punches.

**Doctrine anchor**: 01-STRATEGIC-DOCTRINE.md §1 — sim and
real-life as one progression for one driver.

**Forbidden**: the word "realistic" (subjective). Use "fidelity",
"transfer", "carry-over" instead.

### Section 2 — What transfers, what doesn't [T132] (~400 words)

**Brief**: with data where possible, list what carries between
platforms and what doesn't. Honest about the limits.

**Carries (transferable shapes)**:
- Brake-zone *ordering* — which corner you brake earliest for vs
  latest, in their relative sequence around the lap
- Throttle modulation pattern (smooth pickup vs snap-throttle)
- Line shape (apex location, exit allocation)
- Race-craft instincts — defensive line, undercut/overcut
  decisions, traffic management, blue-flag behaviour
- Mental endurance — stint pacing, focus across 60 minutes
- Trail-braking *pattern* — but not magnitude

**Does not carry (intensity, raw numbers)**:
- Absolute lap times (different reference, setup, tire compound)
- G-force calibration — sim seat feedback vastly understates
  loaded-corner G
- Tire grip *feel* — slip-angle progression, especially on hot
  vs cold tires
- Surface bumps & curb impact — sim simplifies; real curbs hurt
- Fear & adrenaline — sim has no consequence
- Brake-pedal pressure — load-cell pedals approximate, no sim
  pedal matches the actual physical feedback of an HPC system

**Why this matters** (closing paragraph): this list is the
foundation for the rest of the article. Once you accept that
*shapes* transfer but *magnitudes* don't, you can make rational
decisions about what kind of practice translates and what
doesn't.

**Doctrine anchor**: ADR-005 §5.2 WeaknessEpisode `subcategory`
and `corner_tag` — those fields ARE the transferable signature.

**Keyword anchors**: "what sim racing teaches you", "does iRacing
help real driving", "limits of sim racing transfer".

### Section 3 — The shape vs intensity framework [T133] (~400 words)

**Brief**: present the framework as the unifying principle the
rest of the article will lean on.

**Key claims**:
- A weakness has two dimensions: *shape* (what kind of mistake)
  and *intensity* (how big a time loss it produces).
- Shape is platform-agnostic. "Late on the brakes into Turn 1"
  is a legible diagnosis on iRacing AND on the real Spa T1.
- Intensity is platform-specific. "Turn 1 costs you 0.4s" on iRacing
  is unrelated to the same corner's loss in real life — different
  reference, different setup, different physics fidelity.
- Therefore: a coaching system that compares *shapes across
  platforms* and *intensities within platforms* is doing the only
  thing that's epistemically defensible.

**Concrete example**: walk through trail-braking at Spa La Source.
Sim and real both diagnose "trail-brake released too early →
apex speed deficit". Sim says you lose 5km/h there; real day says
3km/h. Same shape, different magnitude. The drill (carry pressure
past turn-in, ease off as you pick up throttle) is the same on
both.

**Doctrine anchor**: /product/bridge T117 page makes this
explicit; the article expands it. ADR-005 §5.5 TransferLink is
the technical realisation.

**Internal link**: "the bridge" → /product/bridge (anchor text
should sit naturally inside the example paragraph).

**Keyword anchors**: "sim to real-life racing transfer", "weakness
shapes transfer", "racing simulator vs real life".

### Section 4 — Track geometry analysis [T134] (~350 words)

**Brief**: not all corner types transfer equally. Map the
fidelity gradient.

**Corner types from highest to lowest sim-real fidelity**:

1. **Medium-speed sweepers (130–180km/h)** — highest fidelity. Sim
   tire models handle steady-state lateral load well. Examples:
   Silverstone Copse, Spa Pouhon.
2. **High-speed flat corners (180km/h+)** — high fidelity in
   technique terms (hands), but sim massively undersells the
   visual cone-of-fear. The fear gap is what surprises sim racers
   on track. Eau Rouge, Suzuka 130R.
3. **Slow-speed hairpins** — high fidelity. Trail-braking and
   rotation behave similarly. Spa La Source, Brands Hatch Druids.
4. **Compression / elevation zones** — medium fidelity. Sim
   approximates downforce-vs-elevation but real cars have
   suspension travel and aero balance shifts that sim simplifies.
   Eau Rouge compression, Laguna Seca corkscrew.
5. **Off-camber and banked corners** — medium fidelity. Banking
   physics work; off-camber tire load shifts are simulated but
   the seat-of-pants signal is missing.
6. **Bumpy / curb-heavy sections** — lowest fidelity. Sim
   simplifies surface roughness; real curbs eat your suspension
   and your trajectory. Sebring is the canonical example.

**Practical implication**: a sim driver should be most confident
about lessons learned in categories 1, 3, and 4. Lessons in 2 are
true but the fear-induced hesitation will only show up on track.
Categories 5 and 6 require track-day calibration.

**Keyword anchors**: "sim racing track geometry", "iRacing track
fidelity", "what corners simulators get right".

### Section 5 — Case studies [T135] (~600 words)

**Brief**: three named circuits, each illustrating one fidelity
class. Concrete, not generic.

**Sebring (USA, 12 Hours of Sebring circuit)** [~200 words]
- Surface: notoriously rough, concrete patches, rough curbs
- Sim: iRacing models the layout and bumps reasonably; ACC
  doesn't have the track. AMS2 has it.
- Where transfer is strong: the rhythm of the lap, where to
  attack, the turn-1 brake commitment
- Where transfer is weak: how the bumps move the car around mid-
  corner; which curbs are usable vs which destroy your alignment
- Verdict: do sim laps for the rhythm; expect surprises in the
  high-speed bumpy sections

**Silverstone (UK, Grand Prix circuit)** [~200 words]
- Surface: smooth, modern grip, well-curated curbs
- Sim: iRacing/ACC both have very high-fidelity Silverstone
- Where transfer is strong: nearly everything technique-wise.
  Silverstone is one of the cleanest sim-to-real transfer cases.
- Where transfer is weak: only the visual scale (it's bigger in
  person than the screen suggests, especially Maggotts/Becketts)
  and the fact that real-life Copse loads the tire much harder
  than the sim "feels" — but the technique is the same
- Verdict: maximum transfer; if you've sim-prepped Silverstone,
  the first session feels familiar

**Nürburgring Nordschleife** [~200 words]
- Surface: 73 corners, elevation, mixed surface, history
- Sim: iRacing's Nordschleife is well-modeled; the layout
  transfers extremely well
- Where transfer is strong: the *layout memorisation* — knowing
  which corner is next, what comes after the bridge, where
  Flugplatz lives. This is the hardest thing to learn at the real
  track and sim provides huge value.
- Where transfer is weak: the elevation FEEL — Nordschleife's
  blind crests and yumps. Sim shows the elevation but the
  visceral "stomach goes up" doesn't transfer.
- Also weak: the *consequence* — there are no recovery zones at
  the real track. The sim reset button has no equivalent.
- Verdict: sim prep is essential for layout; do not let it lull
  you into mis-calibrating commitment levels at the real track.

**Closing pattern**: across all three, the transfer is *partial*
in a predictable way. The article's framework explains which
parts and why.

**Keyword anchors**: "Sebring sim racing", "Silverstone iRacing
real life", "Nürburgring Nordschleife sim transfer".

### Section 6 — What sim teaches that's hard to learn on track [T136] (~300 words)

**Brief**: the asymmetric advantages of sim that the article
should not undersell.

**Things sim does better**:
- **Repetition volume** — you can do 200 laps of Spa T1 in a sim
  evening. You'll never get 200 laps of Spa T1 in a track-day
  career.
- **Cheap iteration on setup** — change a setting, try it, undo it.
  Can't undo a setup change at lunchtime when you've already
  used 40% tire life.
- **Race-craft & multi-class scenarios** — sim multiplayer puts
  you in traffic, dive-bomb situations, blue-flag etiquette
  reps that take years on track to encounter.
- **Strategy reps** — pit-stop timing, fuel save, undercut
  decisions. Track days are practice; sim races are full
  strategy environments.
- **Failure-mode learning** — losing the back end at corner exit
  in the sim teaches you the technique at zero consequence; same
  loss on track ends in armco.

**Honest framing**: these are exactly the areas where a high-
volume sim racer has structurally more practice than a casual
track-day driver. The list isn't a sales pitch; it's the basis
for the article's recommendation in Section 8.

**Internal link**: "the coaching library" → /product/coaching
(when discussing how rule-based coaching reps make these reps
useful instead of just plentiful).

**Keyword anchors**: "what sim racing teaches you", "sim racing
benefits real driving", "iRacing race-craft transfer".

### Section 7 — What track teaches that sim can't [T137] (~300 words)

**Brief**: the asymmetric advantages of track that no sim can
simulate.

**Things track does better**:
- **Tire degradation feel** — slip-angle progression as the tire
  goes off, the early warning signs (front pushing, rear getting
  loose) — sim approximates, real track teaches.
- **Cold-tire / warm-up management** — the first three laps
  on cold tires; what NOT to do; how to feel the moment they
  light up. Sim has cold tires but the consequence is muted.
- **Weather and surface change** — rain on a partially dry
  track, oil patches, a single damp corner on an otherwise dry
  lap. Real track teaches adaptive driving in a way no sim does.
- **Real consequence calibration** — knowing what 90% commitment
  feels like and what 100% feels like; only track teaches the
  difference under real-stakes conditions.
- **Mechanical sympathy** — the sound of a drivetrain under
  abuse; what a tired car feels like; pacing yourself for the
  car's sake. Sim cars don't break.
- **Mental load of physical strain** — heat in the cockpit, neck
  fatigue, pulling Gs on the body, dehydration. Drive 30
  minutes in real heat and you understand why pro drivers train.

**Closing line**: anyone who claims sim makes track redundant is
wrong, and we're going to tell you why in plain English. (This
sets up Section 8.)

**Keyword anchors**: "track day vs sim racing", "real racing tire
feel", "limits of sim racing".

### Section 8 — How to use both deliberately [T138] (~350 words)

**Brief**: the practical recommendation. The article's real
value-add for an actual reader.

**A four-step closed loop**:

1. **Pre-track-day sim prep** — sim the circuit at the same car
   class, same setup philosophy. Goal: layout familiarity, brake-
   point ordering, race-line muscle memory. Do NOT obsess over
   matching real lap times in the sim; you're priming, not
   performing.

2. **Track day capture** — the mobile app captures the real-day
   data alongside the sim-day data. Same driver profile, same
   weakness episodes, same prescriptions.

3. **Post-track review** — line up sim laps and real laps for the
   same corner; look at where they diverge. The bridge does this
   automatically; without LAP, do it manually with two screens
   and a notepad. The shape that transfers is what to focus on.

4. **Drill between events** — if the track day flagged "trail-
   brake too early at La Source", the sim is the cheap place to
   drill. Two evenings of focused La Source reps in the sim, at
   correct car class, can produce a measurable improvement at the
   next track day.

**Quarterly profile review**: the article should mention that
running this loop quarterly, and looking at the driver profile
over 3+ months, is the durable benefit. Single sessions are
noise.

**Internal link**: "the bridge" → /product/bridge; "your driver
profile" → /product/driver-profile.

**Keyword anchors**: "sim to track day prep", "track day sim
preparation", "iRacing for real track day".

### Section 9 — Tools and platforms [T139] (~300 words)

**Brief**: practical recommendations on what to use, without
shilling.

**Sim platforms** (one paragraph each):
- **iRacing** — best for race-craft and multi-class, ranked
  ladder structure, official series, priced subscription.
- **ACC** — best for GT3/GT4 fidelity in a single car class;
  Blancpain car set is canonical; one-time purchase + DLC.
- **AMS2** — Brazilian developer; exceptional formula and stock-
  car content; growing track list; one-time purchase.
- (No iRacing-vs-ACC argument; both work.)

**Telemetry tools**: brief LAP mention — "the desktop client
captures sim sessions automatically; the mobile app captures
real-world track days; together they produce a single driver
profile that closes the sim-to-real loop." One paragraph, doctrine
voice, not salesy.

**Hardware tiers**:
- Consumer wheel + pedals: enough to learn shapes
- Direct-drive + load-cell pedals: closer feel, but technique
  transfer doesn't depend on it
- Full motion: expensive; doesn't add transfer beyond the rig
  feel
- Bottom line: don't let hardware envy delay practice

**Internal links**: /product/desktop, /product/mobile.

**Keyword anchors**: "best sim racing platform for real driving",
"iRacing vs ACC track day prep", "racing telemetry tools".

### Section 10 — Conclusion [T140] (~200 words)

**Brief**: tie the framework back together, point at the LAP
product surface.

**Three closing lines** (the article's "stick"):
1. The transfer is real but partial — and the partial is
   predictable.
2. Treating sim and real as one progression unlocks both; the
   alternative is two separate spreadsheets and a hope.
3. Forward-pointer to /product/bridge, /product/coaching,
   /product/driver-profile, and a /waitlist CTA.

**Voice**: don't oversell. The article's credibility comes from
the honest framing in Sections 2 and 7 — keep the conclusion
short and confident, not exclamatory.

**Internal links**: /product/bridge, /product/coaching,
/product/driver-profile, /waitlist.

**Keyword anchors**: "sim racing track day", "iRacing real
racing transfer".

## Word count rollup

| Section | Target words | Cumulative |
|---|---|---|
| 1. The question | 250 | 250 |
| 2. What transfers, what doesn't (T132) | 400 | 650 |
| 3. Shape vs intensity (T133) | 400 | 1050 |
| 4. Track geometry analysis (T134) | 350 | 1400 |
| 5. Case studies (T135) | 600 | 2000 |
| 6. What sim teaches (T136) | 300 | 2300 |
| 7. What track teaches (T137) | 300 | 2600 |
| 8. How to use both (T138) | 350 | 2950 |
| 9. Tools and platforms (T139) | 300 | 3250 |
| 10. Conclusion (T140) | 200 | 3450 |

**Final target**: 3,000–3,500 words. Section drafts that come in
± 20% of their target are acceptable; substantially over or under
indicates the structure or framing is off and the section needs
re-thinking before assembly.

## Quality bar (for the eventual published article)

- **Voice**: doctrine-aligned (sim + real, weakness shapes,
  rule-based — no AI/LLM/generative vocabulary, no "realistic"
  claims).
- **Specificity**: every section names at least one concrete
  circuit / corner / car class. Generic "fast right-hander"
  language is rejected at copy review.
- **Honest limits**: every "what transfers" claim is paired with
  an honest "what doesn't" claim. Article credibility depends on
  this.
- **Cross-links**: at least one internal link per section to a
  /product/ pillar page or /waitlist; no link spam (max 2 per
  section).
- **No marketing exclamations**: no "!", no "Game-changing",
  no "revolutionary", no "fastest possible". Match the voice
  of /product/bridge.

## Assembly task (post T140)

When all 10 section drafts are landed, a final task assembles
them into:
- `lap-website/src/content/blog/sim-to-real-transfer.mdx` (or
  the equivalent Astro content collection entry once the
  collection is configured)
- Frontmatter: title, description, publishedAt, ogImage, primary
  keyword, target audience.
- Final pass for transitions between sections (the section
  drafts will read independently; the article needs them to
  flow).
- Contract test for: word count band, all 10 sections present,
  doctrine guardrail (no AI-coach/LLM/generative), all internal
  cross-links resolve.

That assembly task is not numbered yet in the sprint plan; it
will land as part of Block H closing.
