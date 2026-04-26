# Apex Speed: The Real Measure of Corner Commitment

Lap times are a lagging indicator. They tell you the
combined consequence of every input across thirty corners,
two straights, and a pit-out lap that you forgot was still
on cold tires. By the time the lap timer flashes, the
information has already been mixed with everything else
that happened in the previous minute and a half. Sector
deltas are better — they isolate a stretch of track — but
they still merge braking, mid-corner balance, and exit
phase into one number.

Apex speed is the cleanest single-signal data anchor in the
trace. It isolates one phase of one corner: the rotation
phase, where the car has finished decelerating and is
turning at maximum lateral load. The minimum speed at the
apex is the trace's record of how close the driver
got to the lateral-grip limit through that rotation. Chase
it deliberately, measure it against a reference, and the
lap time follows. That is the post's distinguishing claim,
and the rest of this piece unpacks it.

## Why apex speed is a leading indicator and lap times are lagging

The same one-second-faster lap can come from twenty
different combinations of inputs. Two drivers running
identical times into Spa's Eau Rouge can be one driver
who carried five extra kilometres an hour through Eau Rouge
and lost it on the run up Kemmel, and another who scrubbed
five kilometres an hour at Eau Rouge but exited so cleanly
that the run up Kemmel paid the deficit back. Lap time says
the two drivers are equal. Apex speed says they are not.

A leading indicator behaves differently from a lagging one.
Lagging indicators record the result; leading indicators
predict it. Apex speed predicts a clean exit because exit
speed is downstream of how much speed the driver carried
through the apex. A driver who chases apex speed
deliberately is chasing the input that the rest of the
corner depends on. A driver who chases lap time is chasing
a number that summarises a hundred decisions, of which
apex speed was the most consequential single one. Read
your minimum speed at every corner before you read
your lap time, and the diagnostic process flips from
"why was the lap slow" to "which corner gave away
commitment".

## What apex speed actually shows in the trace

On the speed trace, apex speed is the trough — the
specific timestamp where the speed reading is at its
local minimum, between the brake release and the throttle
pickup. Telemetry tools usually report it as MIN_SPEED per
corner. Coupled with the steering angle trace, apex speed
arrives at the moment of maximum steering angle: the car
has finished turning in, has not yet started turning out,
and is committed to the corner radius the driver chose at
turn-in.

The shape that matters is not just the minimum value but
the shape around the minimum. A reference lap shows a
narrow trough — the car spends a brief instant at the
limit and then accelerates. A non-reference lap shows a
wide trough or a flat shelf at a lower speed: the driver
held the car below the limit for an extended portion of the
mid-corner, either because they entered too slowly to begin
with or because they got nervous mid-corner and lifted off
the throttle reapply. The trace shape distinguishes "I am
at the limit briefly" from "I gave up on the limit
entirely".

## The physics: lateral grip and the limit of adhesion

Tires generate maximum lateral force at a specific slip
angle — for most racing tires, somewhere between four and
seven degrees, depending on construction and temperature.
Below that slip angle, the tire is producing less grip
than it could; above it, the tire begins to slide and grip
falls off. The apex of the corner is the geometric point
where the tire is being asked for the most lateral force,
because the corner radius is at its tightest and the speed
is at its highest given that radius.

Apex speed records, indirectly, how close the driver got
to that optimal slip angle through the rotation phase. A
driver who feels the front tire scrubbing wide will roll
off the throttle or add steering — both of which lower
apex speed. A driver who feels the rear stepping out will
unload the steering or lift earlier — also lowering apex
speed. A driver who is calibrated to the lateral-grip
limit holds steering and throttle steady through the
apex, the slip angle settles at the optimum, and apex
speed lands at or near the reference. The number on the
telemetry screen is a proxy for how cleanly the driver
read the tire.

## Reading the trace: under-commitment vs over-commitment

Two drivers can lose the same half-second through the
same corner with apex-speed numbers that look identical
on a quick glance, and the fixes for the two are
opposites.

