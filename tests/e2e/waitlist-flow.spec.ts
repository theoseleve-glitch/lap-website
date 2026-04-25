import { expect, test } from '@playwright/test';

// T104 — end-to-end /waitlist form-submission journey. The unit
// layer (waitlist-form.test.ts, waitlist.test.ts, api-waitlist.
// test.ts, drip-scheduler.test.ts) covers the contracts at the
// component / function layer; this spec exercises the actual
// click-fill-submit path a real visitor walks.
//
// /api/waitlist is a Cloudflare Pages Function. Astro's preview
// server does not run it, so we stub the response with playwright
// route handlers. The real-world POST flow (Turnstile siteverify,
// Resend confirmation email, HMAC token) is unit-tested in
// api-waitlist.test.ts; here we lock the LANDING-PAGE half: the
// form is present, fillable, and on submit the browser arrives at
// /waitlist?status=submitted (the 303 destination).

test('T104: /waitlist renders the form with a locked H1, €12 anchor, and required fields', async ({
  page,
}) => {
  await page.goto('/waitlist');

  await expect(page.locator('h1')).toContainText('Join the LAP waitlist');

  // €12 anchor — the cross-doc lock from T060/T091/T095/T099 must
  // be visible above the form so the visitor sees what they are
  // signing up for, not just the verb. Without the price anchor
  // the page would read like a generic newsletter signup.
  await expect(page.locator('main')).toContainText('€12');

  // Form attributes locked: action + method must not drift, or a
  // future "let's just rename to /signup-waitlist" mistake silently
  // breaks every existing email link and analytics funnel.
  const form = page.locator('form[action="/api/waitlist"]');
  await expect(form).toBeVisible();
  await expect(form).toHaveAttribute('method', /post/i);

  // The three required fields the POST handler validates: email,
  // consent, cf-turnstile-response (the Turnstile widget injects
  // the third one async). Two are user-visible.
  await expect(page.locator('input[name="email"]')).toHaveAttribute('required', '');
  await expect(page.locator('input[name="consent"]')).toHaveAttribute('required', '');
});

test('T104: filling and submitting the form lands on /waitlist?status=submitted', async ({
  page,
}) => {
  // Stub the Cloudflare Function so the click-fill-submit handshake
  // completes without depending on the Pages runtime. The redirect
  // mirrors the real handler's 303 on success.
  await page.route('**/api/waitlist', (route) =>
    route.fulfill({
      status: 303,
      headers: { Location: '/waitlist?status=submitted' },
    }),
  );

  await page.goto('/waitlist');
  await page.locator('input[name="email"]').fill('driver@example.com');
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();

  await page.waitForURL(/\/waitlist\?status=submitted/);
  expect(page.url()).toMatch(/\/waitlist\?status=submitted$/);

  // Page didn't 500 — the H1 still renders on the post-submit
  // landing. (The "success state" UX itself is not yet in the
  // template; the URL signal is the proof of submit for now.)
  await expect(page.locator('h1')).toContainText('Join the LAP waitlist');
});

test('T104: consent disclosure links to /privacy (T101 GDPR cross-doc)', async ({ page }) => {
  // The privacy link inside the consent label is the GDPR
  // informed-consent surface (T101). E2E-locking it means a future
  // edit to WaitlistForm.astro that drops the link fails this
  // gate, not just the unit test.
  await page.goto('/waitlist');
  const privacyLink = page.locator('form[action="/api/waitlist"] a[href="/privacy"]');
  await expect(privacyLink).toBeVisible();

  // Click and land on the actual /privacy page — proves the route
  // resolves to a real page, not a 404 or hash anchor.
  await privacyLink.click();
  await page.waitForURL(/\/privacy\/?$/);
  await expect(page.locator('h1')).toContainText('Privacy');
});
