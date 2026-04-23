import { expect, test } from 'vitest';
import { postHogInitOptions } from '../scripts/posthog';

test('cookieless: persistence is memory (no localStorage, no cookies, no consent)', () => {
  // CLAUDE.md forbids "tracking that requires consent on initial page-load".
  // persistence:'memory' is the PostHog config switch that makes this true.
  const opts = postHogInitOptions();
  expect(opts.persistence).toBe('memory');
});

test('marketing-site profile: autocapture off, pageview on, session recording off', () => {
  const opts = postHogInitOptions();
  expect(opts.autocapture).toBe(false);
  expect(opts.capture_pageview).toBe(true);
  expect(opts.disable_session_recording).toBe(true);
});

test('defaults api_host to https://us.i.posthog.com', () => {
  const opts = postHogInitOptions();
  expect(opts.api_host).toBe('https://us.i.posthog.com');
});

test('honours a custom api_host', () => {
  const opts = postHogInitOptions('https://eu.i.posthog.com');
  expect(opts.api_host).toBe('https://eu.i.posthog.com');
});

test('treats empty-string host as absent and falls back to the default', () => {
  // Env vars read out as '' when the key is declared but not populated; that's
  // the same as "not set" from our perspective — a user misconfig shouldn't
  // route pageviews to an empty-string host.
  const opts = postHogInitOptions('');
  expect(opts.api_host).toBe('https://us.i.posthog.com');
});
