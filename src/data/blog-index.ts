// T191 — blog cluster index. Single source of truth for the
// /blog listing page (and any future related-posts /
// taxonomy / RSS surfaces in T194-T196). Each entry is the
// card-format metadata for one published post; the longer
// per-page TITLE/DESCRIPTION used by the actual publish
// page surface continues to live inline on each
// src/pages/blog/<slug>.astro file.
//
// Categories:
//   * pillar — the 4 long-form anchor articles (one per
//     content cluster pillar)
//   * technique-deep-dive — Batch 1 (T171-T180) coaching-rule
//     deep-dives, technique-physics framing
//   * founder-story — Batch 2 (T181-T190) founder/product
//     stories, doctrine-anchored positioning

export type BlogCategory =
  | 'pillar'
  | 'technique-deep-dive'
  | 'founder-story';

/**
 * Typed taxonomy of post tags. Closed union so a typo at
 * the entry site fails at compile time rather than
 * producing an orphan tag page.
 */
export const BLOG_TAGS = [
  'braking',
  'throttle',
  'apex',
  'consistency',
  'sim-vs-real',
  'coaching-framework',
  'positioning',
  'build-in-public',
] as const;

export type BlogTag = (typeof BLOG_TAGS)[number];

export interface BlogPostIndexEntry {
  /** URL slug — page lives at /blog/{slug} */
  readonly slug: string;
  /** Card-format title (≤80 chars target). */
  readonly title: string;
  /** Card-format description (≤200 chars target). */
  readonly description: string;
  /** Cluster category for grouping on the listing page. */
  readonly category: BlogCategory;
  /** Topic tags for filtering on /blog/tag/[tag] pages. */
  readonly tags: ReadonlyArray<BlogTag>;
  /** ISO 8601 publication date (YYYY-MM-DD). */
  readonly datePublished: string;
}

