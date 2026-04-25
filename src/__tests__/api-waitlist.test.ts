import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/waitlist';

// T092 + T093 — unit tests for the /api/waitlist Cloudflare Pages
// Function. The handler runs on Cloudflare's edge after T008
// (BLOCKED until the Pages project lands); these tests prove
// the logic against synthetic Request objects and a mocked
// fetch so the code is reviewed-and-tested before deployment
// rather than after a production submission silently fails.
//
// T093 added Turnstile verification ahead of the Resend forward.
// The default fetch mock handles BOTH the Turnstile siteverify
// endpoint (returning success:true) and the Resend audience
// endpoint (returning 200) so existing tests stay focused on
// the field they're meant to assert; individual tests override
// the mock when they need a Turnstile-specific or Resend-specific
// response.

interface TestEnv {
  RESEND_API_KEY: string;
  RESEND_AUDIENCE_ID: string;
  TURNSTILE_SECRET_KEY: string;
}

const ENV: TestEnv = {
  RESEND_API_KEY: 'test_api_key',
  RESEND_AUDIENCE_ID: 'aud_test',
  // Cloudflare's documented "always pass" test secret key — public
  // test fixture, not a secret. Mirrors the always-pass site key
  // used as the WaitlistForm default.
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
};

function buildRequest(fields: Record<string, string>) {
  // Default the Turnstile token so existing T092 validation tests
  // continue to assert the field they're meant to assert. Tests
  // that want to exercise the Turnstile path override 'cf-turnstile-response'
  // explicitly.
  const params = new URLSearchParams({
    'cf-turnstile-response': 'valid_test_token',
    ...fields,
  });
  return new Request('https://lap-coach.racing/api/waitlist', {
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
  if (urlString.includes('api.resend.com/audiences')) {
    return Promise.resolve(
      new Response(JSON.stringify({ data: { id: 'contact_xyz' } }), {
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

describe('T092 — input validation', () => {
  test('missing email field returns 400', async () => {
    const request = buildRequest({ consent: 'on' });
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(400);
    // Field-validation rejects fire BEFORE any upstream call —
    // neither Turnstile nor Resend should be hit.
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
  });

  test('blank email returns 400 (no whitespace bypass)', async () => {
    const request = buildRequest({ email: '   ', consent: 'on' });
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(400);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
  });

  test('invalid email format (no @) returns 400', async () => {
    // Native HTML form validation (T091 type=email) catches this
    // client-side, but a curl POST or JS-disabled browser bypass
    // would skip the client gate. Server-side validation is the
    // belt-and-braces. The pattern matches "x@y.z" — the simplest
    // honest predicate; full RFC 5322 is overengineering for a
    // mailing list.
    const request = buildRequest({ email: 'not-an-email', consent: 'on' });
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(400);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
  });

  test('missing consent (unchecked checkbox) returns 400 — GDPR Article 7', async () => {
    // HTML forms omit unchecked checkbox fields entirely from the
    // submission. consent === null is the unchecked path. Without
    // the affirmative checkbox tick, GDPR Article 7 informed
    // consent fails — the function MUST refuse to forward.
    const request = buildRequest({ email: 'driver@example.com' });
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(400);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
  });
});

describe('T092 — Resend forwarding', () => {
  test('valid POST forwards to Resend audience contacts API', async () => {
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    await onRequestPost({ request, env: ENV });

    const resendCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('api.resend.com/audiences'),
    );
    expect(resendCall).toBeDefined();
    const [url, init] = resendCall!;
    expect(url).toBe('https://api.resend.com/audiences/aud_test/contacts');
    expect(init.method).toBe('POST');
    expect(init.headers['Authorization']).toBe('Bearer test_api_key');
    expect(init.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(init.body);
    expect(body.email).toBe('driver@example.com');
    expect(body.unsubscribed).toBe(false);
  });

  test('valid POST returns 303 redirect to /waitlist?status=submitted on Resend success', async () => {
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    const response = await onRequestPost({ request, env: ENV });

    // 303 (See Other) is the canonical POST → GET redirect status.
    // 302 would also work but 303 explicitly signals "the resource
    // is available at this OTHER URL via GET" — exactly what we
    // want here so a refresh of /waitlist?status=submitted doesn't
    // re-POST the form.
    expect(response.status).toBe(303);
    const location = response.headers.get('Location');
    expect(location).toMatch(/\/waitlist\?status=submitted$/);
  });

  test('Resend 5xx returns 502 (so the visitor sees a retryable error, not a silent success)', async () => {
    fetchMock.mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes('siteverify')) {
        return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
      }
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Internal error' }), { status: 503 }),
      );
    });

    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    const response = await onRequestPost({ request, env: ENV });

    // 502 (Bad Gateway) signals "upstream — Resend — failed".
    // Returning 200/redirect on a Resend failure would tell the
    // visitor "we got it" when we didn't, and the founder rate
    // promise (T060) becomes a broken promise. 502 lets the
    // visitor retry honestly.
    expect(response.status).toBe(502);
  });
});

describe('T092 — environment safety', () => {
  test('500 if RESEND_API_KEY is missing — fail loud, not silently noop', async () => {
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    const response = await onRequestPost({
      request,
      env: { ...ENV, RESEND_API_KEY: '' },
    });

    // Misconfigured deploy with a missing secret would otherwise
    // pretend to accept signups while emitting nothing. 500 makes
    // the misconfiguration visible in the Pages logs immediately.
    expect(response.status).toBe(500);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
  });
});

describe('T093 — Turnstile spam protection', () => {
  test('missing cf-turnstile-response field returns 400', async () => {
    // A form post without the Turnstile token is either (a) a
    // browser that didn't run the Turnstile script (suspicious),
    // (b) a curl/headless bot bypass, or (c) a misconfigured
    // form. All three deserve the same answer: no further upstream
    // calls, surface a 400 the user can react to.
    const request = new Request('https://lap-coach.racing/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: 'driver@example.com', consent: 'on' }).toString(),
    });
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(400);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
    expect(calls.some((u) => u.includes('siteverify'))).toBe(false);
  });

  test('invalid Turnstile token (siteverify success:false) returns 400 + skips Resend', async () => {
    fetchMock.mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes('siteverify')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }),
            {
              status: 200,
            },
          ),
        );
      }
      // If we got here for resend, it'd be a critical bug.
      return Promise.resolve(new Response('SHOULD NOT REACH', { status: 500 }));
    });

    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    const response = await onRequestPost({ request, env: ENV });

    expect(response.status).toBe(400);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    // Turnstile WAS called once.
    expect(calls.some((u) => u.includes('siteverify'))).toBe(true);
    // Resend was NOT called — fail-fast on bot detection saves
    // mailing-list quota and cleanliness.
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
  });

  test('Turnstile siteverify is called with the token + secret in the form-encoded body', async () => {
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    await onRequestPost({ request, env: ENV });

    const verifyCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('siteverify'));
    expect(verifyCall).toBeDefined();
    const [url, init] = verifyCall!;
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init.method).toBe('POST');
    // Cloudflare expects application/x-www-form-urlencoded with
    // `secret` and `response` fields. Sending JSON would silently
    // get rejected.
    const body = init.body instanceof URLSearchParams ? init.body : new URLSearchParams(init.body);
    expect(body.get('secret')).toBe('1x0000000000000000000000000000000AA');
    expect(body.get('response')).toBe('valid_test_token');
  });

  test('500 if TURNSTILE_SECRET_KEY is missing — same fail-loud pattern as RESEND keys', async () => {
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    const response = await onRequestPost({
      request,
      env: { ...ENV, TURNSTILE_SECRET_KEY: '' },
    });

    // Misconfigured prod deploy with no Turnstile secret would
    // otherwise let bots through. Fail-closed = visible 500 in
    // logs, NOT a silent open door.
    expect(response.status).toBe(500);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
    expect(calls.some((u) => u.includes('siteverify'))).toBe(false);
  });
});
