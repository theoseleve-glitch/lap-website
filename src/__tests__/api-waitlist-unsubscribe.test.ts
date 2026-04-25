// T100 — unit tests for GET /api/waitlist/unsubscribe. The handler
// verifies the unsubscribe token, then PATCHes the contact in the
// Resend audience to set `unsubscribed: true` (soft opt-out: keeps
// the audit-trail record while excluding from future broadcasts).
//
// Why GET-as-action despite the prefetch risk: GDPR Article 7
// requires withdrawal-as-easy-as-consent. A two-step click-then-
// confirm flow asymmetrically friction-loads the unsubscribe vs
// the consent (a single form-submit). The list-unsubscribe email
// header (RFC 8058) handles the prefetch concern at a different
// layer — out of this task's scope but a future enhancement.
//
// All token-failure paths fold into one redirect, same posture as
// the T095 confirm handler: no failure-mode oracle.

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { onRequestGet } from '../../functions/api/waitlist/unsubscribe';
import { signEmailToken, signUnsubscribeToken } from '../../functions/_lib/waitlist-token';

interface TestEnv {
  RESEND_API_KEY: string;
  RESEND_AUDIENCE_ID: string;
  WAITLIST_TOKEN_SECRET: string;
}

const ENV: TestEnv = {
  RESEND_API_KEY: 'test_api_key',
  RESEND_AUDIENCE_ID: 'aud_test',
  WAITLIST_TOKEN_SECRET: 'test_waitlist_token_secret_at_least_32_chars',
};

function buildRequest(token?: string): Request {
  const url =
    token === undefined
      ? 'https://lap-coach.racing/api/waitlist/unsubscribe'
      : `https://lap-coach.racing/api/waitlist/unsubscribe?token=${encodeURIComponent(token)}`;
  return new Request(url, { method: 'GET' });
}

const fetchMock = vi.fn();

function defaultFetchMockImpl(url: string | URL | Request) {
  const urlString = typeof url === 'string' ? url : url.toString();
  if (urlString.includes('api.resend.com/audiences')) {
    return Promise.resolve(
      new Response(JSON.stringify({ id: 'contact_xyz', unsubscribed: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
  return Promise.resolve(new Response('{}', { status: 200 }));
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(defaultFetchMockImpl);
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('T100 — token validation', () => {
  test('missing token redirects 303 to /waitlist?status=invalid', async () => {
    const response = await onRequestGet({ request: buildRequest(undefined), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
  });

  test('empty token redirects 303 to /waitlist?status=invalid', async () => {
    const response = await onRequestGet({ request: buildRequest(''), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
  });

  test('malformed token redirects 303 to /waitlist?status=invalid', async () => {
    const response = await onRequestGet({ request: buildRequest('only-one-segment'), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
  });

  test('tampered HMAC redirects 303 to /waitlist?status=invalid', async () => {
    const valid = await signUnsubscribeToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const tampered = valid.slice(0, -1) + (valid.endsWith('0') ? '1' : '0');
    const response = await onRequestGet({ request: buildRequest(tampered), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
  });

  test('confirmation token (cross-domain replay) redirects 303 to /waitlist?status=invalid', async () => {
    // CRITICAL: a token signed for the confirm flow must NOT pass
    // unsubscribe verification, even though it carries the same
    // email + same secret. Domain separation via the purpose-tag
    // payload is the test's whole point.
    const confirmToken = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(confirmToken), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
  });
});

describe('T100 — Resend audience PATCH on valid unsubscribe', () => {
  test('valid token PATCHes api.resend.com/audiences/{id}/contacts/{email}', async () => {
    const token = await signUnsubscribeToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    await onRequestGet({ request: buildRequest(token), env: ENV });
    const patchCall = fetchMock.mock.calls.find((c) => {
      const url = String(c[0]);
      return (
        url.includes(
          `api.resend.com/audiences/${ENV.RESEND_AUDIENCE_ID}/contacts/driver%40example.com`,
        ) ||
        url.includes(
          `api.resend.com/audiences/${ENV.RESEND_AUDIENCE_ID}/contacts/driver@example.com`,
        )
      );
    });
    expect(patchCall).toBeDefined();
  });

  test('PATCH method + JSON body { unsubscribed: true }', async () => {
    const token = await signUnsubscribeToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    await onRequestGet({ request: buildRequest(token), env: ENV });
    const patchCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('api.resend.com/audiences'),
    );
    expect(patchCall).toBeDefined();
    const init = patchCall![1] as RequestInit;
    expect(init.method).toBe('PATCH');
    const body = JSON.parse(init.body as string) as { unsubscribed: boolean };
    expect(body.unsubscribed).toBe(true);
  });

  test('PATCH carries Authorization: Bearer + Resend API key', async () => {
    const token = await signUnsubscribeToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    await onRequestGet({ request: buildRequest(token), env: ENV });
    const patchCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('api.resend.com/audiences'),
    );
    const init = patchCall![1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${ENV.RESEND_API_KEY}`);
  });

  test('successful PATCH redirects 303 to /waitlist/unsubscribed', async () => {
    const token = await signUnsubscribeToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(token), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist/unsubscribed');
  });

  test('Resend 5xx on PATCH returns 502 (retry-later, not user-error)', async () => {
    fetchMock.mockImplementation((url) => {
      const u = String(url);
      if (u.includes('api.resend.com/audiences')) {
        return Promise.resolve(new Response('upstream down', { status: 503 }));
      }
      return defaultFetchMockImpl(url);
    });
    const token = await signUnsubscribeToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(token), env: ENV });
    expect(response.status).toBe(502);
  });
});

describe('T100 — environment safety', () => {
  test('missing RESEND_API_KEY returns 500', async () => {
    const broken = { ...ENV, RESEND_API_KEY: '' };
    const token = await signUnsubscribeToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(token), env: broken });
    expect(response.status).toBe(500);
  });

  test('missing RESEND_AUDIENCE_ID returns 500', async () => {
    const broken = { ...ENV, RESEND_AUDIENCE_ID: '' };
    const token = await signUnsubscribeToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(token), env: broken });
    expect(response.status).toBe(500);
  });

  test('missing WAITLIST_TOKEN_SECRET returns 500', async () => {
    const broken = { ...ENV, WAITLIST_TOKEN_SECRET: '' };
    const token = await signUnsubscribeToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(token), env: broken });
    expect(response.status).toBe(500);
  });
});
