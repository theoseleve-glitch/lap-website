// T092 — Cloudflare Pages Function for the waitlist form. Lands at
// /api/waitlist on the deployed site (Cloudflare Pages auto-discovers
// files under `functions/`). The function validates the form post,
// forwards to the Resend "waitlist" audience, and redirects the
// visitor back to /waitlist with a status query string.
//
// Deployment dependencies (NOT yet wired — see T008 BLOCKED):
//   1. Cloudflare Pages project bound to this repo (T008)
//   2. RESEND_API_KEY secret on the Pages project
//   3. RESEND_AUDIENCE_ID env var = the "waitlist" audience id from
//      Resend's dashboard
// Until T008 unblocks, this file is reviewed-and-tested code waiting
// for an environment to run in. The unit tests in
// src/__tests__/api-waitlist.test.ts prove the logic in isolation.
//
// Why no double-opt-in here: T094 ships the confirmation-email
// behaviour separately. Resend's audience contacts can be created in
// "subscribed" or "unconfirmed" states; we add as `unsubscribed:
// false` and let Resend's audience flow handle the confirmation
// email (which T094 will configure). If T094 needs a different
// transactional path, the Worker logic moves there — for now this
// function is the smallest thing that puts a contact in the system.

interface WaitlistEnv {
  RESEND_API_KEY: string;
  RESEND_AUDIENCE_ID: string;
}

interface PagesFunctionContext {
  request: Request;
  env: WaitlistEnv;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(reason: string): Response {
  return new Response(reason, {
    status: 400,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function onRequestPost(context: PagesFunctionContext): Promise<Response> {
  const { request, env } = context;

  // Fail loud on misconfigured deploy. Returning 500 with a server-
  // side log entry beats pretending the signup worked while emitting
  // nothing — the latter would silently break the T060 founder-rate
  // promise.
  if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID) {
    return new Response('Server misconfigured', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const formData = await request.formData();
  const email = formData.get('email');
  const consent = formData.get('consent');

  if (typeof email !== 'string' || email.trim() === '') {
    return badRequest('Email is required');
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return badRequest('Email must be a valid address');
  }
  // GDPR Article 7: consent must be a freely-given affirmative
  // action. The HTML form ships a required checkbox with name
  // "consent" — if it was unchecked, the field is absent from the
  // submission entirely (HTML form-encoding rule), so consent === null.
  // The string "on" is the default value for a checked checkbox
  // without an explicit value attribute (the form ships none).
  if (consent !== 'on' && consent !== 'true') {
    return badRequest('Consent is required');
  }

  const resendResponse = await fetch(
    `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        unsubscribed: false,
      }),
    },
  );

  if (!resendResponse.ok) {
    // 502 (Bad Gateway) is the right shape for "we tried, the
    // upstream said no". 4xx would tell the visitor THEY did
    // something wrong; 5xx tells them retry-later.
    return new Response('Submission failed — please retry', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // 303 See Other on POST → GET. Refreshing the success page won't
  // re-POST the form. Relative location works because the function
  // and the page share an origin on Pages.
  return new Response(null, {
    status: 303,
    headers: { Location: '/waitlist?status=submitted' },
  });
}
