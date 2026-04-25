## How LAP automates this

The framework is the same whether the driver runs a paid
subscription or a paper journal. What LAP automates is the
mechanical work at each verb — the shape recognition, the
rule lookup, the metric tracking, the next-session plan —
so the driver's attention stays on what the data means
rather than on the bookkeeping.

**Diagnose.** Each finalized session generates a
WeaknessEpisode on the backend. The desktop client extracts
shape patterns from the trace; the rule library matches them
against named weakness shapes; an episode lands in the
driver's inbox with observation, evidence, and likely cause
already filled in. The driver opens the app and sees what to
look at first — the diagnose step that would take an hour
of trace-reading happens in the time it takes the page to
load.

**Prescribe.** Each WeaknessEpisode that has a matching
rule receives an ActionPrescription: drill name, success
criterion, target session count. The prescription draws from
[our coaching library](/product/coaching). Every prescription
traces to a written rule that a human author edited and
evidence-backed by hand — never to a language-model output.
The deliberate scope choice is durability over surface area:
shapes the library does not yet name receive no prescription
rather than a fabricated one.

**Execute.** Live coaching prompts surface inside the
session itself. On the desktop the prompt overlays the
driver's view when the rule library detects a weakness
shape recurring in real-time; the mobile capture stack
emits the same prompt on real-world sessions. The driver
corrects on the next lap rather than waiting for the
post-session debrief, and the gap between diagnose and
execute shrinks toward zero on the most repetitive shapes.

**Measure.** Each drill execution writes an ActionOutcome
record — whether the success criterion landed, how many
attempts, under what conditions. The DriverProgressSnapshot
aggregates across sessions and across surfaces (sim and
real-world together) so the metric appears on a single
[progression view](/product/driver-profile). The driver does
not have to spreadsheet anything to know whether a
prescription is working.

**Adapt.** The backend reads recent ActionOutcomes and emits
the next ActionPrescription. The loop closes automatically:
the adapt step's three branches (advance, repeat, re-
diagnose) become a queued next-session plan rather than a
weekly meeting with yourself. Manual override is always
available; if the driver disagrees with the prescribed next
step, they can pick the next focus by hand.

The [LAP product surface](/product) ships these capabilities
as a single subscription — see [our pricing](/pricing) for
what is included. The point of the automation is that the
framework runs without the bookkeeping; the driver still has
to execute, and the rule library still has gaps that §6
addresses with the DIY template approach.
