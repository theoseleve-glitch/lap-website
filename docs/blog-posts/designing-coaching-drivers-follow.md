# Designing Coaching That Drivers Actually Follow

Most coaching advice fails on followability, not on accuracy.
A driver who walks away from a session with "be smoother
on entry" has not received coaching. They have received an
observation. The gap between observation and prescription
is the gap between a coaching surface that produces
progression and one that produces good intentions. Closing
that gap is the design problem the rest of this post is
about.

This is the founder voice on the framework that the
[driver development plan
article](/blog/driver-development-plan) develops in
technical detail. The doctrine claim, in one sentence: a
followable prescription has anatomy, and any component
missing from the anatomy is what makes the coaching go
unfollowed.

## Why "be smoother on entry" is not coaching

The advice "be smoother on entry" is observation-shaped.
It names a quality the lap time would benefit from but
not a procedure for producing the quality. The driver
cannot act on it because nothing about it tells them what
to do differently on the next lap. Similar examples: "carry
more speed through the apex", "trust the car on exit", "be
more committed on the brake". Each one names a desirable
end state. None of them name the action that gets the
driver from where they are to that end state.

Driver-side, the failure mode is consistent. The driver
nods, attempts to be smoother, has no procedural anchor
for what smoothness consists of in this corner, and
defaults to driving the corner the same way they did
before. The coaching was technically correct. It was also
not coaching, because it could not be followed.

## The four-component prescription anatomy

A followable prescription has four components, each one
load-bearing. Strip any one of them and the prescription
collapses back into observation.

The weakness shape names the specific pattern observed in
the trace — for instance, a two-stage trail-brake release
with a mid-corner pressure spike, isolated to one corner
of the lap. I use this example throughout the post because
the [trail-brake technique](/blog/what-is-trail-braking)
has a clear anatomy of its own — turn-in pressure, taper
profile, release point — which gives a coaching
prescription a precise vocabulary to land in. The drill
name is the explicit action with a procedure attached:
"hold trail-brake pressure on a single continuous taper
from turn-in to 50% rotation, no secondary pressure
application". The success criterion is
the measurable signal that says the drill worked: brake
pressure shows a monotonic decrease from turn-in to apex,
no local maximum past 50% of the trail-brake duration. The
review cadence is when the driver checks back: ten laps,
then re-diagnose.

A prescription missing any one of these is observation-
shaped, not prescription-shaped. The drill name without a
success criterion produces infinite drilling without a
finish line. The success criterion without a review cadence
produces a drill that runs until the driver gets bored. The
weakness shape without a drill name produces frustration
without an action — the driver knows something is wrong but
has nothing to do about it.

## The five verbs run as a loop

The five framework verbs — diagnose, prescribe, execute,
measure, adapt — are not a line. They are a loop. Order
matters: diagnosis precedes prescription, prescription
precedes execution, and the loop only closes when the
adaptation step feeds back into a re-diagnosis.

This is what the doctrine names "the loop closes or the
feature does not ship". Coaching that emits a single
prescription and walks away produces good intentions. The
driver runs the drill, has no signal for whether it worked,
and either keeps running the same drill indefinitely or
abandons it without knowing whether it produced the
result. Coaching that runs the loop produces follow-through:
the driver runs the drill, measures against the success
criterion, adapts on the next session, and the diagnosis
layer either retires the prescription or surfaces a new one.

## Why a hand-curated rule library makes prescriptions followable

Every coaching prescription in LAP traces to a written
rule that a human author published their name against. The
reason a hand-curated rule library matters for followability
is not credentialism. It is that the rule library is the
source from which the four prescription components are
reliably populated.

A rule in the library names the weakness shape it
diagnoses, the drill that fixes the shape, the success
criterion that says the drill worked, and the cadence at
which to review. When a session's diagnosis layer matches
a rule, the prescription is complete by construction. The
driver receives the four components together, in one piece,
because the rule was written to ship them together.

When a session's diagnosis matches no rule, the surface
declines to prescribe rather than producing a fabricated
prescription with one or more components missing. The
deliberate scope choice is durability over surface area.
A coaching surface that fabricates to fill gaps in the
rule library produces non-followable advice and erodes
trust the first time it lands on a corner the driver knows
well. A surface that declines to prescribe when the library
has not earned the right to produces fewer prescriptions,
but every prescription it does ship survives contact with
the corner.

## What this looks like in a session

A driver opens LAP after a session. The diagnosis layer
surfaces three weakness shapes from the session's data:
a trail-brake release pattern at one corner, a throttle-
pickup hesitation at another, and an apex-line
inconsistency through a third. Each one comes with a drill
name, a success criterion, and a review cadence. The
driver picks one, runs the drill across the next ten laps
of practice, checks the success criterion, and the
adaptation step either retires the drill or feeds back
into a re-diagnosis.

If the third weakness shape matches no rule in the
library, the surface presents it as "observed pattern; no
current prescription" rather than fabricating a drill name
that will not survive contact with the corner. The driver
knows what to work on this week without being handed
coaching that cannot be followed because it was never
followable to begin with.

## The cross-platform discipline

The same prescription anatomy runs on sim and on real-world
surfaces. The architecture that makes one coaching surface
ship across both — the cross-platform Driver OS —
is the same one that the [sim-to-real transfer
article](/blog/sim-to-real-transfer) develops in detail,
and the magnitudes-do-not-transfer caveat that the
[founder-voice version](/blog/sim-to-real-gap-honest-look)
develops in plainer language. A weakness shape extracted
on iRacing on Tuesday produces a drill name, a success
criterion, and a review cadence. The driver runs the drill
on Saturday at the track and adapts. Same anatomy, same
loop, magnitudes recalibrated on the day.

Without that unification, a driver who runs both surfaces
receives two disconnected coaching streams — one for the
sim, one for the real car — and has to reconstruct the
connection in their head every session. With it, the
prescription anatomy is the connection.

## Why followability is the design constraint

Coaching that is accurate but not followable produces no
progression. Coaching that is followable but inaccurate
produces drills that fix nothing. The design target is
both — accurate diagnosis matched to a followable
prescription, with the surface declining to prescribe
when the rule library has not earned the right.

Followability is not a marketing line in the Driver OS.
It is the design constraint that determined how the rule
library is structured, why the prescription anatomy has
four components rather than one, and why the loop must
close before a feature ships. Coaching is followed when
it tells the driver the next four things in the right
order and gives them a way to know whether the drill
worked. The work between the diagnosis and the next
session is where the lap time gets earned, and the
coaching surface either equips the driver to do that work
or it gets in the way.
