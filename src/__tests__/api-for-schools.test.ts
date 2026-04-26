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

// T204 — Resend integration: sales notification to
// sales@lap-coach.racing + confirmation email back to the
// submitter. Both calls go through the Resend transactional
// /emails endpoint with Bearer auth from RESEND_API_KEY.

const SALES_INBOX = 'sales@lap-coach.racing';

function findResendCalls() {
  return fetchMock.mock.calls.filter(([url]) => {
    const urlString = typeof url === 'string' ? url : url.toString();
    return urlString.includes('api.resend.com/emails');
  });
}

interface ResendBody {
  from: string;
  to: string | ReadonlyArray<string>;
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string | ReadonlyArray<string>;
}

function parseResendCallBody(call: unknown[]): ResendBody {
  const init = call[1] as { body: string };
  return JSON.parse(init.body) as ResendBody;
}

describe('T204 — Resend send to sales inbox', () => {
  test('valid POST calls Resend /emails endpoint', async () => {
    await onRequestPost({ request: buildRequest(VALID_FIELDS), env: ENV });
    const resendCalls = findResendCalls();
    expect(
      resendCalls.length,
      'endpoint must POST to api.resend.com/emails',
    ).toBeGreaterThanOrEqual(1);
  });

  test('Resend call uses Bearer auth from RESEND_API_KEY', async () => {
    await onRequestPost({ request: buildRequest(VALID_FIELDS), env: ENV });
    const resendCalls = findResendCalls();
    expect(resendCalls.length).toBeGreaterThanOrEqual(1);
    const init = resendCalls[0][1] as { headers: Record<string, string> };
    expect(init.headers['Authorization']).toBe('Bearer test_api_key');
  });

  test('one Resend email is addressed to sales@lap-coach.racing', async () => {
    await onRequestPost({ request: buildRequest(VALID_FIELDS), env: ENV });
    const calls = findResendCalls();
    const salesMatch = calls.find((call) => {
      const body = parseResendCallBody(call);
      const to = Array.isArray(body.to) ? body.to.join(',') : body.to;
      return to.includes(SALES_INBOX);
    });
    expect(
      salesMatch,
      `at least one Resend /emails call must address ${SALES_INBOX}`,
    ).toBeTruthy();
  });

  test('sales email reply_to is the submitter email (sales can hit Reply)', async () => {
    await onRequestPost({ request: buildRequest(VALID_FIELDS), env: ENV });
    const calls = findResendCalls();
    const salesCall = calls.find((call) => {
      const body = parseResendCallBody(call);
      const to = Array.isArray(body.to) ? body.to.join(',') : body.to;
      return to.includes(SALES_INBOX);
    });
    expect(salesCall, 'sales-bound Resend call must exist').toBeTruthy();
    const body = parseResendCallBody(salesCall!);
    const replyTo = Array.isArray(body.reply_to)
      ? body.reply_to.join(',')
      : body.reply_to;
    expect(
      replyTo,
      'sales notification must set reply_to to the submitter so a Reply lands in their inbox',
    ).toContain(VALID_FIELDS.email);
  });

  test('sales email subject identifies it as a B2B inquiry', async () => {
    // Subject must be unambiguous in a busy inbox — naming the
    // inbound channel ("schools", "academies", or "B2B") plus
    // ideally the school name keeps triage cheap.
    await onRequestPost({ request: buildRequest(VALID_FIELDS), env: ENV });
    const calls = findResendCalls();
    const salesCall = calls.find((call) => {
      const body = parseResendCallBody(call);
      const to = Array.isArray(body.to) ? body.to.join(',') : body.to;
      return to.includes(SALES_INBOX);
    });
    expect(salesCall).toBeTruthy();
    const subject = parseResendCallBody(salesCall!).subject.toLowerCase();
    expect(subject).toMatch(/schools|academ|inquiry|enquiry|b2b/);
  });

  test('sales email body contains every submitted field', async () => {
    // Sales must see the full submission without scrolling
    // back to a separate dashboard. Lock that all 5 fields
    // make it into the email body (HTML or text — either works
    // for visibility; we check both candidates).
    await onRequestPost({ request: buildRequest(VALID_FIELDS), env: ENV });
    const calls = findResendCalls();
    const salesCall = calls.find((call) => {
      const body = parseResendCallBody(call);
      const to = Array.isArray(body.to) ? body.to.join(',') : body.to;
      return to.includes(SALES_INBOX);
    });
    expect(salesCall).toBeTruthy();
    const body = parseResendCallBody(salesCall!);
    const haystack = `${body.text ?? ''}\n${body.html ?? ''}`;
    expect(haystack).toContain(VALID_FIELDS.name);
    expect(haystack).toContain(VALID_FIELDS.school);
    expect(haystack).toContain(VALID_FIELDS['students-count']);
    expect(haystack).toContain(VALID_FIELDS.email);
    expect(haystack).toContain(VALID_FIELDS.message);
  });
});

