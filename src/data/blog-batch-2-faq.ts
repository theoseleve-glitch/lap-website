// T188 — Batch 2 FAQ data module + per-post FAQPage JSON-LD
// factory. Same canonical-source + per-post filter pattern
// as T178 (Batch 1 FAQ); diverges editorially because Batch
// 2 covers founder/product-story topics (positioning,
// doctrine, scope, transparency) rather than technique
// deep-dives.
//
// Why per-post filtering rather than identical-FAQPage on
// every post: emitting an identical FAQPage payload across
// 5 different URLs is a Google duplicate-content signal
// that can suppress rich-snippet eligibility. Each Batch 2
// publish page (T189) emits a JSON-LD payload filtered to
// the questions tagged for that specific post.
//
// ADR-004 asymmetric for the FAQ corpus — the Batch 2 FAQ
// includes the language-model question explicitly because
// the positioning posts (T181, T185) depend on the
// negation argument. Bare "llm" / "ai coach" / "generative"
// / "neural" still banned across the FAQ prose; the
// spelled-out "language-model" form is the editorial form
// that lets the FAQ make the negation argument cleanly.

import type { Faq, FaqPageJsonLd } from './faq';

export type Batch2PostSlug =
  | 'why-im-building-lap-not-motec-clone'
  | 'sim-to-real-gap-honest-look'
  | 'designing-coaching-drivers-follow'
  | 'pre-launch-month-in-numbers'
  | 'what-were-not-building';

export interface Batch2Faq extends Faq {
  /** Slugs of Batch 2 posts this FAQ should appear on. */
  readonly posts: ReadonlyArray<Batch2PostSlug>;
}

