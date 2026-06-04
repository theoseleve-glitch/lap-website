// Single source of truth for the marketing site's membership copy.
// Mirrors the webapp pricing canon (June-8 launch): ONE membership, €19.90/mo,
// €14.90/mo for the first 50 founding members, 30-day free trial, monthly only,
// no free tier, no annual, no B2B. EUR is the charged currency.

export const MEMBERSHIP = {
  name: 'LAP COACH',
  standardMonthly: '€19.90',
  foundingMonthly: '€14.90',
  foundingLimit: 50,
  trialDays: 30,
  currencyNote: 'billed in EUR · cancel anytime',
  ctaText: 'Start 30-day free trial',
  ctaHref: '/register',
} as const;

export interface FeatureGroup {
  heading: string;
  items: string[];
}

// Full access — every member gets everything (no per-tier gating).
export const MEMBERSHIP_FEATURES: FeatureGroup[] = [
  {
    heading: 'Coaching & analysis',
    items: [
      'Unlimited session uploads & analysis',
      '4-pillar scoring — Pace, Consistency, Execution, Robustness',
      'Per-corner coaching with time-loss breakdown',
      'Session comparison & progression tracking',
      'Coaching plans & targeted drills',
      'Visualization workspace',
    ],
  },
  {
    heading: 'Race strategy & live',
    items: [
      'Race strategy dashboard — unlimited duration, all optimizer modes',
      'Pit-stop & stint planning',
      'Live pace & stint monitoring',
      'Gamification & achievements',
    ],
  },
  {
    heading: 'Data, reports & devices',
    items: [
      'PDF reports & API access',
      'Logger auto-sync — RaceChrono, RaceBox, AiM, MoTeC (CSV)',
      'Up to 3 linked devices',
      '12-month raw telemetry retention',
      '5-year report retention',
    ],
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const MEMBERSHIP_FAQ: Faq[] = [
  {
    q: 'How does the free trial work?',
    a: 'Every membership starts with a 30-day free trial with full access — no feature is held back. You are only charged when the trial ends, and you can cancel any time before then at no cost.',
  },
  {
    q: 'What is the Founding offer?',
    a: 'The first 50 members lock in €14.90/mo for as long as their membership stays active — €5/mo below the standard €19.90. Once the 50 founding places are taken, new memberships are €19.90/mo.',
  },
  {
    q: 'Is there a free tier?',
    a: 'No. There is one membership that unlocks the entire product, with a 30-day free trial so you can try it in full before paying.',
  },
  {
    q: 'Is billing monthly or annual?',
    a: 'Monthly only. No annual commitment, no long contracts — cancel any time.',
  },
  {
    q: 'Which loggers and platforms are supported?',
    a: 'RaceChrono, RaceBox, AiM, and MoTeC CSV exports with GPS data, for both kart and car. The pipeline auto-detects formats — no manual configuration.',
  },
  {
    q: 'Can I cancel any time?',
    a: 'Yes. Cancel during the trial and you are never charged. Cancel after and your membership runs to the end of the paid month.',
  },
];
