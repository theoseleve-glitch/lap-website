import { test, expect } from '@playwright/test';

// T040 — end-to-end flow: homepage → click "Start 14-day trial" →
// browser navigates to https://app.lap-coach.racing/signup.
//
// The /signup page itself lives in the lap-webapp repo on a
// different origin and is out of scope for this site's CI. We
// stub the external response so the click-and-navigate handshake
// completes without depending on DNS or the external app. What we
// *do* verify end-to-end is everything lap-website owns: the CTA
// renders → is interactive → click fires a top-level navigation
// to the locked /signup URL.

const SIGNUP_URL = 'https://app.lap-coach.racing/signup';
// Regex matches /signup AND /signup?plan=monthly / /signup?plan=yearly —
// a single stub covers T040 trial CTAs and T063 plan-parametrised CTAs.
const SIGNUP_URL_PATTERN = /^https:\/\/app\.lap-coach\.racing\/signup/;

function stubSignup(page: import('@playwright/test').Page) {
  return page.route(SIGNUP_URL_PATTERN, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body>stubbed signup</body></html>',
    }),
  );
}

test('T040: hero trial CTA (above the fold) navigates to /signup on click', async ({ page }) => {
  await page.goto('/');
  await stubSignup(page);

  // .first() resolves to the hero CTA since it's emitted before
  // the T034 FinalCta in document order. This simulates the
  // fast-path conversion: user lands, clicks immediately, out.
  await page.getByRole('link', { name: 'Start 14-day trial' }).first().click();
  await page.waitForURL(new RegExp(`^${SIGNUP_URL.replaceAll('.', '\\.')}`));

  expect(page.url()).toMatch(new RegExp(`^${SIGNUP_URL.replaceAll('.', '\\.')}`));
});

test('T040: final-CTA trial button (below the fold) navigates to /signup after scroll', async ({
  page,
}) => {
  await page.goto('/');
  await stubSignup(page);

  // The T034 final CTA lives at the bottom of the page; scrolling
  // the user to it and then clicking is the other real conversion
  // journey — a reader who consumed the whole qualification arc
  // (persona fit → competitors → anti-persona) and decides to try.
  const finalCta = page.getByRole('link', { name: 'Start 14-day trial' }).last();
  await finalCta.scrollIntoViewIfNeeded();
  await finalCta.click();
  await page.waitForURL(new RegExp(`^${SIGNUP_URL.replaceAll('.', '\\.')}`));

  expect(page.url()).toMatch(new RegExp(`^${SIGNUP_URL.replaceAll('.', '\\.')}`));
});

test('T063: /pricing "Start monthly" CTA navigates to /signup?plan=monthly', async ({ page }) => {
  // T058 locks the tier-card href at the unit layer; T063 gates
  // the click-and-navigate behaviour end-to-end. The ?plan=monthly
  // query parameter is what the lap-webapp signup handler reads to
  // pre-select billing cadence — dropping it silently would route
  // the user to a cadence picker they've already chosen.
  await stubSignup(page);
  await page.goto('/pricing');
  await page.getByRole('link', { name: 'Start monthly' }).click();
  await page.waitForURL(/\/signup\?plan=monthly$/);
  expect(page.url()).toMatch(/\/signup\?plan=monthly$/);
});

test('T063: /pricing "Start yearly" CTA navigates to /signup?plan=yearly', async ({ page }) => {
  // Same contract as monthly — verbatim "yearly" vocabulary from
  // the sprint brief (not "annual") so the lap-webapp handler and
  // attribution sees one consistent identifier across marketing.
  await stubSignup(page);
  await page.goto('/pricing');
  await page.getByRole('link', { name: 'Start yearly' }).click();
  await page.waitForURL(/\/signup\?plan=yearly$/);
  expect(page.url()).toMatch(/\/signup\?plan=yearly$/);
});

