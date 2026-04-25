import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/waitlist';

// T092 + T093 + T094 — unit tests for the /api/waitlist Cloudflare
// Pages Function. The handler runs on Cloudflare's edge after T008
// (BLOCKED until the Pages project lands); these tests prove the
// logic against synthetic Request objects and a mocked fetch so the
// code is reviewed-and-tested before deployment rather than after a
// production submission silently fails.
//
// T094 made this a TRUE double-opt-in flow: the form post no longer
// adds the contact to the Resend audience. Instead, the function
// generates an HMAC-signed token, sends a confirmation email via
// Resend's transactional /emails endpoint, and redirects the visitor
// to /waitlist?status=submitted. T095 will land the
// /api/waitlist/confirm handler that verifies the token and finally
// commits the contact to the audience.
//
// The default fetch mock dispatches by URL — siteverify, /emails,
// and (no longer expected) /audiences — so individual tests can
// override behavior on one endpoint without rewiring the rest.

interface TestEnv {
  RESEND_API_KEY: string;
  RESEND_AUDIENCE_ID: string;
  TURNSTILE_SECRET_KEY: string;
  WAITLIST_TOKEN_SECRET: string;
}

const ENV: TestEnv = {
  RESEND_API_KEY: 'test_api_key',
  RESEND_AUDIENCE_ID: 'aud_test',
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  WAITLIST_TOKEN_SECRET: 'test_waitlist_token_secret_at_least_32_chars',
};

function buildRequest(fields: Record<string, string>) {
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
  if (urlString.includes('api.resend.com/emails')) {
    return Promise.resolve(
      new Response(JSON.stringify({ id: 'email_xyz' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
  if (urlString.includes('api.resend.com/audiences')) {
    // T094 should never call this — kept here so a regression that
    // re-introduces the immediate audience-add gets caught with a
    // clear "did NOT call audiences" assertion failure rather than
    // a silent network noop.
    return Promise.resolve(new Response('SHOULD NOT REACH', { status: 500 }));
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

describe('T094 — confirmation email (true double-opt-in)', () => {
  test('valid POST sends a confirmation email via Resend POST /emails', async () => {
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    await onRequestPost({ request, env: ENV });

    const emailCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('api.resend.com/emails'),
    );
    expect(emailCall).toBeDefined();
    const [url, init] = emailCall!;
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect(init.headers['Authorization']).toBe('Bearer test_api_key');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  test('confirmation email subject is the locked T094 phrase', async () => {
    // Sprint T094 acceptance: "Confirm your email to join the LAP
    // waitlist". The subject is the most-visible part of the email
    // in the inbox preview; locking it verbatim catches any silent
    // drift toward generic "Welcome!" / "Confirm subscription"
    // copy.
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    await onRequestPost({ request, env: ENV });
    const emailCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('api.resend.com/emails'),
    );
    const body = JSON.parse(emailCall![1].body);
    expect(body.subject).toBe('Confirm your email to join the LAP waitlist');
  });

  test('confirmation email is addressed to the submitted email', async () => {
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    await onRequestPost({ request, env: ENV });
    const emailCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('api.resend.com/emails'),
    );
    const body = JSON.parse(emailCall![1].body);
    expect(body.to).toBe('driver@example.com');
  });

  test('confirmation email "from" is on the lap-coach.racing domain', async () => {
    // From-address must be on the verified Resend domain. Hardcoded
    // here so a future "let's switch sender" decision shows up in
    // the diff rather than a Resend bounce log.
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    await onRequestPost({ request, env: ENV });
    const emailCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('api.resend.com/emails'),
    );
    const body = JSON.parse(emailCall![1].body);
    expect(body.from).toMatch(/@lap-coach\.racing(?:>)?$/);
  });

  test('confirmation email body contains a /api/waitlist/confirm link with a token', async () => {
    // The confirmation link is the entire point of the email. Both
    // the html and text bodies should contain it (mail clients fall
    // back to text-only). The token has 3 dot-separated segments:
    // base64url(email).expiry.hexHmac — verified later by T095.
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    await onRequestPost({ request, env: ENV });
    const emailCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('api.resend.com/emails'),
    );
    const body = JSON.parse(emailCall![1].body);
    const allContent = (body.html ?? '') + (body.text ?? '');
    expect(allContent).toMatch(/\/api\/waitlist\/confirm\?token=/);
    const linkMatch = allContent.match(/\/api\/waitlist\/confirm\?token=([^"\s&)<]+)/);
    expect(linkMatch).not.toBeNull();
    const token = linkMatch![1];
    expect(token.split('.').length).toBe(3);
  });

  test('valid POST does NOT call the Resend audiences API (true double-opt-in)', async () => {
    // T094's defining behavior: the contact is NOT added to the
    // audience until they confirm (T095). If a future refactor
    // accidentally re-introduces the immediate audience-add, the
    // defaultFetchMockImpl returns 500 for /audiences and the test
    // catches the regression here.
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    await onRequestPost({ request, env: ENV });
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com/audiences'))).toBe(false);
  });

  test('valid POST returns 303 redirect to /waitlist?status=submitted on email-send success', async () => {
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(303);
    const location = response.headers.get('Location');
    expect(location).toMatch(/\/waitlist\?status=submitted$/);
  });

  test('Resend email-send 5xx returns 502 (not silent success)', async () => {
    fetchMock.mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes('siteverify')) {
        return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
      }
      // emails endpoint returns 503 (upstream Resend outage)
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Internal error' }), { status: 503 }),
      );
    });

    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    const response = await onRequestPost({ request, env: ENV });

    // Same 502 pattern as before: signal "upstream failed", not
    // "you did something wrong" (4xx). Visitor can retry honestly.
    expect(response.status).toBe(502);
  });
});

describe('T092/T093/T094 — environment safety', () => {
  test('500 if RESEND_API_KEY is missing', async () => {
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    const response = await onRequestPost({
      request,
      env: { ...ENV, RESEND_API_KEY: '' },
    });
    expect(response.status).toBe(500);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
  });

  test('500 if WAITLIST_TOKEN_SECRET is missing — token signing would silently produce garbage', async () => {
    // The token secret signs the confirmation link. Missing-secret
    // would either crash the HMAC step or sign with an empty key
    // (which is verifiable by ANYONE — token forgery). 500
    // fail-closed at the env check is the only safe answer.
    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    const response = await onRequestPost({
      request,
      env: { ...ENV, WAITLIST_TOKEN_SECRET: '' },
    });
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
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response('SHOULD NOT REACH', { status: 500 }));
    });

    const request = buildRequest({ email: 'driver@example.com', consent: 'on' });
    const response = await onRequestPost({ request, env: ENV });

    expect(response.status).toBe(400);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('siteverify'))).toBe(true);
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
    expect(response.status).toBe(500);
    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes('api.resend.com'))).toBe(false);
    expect(calls.some((u) => u.includes('siteverify'))).toBe(false);
  });
});
