// T149 — FAQ data + schema.org FAQPage JSON-LD for Pillar 2
// ("What is Trail Braking and how to measure it"). Same canonical-
// source pattern as T139 / pillar-1-faq.ts: the FAQ array is the
// editorial source for both the human-rendered Q&A surface AND
// the FAQPage JSON-LD. The published article page (T150) imports
// PILLAR_2_FAQS to render an accordion (PricingFaq.astro idiom)
// and calls pillar2FaqJsonLd() to emit the script tag.
//
// Editorial discipline mirrors body sections:
//   * Doctrine voice — physics-first, technique-second; honest
//     about limits
//   * Forbidden vocab — no AI-coach-now / LLM / generative /
//     "realistic" overclaim (ADR-004); no "magic" / "secret" /
//     "trick" (Pillar 2 outline extension)
//   * Substantive answers (≥30 words floor; 50-65 typical) so the
//     FAQ pulls real long-tail search traffic
//
// Types reused from pillar-1-faq.ts — both pillars share the
// same FAQ shape; future pillars import from there as well.

import type { Faq, FaqPageJsonLd } from './pillar-1-faq';

export const PILLAR_2_FAQS: ReadonlyArray<Faq> = [
  {
    question: 'What is trail braking?',
    answer:
      'Trail braking is a release pattern, not a brake input. The brake is already on; trail braking calls for keeping some brake pressure on past turn-in into the apex, so the front tires stay loaded and the car rotates cleanly. Release the brake too early and the front tires give back their extra contact patch a beat too soon — the resulting understeer is the most common rookie mistake.',
  },
  {
    question: 'How do I know if I am trail braking too long?',
    answer:
      'The signature is brake pressure trace still reading five to fifteen percent past the apex point, with throttle reapplied after the apex while steering is still near maximum angle. The car understeers right where it should be biting. The pattern tends to be consistent across the whole lap — drivers who hold late do it everywhere, not just on one corner.',
  },
  {
    question: 'Is trail braking the same in a sim as in a real car?',
    answer:
      'Yes, in shape. The physics — weight transfer to the front axle, larger contact patch, more lateral grip — is the same on iRacing or ACC as in a real GT3. What differs is the seat-of-pants calibration: how much pedal pressure produces how much deceleration. The technique transfers cleanly between platforms; the pedal feel is a per-platform recalibration issue.',
  },
  {
    question: 'What is the data signature of good trail braking?',
    answer:
      'A smooth single-derivative brake-pressure trace through the release phase — one continuous taper from peak to zero, no inflection points, no stab pattern. Steering input ramps up while brake pressure ramps down, with overlap of two-tenths of a second or more between turn-in and brake-zero. Apex speed lands on the driver reference for that corner.',
  },
  {
    question: 'Should I trail brake every corner?',
    answer:
      "No. Trail braking is the right call on most medium and slow corners where rotation matters, but big-stop hairpins (Sebring's Turn 17, second-gear stadium chicanes) often work better with more brake pressure released earlier and a clean steering input. Knowing which corners reward the technique is part of having the technique.",
  },
  {
    question: 'How do I improve my trail braking with telemetry?',
    answer:
      'Run a three-tier drill progression on a single corner you know well. Beginner: brake pressure non-zero at turn-in, with brake-trace and steering-input overlap of at least two-tenths of a second. Intermediate: smooth taper from peak to zero, no inflection points. Advanced: same release shape across five corners of different speeds. Quarterly progression in the data is the durable benefit.',
  },
];

export const pillar2FaqJsonLd = (): FaqPageJsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PILLAR_2_FAQS.map((faq) => ({
    '@type': 'Question' as const,
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: faq.answer,
    },
  })),
});
