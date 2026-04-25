// T159 — FAQ data + schema.org FAQPage JSON-LD for Pillar 3
// ("Best telemetry app comparison: LAP vs Garage61 vs RaceLab
// vs MoTeC vs Track Attack vs STINT"). Same canonical-source
// pattern as T139 / T149: the FAQ array is the editorial
// source for both the human-rendered Q&A surface AND the
// FAQPage JSON-LD. The published article page (T160) imports
// PILLAR_3_FAQS to render an accordion (PricingFaq.astro
// idiom) and calls pillar3FaqJsonLd() to emit the script tag.
//
// Pillar 3 editorial discipline:
//   * Doctrine voice — shopping by persona, no winner-
//     declaration, six-app-six-dimension framework
//   * Forbidden vocab — no AI-coach-now / LLM / generative
//     (ADR-004); no magic / secret / trick / realistic
//     (Pillar 2 carry-over); no clearly worse / outdated /
//     bloated / overhyped / obviously inferior (Pillar 3
//     subjective-disparagement guardrail); no expensive /
//     cheap / pricey / affordable (Pillar 3 §4 subjective-
//     pricing guardrail)
//   * Substantive answers (≥30 words floor; 50-70 typical) so
//     the FAQ pulls real long-tail comparison-search traffic
//   * ≥3 of the 6 named apps referenced cumulatively — the
//     comparison universe must show in the FAQ, not just LAP
//
// Types reused from pillar-1-faq.ts — Pillar 2 + Pillar 3
// share the same FAQ shape; future pillars import from there
// as well (premature abstraction avoided per outline note).

import type { Faq, FaqPageJsonLd } from './pillar-1-faq';

export const PILLAR_3_FAQS: ReadonlyArray<Faq> = [
  {
    question: 'What is the best telemetry app for sim racing?',
    answer:
      'There is no single best telemetry app — the right answer depends on your persona, your platform mix, and your budget. Competitive sim racers chasing iRacing licence-class progression often shortlist LAP, Garage61, and RaceLab. Casual sim racers usually fit Garage61 better because of its free tier. Track-day drivers who want sim and real-world in one view shortlist LAP and Track Attack. Pro and team-coach personas are better served by MoTeC i2 today.',
  },
  {
    question: 'How does LAP compare to Garage61?',
    answer:
      'LAP and Garage61 sit on different sides of a coaching trade-off. Garage61 is sim-side telemetry analysis with strong social features — lap sharing, leaderboards, setup exchange. LAP focuses on cross-platform driver progression with rule-based coaching prescription that names what to work on next. A competitive sim racer benefits from Garage61 if comparing against another driver is the learning loop; LAP fits when "what should I work on this week" is the question.',
  },
  {
    question: 'How much does telemetry software cost for sim racing?',
    answer:
      'Pricing varies widely across the six telemetry apps in this comparison. LAP is a subscription at €15 per month standard, €12 per month for closed-beta waitlist invitees. Garage61 has a free tier plus paid premium. MoTeC i2 Pro is free, with i2 Standard as a paid licence for multi-session analysis. RaceLab is a subscription suite. Track Attack is a free download with in-app upgrades. Verify the current rate on each product page before treating these figures as canonical.',
  },
  {
    question: 'Can I use the same telemetry app for sim and real-world driving?',
    answer:
      'Yes, but only if the app supports both surfaces. LAP is built around cross-platform unification — sim and real-world sessions land in one driver profile with the same weakness detector running on both. Track Attack handles real-world phone-based capture but is not the primary sim-side tool. The other four apps in this comparison are sim-only or analysis-tool-only. The persona that wants both surfaces in one progression view shortlists LAP first.',
  },
  {
    question: 'Is MoTeC worth it for amateur sim racers?',
    answer:
      'Probably not as a first telemetry app. MoTeC i2 Pro is free and powerful, but the learning curve is the steepest of any telemetry app in the comparison — i2 was built for professional motorsport workflows where the engineer reads the trace, not the driver. Amateur sim racers are usually better served by Garage61 or LAP first; MoTeC fits the pro and semi-pro personas, the team coach, and serious club racers running real-world sessions with hardware data loggers.',
  },
  {
    question: 'Do I need a RaceBox to use LAP for track days?',
    answer:
      "Yes, on the current track-day path. LAP's real-world capture pipeline today requires a RaceBox plus an iPhone — a track-day driver without that hardware cannot run the capture stack on real-world sessions. The Android client is in closed beta until July 2026; the iOS app ships at V1 in September 2026. Phone-only tools like Track Attack fit the no-extra-hardware preference better today. The hardware requirement is documented on the mobile product page.",
  },
  {
    question: 'Is there a free telemetry app I can try first?',
    answer:
      'Yes, two options stand out. Garage61 has a free tier covering basic lap analysis on iRacing — a casual sim racer who has never opened a telemetry tool can start there without a subscription commitment. MoTeC i2 Pro is also free and is the most powerful free tier in the comparison, though the learning curve is steep. LAP itself offers a 14-day trial with no card required, which fits readers who want to assess the cross-platform surface before subscribing.',
  },
];

export const pillar3FaqJsonLd = (): FaqPageJsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PILLAR_3_FAQS.map((faq) => ({
    '@type': 'Question' as const,
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: faq.answer,
    },
  })),
});
