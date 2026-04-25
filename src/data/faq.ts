// T169 — shared FAQ types for the pillar-article cluster.
// Extracted here from `pillar-1-faq.ts` once a third consumer
// (Pillar 4) joined Pillars 2 + 3 on the same import path. With
// three consumers all sharing the same shape, the cost of
// keeping the type definitions co-located with one specific
// consumer outweighed the benefit — and the import path
// `import type { Faq } from './pillar-1-faq'` mis-implied that
// later pillars depended on Pillar 1's data, when in fact they
// share only the structural contract.
//
// `Faq` is the editorial unit consumed by both:
//   - the human-rendered Q&A surface (PricingFaq.astro idiom)
//   - the schema.org FAQPage JSON-LD payload
// `FaqPageJsonLd` is the shape Google expects for FAQ rich-
// snippet eligibility — locked here so a future refactor cannot
// quietly drop a required field.

export interface Faq {
  readonly question: string;
  readonly answer: string;
}

export interface FaqPageJsonLd {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'FAQPage';
  readonly mainEntity: ReadonlyArray<{
    readonly '@type': 'Question';
    readonly name: string;
    readonly acceptedAnswer: {
      readonly '@type': 'Answer';
      readonly text: string;
    };
  }>;
}
