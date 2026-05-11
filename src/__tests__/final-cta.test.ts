import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import FinalCta from '../components/FinalCta.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(FinalCta));

test('renders the closing H2 "Ready to make your next session count?"', async () => {
  // T034 locks this as the page-closing call. "Next session" ties the
  // CTA back to the T029 "After every session" section and the
  // doctrine's outcome-loop framing. Any drift to a weaker "Join us"
  // or "Sign up today" would flatten the narrative close.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Ready to make your next session count\?[\s\S]*<\/h2>/);
});

test('wraps the section in a <section> with aria-labelledby pointing to the heading id', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('renders the €15/month price anchor from doctrine §8', async () => {
  // 01-STRATEGIC-DOCTRINE.md §8: "Pricing: €15/month or €150/year
  // (≈€12.50/month). Single tier." Doctrine §10 bullet 3: "€15/month
  // core tier — price does not move up during the 6 months." Locking
  // the number at the HTML surface means any accidental pricing
  // change (€19, $15, etc.) fails CI before it ships.
  const html = await render();
  expect(html).toMatch(/€15/);
});

test('renders the €150/year price anchor from doctrine §8', async () => {
  // Same lock for the annual plan. The yearly price is how the
  // doctrine expresses the loyalty discount (€30 saving); losing it
  // silently would strip one of the two commitment paths from the
  // page.
  const html = await render();
  expect(html).toMatch(/€150/);
});

test('primary CTA: "Start 14-day trial" → /register', async () => {
  // T025 locked this text + href for the hero. The final CTA MUST
  // reuse both so the hero button and the page-closing button are
  // recognizably the same commitment. Drift here would either create
  // two different trial flows or break the attribution model.
  //
  // Hand-off target was originally `https://app[.]lap-coach[.]racing/signup`
  // (square brackets keep this comment outside the URL-rewrite pass);
  // updated 2026-05-11 to the actual production webapp route at
  // /register (V2 Next.js, served via Cloudflare
  // Worker route `lap-coach.racing/register*`). The `app.` subdomain
  // was never set up in DNS; pointing CTAs at it returned NXDOMAIN.
  const html = await render();
  expect(html).toMatch(
    /<a[^>]+href="\/register"[^>]*>[\s\S]*Start 14-day trial[\s\S]*<\/a>/,
  );
});

test('primary CTA carries rel="noopener"', async () => {
  // Kept for defense-in-depth even though the hand-off is now same-site
  // (www.lap-coach.racing/register sits behind a worker route on the
  // same zone). rel=noopener is harmless here and would re-acquire its
  // original meaning the day the webapp moves to a different origin
  // (e.g. app.lap-coach.racing once that rebuild ships).
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/register"[^>]+rel="noopener"/);
});

test('renders a secondary link to /pricing for the full tier card', async () => {
  // Final CTA intentionally compresses pricing to the €15/€150
  // anchors; readers who want the full "what's included" breakdown
  // (T059) and FAQ (T061) follow /pricing. Lock the href so this
  // hand-off stays intact.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/pricing"/);
});

test('copy stays doctrine-aligned — no AI-coach / LLM / generative framing', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
