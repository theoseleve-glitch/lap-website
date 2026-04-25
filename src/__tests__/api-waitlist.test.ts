import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/waitlist';

// T092 — unit tests for the /api/waitlist Cloudflare Pages
// Function. The handler runs on Cloudflare's edge after T008
// (BLOCKED until the Pages project lands); these tests prove
// the logic against synthetic Request objects and a mocked
// fetch so the code is reviewed-and-tested before deployment
// rather than after a production submission silently fails.

interface TestEnv {
  RESEND_API_KEY: string;
  RESEND_AUDIENCE_ID: string;
}

const ENV: TestEnv = {
  RESEND_API_KEY: 'test_api_key',
  RESEND_AUDIENCE_ID: 'aud_test',
};

function buildRequest(body: URLSearchParams | string | null) {
  return new Request('https://lap-coach.racing/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body === null ? null : body.toString(),
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('T092 — input validation', () => {
  test('missing email field returns 400', async () => {
    const request = buildRequest(new URLSearchParams({ consent: 'on' }));
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('blank email returns 400 (no whitespace bypass)', async () => {
    const request = buildRequest(new URLSearchParams({ email: '   ', consent: 'on' }));
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('invalid email format (no @) returns 400', async () => {
    // Native HTML form validation (T091 type=email) catches this
    // client-side, but a curl POST or JS-disabled browser bypass
    // would skip the client gate. Server-side validation is the
    // belt-and-braces. The pattern matches "x@y.z" — the simplest
    // honest predicate; full RFC 5322 is overengineering for a
    // mailing list.
    const request = buildRequest(new URLSearchParams({ email: 'not-an-email', consent: 'on' }));
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('missing consent (unchecked checkbox) returns 400 — GDPR Article 7', async () => {
    // HTML forms omit unchecked checkbox fields entirely from the
    // submission. consent === null is the unchecked path. Without
    // the affirmative checkbox tick, GDPR Article 7 informed
    // consent fails — the function MUST refuse to forward.
    const request = buildRequest(new URLSearchParams({ email: 'driver@example.com' }));
    const response = await onRequestPost({ request, env: ENV });
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('T092 — Resend forwarding', () => {
  test('valid POST forwards to Resend audience contacts API', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'contact_xyz' } }), { status: 200 }),
    );

    const request = buildRequest(
      new URLSearchParams({ email: 'driver@example.com', consent: 'on' }),
    );
    await onRequestPost({ request, env: ENV });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/audiences/aud_test/contacts');
    expect(init.method).toBe('POST');
    expect(init.headers['Authorization']).toBe('Bearer test_api_key');
    expect(init.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(init.body);
    expect(body.email).toBe('driver@example.com');
    expect(body.unsubscribed).toBe(false);
  });

  test('valid POST returns 303 redirect to /waitlist?status=submitted on Resend success', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'contact_xyz' } }), { status: 200 }),
    );

    const request = buildRequest(
      new URLSearchParams({ email: 'driver@example.com', consent: 'on' }),
    );
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
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Internal error' }), { status: 503 }),
    );

    const request = buildRequest(
      new URLSearchParams({ email: 'driver@example.com', consent: 'on' }),
    );
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
  test('throws (5xx) if RESEND_API_KEY is missing — fail loud, not silently noop', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));

    const request = buildRequest(
      new URLSearchParams({ email: 'driver@example.com', consent: 'on' }),
    );
    const response = await onRequestPost({
      request,
      env: { RESEND_API_KEY: '', RESEND_AUDIENCE_ID: 'aud_test' },
    });

    // Misconfigured deploy with a missing secret would otherwise
    // pretend to accept signups while emitting nothing. 500 makes
    // the misconfiguration visible in the Pages logs immediately.
    expect(response.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
