# What We're NOT Building (and Why)

Most product roadmaps are a list of features that will
ship. This post is the inverse — a list of features LAP
will not ship, and the reasons each one is excluded by a
deliberate scope choice rather than by oversight or
runway. Naming the exclusions in public is the part of
scope discipline that makes the roadmap credible. A
project that cannot say what it is not building cannot be
trusted to defend the scope of what it is building when a
demo request lands or a pivot temptation arrives.

The doctrine §10 commitments document the exclusions
internally. This post is the public-facing version, written
plainly so that prospective users can decide before they
sign up whether what LAP is and is not is the product they
want.

## We are not building language-model-generated coaching

Every coaching prescription LAP ships traces to a written
rule from a hand-curated rule library — never to a
language-model output. The reason is durability, not
fashion. A coaching surface that fabricates plausible-
sounding advice will eventually land a prescription on a
corner the driver knows well, and the prescription will be
wrong, and the trust differential between LAP and the
products that already pivoted to language-model coaching
will collapse on that single bad output. The rule library
is hand-curated specifically because the scope choice is
durability over surface area: fewer prescriptions, every
one of them traceable to a human author who put their name
against the rule.

This is the headline scope choice for the product. It is
also the one that cost the most surface area to keep —
the rule library is a slower thing to build than a
prompted coaching agent would be, and the slowness is the
point. Doctrine §10 lists this exclusion as one of six
commitments the project will not compromise on, alongside
session-capture reliability and grandfathered pricing for
early users — the company-level commitments that have been
ratified before the product exists, so that the scope
choice has somewhere to live other than this one founder's
willingness to defend it.

## We are not building a real-time in-cockpit coach

A voice in the driver's ear during the lap is a different
product. It is also a different safety profile, a different
latency budget, and a different trust failure mode. LAP
runs between sessions, on the trace after the lap is in
the books, where the prescription anatomy can be verified
and reviewed before it reaches the driver. A prescription
that arrives mid-corner with no review step has a
narrower window for correctness and a wider blast radius
when it lands wrong.

The deliberate scope choice is that the loop closes
between sessions, with the driver as the decision-maker
of which prescription to run, not at 200 km/h with the
coach overriding the driver's read of the corner. Real-
time coaching is not on the roadmap because it is not the
loop the doctrine commits to closing.

## We are not building a tool for the racing-team engineer

The persona LAP serves is the driver alone with the data,
between sessions, with no engineer attached. The racing-
team engineer who instruments a real car with hardware
loggers, builds math channels, and reads traces in the
pit garage is a different persona with a different
established workflow. That workflow already has tools that
serve it well — the [telemetry app
comparison](/blog/best-sim-racing-telemetry-app) walks
through the comparison universe and documents which tool
fits which engineer's day.

A coaching-surface product would add friction to that
engineer's workflow without adding value, and the engineer
who masters the existing tooling does not need a
prescription emitted from software because they are the
prescription, in cooperation with the driver. We are not
building for that persona because the persona already
has what it needs, and pretending otherwise would dilute
the surface for the persona LAP is actually serving.

## We are not building gamification as the primary surface

Leaderboards, streaks, and social comparison features
have a real place in a sim-racing community product. They
do not have a place at the center of a coaching surface.
The reason is that the design loop the doctrine commits
to closing — diagnose, prescribe, execute, measure, adapt —
runs on the driver's individual weakness shapes, not on
their position relative to a peer group. Gamification
optimised against a leaderboard tends to produce
optimisation against the leaderboard, which is not the
same thing as optimisation against the driver's actual
limiters.

The community surface around the product can use whatever
gamification the community wants. The coaching surface
inside the product does not, because the persona LAP is
serving wants the next four things to do this week, not a
ranking against last week's peer cohort. This is also a
deliberate scope choice — we picked durability of the
coaching loop over engagement metrics that decay quickly.

## We are not building a setup or strategy widget

The doctrine names this exclusion plainly: LAP does not
sell a logger, a viewer, or a strategy widget. Those are
adjacent products with their own established users and
their own pricing models. A coaching surface that also
tries to be a setup tool, a tire-strategy calculator, or a
race-engineer dashboard ends up serving none of those
personas well, because the prescription anatomy that
serves the driver-between-sessions does not generalise to
mid-race strategy decisions or to engineering-grade trace
inspection. The deliberate scope choice is to be the
coaching loop and to leave the adjacent surfaces to the
products that built them well.

## We are not prescribing what the rule library cannot diagnose

If a session's diagnosis layer matches no rule in the
library, the surface declines to prescribe rather than
fabricating a prescription with one or more components
missing. The driver sees "observed pattern; no current
prescription" rather than a drill that was generated to
fill the gap. The rule library will grow over time, but
the rule it does not yet contain receives no
prescription — not a fabricated one — until a human
author writes the rule and ships it under their name.

This commitment is the load-bearing one for trust. A
coaching surface that fabricates to fill gaps in the rule
library will produce non-followable advice and lose trust
the first time it lands wrong. A surface that declines to
prescribe when the library has not earned the right
produces fewer prescriptions and earns the right to ship
the next one. The scope choice is the same one the
[framework post](/blog/driver-development-plan) names: the
loop closes or the feature does not ship.

## Why we publish what we are not building

Two reasons. First, prospective users deserve to know what
LAP is not before they sign up, so the user who needs a
real-time coach or a math-channel tool or a gamified
sim-racing community can pick a product that fits, rather
than be disappointed by LAP's absence of features it never
intended to build.

Second, publishing the exclusions in public is what makes
them durable. A scope choice that lives only in an
internal doctrine document drifts when the next demo
request lands and the pressure to "just add a small
real-time hint" arrives. A scope choice that has been
published, named, and explained is harder to drift past,
because the drift would visibly contradict the public
commitment. We publish what we are not building because
the publication is part of how we keep ourselves honest
about it.

The roadmap of features LAP will ship is a long document.
The roadmap of features LAP will not ship is a shorter
one, and a more important one to get right. This post is
the public-facing edition; the internal commitments are
where they live by name and by ADR, and the scope
discipline runs across both.
