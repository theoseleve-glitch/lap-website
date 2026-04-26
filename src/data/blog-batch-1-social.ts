// T180 — Batch 1 social-media kit. 5 tweets per published
// post × 5 posts = 25 total. Single canonical source for the
// social drip surface; future drip tooling (T096, currently
// BLOCKED on infrastructure) will consume this module
// programmatically rather than reading a markdown file.
//
// Per-post diversity (informal, not enforced beyond count):
// each post's 5 tweets cover roughly five distinct angles —
// the hook (opening framing), the data signal (what the
// trace shows), the physics (the underlying why), the drill
// (the framework verb in 280 characters), and the takeaway
// (the doctrine claim in compressed form). The drip cron
// can sequence them across a week per post or shuffle freely.
//
// Editorial discipline mirrors the body posts and FAQ:
//   * ≤280 chars per body (Twitter hard limit; t.co URL
//     append at publish time fits within margin)
//   * ≥40 chars per body (substance floor)
//   * No verbatim duplicates across the 25
//   * Forbidden vocab carry-over (ADR-004 + Pillar 2/3/4 +
//     blog-post-layer technique-overclaim)
//   * ≤1 hashtag per tweet (anti-tag-spam; 0 is preferred)

import type { BatchPostSlug } from './blog-batch-1-faq';

export interface Tweet {
  /** Body text — what publishes to Twitter/X. ≤280 chars. */
  readonly body: string;
  /** Slug of the Batch 1 post this tweet links to. */
  readonly post: BatchPostSlug;
}

export const BATCH_1_TWEETS: ReadonlyArray<Tweet> = [
  // ─── Late braking at T1 ──────────────────────────────────
  {
    body: "Every track has a Turn 1 problem. The coach answer most drivers grow up hearing is 'brake later'. The trace says something more specific.",
    post: 'late-braking-at-t1',
  },
  {
    body: 'Three signatures of late braking in the brake-pressure trace: peak pressure timing, release shape, and overlap with steering input. The combination tells you whether you are late and rotating cleanly, or late and breaking the corner.',
    post: 'late-braking-at-t1',
  },
  {
    body: 'Late braking compresses the front-axle weight transfer into a smaller window. The contact patch is still growing when steering input begins, and the front tires refuse to bite. That refusal is what understeer at turn-in feels like.',
    post: 'late-braking-at-t1',
  },
  {
    body: 'Pick one corner you brake late at. Capture five laps. Look at the brake-pressure trace. Write the weakness down in one sentence. The diagnose step is done when the sentence exists; the rest of the loop runs from there.',
    post: 'late-braking-at-t1',
  },
  {
    body: "'Brake later' only works when the release shape is correct. If your release shape is the problem, braking later just moves the failure mode an extra ten metres down the road.",
    post: 'late-braking-at-t1',
  },

  // ─── Throttle pickup smooth vs aggressive ────────────────
  {
    body: 'Smooth vs aggressive throttle pickup is not a moral question. Both can be the right answer at the right corner. The corner radius decides which shape the trace should show.',
    post: 'throttle-pickup-smooth-vs-aggressive',
  },
  {
    body: 'Smooth pickup: continuous ramp from zero to full across the exit phase. Aggressive pickup: stab-and-plateau in one beat. Different trace shapes for different corner geometries.',
    post: 'throttle-pickup-smooth-vs-aggressive',
  },
  {
    body: "Throttle-induced oversteer at the apex is what 'no' looks like from the traction circle: rear contact patch can't carry both lateral and longitudinal grip past its budget.",
    post: 'throttle-pickup-smooth-vs-aggressive',
  },
  {
    body: "Compare your throttle trace to a reference. If you stab-and-plateau on a long sweeper, you're over-committing. If you smooth-ramp on a hairpin, you're leaving exit time on the table.",
    post: 'throttle-pickup-smooth-vs-aggressive',
  },
  {
    body: 'The same aggressive shape that wins Sebring T17 will spin the car at Spa Pouhon. Neither shape is wrong as a technique; both are wrong as a corner-context choice.',
    post: 'throttle-pickup-smooth-vs-aggressive',
  },

  // ─── Apex speed corner commitment ────────────────────────
  {
    body: 'Lap times are a lagging indicator. They mix every input across thirty corners. Apex speed isolates one phase of one corner — the rotation phase, where the car is at maximum lateral load.',
    post: 'apex-speed-corner-commitment',
  },
  {
    body: "MIN_SPEED at the apex is the trace's record of how close you got to the lateral-grip limit through the rotation phase. The shape around the minimum matters as much as the value itself.",
    post: 'apex-speed-corner-commitment',
  },
  {
    body: 'Tires generate maximum lateral force at a specific slip angle, between four and seven degrees. Apex speed records, indirectly, how cleanly the driver read the tire through rotation.',
    post: 'apex-speed-corner-commitment',
  },
  {
    body: 'Two drivers can lose the same half-second through one corner with opposite fixes. Under-committers need entry-side work. Over-committers need mid-corner work. The trace tells you which.',
    post: 'apex-speed-corner-commitment',
  },
  {
    body: 'Chase the leading indicator (apex speed) and the lap time follows. Chase the lap time and you are guessing which of a hundred decisions to fix first.',
    post: 'apex-speed-corner-commitment',
  },

  // ─── Consistency over raw pace ───────────────────────────
  {
    body: 'Most drivers train for the fastest single lap. Races and championships reward the median lap. The gap between the two is the consistency tax — and most drivers undercount it.',
    post: 'consistency-over-raw-pace',
  },
  {
    body: 'Driver A: 1:32.0 best, 0.5s standard deviation. Driver B: 1:31.9 best, 0.9s. Over thirty laps, B finishes eighteen seconds behind A despite owning the faster qualifying lap. Race day rewards consistency.',
    post: 'consistency-over-raw-pace',
  },
  {
    body: 'A wide lap-time distribution is one symptom of three different problems: random scatter, systematic drift, or spike pattern. Each one has a different fix.',
    post: 'consistency-over-raw-pace',
  },
  {
    body: 'Pull lap times across your last three sessions. Compute the median, the fastest, and the standard deviation. The gap between median and fastest is your consistency tax — measurable, in seconds.',
    post: 'consistency-over-raw-pace',
  },
  {
    body: "Peak pace shows on qualifying day. Consistency shows on race day. iRacing's iRating system rewards consistent finishes; real-world race series are no different.",
    post: 'consistency-over-raw-pace',
  },

  // ─── Tire management in endurance ────────────────────────
  {
    body: 'A two-hour endurance race punishes drivers who treat lap one of a stint and lap forty the same way. The trace tells you when the tire is starting to give up before the lap times do.',
    post: 'tire-management-endurance',
  },
  {
    body: 'Earliest sign of tire degradation: brake pressure required to hit the same deceleration climbs across laps. The trace is the leading indicator; lap times follow once the compensation budget is exhausted.',
    post: 'tire-management-endurance',
  },
  {
    body: 'Racing tires are optimised for a thirty- to forty-degree temperature window. Below it the rubber is glassy. Above it the rubber smears off the contact patch and sheds faster than the tire can carry.',
    post: 'tire-management-endurance',
  },
  {
    body: 'Three tire-wear patterns: linear drift (normal degradation), cliff (thermal threshold crossed), uneven wear (one axle giving up first). Each one points at a different driving response.',
    post: 'tire-management-endurance',
  },
  {
    body: 'Sprint racing optimises for the fastest possible lap. Endurance optimises for the highest pace the tire can sustain across the entire stint. Different question, different optimal pace.',
    post: 'tire-management-endurance',
  },
];
