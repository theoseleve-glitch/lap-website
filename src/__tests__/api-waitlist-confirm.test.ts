// T095 — unit tests for the GET /api/waitlist/confirm handler. This
// is the back half of the T094 double-opt-in flow: the visitor
// clicks the link in the confirmation email; this handler verifies
// the HMAC-signed token, commits the contact to the Resend
// "waitlist" audience (the deferred-from-T094 step), then 303s to
// /waitlist/welcome.
//
// All token-failure paths fold into ONE response — 303 redirect to
// /waitlist?status=invalid. Distinguishing "expired" from "tampered"
// in the response would give an attacker a confirmation oracle for
// poking at the token format. One redirect, one shape.
//
// Default fetch mock returns 201 for the Resend audiences POST
// (the success shape). Individual tests override per case.

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { onRequestGet } from '../../functions/api/waitlist/confirm';
import { signEmailToken } from '../../functions/_lib/waitlist-token';

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
      ? 'https://lap-coach.racing/api/waitlist/confirm'
      : `https://lap-coach.racing/api/waitlist/confirm?token=${encodeURIComponent(token)}`;
  return new Request(url, { method: 'GET' });
}

const fetchMock = vi.fn();

function defaultFetchMockImpl(url: string | URL | Request) {
  const urlString = typeof url === 'string' ? url : url.toString();
  if (urlString.includes('api.resend.com/audiences')) {
    return Promise.resolve(
      new Response(JSON.stringify({ id: 'contact_xyz' }), {
        status: 201,
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

describe('T095 — token validation', () => {
  test('missing token query param redirects 303 to /waitlist?status=invalid', async () => {
    const response = await onRequestGet({ request: buildRequest(undefined), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
    // No Resend call — bad token never reaches the audience.
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
  });

  test('empty token redirects 303 to /waitlist?status=invalid', async () => {
    const response = await onRequestGet({ request: buildRequest(''), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
  });

  test('malformed token (wrong segment count) redirects 303 to /waitlist?status=invalid', async () => {
    const response = await onRequestGet({ request: buildRequest('only.two'), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
  });

  test('tampered HMAC redirects 303 to /waitlist?status=invalid', async () => {
    const valid = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const tampered = valid.slice(0, -1) + (valid.endsWith('0') ? '1' : '0');
    const response = await onRequestGet({ request: buildRequest(tampered), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
  });

  test('expired token redirects 303 to /waitlist?status=invalid', async () => {
    const expired = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET, -1);
    const response = await onRequestGet({ request: buildRequest(expired), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
  });

  test('token signed with a different secret redirects 303 to /waitlist?status=invalid', async () => {
    const wrongSecret = await signEmailToken(
      'driver@example.com',
      'completely_different_secret_value_here',
    );
    const response = await onRequestGet({ request: buildRequest(wrongSecret), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist?status=invalid');
  });
});

describe('T095 — Resend audience-add on valid confirmation', () => {
  test('valid token POSTs to api.resend.com/audiences/{id}/contacts', async () => {
    const token = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    await onRequestGet({ request: buildRequest(token), env: ENV });
    const audiencesCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes(`api.resend.com/audiences/${ENV.RESEND_AUDIENCE_ID}/contacts`),
    );
    expect(audiencesCall).toBeDefined();
  });

  test('audience-add carries the verified email + unsubscribed:false in the JSON body', async () => {
    const token = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    await onRequestGet({ request: buildRequest(token), env: ENV });
    const audiencesCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('api.resend.com/audiences'),
    );
    expect(audiencesCall).toBeDefined();
    const init = audiencesCall![1] as RequestInit;
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string) as { email: string; unsubscribed: boolean };
    expect(body.email).toBe('driver@example.com');
    expect(body.unsubscribed).toBe(false);
  });

  test('audience-add carries Authorization: Bearer + Resend API key', async () => {
    const token = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    await onRequestGet({ request: buildRequest(token), env: ENV });
    const audiencesCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('api.resend.com/audiences'),
    );
    const init = audiencesCall![1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${ENV.RESEND_API_KEY}`);
  });

  test('successful audience-add redirects 303 to /waitlist/welcome', async () => {
    const token = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(token), env: ENV });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/waitlist/welcome');
  });

  test('Resend 5xx on audience-add returns 502 (signal retry-later, not user-error)', async () => {
    fetchMock.mockImplementation((url) => {
      const u = String(url);
      if (u.includes('api.resend.com/audiences')) {
        return Promise.resolve(new Response('upstream down', { status: 503 }));
      }
      return defaultFetchMockImpl(url);
    });
    const token = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(token), env: ENV });
    expect(response.status).toBe(502);
  });
});

describe('T095 — environment safety', () => {
  test('missing RESEND_API_KEY returns 500', async () => {
    const broken = { ...ENV, RESEND_API_KEY: '' };
    const token = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(token), env: broken });
    expect(response.status).toBe(500);
  });

  test('missing RESEND_AUDIENCE_ID returns 500', async () => {
    const broken = { ...ENV, RESEND_AUDIENCE_ID: '' };
    const token = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(token), env: broken });
    expect(response.status).toBe(500);
  });

  test('missing WAITLIST_TOKEN_SECRET returns 500 (cannot verify any token)', async () => {
    const broken = { ...ENV, WAITLIST_TOKEN_SECRET: '' };
    const token = await signEmailToken('driver@example.com', ENV.WAITLIST_TOKEN_SECRET);
    const response = await onRequestGet({ request: buildRequest(token), env: broken });
    expect(response.status).toBe(500);
  });
});
