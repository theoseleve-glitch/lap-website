# Why I'm Building LAP (and Not Another MoTeC Clone)

I get this question often, usually from sim racers who have
been around the telemetry-tool universe for a while: why
build a new product when MoTeC already exists? The honest
answer is that I am not building MoTeC's competitor. I am
building a different product, for a different driver, with
the same kind of data underneath but a different question
on top.

The shorter version: MoTeC is the tool that helps an
engineer read a trace. LAP is the tool that helps a driver
decide what to work on next. Both rely on telemetry data;
they answer different questions and ship different surfaces.
Confusing them is what produces "MoTeC clone" pitches that
never quite land.

## What MoTeC actually does well

MoTeC i2 is the gold standard for professional motorsport
engineering workflows. The trace-reading depth, the channel
customisation, the math-channel system, the data-import
flexibility — all of it is unmatched at the engineering
level. The pro race engineer using a hardware logger to
instrument a real car will continue to use MoTeC, and they
will continue to be right to do so. [The telemetry app
comparison](/blog/best-sim-racing-telemetry-app) walks
through six tools across six dimensions and documents
MoTeC's strengths in detail; readers who think they need
MoTeC almost always do.

This is not framing-by-praise so I can pivot to a critique.
MoTeC was built for a specific user — the engineer who is
between the driver and the data — and it serves that user
better than any other tool in the comparison universe.

## What MoTeC was never designed to do

MoTeC's audience is the engineer reading the trace for a
driver who is at the track. The driver-facing surface — what
to work on this week, what drill to run, what success
criterion to measure — is not MoTeC's job. It is a deliberate
scope choice on MoTeC's side, and a defensible one. The
engineer who masters MoTeC does not need a coaching
prescription emitted from the software; they are the
coaching prescription, in cooperation with the driver.

The driver alone with the data, no engineer behind them
between sessions at home, is a different user. Sim racers
who are training between weekends. Track-day drivers who run
four-to-eight events a year and want to compress weekend
learning into the next event without an engineer attached.
This persona has nowhere to go inside MoTeC's surface,
because MoTeC was never trying to serve them. The gap is
real and the product MoTeC ships is correct on its own
terms.

## The driver-facing question I want to answer

When the driver opens LAP between sessions, the surface they
see is built around one question: what should I work on this
week? The five framework verbs from [the development plan
article](/blog/driver-development-plan) — diagnose, prescribe,
execute, measure, adapt — close the loop on practice, derived
from the same data MoTeC reads but presented as a coaching
surface rather than an engineering surface. The driver gets
a weakness shape, a drill name, a success criterion, and a
review cadence. The engineer gets the trace itself, with the
math channels and the customisation that MoTeC has spent
twenty years polishing.

The cross-platform claim is the other half of LAP's
positioning. iRacing-only telemetry tools, real-world-only
telemetry tools, and pro-engineering tools all share a
limitation: none of them carry a single driver profile across
both sim and real-world surfaces. The same driver running
iRacing on Tuesday and a track day on Saturday lives across
two disconnected data silos in every other tool. That gap
is the reason LAP exists; it is what cross-platform
unification means in practice, and it is the part of the
product that no MoTeC-shaped tool was set up to deliver.

## Why language-model coaching was the wrong move

Several adjacent products in the cluster pivoted to
language-model-generated coaching prompts when the
language-model wave arrived in the early 2020s. We did not, and we will not. Every coaching
prescription in LAP traces to a written rule that a human
author edited and evidence-backed by hand — never to a
language-model output. The rule library is hand-curated
specifically because the durability of a coaching surface
depends on whether the prescription can be traced to a
written rule with examples and counterexamples behind it.

The deliberate scope choice is durability over surface area.
Shapes the rule library does not yet name receive no
prescription rather than a fabricated one. A coaching prompt
that sounds plausible but cannot be traced to a rule is
exactly the kind of advice that costs the driver lap time
and erodes trust the first time it lands wrong on a corner
the driver knows well. The loop closes — observation,
evidence, likely cause, prescribed action, measurable
success condition, review — only when the prescription is
sourced from a rule a human author was willing to publish
their name against.

## What LAP gives up versus MoTeC

The honest list of what LAP does not yet do, and what it may
never do because it sits outside the scope:

LAP does not surface raw trace inspection at MoTeC's depth.
The math-channel system is not there. The hardware-logger
integration is not there. Channel-by-channel customisation
is not there. A driver who needs those features needs MoTeC,
and we say so explicitly on the comparison page rather than
pretending the gap is not real.

LAP also does not target the team-coach or the racing-team
engineer persona. Both have established workflows where
MoTeC is load-bearing and a coaching-surface product would
add friction without adding value. We are not the product
those users should switch to.

## Who this is for, and who it isn't

The persona work in the doctrine spells this out cleanly.
LAP fits the serious sim racer who has plateaued at a
licence class and wants structured progression rather than
more seat time in the same fog. It fits the track-day driver
who runs four-to-eight events a year and wants the work
between sessions to compound into the next event. The driver
who learns from the data, alone at the desk between
sessions, is the primary persona, and the cross-platform
unification is what lets one structured loop run across both
surfaces of their training week.

The anti-personas are explicit: racing-team engineers (keep
MoTeC); drivers with a dedicated human coach (keep the
coach); semi-pro sponsored drivers in series with a paid
engineer attached (different product entirely, and not what
LAP is trying to be). The development-plan framework runs on
any tool the driver already pays for; LAP automates the
bookkeeping for a specific persona, not for everyone. The
companion piece to this post — [what we're explicitly not
building](/blog/what-were-not-building) — names the scope
exclusions that follow from this persona choice.

## Why this matters now

The cross-platform Driver OS is a product category that does
not exist yet at the consumer-driver level. Pro motorsport
has solved the engineering surface; sim racing has telemetry
analysis tools; track-day driving has phone-capture pipelines
at the bottom and pro-engineering setups at the top. None
of these are unified by a single driver profile that travels
with the driver across surfaces. Someone will build that
category, and I want it to be us — hand-curated,
evidence-backed, and honest about what it does and does not
do.

The trace MoTeC reads is the trace MoTeC has been reading
since the early 2000s, and it will keep reading it for the
race engineers who are its users. The coaching prescription
LAP ships is a different product in the adjacent category,
serving a driver MoTeC was never trying to reach. Different
question, different surface, different persona — and no
clone in the engineering sense, only honest neighbours in
the data.
