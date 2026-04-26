// T203 — Cloudflare Pages Function for the /for-schools B2B
// inquiry form. Lands at /api/for-schools on the deployed site.
// The function:
//   1. Validates the form post — name, school, students-count,
//      email, message, consent (GDPR Article 7) — all required.
//   2. Verifies the Cloudflare Turnstile token via siteverify.
//   3. 303-redirects the visitor back to /for-schools?status=submitted.
//
// T204 layers on top of this handler the Resend send to
// sales@lap-coach.racing + the confirmation email back to the
// submitter. T203 keeps the validation and the user-visible
// 303 success behaviour in place so the form's "submits" gate
// closes ahead of the Resend wiring.
//
// Deployment dependencies (BLOCKED on T008 Cloudflare Pages):
//   1. TURNSTILE_SECRET_KEY secret on the Pages project
//   2. RESEND_API_KEY (kept in env shape; T204 uses it)

interface ForSchoolsEnv {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
}

interface PagesFunctionContext {
  request: Request;
  env: ForSchoolsEnv;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENTS_COUNT_PATTERN = /^[1-9]\d{0,4}$/;

function badRequest(reason: string): Response {
  return new Response(reason, {
    status: 400,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function requiredString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export async function onRequestPost(
  context: PagesFunctionContext,
): Promise<Response> {
  const { request, env } = context;

  if (!env.TURNSTILE_SECRET_KEY) {
    return new Response('Server misconfigured', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const formData = await request.formData();
  const name = requiredString(formData.get('name'));
  const school = requiredString(formData.get('school'));
  const studentsCountRaw = requiredString(formData.get('students-count'));
  const email = requiredString(formData.get('email'));
  const message = requiredString(formData.get('message'));
  const consent = formData.get('consent');
  const turnstileToken = formData.get('cf-turnstile-response');

  if (!name) return badRequest('Name is required');
  if (!school) return badRequest('School or academy is required');
  if (!studentsCountRaw) return badRequest('Students count is required');
  if (!STUDENTS_COUNT_PATTERN.test(studentsCountRaw)) {
    return badRequest('Students count must be a positive integer');
  }
  if (!email) return badRequest('Email is required');
  if (!EMAIL_PATTERN.test(email)) {
    return badRequest('Email must be a valid address');
  }
  if (!message) return badRequest('Message is required');

  // GDPR Article 7: consent must be a freely-given affirmative
  // action. Same checkbox-on-or-true logic as /api/waitlist.
  if (consent !== 'on' && consent !== 'true') {
    return badRequest('Consent is required');
  }

  if (typeof turnstileToken !== 'string' || turnstileToken === '') {
    return badRequest('Spam check failed — please retry');
  }

  const verifyResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }).toString(),
    },
  );
  const verifyData = (await verifyResponse.json()) as { success?: boolean };
  if (!verifyData.success) {
    return badRequest('Spam check failed — please retry');
  }

  // T204 plugs the Resend send to sales@lap-coach.racing here,
  // plus a confirmation email back to the submitter. Until then
  // the validation passes and the visitor sees the success state
  // on /for-schools?status=submitted.

  return new Response(null, {
    status: 303,
    headers: { Location: '/for-schools?status=submitted' },
  });
}
