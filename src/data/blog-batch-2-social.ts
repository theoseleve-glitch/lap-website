// T190 — Batch 2 social-media kit. 5 tweets per published
// post × 5 posts = 25 total. Single canonical source for
// the social drip surface; future drip tooling (T096,
// currently BLOCKED on infrastructure) will consume this
// module programmatically rather than reading a markdown
// file.
//
// Per-post diversity (informal, not enforced beyond count):
// each post's 5 tweets cover roughly five distinct angles —
// the hook, the doctrine claim, the supporting evidence or
// example, the anti-claim or counter-framing, and the
// takeaway. The drip cron can sequence them across a week
// per post or shuffle freely.
//
// Editorial discipline mirrors the body posts and FAQ:
//   * ≤280 chars per body (Twitter hard limit; t.co URL
//     append at publish time fits within margin)
//   * ≥40 chars per body (substance floor)
//   * No verbatim duplicates across the 25
//   * ADR-004 ASYMMETRIC (T181/T185 negation pattern):
//     spelled-out "language-model" REQUIRED in corpus to
//     back the positioning argument; bare "llm" / "ai
//     coach" / "generative" / "neural" still banned
//   * Pillar 2/3/4 forbidden vocab carry-over
//   * Anti-overclaim guardrail (no "guaranteed faster",
//     "what pros do", etc.)
//   * ≤1 hashtag per tweet (anti-tag-spam; 0 preferred)

import type { Batch2PostSlug } from './blog-batch-2-faq';

export interface Batch2Tweet {
  /** Body text — what publishes to Twitter/X. ≤280 chars. */
  readonly body: string;
  /** Slug of the Batch 2 post this tweet links to. */
  readonly post: Batch2PostSlug;
}

