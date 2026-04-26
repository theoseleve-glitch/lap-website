# Tire Management in Endurance: Data Signals

A two-hour endurance race punishes every driver who treats
lap one of a stint and lap forty the same way. The tire
that lays down a personal best on the out-lap is not the
tire that is going to finish the stint with grip in
reserve. The tire that wins endurance races is the one the
driver has been reading the entire time, in the
brake-pressure trace, in the lap-time distribution across
the stint, and in the seat-of-pants signal that arrives
about eight laps after the trace did.

Tire management in endurance racing is the discipline of
adjusting your driving across a stint so the tire crosses
the finish line of that stint at the right point on its
degradation curve — neither so conservative that the stint
left lap time unspent, nor so aggressive that the last
five laps gave back more time than the first thirty saved.
The trace tells you which side of the curve you are on
before the lap-time numbers do. This post is about reading
those signals.

## Why endurance changes the question

Sprint racing has a simple optimisation: drive at the
limit, every lap, until the chequered flag. The strategy
question reduces to "go as fast as you can". Endurance
racing inverts the question. The optimal pace per lap is
not the peak pace; it is the highest pace the tire can
sustain for the length of the stint without entering the
high-degradation phase before the stop. The driver's job
shifts from "drive at the limit" to "drive at the
sustainable limit", and the sustainable limit is a moving
target as the tire ages.

The math behind this is not subtle. A driver who runs the
first ten laps of a forty-lap stint two-tenths under the
absolute best lap they could record will save a measurable
fraction of tire life. Those preserved tires are the ones
that hold pace across laps thirty to forty when the
inconsistent driver is now climbing the lap-time chart at
half a second per lap. Race result depends on the median
lap of the stint, not the single fastest one — the
[consistency post](/blog/driver-development-plan) develops
that argument; endurance amplifies it.

## What "tire degradation" actually shows in the trace

The earliest data signal of tire degradation is brake-
pressure required to hit the same deceleration. As the
front tire's contact patch ages, peak grip falls, and the
driver instinctively adds brake pressure to compensate for
the missing grip. Lap one of the stint shows brake-
pressure peaks at one specific value into Turn 1; lap
fifteen shows the same target deceleration achieved with a
five-percent-higher peak, lap thirty with ten percent
higher. The trace is the leading indicator. Lap times do
not yet reflect the degradation because the driver is
compensating; they will, once the compensation budget is
exhausted.

The second signal is corner-entry speed creeping downward.
The same brake-pressure peak that produced an apex speed
of 132 km/h on lap one produces 130 km/h on lap twenty.
The driver's tire-feel calibration shifts as the contact
patch's grip envelope shrinks; what felt like the limit on
lap one feels like sliding on lap twenty, so the driver
rolls off entry speed by a tenth without consciously
deciding to. The third signal is the temperature trace
itself — modern telemetry tools report tire surface
temperature, and a tire whose temperature has drifted
above the optimal compound window is a tire that is
shedding rubber every corner.

## The physics: rubber, heat, and grip

Tire grip comes from rubber being slightly soft enough to
deform around the surface texture of the asphalt while
being firm enough to spring back rather than tear off.
That balance is set by tire temperature: too cold and the
rubber is glassy, too hot and the rubber smears off in a
visible blue cloud. The optimal window for a racing
compound is narrow — typically a thirty- to forty-degree
range, sometimes tighter on softer compounds. Tire
management is, in physical terms, the discipline of
keeping each tire inside that window for as long as
possible.

Tire wear is the cumulative loss of rubber from the
contact patch surface. A tire driven repeatedly above its
optimal temperature window enters the high-wear phase
faster; a tire driven below the window does not generate
enough heat to reach the optimal grip and is, in a
different way, also being managed badly because the stint
is being run sub-optimally cold. The visible degradation
shows up as the contact patch becomes glazed, the tread
shoulders round off, and grip falls off the cliff that
separates the optimal window from terminal wear.

## Reading the data: three patterns of tire wear

Endurance stint data shows three distinct tire-management
failure modes, each with its own driving response.

