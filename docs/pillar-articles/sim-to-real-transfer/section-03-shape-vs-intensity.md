## Shape vs intensity

Every weakness in your driving has two dimensions. There is the
*shape* of the mistake — the kind of thing it is, described in
plain language. And there is the *intensity* — how big a time
loss it produces on a particular car, in a particular setup, on
a particular track surface, in a particular session.

The framework that decides which parts of your sim work transfer
to the real circuit is the one that takes those two dimensions
seriously and treats them differently.

**Shape is platform-agnostic.** "Late on the brakes into Spa La
Source" is a legible diagnosis whether you logged the lap on
iRacing on a Tuesday evening or in a real GT3 at the actual
circuit. The pattern of the mistake — the trail-brake released
too early, the apex line opening up, the throttle reapplied a
beat late to compensate — looks the same in both data sets. A
coach reviewing either would say the same words about it.

**Intensity is platform-specific.** "Turn 1 costs you 0.4 seconds
versus your reference" on iRacing is unrelated to the same
diagnosis at the real Spa. Different reference lap, different
setup, different tire compound, different physics fidelity in the
sim's tire model. Within iRacing, "0.4 seconds" is a number you
can compare to your own previous laps. Across platforms, it isn't
a number you can compare to anything.

A concrete example. You drive Spa on iRacing for three weeks of
evenings, in a Mercedes-AMG GT3. The detector flags
trail-brake-released-too-early at La Source as your top
weakness — apex speed running about 5 km/h under your reference
on three laps in this session, twice more in the previous two
weeks. You attack the prescription drill: carry brake pressure
past turn-in, ease off as you pick up throttle. Two months
later you are at the actual Spa for a track day in a different
GT3. Same shape of weakness shows up: trail-brake release too
abrupt at La Source. The intensity is different — apex speed
deficit reads about 3 km/h instead of 5 — but the shape, the
prescription, and the drill are the same.

That is what makes the carry-over predictable. The technical
artefact that makes this comparison automatic is
[the bridge](/product/bridge) — it normalises sim and real
sessions into the same canonical shape, runs the weakness
detector on the canonical version, and surfaces matched pairs as
one progression. The framework is the principle; the bridge is
how we operationalise it. Every claim in the rest of this
article rests on this distinction holding up.
