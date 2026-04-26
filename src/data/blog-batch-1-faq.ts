// T178 — Batch 1 FAQ data module + per-post FAQPage JSON-LD
// factory. Single canonical source for both the human-rendered
// Q&A surface (rendered on each Batch 1 publish page at T179)
// and the schema.org FAQPage structured data. Diverges from
// the per-pillar FAQ pattern (T139/T149/T159/T169) in that
// one data module serves all 5 published posts, with per-post
// FAQPage filtering by topic tag.
//
// Why per-post filtering rather than identical-FAQPage on
// every post: emitting an identical FAQPage payload across 5
// different URLs is a Google duplicate-content signal that
// can suppress rich-snippet eligibility. Each post in Batch 1
// emits a JSON-LD payload filtered to the questions tagged
// for that specific post.
//
// Editorial discipline:
//   * 14 FAQs, ≥3 tagged per post, average answer 60-75 words
//   * Forbidden vocab: ADR-004 + Pillar 2/3/4 carry-over +
//     blog-post-layer technique-overclaim guardrail
//   * Framework verbs (diagnose / prescribe / execute /
//     measure / adapt) referenced cumulatively
//   * Question phrasings match real long-tail search intent
//     (paraphrase-and-extend of body-section content rather
//     than verbatim repetition)

import type { Faq, FaqPageJsonLd } from './faq';

export type BatchPostSlug =
  | 'late-braking-at-t1'
  | 'throttle-pickup-smooth-vs-aggressive'
  | 'apex-speed-corner-commitment'
  | 'consistency-over-raw-pace'
  | 'tire-management-endurance';

export interface BatchFaq extends Faq {
  /** Slugs of posts this FAQ should appear on. */
  readonly posts: ReadonlyArray<BatchPostSlug>;
}

