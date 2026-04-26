// T203 + T204 — Cloudflare Pages Function for the /for-schools
// B2B inquiry form. Lands at /api/for-schools on the deployed
// site. The function:
//   1. Validates the form post — name, school, students-count,
//      email, message, consent (GDPR Article 7) — all required.
//   2. Verifies the Cloudflare Turnstile token via siteverify.
//   3. (T204) Sends the inquiry to sales@lap-coach.racing via
//      Resend's transactional /emails endpoint; reply_to is the
//      submitter so a Reply lands in their inbox. Failure here
//      returns 502 — we do NOT tell the visitor "we got it" if
//      we couldn't actually deliver the inquiry.
//   4. (T204) Sends a confirmation email back to the submitter,
//      naming sales@lap-coach.racing as the reply origin. Best-
//      effort: a confirmation failure does NOT block the success
//      state because the load-bearing artefact (the sales email)
//      already landed.
//   5. 303-redirects the visitor back to /for-schools?status=submitted.
//
// Deployment dependencies (BLOCKED on T008 Cloudflare Pages):
//   1. TURNSTILE_SECRET_KEY secret on the Pages project
//   2. RESEND_API_KEY secret on the Pages project
//   3. The lap-coach.racing domain must be verified in the
//      Resend dashboard so the "from" address can send.

interface ForSchoolsEnv {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
}

const FROM_ADDRESS = 'LAP <noreply@lap-coach.racing>';
const SALES_INBOX = 'sales@lap-coach.racing';

interface ResendPayload {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  reply_to?: string;
}

async function sendResendEmail(
  apiKey: string,
  payload: ResendPayload,
): Promise<Response> {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface InquiryFields {
  name: string;
  school: string;
  studentsCount: string;
  email: string;
  message: string;
}

function buildSalesEmail(fields: InquiryFields): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Schools & academies inquiry — ${fields.school}`;
  const text = [
    `Name: ${fields.name}`,
    `School: ${fields.school}`,
    `Drivers: ${fields.studentsCount}`,
    `Email: ${fields.email}`,
    '',
    'Message:',
    fields.message,
    '',
    '— Submitted via /for-schools',
  ].join('\n');
  const html = `<!doctype html>
<html lang="en">
  <body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.55; color: #1f1f1f;">
    <p><strong>New B2B inquiry</strong> from /for-schools.</p>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(fields.name)}</li>
      <li><strong>School:</strong> ${escapeHtml(fields.school)}</li>
      <li><strong>Drivers:</strong> ${escapeHtml(fields.studentsCount)}</li>
      <li><strong>Email:</strong> ${escapeHtml(fields.email)}</li>
    </ul>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap;">${escapeHtml(fields.message)}</p>
    <p style="color: #888; font-size: 13px;">Hit Reply to respond directly to ${escapeHtml(fields.email)}.</p>
  </body>
</html>`;
  return { subject, text, html };
}

function buildConfirmationEmail(fields: InquiryFields): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = 'We got your inquiry — LAP';
  const text = [
    'Thanks for writing to LAP.',
    '',
    `A real person will reply from ${SALES_INBOX}, usually within a working day.`,
    '',
    'The details we received:',
    `  Name: ${fields.name}`,
    `  School: ${fields.school}`,
    `  Drivers: ${fields.studentsCount}`,
    '',
    'If anything looks wrong, just reply to this email and we will fix it.',
    '',
    '— LAP',
    'lap-coach.racing',
  ].join('\n');
  const html = `<!doctype html>
<html lang="en">
  <body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.55; color: #1f1f1f;">
    <p>Thanks for writing to LAP.</p>
    <p>A real person will reply from <a href="mailto:${SALES_INBOX}" style="color: #0a3d99;">${SALES_INBOX}</a>, usually within a working day.</p>
    <p>The details we received:</p>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(fields.name)}</li>
      <li><strong>School:</strong> ${escapeHtml(fields.school)}</li>
      <li><strong>Drivers:</strong> ${escapeHtml(fields.studentsCount)}</li>
    </ul>
    <p style="color: #555; font-size: 14px;">If anything looks wrong, just reply to this email and we will fix it.</p>
    <p style="color: #888; font-size: 13px;">— LAP · lap-coach.racing</p>
  </body>
</html>`;
  return { subject, text, html };
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

  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY) {
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

  const fields: InquiryFields = {
    name,
    school,
    studentsCount: studentsCountRaw,
    email,
    message,
  };

  // (1) Sales notification — load-bearing artefact. If this
  //     fails we MUST return 502 so the visitor knows their
  //     inquiry didn't land. reply_to is the submitter so a
  //     Reply in the sales inbox goes back to them.
  const salesEmail = buildSalesEmail(fields);
  const salesResponse = await sendResendEmail(env.RESEND_API_KEY, {
    from: FROM_ADDRESS,
    to: SALES_INBOX,
    reply_to: email,
    subject: salesEmail.subject,
    text: salesEmail.text,
    html: salesEmail.html,
  });
  if (!salesResponse.ok) {
    return new Response('Submission failed — please retry', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // (2) Confirmation email back to the submitter — best-effort.
  //     A failure here does NOT flip the visitor's success
  //     state because the sales email already landed; the
  //     inquiry is in the inbox even if the receipt-style
  //     reply didn't go out.
  const confirmationEmail = buildConfirmationEmail(fields);
  await sendResendEmail(env.RESEND_API_KEY, {
    from: FROM_ADDRESS,
    to: email,
    subject: confirmationEmail.subject,
    text: confirmationEmail.text,
    html: confirmationEmail.html,
  });

  return new Response(null, {
    status: 303,
    headers: { Location: '/for-schools?status=submitted' },
  });
}
