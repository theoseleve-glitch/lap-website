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

function stubSignup(page: import('@playwright/test').Page) {
  return page.route(SIGNUP_URL, (route) =>
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