describe('T204 — confirmation email to submitter', () => {
  test('a Resend email is addressed to the submitter', async () => {
    await onRequestPost({ request: buildRequest(VALID_FIELDS), env: ENV });
    const calls = findResendCalls();
    const confirmCall = calls.find((call) => {
      const body = parseResendCallBody(call);
      const to = Array.isArray(body.to) ? body.to.join(',') : body.to;
      return to.includes(VALID_FIELDS.email);
    });
    expect(
      confirmCall,
      `at least one Resend /emails call must address ${VALID_FIELDS.email}`,
    ).toBeTruthy();
  });

  test('two Resend calls fire on the happy path (sales + confirmation)', async () => {
    await onRequestPost({ request: buildRequest(VALID_FIELDS), env: ENV });
    const calls = findResendCalls();
    expect(
      calls.length,
      'happy path must send sales notification AND confirmation',
    ).toBe(2);
  });

  test('confirmation email mentions sales@lap-coach.racing as the reply origin', async () => {
    // The success banner on /for-schools tells the visitor a
    // reply will come from sales@lap-coach.racing. The email
    // should match so the recipient knows what to expect when
    // it lands.
    await onRequestPost({ request: buildRequest(VALID_FIELDS), env: ENV });
    const calls = findResendCalls();
    const confirmCall = calls.find((call) => {
      const body = parseResendCallBody(call);
      const to = Array.isArray(body.to) ? body.to.join(',') : body.to;
      return to.includes(VALID_FIELDS.email);
    });
    expect(confirmCall).toBeTruthy();
    const body = parseResendCallBody(confirmCall!);
    const haystack = `${body.text ?? ''}\n${body.html ?? ''}`;
    expect(haystack).toContain(SALES_INBOX);
  });

  test('confirmation email subject is doctrine-aligned (no marketing overhype)', async () => {
    await onRequestPost({ request: buildRequest(VALID_FIELDS), env: ENV });
    const calls = findResendCalls();
    const confirmCall = calls.find((call) => {
      const body = parseResendCallBody(call);
      const to = Array.isArray(body.to) ? body.to.join(',') : body.to;
      return to.includes(VALID_FIELDS.email);
    });
    expect(confirmCall).toBeTruthy();
    const subject = parseResendCallBody(confirmCall!).subject.toLowerCase();
    expect(subject).not.toMatch(/\bai coach\b/);
    expect(subject).not.toMatch(/\bllm\b/);
    expect(subject).not.toMatch(/\bgenerative\b/);
    expect(subject).not.toMatch(/!{2,}/);
  });
});

describe('T204 — Resend failure handling', () => {
  test('sales-send failure returns 502 (visitor is NOT shown success)', async () => {
    // If we cannot deliver the inquiry to sales, we must not
    // tell the visitor "we got it." 502 (Bad Gateway) signals
    // upstream failure; the visitor's submission remains valid
    // and the form preserves the entered values for retry.
    let salesAttempt = 0;
    fetchMock.mockImplementation((url: string | URL | Request, init?: { body?: string }) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes('challenges.cloudflare.com/turnstile/v0/siteverify')) {
        return Promise.resolve(
          new Response(JSON.stringify({ success: true }), { status: 200 }),
        );
      }
      if (urlString.includes('api.resend.com/emails')) {
        salesAttempt++;
        // First Resend call is the sales notification — fail it.
        if (salesAttempt === 1) {
          return Promise.resolve(
            new Response(JSON.stringify({ error: 'rate_limited' }), {
              status: 429,
            }),
          );
        }
        // Subsequent calls (confirmation) — won't fire on a
        // sales failure, but kept defensive.
        return Promise.resolve(
          new Response(JSON.stringify({ id: 'email_xyz' }), { status: 200 }),
        );
      }
      void init;
      return Promise.resolve(new Response('{}', { status: 200 }));
    });

    const response = await onRequestPost({
      request: buildRequest(VALID_FIELDS),
      env: ENV,
    });
    expect(response.status).toBe(502);
  });

  test('confirmation-send failure does NOT block the success state (best-effort)', async () => {
    // The sales person already got the inquiry, so the load-
    // bearing artefact landed. A confirmation-email failure
    // (bad recipient, transient blip) must not flip the
    // visitor's experience to "submission failed."
    let resendAttempt = 0;
    fetchMock.mockImplementation((url: string | URL | Request) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes('challenges.cloudflare.com/turnstile/v0/siteverify')) {
        return Promise.resolve(
          new Response(JSON.stringify({ success: true }), { status: 200 }),
        );
      }
      if (urlString.includes('api.resend.com/emails')) {
        resendAttempt++;
        if (resendAttempt === 1) {
          return Promise.resolve(
            new Response(JSON.stringify({ id: 'sales_ok' }), { status: 200 }),
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ error: 'recipient_invalid' }), {
            status: 400,
          }),
        );
      }
      return Promise.resolve(new Response('{}', { status: 200 }));
    });

    const response = await onRequestPost({
      request: buildRequest(VALID_FIELDS),
      env: ENV,
    });
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe(
      '/for-schools?status=submitted',
    );
  });
});

describe('T204 — server misconfiguration (Resend secrets)', () => {
  test('missing RESEND_API_KEY returns 500', async () => {
    const response = await onRequestPost({
      request: buildRequest(VALID_FIELDS),
      env: { ...ENV, RESEND_API_KEY: '' },
    });
    expect(response.status).toBe(500);
  });
});
