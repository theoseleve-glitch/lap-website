## Three examples from real telemetry

The trail braking framework gets concrete when you walk it
through actual captured laps. Three corners, three drivers,
three different trail braking mistakes from the previous list —
each example shows the diagnosis the detector emits and the
prescription that follows.
Numbers below are illustrative of patterns we see in real
captures; the shapes are what matters, not the exact magnitudes.

**Spa La Source — release-too-early (sim).** A driver in their
second season of iRacing GT3 racing. Their reference lap on La
Source releases the brake 0.2 seconds before the apex point.
The attempt under review releases at 0.7 seconds before apex —
half a second early. The throttle trace shows the canonical
"dwell" between brake-off and throttle-on; apex speed reads 5
km/h under reference. Diagnosis: trail-brake-released-too-early,
the canonical mistake from the earlier list. Prescription: the
beginner drill from the previous section, with La Source as the
target corner.

**Suzuka Hairpin — too-gentle (sim).** A driver new to the
circuit, on AMS2 in a GT3 car. Peak brake pressure on the
hairpin entry reads 52% of available — the predicate for any
trail braking benefit was missing before the release shape even
became relevant. The car understeers through the mid-corner
phase; trail-brake intent is right but there is not enough load
on the front axle for any rotation benefit to land. Diagnosis:
brake-too-gentle. Prescription: increase peak pressure first,
work on release shape only after the magnitude is set —
sequencing matters in coaching, and the framework names the
sequence.

**Brands Hatch Druids — held-too-late (real).** A track-day
driver in a 911 GT3 RS, third event of the season, RaceBox
plus iPhone capture. The brake pressure trace still reads 11%
at the apex point of Druids; throttle reapplies after the apex
with steering still near maximum angle. The car understeers
right where it should be biting. Diagnosis: trail-brake-held-
too-late. Prescription: the intermediate drill from the previous
section.

The pattern across all three: the *shape* of each mistake is
platform-agnostic. The diagnosis on the iRacing La Source
attempt would land identically on a real-track La Source
capture; the same is true for the AMS2 Suzuka example and the
real-track Druids example. What is platform-specific is the
*intensity* — the 5 km/h apex deficit on iRacing and a 5 km/h
deficit at real Spa are different numbers in absolute terms,
even when they read as the same shape. That is the
[shape-vs-intensity framework](/blog/sim-to-real-transfer)
applied corner-by-corner: same diagnosis across surfaces, same
drill prescription, same loop closing as the WeaknessEpisode
flips from open to improving in
[your driver profile](/product/driver-profile) over the course
of a quarter.