export const BATCH_1_FAQS: ReadonlyArray<BatchFaq> = [
  {
    question: 'How do I know if I am braking too late at Turn 1?',
    answer:
      'Look at three signatures in your brake-pressure trace. First, peak pressure timing — does the brake go in significantly later than your reference lap? Second, release shape — is it a smooth taper from peak to zero, or a stab-and-lift pattern with two distinct phases? Third, overlap with steering input — does brake pressure reach zero before steering begins, or do they overlap by two-tenths of a second? The combination tells you whether you are late and rotating cleanly, or late and breaking the corner.',
    posts: ['late-braking-at-t1'],
  },
  {
    question: 'What does a clean Turn 1 brake-pressure trace look like?',
    answer:
      'A clean Turn 1 brake-pressure trace climbs to peak quickly and then tapers in a single continuous curve from peak to zero across half a second or more, with steering input ramping up while brake pressure ramps down. The overlap window between brake pressure and steering is the trail-braking signature; a flat-top followed by a stab-down release with no steering overlap is what an unclean trace looks like instead.',
    posts: ['late-braking-at-t1'],
  },
  {
    question: 'Should I always brake later to gain time?',
    answer:
      'No. "Brake later" only works when the brake-release shape is otherwise correct. If your release shape shows a stab-and-lift pattern with no overlap to steering input, braking later just moves the failure mode an extra ten metres down the road. Apex speed is the leading indicator; if it is below your reference, the problem is more often in the release shape than in absolute brake-zone distance. Diagnose the release shape before you adjust the brake-zone marker.',
    posts: ['late-braking-at-t1', 'apex-speed-corner-commitment'],
  },
  {
    question: 'When should I be aggressive on throttle versus smooth on corner exit?',
    answer:
      'Smooth pickup — a continuous ramp from zero to full across the exit phase — fits long sweepers with long straights afterward, where the rear axle is still being asked for lateral grip through the apex. Aggressive pickup — a stab-and-plateau pattern — fits tight, low-grip exits with short chutes, where the corner radius has effectively closed by the apex and the rear is no longer carrying lateral load. The corner radius decides which shape the trace should show.',
    posts: ['throttle-pickup-smooth-vs-aggressive'],
  },
  {
    question: 'What causes throttle-induced oversteer at the apex?',
    answer:
      'Asking the rear contact patch for both lateral and longitudinal grip simultaneously. Through the apex, the rear is still carrying lateral load from the cornering force; aggressive throttle adds longitudinal demand on top, and the traction circle says no. The slide that follows is the rear giving up on the lateral component because the longitudinal demand was too high. The fix is matching the throttle ramp rate to the rate at which lateral load is releasing as the steering unwinds.',
    posts: ['throttle-pickup-smooth-vs-aggressive', 'apex-speed-corner-commitment'],
  },
  {
    question: 'How do I tell from data if my throttle pickup is wrong for the corner?',
    answer:
      'Compare the throttle-position trace to a reference. If your trace shows a stab-and-plateau pattern on a long sweeper, you are over-committing on throttle for the corner radius; the rear-yaw event will appear at the apex moment in the steering trace. If your trace shows a smooth ramp on a tight hairpin with a short straight, you are under-committing; the missing time shows up as exit speed below reference at the next sector beacon.',
    posts: ['throttle-pickup-smooth-vs-aggressive'],
  },
  {
    question: 'Why is apex speed a better metric than my fastest lap?',
    answer:
      'A fastest lap is a conditional event — fresh tires, clean track, no traffic, no mistakes across ninety inputs across the whole lap. It mixes too many signals to diagnose anything specific. Apex speed isolates one phase of one corner: the rotation phase, where the car is at maximum lateral load. The minimum speed at the apex is the trace\'s record of how close the driver got to the lateral-grip limit. Chase the leading indicator and the lap time follows.',
    posts: ['apex-speed-corner-commitment'],
  },
  {
    question: 'What is the difference between under-committing and over-committing at the apex?',
    answer:
      'Under-committers show MIN_SPEED below reference and brake pressure released early — the trace shows the driver bailed before the tires committed to rotation. The fix is on the entry side. Over-committers show MIN_SPEED at or above reference but exit speed below reference, with a rear-yaw signature in the steering trace at the apex — the tire was asked for more than it could produce. The fix is on the mid-corner side. Same lap-time deficit, opposite fixes.',
    posts: ['apex-speed-corner-commitment', 'throttle-pickup-smooth-vs-aggressive'],
  },
  {
    question: 'Why do consistent drivers beat faster ones in races?',
    answer:
      'Race results depend on the median lap of the field, not the single fastest one. A driver whose median is two-tenths slower than a rival\'s but whose standard deviation is 0.4 seconds tighter will pull ahead by ten seconds or more across thirty laps. Endurance amplifies the asymmetry. iRacing\'s iRating system rewards consistent finishes over fluke fast laps; real-world race series are no different. Peak pace shows on qualifying day; consistency shows on race day.',
    posts: ['consistency-over-raw-pace'],
  },
  {
    question: 'How do I measure my consistency from session data?',
    answer:
      'Pull lap times across a stint or session. Compute the median, the fastest, and the standard deviation of the distribution. The median measures your sustainable pace; the gap between median and fastest measures your consistency tax; the standard deviation measures the spread. A standard deviation under 0.4 seconds across a clean stint is competitive at most sim-racing levels; above 0.7 seconds suggests one of three failure modes — random scatter, systematic drift, or a spike pattern.',
    posts: ['consistency-over-raw-pace', 'tire-management-endurance'],
  },
  {
    question: 'What does a spike pattern in my lap times mean?',
    answer:
      'A spike pattern is a session where most laps are within 0.2 seconds of each other but one or two laps are 1.5 seconds slower because a single corner is unreliable. Unlike random scatter or systematic drift, a spike pattern isolates a specific corner\'s reliability problem. The fix is corner-phase work — diagnose the trace shape on the failing corner, prescribe one drill, and the median tightens by half a second per stint without ever changing the fastest lap.',
    posts: ['consistency-over-raw-pace', 'late-braking-at-t1'],
  },
  {
    question: 'How do I know when my tires are starting to degrade?',
    answer:
      'The earliest signal is brake-pressure required to hit the same deceleration. As the front tire\'s contact patch ages, peak grip falls and the driver instinctively adds brake pressure to compensate. Lap one of the stint shows brake-pressure peaks at one specific value; lap thirty shows the same target deceleration achieved with a ten-percent-higher peak. The trace is the leading indicator; lap times do not reflect the degradation until the compensation budget is exhausted.',
    posts: ['tire-management-endurance'],
  },
  {
    question: 'What is the optimal tire temperature window for racing tires?',
    answer:
      'Modern racing compounds are optimised for a specific temperature range — typically thirty to forty degrees wide, sometimes tighter on softer compounds. Below the window the rubber is too glassy to deform around the asphalt texture; above the window the rubber smears off the contact patch and sheds faster than the tire can carry. Modern telemetry tools report tire surface temperature; staying inside the window is the discipline of tire management in endurance racing.',
    posts: ['tire-management-endurance'],
  },
  {
    question: 'How does endurance racing change my driving compared to sprint?',
    answer:
      'Sprint racing optimises for the fastest possible lap, every lap. Endurance racing optimises for the highest pace the tire can sustain across the entire stint without entering the high-degradation phase before the pit stop. The optimal pace per lap drops below the absolute peak; the consistency-over-raw-pace argument compounds across two-hundred-lap races; the trace-reading discipline becomes essential because the leading indicators of degradation arrive eight laps before the lap-time signal does.',
    posts: ['tire-management-endurance', 'consistency-over-raw-pace'],
  },
];

/**
 * Returns a FAQPage JSON-LD payload filtered to questions
 * tagged for the given Batch 1 post slug. Each Batch 1 publish
 * page (T179) calls this with its own slug to emit a topic-
 * specific FAQPage rather than a duplicate of every other
 * post's structured data.
 */
export const batchPostFaqJsonLd = (slug: BatchPostSlug): FaqPageJsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: BATCH_1_FAQS.filter((faq) => faq.posts.includes(slug)).map(
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
 * Returns the FAQs targeted at a given Batch 1 post slug.
 * The Batch 1 publish pages (T179) iterate this for the
 * human-rendered accordion surface (PricingFaq.astro idiom).
 */
export const batchPostFaqs = (
  slug: BatchPostSlug,
): ReadonlyArray<BatchFaq> =>
  BATCH_1_FAQS.filter((faq) => faq.posts.includes(slug));
