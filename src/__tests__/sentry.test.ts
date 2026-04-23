import { expect, test } from 'vitest';
import { sentryInitOptions } from '../scripts/sentry';

test('passes DSN through to init options', () => {
  const opts = sentryInitOptions('https://key@o0.ingest.sentry.io/1');
  expect(opts.dsn).toBe('https://key@o0.ingest.sentry.io/1');
});

test('environment defaults to "production" when not supplied', () => {
  const opts = sentryInitOptions('dsn');
  expect(opts.environment).toBe('production');
});

test('environment honours an explicit override', () => {
  const opts = sentryInitOptions('dsn', 'preview');
  expect(opts.environment).toBe('preview');
});

test('treats empty-string environment as absent and falls back to "production"', () => {
  // Matches the empty-string env-var handling T014 locked in for the
  // PostHog integration — a declared-but-unpopulated PUBLIC_SENTRY_ENV
  // should not route all events into an empty-string bucket.
  const opts = sentryInitOptions('dsn', '');
  expect(opts.environment).toBe('production');
});

test('performance monitoring is off (tracesSampleRate: 0)', () => {
  // Marketing site error-capture only — no BrowserTracing.
  const opts = sentryInitOptions('dsn');
  expect(opts.tracesSampleRate).toBe(0);
});

test('integrations array is empty so no Replay / BrowserTracing code is pulled in', () => {
  // Default integrations (GlobalHandlers, Breadcrumbs, etc.) still apply —
  // this only asserts that we do not OPT IN to the heavyweight extras.
  const opts = sentryInitOptions('dsn');
  expect(opts.integrations).toEqual([]);
});