test('T070: home → /pricing → consume sections → monthly CTA → /signup?plan=monthly', async ({
  page,
}) => {
  // Three-stage /pricing journey the sprint task calls out:
  // navigate → consume → CTA. Exercises the T034 FinalCta link to
  // /pricing (which exists on the homepage AND /how-it-works), the
  // T057 page shell, the T058 tier card with both plan CTAs, and
  // the T059/T061 structural sections in between.
  await stubSignup(page);

  // Navigate: click "See full pricing" on the homepage. The text
  // is rendered as "See full pricing →" (with a right-arrow);
  // regex matching sidesteps trailing-character flakiness across
  // character encodings.
  await page.goto('/');
  await page.getByRole('link', { name: /See full pricing/ }).click();
  await expect(page).toHaveURL(/\/pricing\/?$/);

  // Consume: the page-level H1 renders (post-T069 SEO tune, it
  // still reads "One tier. Clear price.") and the two structural
  // H2s a reader must reach before the CTA — "What's included"
  // (T059) and "Common questions" (T061) — are present. If a
  // future refactor silently unmounts either section, the
  // assertion catches it.
  await expect(page.locator('h1')).toContainText('One tier');
  await expect(page.locator('h2').filter({ hasText: /What.{0,3}s included/ })).toBeVisible();
  await expect(page.locator('h2').filter({ hasText: /Common questions/ })).toBeVisible();

  // CTA: click "Start monthly" (T058 tier card) — a stand-in for
  // either plan CTA, since T063 already tests both independently.
  // Verifies the full home → /pricing → signup arc completes.
  await page.getByRole('link', { name: 'Start monthly' }).click();
  await page.waitForURL(/\/signup\?plan=monthly$/);
  expect(page.url()).toMatch(/\/signup\?plan=monthly$/);
});

test('T090: /demo → consume sections → trial CTA → /signup', async ({ page }) => {
  // Three-stage /demo journey the sprint task calls out: land →
  // consume → CTA. Unlike T055 (home → /how-it-works), there is no
  // hero link to /demo in the current build, so this test simulates
  // the realistic path — a cold SERP click on the "sim racing
  // telemetry demo" query (T088 tuned that meta) lands the reader
  // directly on /demo. From there they consume the T072 shell, the
  // T073 walkthrough placeholder, and the T086 testimonials block
  // before clicking the T085 FinalCta.
  await stubSignup(page);

  // Land: cold /demo entry.
  await page.goto('/demo');

  // Consume: H1 + the two key H2s must render. If a refactor
  // silently unmounts either section between T073/T086, the count
  // slips and this fails with a clear signal rather than letting
  // the CTA still work on a gutted page.
  await expect(page.locator('h1')).toContainText('See LAP in action');
  await expect(page.locator('h2').filter({ hasText: /three-minute walkthrough/i })).toBeVisible();
  await expect(
    page.locator('h2').filter({ hasText: /No testimonials until the beta opens/ }),
  ).toBeVisible();

  // CTA: scroll to the final trial button and click through.
  const trialCta = page.getByRole('link', { name: 'Start 14-day trial' });
  await trialCta.scrollIntoViewIfNeeded();
  await trialCta.click();
  await page.waitForURL(new RegExp(`^${SIGNUP_URL.replaceAll('.', '\\.')}`));
  expect(page.url()).toMatch(new RegExp(`^${SIGNUP_URL.replaceAll('.', '\\.')}`));
});

test('T055: home → /how-it-works → consume sections → trial CTA → /signup', async ({ page }) => {
  // Three-stage journey the sprint task calls out: navigate →
  // consume → CTA. Exercises the T026 secondary CTA (/how-it-works
  // link), the T042 page shell, the T043 hero, the full T045-T049
  // section arc (6 H2s on the page), and the T052 final-CTA mount
  // that closes to app.lap-coach.racing/signup.
  await stubSignup(page);

  // Navigate: click "See how it works" from the homepage.
  await page.goto('/');
  await page.getByRole('link', { name: 'See how it works' }).click();
  await expect(page).toHaveURL(/\/how-it-works\/?$/);

  // Consume: the hero H1 + all six section H2s must render (Capture,
  // Brain, Plan, Improve, Honesty, FinalCta). If a section silently
  // unmounts between T045-T049/T052, the H2 count slips and this
  // fails with a clear "expected 6, got N" signal.
  await expect(page.locator('h1')).toContainText('driver improvement loop');
  await expect(page.locator('h2')).toHaveCount(6);

  // CTA: scroll to the final trial button and click through.
  const trialCta = page.getByRole('link', { name: 'Start 14-day trial' });
  await trialCta.scrollIntoViewIfNeeded();
  await trialCta.click();
  await page.waitForURL(new RegExp(`^${SIGNUP_URL.replaceAll('.', '\\.')}`));
  expect(page.url()).toMatch(new RegExp(`^${SIGNUP_URL.replaceAll('.', '\\.')}`));
});