export const BATCH_2_FAQS: ReadonlyArray<Batch2Faq> = [
  {
    question: 'What is the difference between LAP and MoTeC?',
    answer:
      'LAP is a coaching surface; MoTeC i2 is an engineering trace-reading tool. MoTeC was built for the engineer between the driver and the data — math channels, hardware-logger integration, channel customisation polished over twenty years. LAP is built for the driver alone with the data between sessions, with no engineer attached: weakness shape, drill name, success criterion, review cadence. Different question, different surface, different persona, with the same data underneath.',
    posts: ['why-im-building-lap-not-motec-clone'],
  },
  {
    question: 'Who is LAP designed for?',
    answer:
      'The serious sim racer who has plateaued at a licence class and wants structured progression rather than more seat time, and the track-day driver who runs four-to-eight events a year and wants the work between sessions to compound into the next event. The driver alone with the data between sessions is the primary persona. Anti-personas are explicit: racing-team engineers (keep MoTeC), drivers with a dedicated human coach.',
    posts: ['why-im-building-lap-not-motec-clone', 'what-were-not-building'],
  },
  {
    question: 'Should I use MoTeC instead of LAP for my use case?',
    answer:
      'If your workflow involves an engineer reading the trace for you, hardware-logger integration with a real car, math-channel customisation, or pro-grade engineering analysis, MoTeC is the right tool, and we say so on the comparison page. LAP fits the driver alone with the data who needs a coaching prescription rather than an engineering surface. The two products serve different personas; they are not competitors so much as honest neighbours in the data.',
    posts: ['why-im-building-lap-not-motec-clone'],
  },
  {
    question: 'Does sim training transfer to real-world driving?',
    answer:
      'Yes, partially, and the partial is predictable. The shape of driving — brake-zone ordering, line shape, trail-brake patterns, race-craft instincts in traffic — transfers cleanly between sim and real. The magnitudes do not: tire feel under real-world load, G-force calibration, fear under genuine consequence, weather adaptation in actual rain. Sim sessions chase shapes, real sessions chase magnitudes, and the same framework runs across both surfaces.',
    posts: ['sim-to-real-gap-honest-look'],
  },
  {
    question: 'What does NOT transfer between sim and real?',
    answer:
      'The seat-of-pants calibration: tire feel under real-world load and surface temperature, the inner-ear G-force signal that tells the driver where the braking limit is, fear under genuine consequence (the cone of visual perception narrows when there is real armco at the runoff), and weather adaptation in actual rain. The shape of the line transfers between platforms; the rate at which the driver trusts that line under conditions does not.',
    posts: ['sim-to-real-gap-honest-look'],
  },
  {
    question: 'Should I prepare for a track day with sim time?',
    answer:
      'Yes. Sim work calibrates the shape of your driving — brake-zone ordering, line shape, trail-brake patterns. Treat the first track session as a re-baseline of intensity rather than a chance to match sim lap times in real life. The shape will be familiar; the pedal pressures, the G-force under braking, the cone of visual perception all need a re-baseline. By the third session, magnitudes catch up with the shapes the sim already taught.',
    posts: ['sim-to-real-gap-honest-look'],
  },
  {
    question: 'What makes coaching followable versus unfollowable?',
    answer:
      'Followable coaching has anatomy: weakness shape (the specific pattern in the trace), drill name (the explicit action with a procedure attached), success criterion (the measurable signal that says the drill worked), review cadence (when the driver checks back). Unfollowable coaching is observation-shaped — "be smoother on entry", "carry more speed" — naming the desired end state but no procedure for producing it. The driver cannot act on observation-shaped advice.',
    posts: ['designing-coaching-drivers-follow'],
  },
  {
    question: 'Why is "be smoother on entry" not useful coaching?',
    answer:
      'Because it is observation-shaped, not prescription-shaped. It names a quality the lap time would benefit from but no procedure for producing the quality. The driver nods, attempts to be smoother, has no procedural anchor for what smoothness consists of in this corner, and defaults to driving the corner the same way as before. Technically correct advice, but not coaching, because nothing about it can be followed.',
    posts: ['designing-coaching-drivers-follow'],
  },
  {
    question: 'What are the four parts of a followable prescription?',
    answer:
      'First, the weakness shape — the specific pattern observed in the trace. Second, the drill name — the explicit action with a procedure attached. Third, the success criterion — the measurable signal that says the drill worked. Fourth, the review cadence — when the driver checks back. Strip any one of these and the prescription collapses into observation. All four together is what makes a prescription executable in the next session.',
    posts: ['designing-coaching-drivers-follow'],
  },
  {
    question: 'What is LAP shipping in the pre-launch month?',
    answer:
      'Foundational design work. The strategic doctrine ratified across 198 questions, 19 ADRs that turn doctrine into build constraints, four pillar articles plus eight supporting blog posts across two batches, contract tests on every published post, and the marketing surface itself. No paying customers yet, no public beta, no revenue — these are excluded from pre-launch by deliberate scope choice. The build is foundational; the reporting cadence is monthly.',
    posts: ['pre-launch-month-in-numbers'],
  },
  {
    question: 'When will LAP be publicly available?',
    answer:
      'The roadmap commits to a public beta by end of Month 3 (sim-only at first, with a closed driver cohort) and a paid product by Month 6. Pre-launch waitlist signups receive grandfathered terms: pricing and feature availability preserved through any Month-6 launch changes. The build cadence runs to those dates, and the monthly update reports progress against them, including any month the schedule slips behind plan.',
    posts: ['pre-launch-month-in-numbers'],
  },
  {
    question: 'What metrics does LAP publish in its monthly updates?',
    answer:
      'Concrete counts from the codebase: ADRs landed, pillar articles published, supporting posts shipped, sprint tasks completed, test suite size, typecheck file count. The monthly format also commits to publishing what was NOT done — no paying customers yet, no public beta, no real-world driver cohort assembled. The honesty discipline is the format itself: numbers attached, including the unflattering ones, including the months where the unflattering numbers dominate the report.',
    posts: ['pre-launch-month-in-numbers'],
  },
  {
    question: 'Does LAP use language-model-generated coaching?',
    answer:
      'No. Every coaching prescription LAP ships traces to a hand-curated rule library written by human authors — never to a language-model output. The reason is durability over surface area: a coaching surface that fabricates plausible-sounding advice will eventually land a prescription on a corner the driver knows well, the prescription will be wrong, and the trust differential collapses on that single bad output. The doctrine commitment is non-negotiable.',
    posts: ['what-were-not-building', 'why-im-building-lap-not-motec-clone'],
  },
  {
    question: 'What is LAP NOT going to build, and why?',
    answer:
      'Six exclusions documented in public: language-model-generated coaching, real-time in-cockpit coaching, racing-team-engineer tooling, gamification as the primary surface, setup or strategy widgets, and prescriptions when the rule library cannot diagnose. Each exclusion is a deliberate scope choice with reasons attached. The roadmap of features LAP will not ship is shorter than the roadmap of features it will, and a more important one to get right at the start.',
    posts: ['what-were-not-building'],
  },
  {
    question: 'Why no real-time in-cockpit coaching?',
    answer:
      'Different product, different safety profile, different latency budget, different trust failure mode. LAP runs between sessions on the trace after the lap is in the books, where the prescription anatomy can be verified before reaching the driver. A prescription that arrives mid-corner with no review step has a narrower correctness window and a wider blast radius when it lands wrong. The deliberate scope is that the loop closes between sessions, not at 200 km/h.',
    posts: ['what-were-not-building'],
  },
];

/**
 * Returns a FAQPage JSON-LD payload filtered to questions
 * tagged for the given Batch 2 post slug. Each Batch 2
 * publish page (T189) calls this with its own slug to emit
 * a topic-specific FAQPage rather than a duplicate of every
 * other post's structured data.
 */
export const batch2PostFaqJsonLd = (slug: Batch2PostSlug): FaqPageJsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: BATCH_2_FAQS.filter((faq) => faq.posts.includes(slug)).map(
    (faq) => ({
      '@type': 'Question' as const,
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: faq.answer,
      },
    }),
  ),
});

/**
 * Returns the FAQs targeted at a given Batch 2 post slug.
 * The Batch 2 publish pages (T189) iterate this for the
 * human-rendered accordion surface.
 */
export const batch2PostFaqs = (
  slug: Batch2PostSlug,
): ReadonlyArray<Batch2Faq> =>
  BATCH_2_FAQS.filter((faq) => faq.posts.includes(slug));
