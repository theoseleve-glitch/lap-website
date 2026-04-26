// T203 — unit tests for the /api/for-schools Cloudflare Pages
// Function. Mirrors the api-waitlist.test.ts shape. T203 lands
// the validation + 303 success redirect; T204 layers the Resend
// send to sales@lap-coach.racing + confirmation email back to
// the submitter (verified there). The handler runs on Cloudflare
// Pages after T008 (BLOCKED on infra); these tests prove the
// logic against synthetic Request objects so the endpoint is
// review-and-tested ahead of deploy.

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/for-schools';

interface TestEnv {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
}

const ENV: TestEnv = {
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  RESEND_API_KEY: 'test_api_key',
};

const VALID_FIELDS = {
  name: 'Alex Driver',
  school: 'Pyrenees Karting Academy',
  'students-count': '24',
  email: 'alex@pyreneeskarting.example',
  message: 'We run a 24-driver programme across the season; happy to talk.',
  consent: 'on',
};

function buildRequest(fields: Record<string, string>) {
  const params = new URLSearchParams({
    'cf-turnstile-response': 'valid_test_token',
    ...fields,
  });
  return new Request('https://lap-coach.racing/api/for-schools', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
}

const fetchMock = vi.fn();

function defaultFetchMockImpl(url: string | URL | Request) {
  const urlString = typeof url === 'string' ? url : url.toString();
  if (urlString.includes('challenges.cloudflare.com/turnstile/v0/siteverify')) {
    return Promise.resolve(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
  // T204 layers the Resend /emails calls; T203 doesn't issue any
  // network request beyond Turnstile siteverify. Catch-all returns
  // 200 so accidental new fetches don't fail the test silently.
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

describe('T203 — validation: required fields', () => {
  test('missing name returns 400', async () => {
    const { name: _omit, ...rest } = VALID_FIELDS;
    void _omit;
    const response = await onRequestPost({ request: buildRequest(rest), env: ENV });
    expect(response.status).toBe(400);
  });

  test('missing school returns 400', async () => {
    const { school: _omit, ...rest } = VALID_FIELDS;
    void _omit;
    const response = await onRequestPost({ request: buildRequest(rest), env: ENV });
    expect(response.status).toBe(400);
  });

  test('missing students-count returns 400', async () => {
    const { 'students-count': _omit, ...rest } = VALID_FIELDS;
    void _omit;
    const response = await onRequestPost({ request: buildRequest(rest), env: ENV });
    expect(response.status).toBe(400);
  });

  test('missing email returns 400', async () => {
    const { email: _omit, ...rest } = VALID_FIELDS;
    void _omit;
    const response = await onRequestPost({ request: buildRequest(rest), env: ENV });
    expect(response.status).toBe(400);
  });

  test('missing message returns 400', async () => {
    const { message: _omit, ...rest } = VALID_FIELDS;
    void _omit;
    const response = await onRequestPost({ request: buildRequest(rest), env: ENV });
    expect(response.status).toBe(400);
  });

  test('blank fields are treated as missing (no whitespace bypass)', async () => {
    const response = await onRequestPost({
      request: buildRequest({ ...VALID_FIELDS, name: '   ' }),
      env: ENV,
    });
    expect(response.status).toBe(400);
  });
});

describe('T203 — validation: field shape', () => {
  test('invalid email format returns 400', async () => {
    const response = await onRequestPost({
      request: buildRequest({ ...VALID_FIELDS, email: 'not-an-email' }),
      env: ENV,
    });
    expect(response.status).toBe(400);
  });

  test('students-count = 0 returns 400 (must be ≥ 1)', async () => {
    const response = await onRequestPost({
      request: buildRequest({ ...VALID_FIELDS, 'students-count': '0' }),
      env: ENV,
    });
    expect(response.status).toBe(400);
  });

  test('students-count negative returns 400', async () => {
    const response = await onRequestPost({
      request: buildRequest({ ...VALID_FIELDS, 'students-count': '-5' }),
      env: ENV,
    });
    expect(response.status).toBe(400);
  });

  test('students-count non-numeric returns 400', async () => {
    const response = await onRequestPost({
      request: buildRequest({ ...VALID_FIELDS, 'students-count': 'lots' }),
      env: ENV,
    });
    expect(response.status).toBe(400);
  });
});

describe('T203 — GDPR consent (Article 7)', () => {
  test('missing consent returns 400', async () => {
    const { consent: _omit, ...rest } = VALID_FIELDS;
    void _omit;
    const response = await onRequestPost({ request: buildRequest(rest), env: ENV });
    expect(response.status).toBe(400);
  });
});

describe('T203 — Turnstile spam check', () => {
  test('missing turnstile token returns 400', async () => {
    const params = new URLSearchParams(VALID_FIELDS);
    const request = new Request('https://lap-coach.racing/api/for-schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(400);
  });

  test('turnstile siteverify failure returns 400', async () => {
    fetchMock.mockImplementation((url: string | URL | Request) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes('challenges.cloudflare.com/turnstile/v0/siteverify')) {
        return Promise.resolve(
          new Response(JSON.stringify({ success: false }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      return defaultFetchMockImpl(url);
    });
    const response = await onRequestPost({
      request: buildRequest(VALID_FIELDS),
      env: ENV,
    });
    expect(response.status).toBe(400);
  });
});

describe('T203 — success path: 303 redirect to /for-schools?status=submitted', () => {
  test('valid POST returns 303', async () => {
    const response = await onRequestPost({
      request: buildRequest(VALID_FIELDS),
      env: ENV,
    });
    expect(response.status).toBe(303);
  });

  test('Location header points to /for-schools?status=submitted', async () => {
    const response = await onRequestPost({
      request: buildRequest(VALID_FIELDS),
      env: ENV,
    });
    expect(response.headers.get('Location')).toBe('/for-schools?status=submitted');
  });
});

describe('T203 — server misconfiguration', () => {
  test('missing TURNSTILE_SECRET_KEY returns 500', async () => {
    const response = await onRequestPost({
      request: buildRequest(VALID_FIELDS),
      env: { ...ENV, TURNSTILE_SECRET_KEY: '' },
    });
    expect(response.status).toBe(500);
  });
});
