import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import WaitlistForm from '../components/WaitlistForm.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(WaitlistForm));

test('T091: form posts to /api/waitlist (target for the T092 Cloudflare Worker)', async () => {
  // T092 ships a Cloudflare Pages Function at /api/waitlist that
  // forwards the submission to the Resend "waitlist" audience.
  // Locking the action + method here means a future "let's just
  // change the route to /signup" mistake fails before the form
  // becomes a one-way data leak.
  const html = await render();
  expect(html).toMatch(/<form[^>]+action="\/api\/waitlist"/);
  expect(html).toMatch(/<form[^>]+method="post"/i);
});

test('T091: email input is type=email, required, with autocomplete=email', async () => {
  // type=email opens the iOS/Android email keyboard and triggers
  // the browser-native validation pattern. autocomplete=email
  // reads the saved address from the password manager — friction
  // we can't afford on the lowest-funnel form on the site.
  // `required` enforces the email field at the HTML layer so the
  // T092 Worker isn't the first line of defence against blanks.
  const html = await render();
  const emailInput = html.match(/<input[^>]+name="email"[^>]*>/);
  expect(emailInput).not.toBeNull();
  expect(emailInput![0]).toMatch(/type="email"/);
  expect(emailInput![0]).toMatch(/required/);
  expect(emailInput![0]).toMatch(/autocomplete="email"/);
});

test('T091: consent checkbox is type=checkbox and required (GDPR Article 7)', async () => {
  // GDPR Article 7 (consent): consent must be a freely-given,
  // affirmative action with a clear statement of purpose. A
  // required checkbox satisfies "affirmative action"; the
  // accompanying label (next test) carries the purpose statement.
  // T101 ("GDPR compliance: consent checkbox + privacy link") is
  // the verification of T091's consent posture — locking required
  // here means T101 stays a contract test, not a re-implementation.
  const html = await render();
  const consentInput = html.match(/<input[^>]+name="consent"[^>]*>/);
  expect(consentInput).not.toBeNull();
  expect(consentInput![0]).toMatch(/type="checkbox"/);
  expect(consentInput![0]).toMatch(/required/);
});

test('T091: consent label discloses what the email will be used for', async () => {
  // Inline disclosure satisfies GDPR informed-consent without
  // depending on a /privacy page that doesn't exist yet. The
  // label must mention BOTH (a) the purpose ("launch", "founder"
  // or similar) and (b) the unsubscribe path. Anything vaguer
  // ("emails from LAP") fails the "specific" prong of Article 7.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/launch/);
  expect(html.toLowerCase()).toMatch(/unsubscribe/);
});

test('T091: submit button has the accessible name "Join the waitlist"', async () => {
  // Locked button copy. Verbatim "Join the waitlist" matches the
  // T060 PricingFounderOffer language ("Signed up before launch")
  // and reads as commitment, not as a generic "Subscribe" CTA.
  const html = await render();
  expect(html).toMatch(/<button[^>]+type="submit"[^>]*>[\s\S]*Join the waitlist[\s\S]*<\/button>/);
});

test('T091: form is labelled via aria-labelledby pointing at the heading id', async () => {
  // Form-level aria-labelledby names the form for screen readers
  // — same pattern used on every section component on the site.
  // A future refactor that drops the labelling will blow the
  // T038-style axe gate; this unit-level check catches it before
  // playwright even starts.
  const html = await render();
  const formMatch = html.match(/<form[^>]+aria-labelledby="([^"]+)"/);
  expect(formMatch).not.toBeNull();
  const headingId = formMatch![1];
  expect(html).toMatch(new RegExp(`id="${headingId}"`));
});

test('T091: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T101: consent disclosure links to /privacy (GDPR informed-consent)', async () => {
  // GDPR Article 13(1)(c+e+f) + Recital 42: informed consent
  // requires the data subject to know who controls their data,
  // who it goes to, and what their rights are. Linking to the
  // privacy notice from the consent surface is how every
  // GDPR-compliant signup form satisfies "informed". The link
  // must point exactly at /privacy so the cross-doc contract
  // (form → privacy notice) cannot drift.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/privacy"/);
});

test('T093: form renders the Cloudflare Turnstile widget div with a data-sitekey', async () => {
  // Turnstile is the spam-protection layer. The widget is a single
  // <div class="cf-turnstile" data-sitekey="..."> that the
  // upstream Cloudflare script (loaded async/defer) hydrates into
  // an invisible-or-managed challenge. The data-sitekey defaults
  // to Cloudflare's public always-pass test key
  // (1x00000000000000000000AA) so dev "just works"; production
  // overrides via the PUBLIC_TURNSTILE_SITE_KEY env var.
  const html = await render();
  expect(html).toMatch(/<div[^>]+class="[^"]*cf-turnstile[^"]*"[^>]+data-sitekey="[^"]+"/);
});

test('T093: form loads the Cloudflare Turnstile script (async, deferred)', async () => {
  // Without the script tag, the cf-turnstile div is just an
  // empty container — no challenge runs and no token gets
  // submitted. async + defer keep it off the LCP critical path
  // (T036 budget).
  const html = await render();
  expect(html).toMatch(
    /<script[^>]+src="https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js"/,
  );
});
