# Introducing LAP

LAP is the cross-platform driver-development surface for sim and real-world racing. Public beta opens on **2026-07-23**. This is the launch-day note from the founding team — what is shipping, what is intentionally not, and how the story continues from here.

## What LAP is, in one sentence

LAP turns every sim session and every real-world session a driver runs into a per-driver development plan with a named drill, a measurable success criterion, and a review cadence. The same capture, the same rule library, and the same coaching record carry across iRacing, Assetto Corsa Competizione, AMS2, rFactor 2, and on-track sessions captured with a phone GPS or a RaceBox. One driver, one record, both surfaces.

## Why we built it

Driver development today is fragmented. Telemetry tools sit on the sim side, lap-timing apps on the real-world side, and the conclusions a driver reaches in one rarely transfer cleanly to the other. A driver who spends a year on iRacing and a year on track days ends up with two parallel improvement curves that never quite meet. The brake-zone ordering at Spa La Source on iRacing reads as a different problem from the brake-zone ordering at Brands Hatch Druids on a track day, even though the underlying driving habit is the same.

LAP closes the gap by treating both as captures of the same driver. The shape of the trail-brake release at Suzuka hairpin transfers — whether the corner was virtual or real, the diagnosis lands the same way. The intensity does not transfer cleanly (sim and real grip levels differ, brake-pedal feedback differs, fear differs), so the rule library says so explicitly. Shape is portable; magnitude is platform-specific. That distinction is the foundation the rest of the product sits on.

## What ships in public beta

On launch day, the four substantial pieces all ship together:

**Driver OS v1 on the web.** Per-driver development plans, weakness-episode rows that name the specific mistake shape, and the coaching library all live at lap-coach.racing.

**Sim ↔ real bridge MVP.** Captures from iRacing, Assetto Corsa Competizione, and AMS2 share one driver record with on-track captures from a phone GPS or a RaceBox. The same diagnoses, the same rule library, both surfaces.

**Stripe billing live.** €19.90 per month, monthly only, with a 30-day free trial and no credit card asked at signup. The first 50 founding members lock €14.90 per month — €5 below standard — for as long as the membership stays active; pre-launch waitlist members get a head start to claim one of those spots.

**Hand-curated coaching, in writing.** Every prescription a driver receives traces to a written rule the LAP coaching team maintains in public. Predicate, trigger, prescription, success criterion — all four components shipped, all four versionable, all four defensible to a parent or programme director who asks why a particular drill was chosen.

## What V1 adds on 2026-09-23

Two months after public beta, the V1 release lands four further pieces. The Android application opens capture to the other half of the European phone market. The Apple Watch and WearOS companion surfaces in-session prompts on the wrist — the single next drill the driver agreed to during the prep, with a one-tap confirmation when the lap was the focus attempt. The coaching library v1 expands from the public-beta seed set to more than one hundred hand-curated rules across braking, throttle, apex, line shape, and consistency families. Endurance events become first-class capture shapes — multi-stint sessions, driver swaps, and across-stint consistency comparisons that matter for VLN, 24-hour sim races, and real-track endurance programmes.

Both dates are doctrine commitments. Public beta on 2026-07-23, V1 on 2026-09-23. The roadmap and the active development log live openly on the [blog](/blog), where monthly build-in-public updates name what shipped, what slipped, and what was deliberately left out.

## What we are explicitly not building

Some choices are easier to read in the negative. LAP does not generate coaching narrative with a language model. The discipline is a deliberate scope choice, not a technical shortcut. A written rule library is the only coaching artefact that can be trusted at the depth a driver needs to act on, and we commit in writing to that posture for the foreseeable horizon of the product. There is no real-time in-cockpit coaching at launch. There is no advertising-supported free tier and no plan to introduce one. We do not ship setup widgets, gamification surfaces, or racing-team-engineer tooling. The longer version of this list is in [What we are NOT building, and why](/blog/what-were-not-building) — published as Month 1 build-in-public when the scope discipline was being argued internally.

## Pricing and the founder rate

A single consumer tier at €19.90 per month, monthly only, with a 30-day free trial — and €14.90 per month for the first 50 founding members, locked for as long as the membership stays active. Multi-seat pricing for racing schools and karting academies starts from €10 per seat per month for programmes of ten or more drivers, finalised in conversation with each operator. Every part of that paragraph is a commitment, including the numbers and the trial length.

## How to participate

The most useful pre-launch action is to [join the waitlist](/waitlist). Waitlist members get the launch invite first and a head start to claim one of the 50 founding spots at €14.90 per month. Racing schools and karting academies considering the programme rate can read [/for-schools](/for-schools) and write to sales for a quote. Press and media: the [/press](/press) page has the wordmark, founder context, and the press-release template; press inquiries route to the same inbox with a subject tag.

## What changes between now and 2026-07-23

Most things stay where they are. The pillar articles, the build-in-public posts, the doctrine, and the pricing are all in place today. What is in active development is the capture pipeline, the rule library expansion, and the closed-private-beta cohort feedback loop. The plan is for this post to read accurately on launch day with no edits beyond the date verb tense — that has been the discipline for every artefact shipped during this pre-launch month, and it is the discipline the public will continue to see post-launch.

The rest is shipping the work.

— LAP
