// T169 — FAQ data + schema.org FAQPage JSON-LD for Pillar 4
// ("How to Build a Driver Development Plan"). Same canonical-
// source pattern as T139 / T149 / T159: the FAQ array is the
// editorial source for both the human-rendered Q&A surface AND
// the FAQPage JSON-LD. The published article page (T170) imports
// PILLAR_4_FAQS to render an accordion (PricingFaq.astro idiom)
// and calls pillar4FaqJsonLd() to emit the script tag.
//
// Pillar 4 editorial discipline:
//   * Doctrine voice — five verbs (diagnose, prescribe, execute,
//     measure, adapt) running on three cadences (per-session,
//     weekly, event-cycle); the loop closes or the plan stalls
//   * Forbidden vocab — no AI-coach-now / LLM / generative
//     (ADR-004); no magic / secret / trick / realistic (Pillar 2
//     carry-over); no clearly worse / outdated / bloated /
//     overhyped / obviously inferior, no expensive / cheap /
//     pricey / affordable (Pillar 3 carry-over); no guru /
//     secret formula / shortcut / overnight / hack / system that
//     guarantees (Pillar 4 extension — development plans are
//     sustained loops, not marketing shortcuts)
//   * Substantive answers (≥30 words floor; 60-85 typical) so
//     the FAQ pulls real long-tail action-oriented traffic
//   * Five-verb framework vocabulary present cumulatively — the
//     FAQ surface and the body sections speak the same framework

import type { Faq, FaqPageJsonLd } from './faq';

export const PILLAR_4_FAQS: ReadonlyArray<Faq> = [
  {
    question: 'What is a driver development plan?',
    answer:
      'A driver development plan is a structured feedback loop tied to data, anchored on five framework verbs: diagnose, prescribe, execute, measure, and adapt. Each verb is a discrete decision the driver makes at a different point in the practice cycle. Skipping any one of them opens the loop. A development plan is what separates sustained improvement from accumulated seat time — the structure is what makes the work compound across sessions.',
  },
  {
    question: 'What is the difference between regular practice and a development plan?',
    answer:
      'Regular practice produces seat time without progression. A development plan produces a written prescription with an observable success criterion before the session, then measures whether the criterion landed afterwards. The discipline of writing the prescription before driving and the success criterion before measuring is what closes the loop. Both surfaces — sim and real-world — benefit from the same structure, and a driver who runs the loop on either surface alone still gets the structural payoff.',
  },
  {
    question: 'How do I structure my sim racing practice into a development plan?',
    answer:
      "Run the five verbs on a weekly cadence. Diagnose: review last week's traces, identify one weakness shape. Prescribe: pick one drill with a measurable success criterion. Execute: run the drill across two or three sessions. Measure: did the criterion land in three of five attempts? Adapt: advance to the next prescription, repeat the same one, or re-diagnose. A weekly review of thirty minutes is the anchor that turns logged sessions into a development plan rather than a backlog of seat time.",
  },
  {
    question: 'How often should I review my telemetry?',
    answer:
      "The framework runs on three cadences. Per-session for live coaching prompts during the run itself. Weekly for the main review where you pick one focus for the next seven days. Event-cycle across the four to six weeks before a target track day or race. The weekly review is where the measure step feeds adapt — week N's result becomes week N+1's diagnose step. Reviewing every minute of every session is overkill; skipping the weekly review is the most common reason a driver's improvement curve flattens.",
  },
  {
    question: 'Do I need a coach to follow this framework?',
    answer:
      'A coach helps but is not required. The framework verbs are decisions a driver can make alone if there is access to a credible source for what to drill — a coaching library, a published technique guide, or a written drill catalogue. What matters is that each prescription traces to evidence and to a written rule, not to opinion. The DIY template in section six of the article is the worksheet structure that runs on any telemetry tool the reader already owns.',
  },
  {
    question: 'What is the biggest mistake drivers make with development plans?',
    answer:
      "Skipping the measure step. Drivers diagnose, prescribe, and execute the drill, then move on without writing down whether the success criterion landed. Without a measured outcome, the next diagnose step has nothing to argue against and the development plan stalls. The other common failure is writing prescriptions that cannot be measured — 'smooth it out' is not a success criterion. If the success criterion does not fit in one sentence, the prescription is not yet specific enough to drill against.",
  },
  {
    question: 'How long does it take to see results from a development plan?',
    answer:
      'There is no fixed timeline because the framework is not a linear program. What can be measured week over week is the rate at which prescriptions land — the percentage of drills that hit their success criterion. A driver running the loop honestly should see that rate climb across a quarter, with weakness shapes named today retired and replaced by the next ones. A development plan that promises a fixed result on a fixed date is selling certainty the framework does not promise.',
  },
];

export const pillar4FaqJsonLd = (): FaqPageJsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PILLAR_4_FAQS.map((faq) => ({
    '@type': 'Question' as const,
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: faq.answer,
    },
  })),
});