export const BATCH_2_TWEETS: ReadonlyArray<Batch2Tweet> = [
  // ─── T181 — Why I am building LAP (not a MoTeC clone) ───
  {
    body: "MoTeC i2 is a tool for the engineer reading the trace. LAP is a tool for the driver alone with the data. Different question, different surface, different persona. Not a competitor — an honest neighbour in the same data.",
    post: 'why-im-building-lap-not-motec-clone',
  },
  {
    body: "The driver alone with the data, no engineer attached, between sessions at home — that is the persona LAP was built for. Sim racers chasing licence-class progression. Track-day drivers compressing weekend learning into the next event.",
    post: 'why-im-building-lap-not-motec-clone',
  },
  {
    body: "I am not building a MoTeC clone. The engineering surface MoTeC has spent twenty years polishing is not the surface a driver alone with the data needs. Two products, adjacent categories, same telemetry data underneath.",
    post: 'why-im-building-lap-not-motec-clone',
  },
  {
    body: "MoTeC ships math channels, hardware-logger integration, channel-by-channel customisation. LAP ships weakness shape, drill name, success criterion, review cadence. Both rely on telemetry. They answer different questions.",
    post: 'why-im-building-lap-not-motec-clone',
  },
  {
    body: "If your workflow involves an engineer reading the trace for you or hardware-logger integration with a real car, MoTeC is the right tool — and we say so on the comparison page rather than pretending the gap is not real.",
    post: 'why-im-building-lap-not-motec-clone',
  },

  // ─── T182 — The sim-to-real gap: an honest look ─────────
  {
    body: "Shapes transfer between sim and real. Magnitudes do not. The doctrine claim, in one sentence. The gap between sim and real lives in a specific place, and naming where it lives is what makes the work between them coherent.",
    post: 'sim-to-real-gap-honest-look',
  },
  {
    body: "What transfers between sim and real: brake-zone ordering, line shape, trail-brake patterns, race-craft instincts in traffic. All of these belong to the driver's mental model of the track and the car, and the mental model is platform-independent.",
    post: 'sim-to-real-gap-honest-look',
  },
  {
    body: "What does not transfer: tire feel under real load. G-force calibration in the inner ear. Fear at the entry to a high-speed corner with armco at the runoff. Weather adaptation in actual rain. The seat-of-pants signal does not exist in the sim.",
    post: 'sim-to-real-gap-honest-look',
  },
  {
    body: "Adjacent products either overclaim sim-to-real transfer or dismiss it entirely. Both stances are wrong about the same fact, in opposite directions. The honest framing — shapes transfer, magnitudes do not — holds up across edge cases.",
    post: 'sim-to-real-gap-honest-look',
  },
  {
    body: "Sim-prepped first track session is recalibration of intensity, not lap-time matching. The shape will be familiar; pedal pressures, G-force under braking, the cone of visual perception need a re-baseline. By the third session, magnitudes catch up.",
    post: 'sim-to-real-gap-honest-look',
  },

  // ─── T183 — Designing coaching drivers actually follow ──
  {
    body: "'Be smoother on entry' is observation-shaped, not prescription-shaped. It names what the lap time would benefit from but no procedure for producing it. The driver nods, attempts to be smoother, and defaults to driving the corner the same way.",
    post: 'designing-coaching-drivers-follow',
  },
  {
    body: "A followable prescription has anatomy. Weakness shape (the trace pattern). Drill name (the explicit action). Success criterion (the measurable signal). Review cadence (when to check back). Strip any one and the prescription collapses to observation.",
    post: 'designing-coaching-drivers-follow',
  },
  {
    body: "Diagnose, prescribe, execute, measure, adapt. Five framework verbs, in order, run as a loop. Coaching that emits one prescription and walks away produces good intentions. Coaching that runs the loop produces follow-through.",
    post: 'designing-coaching-drivers-follow',
  },
  {
    body: "Every coaching prescription LAP ships traces to a hand-curated rule library. Each rule names the weakness it diagnoses, the drill that fixes it, the success criterion, the cadence. Followability is reliable when the source is structured for it.",
    post: 'designing-coaching-drivers-follow',
  },
  {
    body: "Coaching that is accurate but not followable produces no progression. Coaching that is followable but inaccurate produces drills that fix nothing. The design target is both — accurate diagnosis matched to a followable prescription, every time.",
    post: 'designing-coaching-drivers-follow',
  },

  // ─── T184 — The pre-launch month in numbers ─────────────
  {
    body: "First monthly build-in-public update for LAP. The numbers attached, including the unflattering ones. The cadence is the commitment; any single month's numbers are a snapshot. Skipping unflattering months is what builds distrust later.",
    post: 'pre-launch-month-in-numbers',
  },
  {
    body: "Month 1 in numbers: 198-question doctrine ratification, 19 ADRs landed, 4 pillar articles, 8 supporting blog posts, 156 sprint tasks completed, 1300+ tests passing. Foundational design work, not customer-facing surface yet.",
    post: 'pre-launch-month-in-numbers',
  },
  {
    body: "What Month 1 was NOT: no paying customers (no product yet), no public beta (Month 3 commitment), no revenue, no real-world driver beta cohort assembled. The pre-launch reality, plainly named in public.",
    post: 'pre-launch-month-in-numbers',
  },
  {
    body: "A pre-launch month with no numerals reads as wishful thinking dressed as marketing. A pre-launch month with numerals attached, including the unflattering ones, reads as a project that knows where it is.",
    post: 'pre-launch-month-in-numbers',
  },
  {
    body: "Month 2 commitments: 1 rule library v0, 5+ Batch 3 supporting posts, the Month 2 update on the same cadence — including whatever numbers Month 2 produces, flattering or not. The cadence is how a one-person publishing operation stays honest.",
    post: 'pre-launch-month-in-numbers',
  },

  // ─── T185 — What we are NOT building (and why) ──────────
  {
    body: "The roadmap of features LAP will not ship is shorter than the roadmap of features it will, and a more important one to get right at the start. Six exclusions, each a deliberate scope choice with reasons attached. Published in public so the choices are durable.",
    post: 'what-were-not-building',
  },
  {
    body: "Six things LAP is NOT building: language-model coaching, real-time in-cockpit coaching, racing-team-engineer tooling, gamification as primary surface, setup or strategy widgets, prescriptions when the rule library cannot diagnose.",
    post: 'what-were-not-building',
  },
  {
    body: "Every coaching prescription LAP ships traces to a hand-curated rule library written by humans — never to a language-model output. Durability over surface area: a fabricated prescription that lands wrong on a known corner collapses trust on a single bad output.",
    post: 'what-were-not-building',
  },
  {
    body: "We are not building a voice in the driver's ear during the lap. Different product, different safety profile, different latency budget. LAP runs between sessions on the trace, where prescriptions can be verified before reaching the driver.",
    post: 'what-were-not-building',
  },
  {
    body: "Publishing the exclusions in public is what makes them durable. A scope choice that lives only in an internal doctrine document drifts when the next demo request lands. A scope choice published, named, and explained is harder to drift past.",
    post: 'what-were-not-building',
  },
];
