// T139 — FAQ data + schema.org FAQPage JSON-LD for Pillar 1
// ("Sim to Real-Life Racing Transfer"). Single canonical source
// for both the human-rendered Q&A surface and the structured
// data Google needs for FAQ rich snippets — keeping rendering
// and schema in lockstep is the whole point of putting them in
// the same module. The published article page (T140) will import
// PILLAR_1_FAQS to render an accordion (same idiom as
// PricingFaq.astro) and call pillar1FaqJsonLd() to emit the
// FAQPage script tag.
//
// Editorial discipline mirrors body sections:
//   * Doctrine voice — "shapes transfer, magnitudes don't"
//   * Forbidden vocab — no AI-coach-now / LLM / generative /
//     "realistic" overclaim (ADR-004)
//   * Substantive answers (≥30 words each) so the FAQ pulls
//     real long-tail search traffic, not token padding
//
// Faq + FaqPageJsonLd types were extracted to `./faq` at T169,
// once Pillar 4 made three consumers on the shared shape.

import type { Faq, FaqPageJsonLd } from './faq';

export const PILLAR_1_FAQS: ReadonlyArray<Faq> = [
  {
    question: 'Does sim racing actually help with real track driving?',
    answer:
      "Yes, partially, and the partial is predictable. Brake-zone ordering, line shape, throttle modulation, race-craft instincts, and trail-brake patterns all transfer cleanly between platforms. Tire feel, G-force calibration, fear, and absolute lap times don't. Once you accept that shapes transfer and magnitudes don't, sim work becomes a deliberate preparation tool rather than a substitute for track time.",
  },
  {
    question: 'Which sim racing platform transfers best to real-world driving?',
    answer:
      'iRacing has the broadest scanned-track library and the strongest race-craft simulation. ACC delivers the highest GT3 and GT4 fidelity in that single car class. AMS2 covers formula and stock-car content well. None of them is meaningfully better for technique transfer once a car-class match is in place — pick by content availability and price, not by claimed transfer fidelity.',
  },
  {
    question: 'How many hours of sim racing equal one real track day?',
    answer:
      "It's the wrong question. Sim hours and track hours teach different things — they're complements, not substitutes. Sim is unmatched for repetition (two hundred laps of one corner in an evening) and race-craft scenarios. Real track teaches tire degradation feel, real-stakes commitment calibration, and weather adaptation. Time spent on either is time well spent if you're deliberate about what you're learning.",
  },
  {
    question: 'What is the biggest mistake sim racers make at their first real track day?',
    answer:
      'Carrying sim-confidence into real-track commitment levels, especially in high-speed sweepers where the visual cone-of-fear only exists in the real cockpit. The sim has a reset button; the real circuit has armco for kilometres. Treat your first track session as recalibration of intensity, not as a chance to match your sim lap times — the shape of your driving will already be familiar.',
  },
  {
    question: 'Can I skip the real track day if I have prepped on the sim?',
    answer:
      'No. Sim prep accelerates real-track learning but does not replace it. The asymmetric advantages of sim (repetition volume, cheap setup iteration, race-craft reps) and real track (tire degradation feel, real consequence calibration, mechanical sympathy) are both essential. The fastest progression treats sim and real as one progression, with the same driver across both surfaces and weakness shapes carrying between them.',
  },
  {
    question: 'How do I measure transfer for myself without a coaching platform?',
    answer:
      'Run two same-circuit sessions, one sim and one real. Write down five comparable artifacts in each: brake-zone ordering, line shape per major corner, your top one or two repeated mistakes in plain language, trail-brake pattern shape, and within-platform sector deltas. Compare shapes across platforms and intensities only within a platform. Same shape across both is the transfer payoff; different shape is the recalibration target.',
  },
];

export const pillar1FaqJsonLd = (): FaqPageJsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PILLAR_1_FAQS.map((faq) => ({
    '@type': 'Question' as const,
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: faq.answer,
    },
  })),
});
