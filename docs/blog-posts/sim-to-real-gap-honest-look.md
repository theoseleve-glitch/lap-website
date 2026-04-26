# The Sim-to-Real Gap: A Honest Look

I get asked about the sim-to-real gap two different ways.
Sim racers want to know whether their training transfers to
real-world driving when they finally book a track day.
Track-day drivers ask the inverse: is sim time a waste
before their next event, or is it the fastest preparation
they can buy? The honest answer to both is the same. Yes,
sim training transfers, partially, and the partial is
predictable. The gap lives in a specific place, and naming
where the gap lives is the difference between treating sim
hours as preparation versus treating them as a substitute.

This post is the founder version of the argument that the
[sim-to-real transfer
article](/blog/sim-to-real-transfer) develops in technical
detail. The doctrine claim, in one sentence: shapes
transfer between sim and real, and magnitudes do not. What
follows is what that means in practice.

## What sim training transfers cleanly

A non-trivial portion of driving knowledge lives in the
driver's mental model of the track and the car, not in
their seat-of-pants calibration. Brake-zone ordering — which
corners need a hard stop and which need a brush of the
pedal — transfers cleanly between platforms. Line shape,
the geometric path through a corner from turn-in to apex to
exit, is the same shape on iRacing as on a real GT3 with
the same corner radius. Trail-brake patterns, throttle
modulation off the apex, race-craft instincts in traffic —
all of this category of knowledge belongs to the model the
driver carries in their head, and the model is platform-
independent.

Repetition is sim training's other asymmetric advantage.
Two hundred laps of one corner in an evening is something
no real-world circuit budget supports, and the kind of
weakness shape that requires repeated isolation to fix is
exactly the kind of thing sim training is unmatched at
delivering. A driver who has run two hundred Spa Eau Rouges
in iRacing this month has a calibrated mental model of that
corner that survives the platform jump.

## What sim training does not transfer

The gap lives in the magnitudes — in the specific values
the driver feels in the seat. Tire feel under real-world
load and surface temperature does not transfer; the rubber
does what the rubber does, and no haptic feedback rig has
yet calibrated to a real-world contact patch. G-force
calibration is the inner-ear signal that tells the driver
how much braking force the car is generating; that signal
does not exist in the sim, and a driver who has never felt
real braking G has only the visual cue of the car's pitch
to tell them where the limit is.

Fear is the third magnitude that doesn't transfer. The cone
of visual perception narrows in the real cockpit because
there is an armco at the end of the runoff, and the
narrowing changes the driver's commitment level on entry to
high-speed corners. The sim has a reset button. A real
circuit has consequences that arrive at the speed the
driver is currently traveling. Mechanical sympathy — the
sense that a missed gear is a real expense and a clipped
kerb is real damage — only develops in the real car.

Weather adaptation in actual rain is the fourth magnitude.
A wet circuit with cold tires in real life produces a
sliding behavior that no sim's tire model has fully
captured. The shape of the line a driver takes around a
wet circuit transfers; the rate at which they trust that
line under the conditions does not.

## The doctrine claim, made concrete

Shapes transfer. Magnitudes do not. The same brake-release
shape that lands cleanly at iRacing's Sebring T1 will land
cleanly at the real Sebring T1, with the same line shape
and the same trail-brake overlap. The pedal pressure
required to produce that release will differ. The G-force
the driver feels under the deceleration will differ. The
fear the driver feels at the entry to the corner will
differ. The shape of the driving is the same; the
magnitudes need recalibration on the day.

This is why I do not claim sim training is a substitute
for real-world seat time, and why I also do not dismiss
sim training as somehow disconnected from real driving.
Both framings are honest about half the picture and wrong
about the other half. The framing that holds up across
data is shapes-transfer-magnitudes-don't.

## The mistake everyone makes about sim time

The common mistake is treating sim hours and real-track
hours as substitutes for each other on the same axis. They
are not. They are complements with asymmetric advantages.
Sim is unmatched at repetition volume, race-craft scenarios
with full thirty-car fields, and rapid setup iteration.
Real track is unmatched at tire-degradation feel, real-
stakes commitment calibration, and weather adaptation under
genuine conditions. Time spent on either is time well
spent if the driver is deliberate about which kind of
learning they are extracting from the session.

What the [development plan
article](/blog/driver-development-plan) calls the framework
runs across both surfaces. The same five verbs — diagnose,
prescribe, execute, measure, adapt — apply to a sim session
and to a track-day session. The weakness shape extracted
from a Tuesday-evening iRacing session and the weakness
shape extracted from a Saturday track-day session can be
the same shape, and the drill that fixes it can be the
same drill, with magnitudes recalibrated on the day.

## What this means for LAP

The cross-platform Driver OS — one driver profile that
travels with the driver across sim and real-world surfaces
— is the [positioning argument](/blog/why-im-building-lap-not-motec-clone)
that distinguishes LAP from the engineering-grade tools
the same data lives in. It is also what makes the shapes-
transfer claim load-bearing in a product rather than only
in a doctrine document. A
weakness shape extracted on iRacing on Tuesday becomes a
prescription that can be drilled on Saturday's track day.
The same trace-reading framework runs on either surface.
The same coaching library, the same prescription format,
the same review cadence.

Without that cross-platform unification, the driver who
runs both surfaces lives in two disconnected data silos
and has to reconstruct the connection in their head every
session. With it, the connection is the product.

## The track day after sim training

The concrete framing I give first-time track-day drivers
who arrive after sim prep is short. Sim work calibrated
the shape of your driving. The track day calibrates the
intensity. The first session is recalibration of intensity,
not a chance to match sim lap times in real life. The
shape will be familiar; the pedal pressures, the G-force
under braking, the cone of visual perception — all of
those need a re-baseline. Treat the first session as a
re-baseline session. By the third session, the magnitudes
have caught up with the shapes the sim already taught,
and the lap times converge.

## Why the honest framing matters

Adjacent products in the cluster overclaim sim-to-real
transfer or dismiss it entirely; both stances are wrong
about the same fact, in opposite directions. The honest
framing — shapes transfer, magnitudes don't — is more
useful in practice and more durable across edge cases. A
driver who internalises the framing trains differently:
sim sessions chase shapes, track sessions chase
magnitudes, and the framework runs across both.

The gap between sim and real is real. Naming it precisely
is what makes the work between them coherent rather than a
guessing game.
