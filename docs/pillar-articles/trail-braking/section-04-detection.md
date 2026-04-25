## How LAP detects it

The detector that flags trail-braking mistakes in your data is a
rule-based pipeline, not a language model and not a neural net.
Every mistake the previous section named maps onto a written
rule in [the coaching library](/product/coaching) — one rule
per mistake-shape, hand-curated, version-controlled, and
testable against captured sessions. ADR-004 of our 6-month plan
makes this commitment explicit: hand-written rules in the
coaching surface, not generative output.

Three signal streams feed each rule:

- The **brake-trace gradient** — the rate at which brake
  pressure decays through the corner-entry phase. The gradient
  is what distinguishes a smooth taper from a stab pattern, and
  what tells the detector whether the release was completed
  too early or too late relative to the apex.
- The **steering-input correlation** — when does steering peak
  versus when does brake pressure hit zero? The temporal offset
  between the two peaks is the friction-circle violation
  signal: simultaneous peaks mean the tire was asked for both
  forces at once.
- The **apex-speed deficit** — measured against the driver's own
  reference lap on the same corner and the same platform. This
  is the magnitude floor that keeps the detector from
  false-positiving on hesitations smaller than the noise floor.

Each rule combines these three signals with explicit
thresholds — a brake-trace pattern, a correlation criterion, a
magnitude floor — and emits a named subcategory when matched.
The names are exactly the six trail braking mistakes from the
previous section: a trail-brake-released-too-early in your
session reads as the same diagnosis whether the lap is from
iRacing on a Tuesday evening or from a real Spa track day.

Cross-platform consistency is the whole point of
[the bridge](/product/bridge): the rule matches *shape*, not
absolute pressure values. The same rule runs against sim
telemetry from iRacing, ACC, and AMS2 desktop captures, and
against real-world telemetry from a RaceBox plus iPhone setup.
Same rule, same diagnosis, same prescription pattern — what
differs is which session you ran it on.

The library is hand-curated. Not every trail braking failure
shape is detected today; new patterns get codified as we
encounter them in real captured sessions. That is a deliberate
scope choice — language-model output would scale faster but
cannot be audited or trusted the same way a written rule can.
The honesty of the framing is part of the product surface, not
a workaround.