Linear drift is the normal degradation pattern: lap times
get progressively slower across the stint at a roughly
constant rate, brake-pressure peaks climb steadily, and
the temperature trace stays inside the window but creeps
upward. Linear drift is what every tire does eventually;
the management question is how long until the drift slope
steepens. The fix is patience: hold the conservative
target lap time, let the tire age across the stint, and
keep the trail-braking shape that [the trail-braking
explainer](/blog/what-is-trail-braking) names so the
front tire takes load smoothly rather than sharply.

The cliff pattern is more dangerous. Lap times stay flat
for twenty laps and then drop two seconds in a single
lap, with brake-pressure peaks spiking and the temperature
trace overshooting the optimal window. The cliff is a
tire that has crossed a thermal or wear threshold and given
up on grip in a single corner. The driving response is
immediate: drop the target pace by half a second, lift
braking peak pressures by ten percent, and bring the
temperature back down by being patient with the rear
through long sweepers.

The uneven-wear pattern shows one axle's signal degrading
faster than the other's. Front-axle wear shows up as
under-steer at corner-entry getting worse across the stint;
rear-axle wear shows up as throttle-induced oversteer
arriving earlier each lap. The fix is asymmetric: an under-
steering front needs less aggressive brake-release into the
corner; an oversteering rear needs longer throttle-pickup
ramps so the rear contact patch has more time to recover.
The corner-phase weakness shapes apply at the stint-
management level too.

## The drill: managing the tire deliberately

The framework verbs from [the driver-development-plan
article](/blog/driver-development-plan) extend cleanly to
tire management.

Diagnose: pull the brake-pressure peaks, the corner-entry
speeds, and the lap-time distribution across one full
endurance stint. Identify which of the three failure modes
is most prominent. Write the diagnosis down: "my forty-
lap stint at Spa shows linear drift in lap times plus a
cliff event at lap thirty-three; the brake-pressure trace
climbs steadily from lap one and spikes at lap thirty-
three." Specificity is the test of whether the diagnose
step is finished.

Prescribe: pick one corrective drill. For linear drift,
target a half-second-slower lap on the first ten laps with
the success criterion that lap thirty's pace stays within
0.4 seconds of lap five's. For cliff patterns, target a
temperature-trace ceiling — maximum brake-pressure peak
held to the lap-one value across the entire stint. For
uneven wear, target the appropriate axle-specific drill.

Execute: run a full-stint session with the prescription as
the focus. Lap-time peak does not matter inside this drill;
stint-aggregate result does.

Measure: did the criterion land? The lap-time distribution
across the stint is observable and quantifiable. Three
consecutive stints landing the criterion is the measure of
whether the prescription has stuck.

Adapt: if it landed, advance to the next tire-management
problem in the backlog. If it landed only partially, refine
the technique. If it missed, the diagnosis was probably
wrong — re-read the stint data and confirm which failure
mode was actually loudest.

## Cross-platform: tire models in sim and on track

iRacing, ACC, and AMS2 model tire degradation reasonably
well — well enough that the trace shapes described in this
post all show up in sim endurance stints. The compounds
differ from real-world rubber, the temperature ranges are
calibrated per platform, and the rate of degradation is
sometimes more linear in sim than real-world data shows.
The discipline transfers: a driver who has run twenty
endurance stints in iRacing's six-hour series with
deliberate tire-management drills arrives at a real-world
six-hour event with the trace-reading discipline already
calibrated. The absolute numbers shift; the management
mindset travels. [The sim-to-real transfer
article](/blog/sim-to-real-transfer) develops the
cross-platform argument that this post depends on.

## What this post is, and what comes next

Tire management in endurance is the discipline of reading
the trace, the lap-time distribution, and the temperature
window across a stint and adjusting the driving to keep
the tire on the right side of its degradation curve. The
framework runs on tire-management weakness shapes the same
way it runs on corner-phase shapes — diagnose the data,
prescribe one drill, execute on one stint, measure the
criterion, adapt the next prescription.

Pull your last endurance stint's brake-pressure trace and
lap-time distribution before the next race. Identify which
of the three failure modes is loudest. Write the diagnosis
down in one sentence. The diagnose step is done when the
sentence exists; the rest of the loop runs from there.
