import posthog from 'posthog-js';

export interface PostHogCookielessOptions {
  api_host: string;
  persistence: 'memory';
  disable_session_recording: boolean;
  autocapture: boolean;
  capture_pageview: boolean;
}

const DEFAULT_API_HOST = 'https://us.i.posthog.com';

/**
 * PostHog init options locked to the cookieless + pageview-only profile
 * mandated by CLAUDE.md and ADR-018's doctrine alignment. Persistence lives
 * only in memory, so no consent banner is required on initial page-load;
 * autocapture is off because the marketing site does not need
 * click/form-interaction telemetry; session recording is off for the same
 * reason.
 */
export function postHogInitOptions(apiHost?: string): PostHogCookielessOptions {
  return {
    api_host: apiHost && apiHost.length > 0 ? apiHost : DEFAULT_API_HOST,
    persistence: 'memory',
    disable_session_recording: true,
    autocapture: false,
    capture_pageview: true,
  };
}

export function initPostHog(): void {
  const key = import.meta.env.PUBLIC_POSTHOG_KEY;
  if (typeof key !== 'string' || key.length === 0) return;
  const host = import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined;
  posthog.init(key, postHogInitOptions(host));
}

if (typeof window !== 'undefined') {
  initPostHog();
}
