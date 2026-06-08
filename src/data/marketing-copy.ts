// Central, claim-governed marketing copy for the cinematic redesign.
//
// Every string here must pass src/__tests__/claim-governance.test.ts — no
// AI-coach / LLM / dormant-feature claims, and monthly-only pricing language
// (spec §4 / §4a). Keep ALL user-facing headline/body copy here so the guard
// covers it.

export const HERO = {
  eyebrow: 'The cross-platform Driver OS',
  headline: "Find the seconds you're leaving on track.",
  subhead:
    'LAP turns every sim and real session into a corner-by-corner plan you can execute — then checks you actually did it next time out.',
  primaryCta: 'Start 30-day free trial',
  primaryHref: '/register',
  secondaryCta: 'See how it works',
  secondaryHref: '/how-it-works',
  trust: '30-day free trial · no card to start · cancel anytime',
} as const;

// The honest-engine differentiator (outcome-led, no chatbot claims).
export const DIFFERENTIATOR =
  'Named, rule-based coaching from 75 telemetry patterns — not a chatbot guess. Every prescription is checked on your next session.';

export const FIRST_VALUE_PROMISE = 'Your first analysis in under five minutes.';

export const VALUE_ANCHOR = 'Less than one track-day entry a month.';

// "What happens after you sign up" — seeds accurate retention expectations.
export const POST_SIGNUP_STEPS = [
  {
    n: '01',
    label: 'Upload a session',
    body: 'Drop a sim or real session — RaceChrono, RaceBox, AiM or MoTeC CSV, or capture live from iRacing and ACC.',
  },
  {
    n: '02',
    label: 'See where you lost time',
    body: 'A 0–100 score across four pillars and a corner-by-corner breakdown of exactly where the lap went.',
  },
  {
    n: '03',
    label: 'Get your plan',
    body: 'Targeted drills with a clear success target — checked automatically on your next session.',
  },
] as const;

export const SECTIONS = {
  problem: {
    eyebrow: 'The problem',
    headline: 'Timing screens and a CSV. Neither tells you how to get faster.',
  },
  loop: {
    eyebrow: 'The loop',
    headline: 'Capture. Analyze. Plan. Improve.',
    steps: [
      {
        code: '01 · CAPTURE',
        title: 'Capture',
        body: 'Sim or real — one driver profile across iRacing, ACC, kart and car.',
      },
      {
        code: '02 · ANALYZE',
        title: 'Analyze',
        body: 'An instant 0–100 score and per-corner diagnosis the moment your session lands.',
      },
      {
        code: '03 · PLAN',
        title: 'Plan',
        body: 'The corners to fix next, each with a measurable target.',
      },
      {
        code: '04 · IMPROVE',
        title: 'Improve',
        body: 'Run it back. LAP checks whether you hit the target — then sets the next one.',
      },
    ],
  },
  score: {
    eyebrow: 'The score',
    headline: 'A 0–100 score that names which pillar to fix.',
    pillars: ['Pace', 'Consistency', 'Execution', 'Robustness'],
  },
  corner: {
    eyebrow: 'Corner coaching',
    headline: 'The exact corner, the exact fix.',
    body: 'Brake points, apex speed, line quality — diagnosed corner by corner and tied to the time you lost.',
  },
  crossPlatform: {
    eyebrow: 'One profile',
    headline: 'Sim and real, in one driver profile.',
    body: 'Capture from the desktop logger (iRacing and ACC), your phone, or any RaceChrono / RaceBox / AiM / MoTeC CSV. Up to three linked devices.',
  },
  trust: {
    eyebrow: 'Why trust it',
    headline: 'Coaching you can read, not a black box.',
    body: DIFFERENTIATOR,
  },
  finalCta: {
    eyebrow: 'Get started',
    headline: 'Stop guessing. Start improving.',
  },
} as const;