export const BLOG_INDEX: ReadonlyArray<BlogPostIndexEntry> = [
  // ─── Pillar guides (long-form anchor articles) ──────────
  {
    slug: 'sim-to-real-transfer',
    title: 'Sim to real-life racing transfer',
    description:
      'What carries over from sim training to real-world driving, and what does not. The mental model transfers; the seat-of-pants calibration does not.',
    category: 'pillar',
    tags: ['sim-vs-real'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'what-is-trail-braking',
    title: 'What is trail braking',
    description:
      'How to measure trail braking in your own telemetry, the front-axle physics behind why it works, and the trace signatures that distinguish clean technique from a stab-and-lift release.',
    category: 'pillar',
    tags: ['braking'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'best-sim-racing-telemetry-app',
    title: 'Sim racing telemetry app comparison',
    description:
      'Six tools across six dimensions. Which is the right tool for which workflow, and why the comparison universe sorts cleanly by persona rather than by feature checklist.',
    category: 'pillar',
    tags: ['positioning'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'driver-development-plan',
    title: 'Driver development plan: the framework',
    description:
      'Diagnose, prescribe, execute, measure, adapt. Five framework verbs that close the loop on practice between sessions, run on whichever telemetry tool the driver already uses.',
    category: 'pillar',
    tags: ['coaching-framework'],
    datePublished: '2026-04-26',
  },

  // ─── Technique deep-dives (Batch 1) ─────────────────────
  {
    slug: 'late-braking-at-t1',
    title: 'Late braking at T1: what your telemetry is saying',
    description:
      'Three signatures in the brake-pressure trace that distinguish late-but-rotating from late-and-broken at Turn 1, and why peak-pressure timing is the leading indicator.',
    category: 'technique-deep-dive',
    tags: ['braking'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'throttle-pickup-smooth-vs-aggressive',
    title: 'Throttle pickup: smooth versus aggressive',
    description:
      'When the corner radius asks for a smooth ramp from zero to full, and when it asks for stab-and-plateau. The traction-circle physics that decides which the trace should show.',
    category: 'technique-deep-dive',
    tags: ['throttle'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'apex-speed-corner-commitment',
    title: 'Apex speed: corner commitment, measured',
    description:
      'Why minimum speed at the apex is a better leading indicator than fastest lap, and how the under-committer / over-committer distinction sorts the lap-time deficit into two opposite fixes.',
    category: 'technique-deep-dive',
    tags: ['apex'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'consistency-over-raw-pace',
    title: 'Consistency over raw pace',
    description:
      'Why race results depend on the median lap, not the fastest. The standard-deviation discipline, the spike-pattern failure mode, and how to measure consistency from session data.',
    category: 'technique-deep-dive',
    tags: ['consistency'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'tire-management-endurance',
    title: 'Tire management in endurance racing',
    description:
      'How to read the leading indicators of tire degradation in the brake-pressure trace eight laps before the lap-time signal arrives, and why endurance amplifies the consistency asymmetry.',
    category: 'technique-deep-dive',
    tags: ['consistency'],
    datePublished: '2026-04-26',
  },

  // ─── Founder & product stories (Batch 2) ────────────────
  {
    slug: 'why-im-building-lap-not-motec-clone',
    title: 'Why we are building LAP, not another MoTeC clone',
    description:
      'MoTeC is a trace-reading tool for the engineer between driver and data; LAP is a coaching surface for the driver alone with the data. The persona-mismatch positioning argument.',
    category: 'founder-story',
    tags: ['positioning'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'sim-to-real-gap-honest-look',
    title: 'The sim-to-real gap: an honest look',
    description:
      'Shapes transfer between sim and real, magnitudes do not. The doctrine claim made concrete with the four magnitudes that will not transfer: tire feel, G-force, fear, weather adaptation.',
    category: 'founder-story',
    tags: ['sim-vs-real'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'designing-coaching-drivers-follow',
    title: 'Designing coaching that drivers actually follow',
    description:
      'A followable prescription has anatomy: weakness shape, drill name, success criterion, review cadence. Why "be smoother on entry" is observation-shaped and not prescription-shaped.',
    category: 'founder-story',
    tags: ['coaching-framework'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'pre-launch-month-in-numbers',
    title: 'The pre-launch month in numbers',
    description:
      'First of a recurring monthly build-in-public update. The numbers attached, including the unflattering ones: 19 ADRs, 4 pillars, 8 supporting posts, no paying customers yet.',
    category: 'founder-story',
    tags: ['build-in-public'],
    datePublished: '2026-04-26',
  },
  {
    slug: 'what-were-not-building',
    title: 'What we are NOT building, and why',
    description:
      'Six exclusions documented in public — language-model coaching, real-time in-cockpit coaching, racing-team-engineer tooling, gamification, setup widgets, and prescriptions when the rule library cannot diagnose.',
    category: 'founder-story',
    tags: ['positioning', 'build-in-public'],
    datePublished: '2026-04-26',
  },
  // ─── Launch-day announcement (T211) ─────────────────────
  // Scheduled for public-beta launch on 2026-07-23; ships
  // in source today with date-anchored copy that reads
  // accurately whether visited before or after the date.
  {
    slug: 'introducing-lap',
    title: 'Introducing LAP — public beta on 2026-07-23',
    description:
      'Launch-day note from the founding team. What LAP is, what ships in public beta, what V1 adds in September, and the four commitments LAP refuses to relax — including the no-language-model-coaching one.',
    category: 'founder-story',
    tags: ['positioning', 'build-in-public'],
    datePublished: '2026-07-23',
  },
];

/** Returns the deduplicated set of tags actually used by posts. */
export const listAllTags = (): ReadonlyArray<BlogTag> => {
  const seen = new Set<BlogTag>();
  for (const post of BLOG_INDEX) {
    for (const tag of post.tags) {
      seen.add(tag);
    }
  }
  return Array.from(seen);
};

/** Filters BLOG_INDEX to posts that include the given tag. */
export const postsByTag = (
  tag: BlogTag,
): ReadonlyArray<BlogPostIndexEntry> =>
  BLOG_INDEX.filter((p) => p.tags.includes(tag));
