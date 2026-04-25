## What goes wrong, and what it looks like in the data

Six failure shapes account for almost everything that goes wrong
with trail braking. Each one leaves a recognisable signature on
the brake trace and the steering trace, so once you know what
to look for you can diagnose your own laps without a coach over
your shoulder. The list below names each pattern, describes the
behavioural shape, and calls out the telemetry signature that
gives it away.

**Released too early.** The canonical trail braking mistake — the
brake pressure hits zero before turn-in is complete. The car
under-rotates because the front tires gave back their extra
contact patch a beat too soon, the apex line opens up, and the
throttle reapplies late because the chassis is still sorting
itself out. Signature: brake pressure trace drops to zero more
than half a second before the apex; the throttle trace shows a
quiet "dwell" between brake-off and throttle-on; apex speed
runs three to eight percent under the driver's own reference
lap on the same corner.

**Held too late.** The opposite mistake. The driver carries
trail-brake pressure too far past the apex; the car understeers
exactly where it should be biting. Signature: brake pressure
trace still reads five to fifteen percent past the apex point;
throttle reapplies after the apex with steering still at maximum
angle. The session-to-session pattern is consistent — drivers
who hold late tend to do it across the whole lap, not on one
corner.

**Inconsistent pressure decay.** The release is not smooth. The
driver eases off, then catches it, then eases again — a stab
pattern instead of a single taper. The car loads and unloads
through the entry phase; the front tires never settle.
Signature: the brake trace shows two or more inflection points
in the release phase, and lap-to-lap variance is much higher
than for the other five mistakes. Spa La Source on a fresh set
of tires is a favourite for this one.

**Too gentle to begin with.** Peak brake pressure is too low for
real weight transfer to happen. The trail braking intent is right
but the predicate fails — there is not enough load on the front
tires for any rotation benefit to land. Signature: peak brake
pressure under sixty percent of available; entry speed too high
for the rotation achieved; understeer through the mid-corner
phase rather than at the apex point.

**Too aggressive at start.** Peak brake pressure spikes near
maximum, the front tires lock, and the rotation that does come
is from grip overload rather than weight transfer. The car
turns, but it turns the wrong way and kills the exit.
Signature: peak brake pressure above ninety-five percent; a
characteristic lockup signature on tire-load data; the
ABS-active flag set in the series and platforms that record it.

**Lateral and longitudinal at the same time.** The driver asks
the tire for maximum braking and maximum cornering at once. The
friction circle from the previous section says no — the tire
gives back both. Signature: the brake-pressure peak coincides
with the steering-input peak, both within a tenth of a second
of each other.

Each shape lives in [the coaching library](/product/coaching)
as a named rule, with the same name the detector emits when it
fires. The pattern across all six is the same: each trail
braking mistake is a *shape* in the data, and the shape carries
cleanly between iRacing, ACC, AMS2, and a real-world RaceBox
capture. The
intensity — how much time each costs — is platform-specific, but
the diagnosis itself is not. That is the
[shape-vs-intensity framework](/blog/sim-to-real-transfer)
applied to one technique: same shape, different magnitude,
predictable transfer.