The under-committer shows MIN_SPEED below reference and
brake pressure released early — the trace shows the
driver bailed out of the brake before they trusted the
tires to take the rotation. They arrive at the apex
slower than they could have, and the lower apex speed
becomes a structural lid on the rest of the corner. The
fix is on the entry side: trail-brake further in, hold the
release shape that [the trail-braking
explainer](/blog/what-is-trail-braking) names, and let the
front load carry into rotation rather than cutting it
short. [The late-braking-at-T1
deep-dive](/blog/late-braking-at-t1) walks through the
entry-side trace shapes end to end.

The over-committer shows MIN_SPEED at or above reference
but exit speed below reference and a noticeable rear-yaw
event in the steering trace at the apex. They asked for
more lateral grip than the tire could produce, the tire
slid, and the lap-time deficit lands on exit because the
slide cost rotation efficiency. The fix is on the
mid-corner side: same approach speed, but soften the
steering input through the apex by a few degrees so the
tire stays just inside the limit. Both look like "slow
through the corner" on the lap timer; the trace tells you
which one is happening.

## The drill: chasing apex speed deliberately

The framework verbs from [the driver-development-plan
article](/blog/driver-development-plan) work on apex-speed
weakness shapes the same way they work on entry-phase and
exit-phase shapes.

Diagnose: pick one corner where apex speed feels low.
Capture five laps. Pull MIN_SPEED for that corner across
the five laps and against your reference. Look at the
brake-pressure trace and the steering-angle trace at the
apex moment. Write down which side of the trade-off you
are on: under-committer (MIN_SPEED below reference, brake
released early) or over-committer (MIN_SPEED at reference,
exit speed below reference, rear-yaw signature).

Prescribe: pick one corrective drill matched to the
diagnosis. For the under-committer, the prescription is to
hold trail-brake pressure two-tenths of a second longer
into the apex and target a MIN_SPEED reading within two
kilometres an hour of reference on three of five attempts.
For the over-committer, the prescription is to reduce
steering angle at the apex by five degrees while holding
the same approach speed, with the success criterion that
exit speed at the next sector beacon is within two
kilometres an hour of reference on three of five attempts.

Execute: five laps, one corner, one focus.

Measure: did three of the five attempts land the criterion?
The MIN_SPEED reading is in the telemetry; the exit-speed
reading is in the telemetry; both are observable and
quantifiable. There is no room for "felt better".

Adapt: if the drill landed, advance to the next corner in
the weakness backlog. If it landed only partially, repeat
with a refinement. If it missed, the diagnosis was probably
wrong — go back to the trace and ask whether the corner
is asking for the under-commit fix or the over-commit fix
before re-prescribing.

## Cross-platform: apex speed in sim and on track

The MIN_SPEED reading at the apex of a given corner
calibrates well between platforms. iRacing, ACC, and AMS2
report the value in the same units; the corner radius and
the tire model differ slightly across platforms, but the
relative gap to your reference is consistent. A driver
chasing the under-commit fix on iRacing's Watkins Glen
will see the same gap to reference at the same corner on a
real-world track day, with the absolute MIN_SPEED numbers
shifted only slightly because of tire and surface
differences. The drill above runs on either surface; [the
sim-to-real transfer
article](/blog/sim-to-real-transfer) is the cluster's
explainer for why mid-corner trace shapes ride out the
sim-to-real boundary unchanged.

## What this post is, and what comes next

Apex speed is the cleanest single-signal anchor in the
mid-corner data. Lap times mix too many phases; sector
deltas isolate a stretch but still combine inputs;
MIN_SPEED at the apex isolates one phase of one corner
and reports how close the driver got to the lateral-grip
limit through the rotation. The framework runs on apex-
speed weakness shapes the same way it runs on entry-phase
and exit-phase shapes — diagnose the trace, prescribe one
drill, execute on one corner, measure the criterion, adapt
the next prescription.

Read your MIN_SPEED before your next session. Pick one
corner where the gap to reference is largest. Look at the
brake trace and the steering trace at the apex. Write the
weakness down in one sentence — under-commit or over-
commit. The diagnose step is done when the sentence
exists; the rest of the loop runs from there.
