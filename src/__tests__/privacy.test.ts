// T101 — contract tests for /privacy. The page is the GDPR
// transparency notice required under Articles 13/14 — it discloses
// the data controller, the categories + purposes + legal bases of
// processing, the third-party processors, the data-subject rights,
// and how to exercise them. The actual prose is human-quality
// professional copy; these tests lock the structural facts that
// must appear so a future "tighten the copy" edit cannot quietly
// drop the regulatory disclosure floor.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Privacy from '../pages/privacy.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Privacy));

test('T101: /privacy renders a single <main> landmark', async () => {
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T101: /privacy renders the locked H1 "Privacy"', async () => {
  // The H1 names the page topic — a vaguer "Legal" or "Policies"
  // would force users to guess at the page identity. "Privacy"
  // matches the footer-link convention every site uses.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*Privacy[\s\S]*<\/h1>/);
});

test('T101: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T101: page identifies LAP as the data controller', async () => {
  // GDPR Article 13(1)(a): identity of the controller. "LAP" or
  // a registered legal entity name is what fills this. The absence
  // of this disclosure is itself an Article 13 violation.
  const html = await render();
  expect(html).toMatch(/LAP/);
  expect(html.toLowerCase()).toMatch(/(controller|operator|run by|behind)/);
});

test('T101: page lists the four wired processors (Resend, Cloudflare, PostHog, Sentry)', async () => {
  // GDPR Article 13(1)(e) + Recital 39: data subjects must know
  // who their data goes to. The four processors active on the
  // site today: Resend (waitlist + drip emails), Cloudflare
  // (hosting + Turnstile spam check), PostHog (cookieless
  // analytics, T014), Sentry (error monitoring, T016). All four
  // must be named.
  const html = await render();
  expect(html).toMatch(/Resend/);
  expect(html).toMatch(/Cloudflare/);
  expect(html).toMatch(/PostHog/);
  expect(html).toMatch(/Sentry/);
});

test('T101: page names the data-subject rights (access, erasure, withdrawal)', async () => {
  // GDPR Articles 15-21 enumerate rights. The minimum-viable
  // disclosure floor names access, erasure, and withdrawal of
  // consent — without those, the notice is incomplete and the
  // data subject does not know what they can ask for.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/access/);
  expect(lower).toMatch(/(erasure|delete|deletion)/);
  expect(lower).toMatch(/(withdraw|unsubscribe)/);
});

test('T101: page lists the right to lodge a complaint with a supervisory authority', async () => {
  // GDPR Article 13(2)(d): right to complain to a supervisory
  // authority. This is the regulatory-escalation safety valve
  // — required disclosure even when the data subject has never
  // had a complaint. The keyword is broad on purpose ("authority"
  // or "regulator" both satisfy the regulator-discovery test).
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/(supervisory authority|data protection authority|regulator|complaint)/);
});

test('T101: page provides a contact email for privacy requests', async () => {
  // GDPR Article 13(1)(b): contact details of the controller.
  // mailto: link is the universal expectation; the existing
  // refund policy uses support@lap-coach.racing — privacy-specific
  // (privacy@lap-coach.racing) or the same shared address both
  // satisfy.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="mailto:[^"]+@lap-coach\.racing"/);
});

test('T101: page mentions GDPR or the EU regulatory framework by name', async () => {
  // Naming the framework signals "we know which rules apply" and
  // matches the search-and-skim user behaviour of someone
  // looking for "is this site GDPR-compliant?". Implicit GDPR
  // disclosure (just describing rights without naming the law)
  // is legally sufficient but failing the search-and-skim test
  // hurts the trust signal.
  const html = await render();
  expect(html).toMatch(/GDPR/);
});

test('T101: page includes a "last updated" date', async () => {
  // GDPR doesn't strictly require the date, but every reasonable
  // privacy-notice convention does — the data subject needs to
  // know whether the notice has changed since their consent.
  // Pattern: "Last updated: <date>" or "Updated <date>" or any
  // recognisable date string near the end of the page.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/(last updated|updated)/);
  // 4-digit year recognisable as a date anchor.
  expect(html).toMatch(/202[6-9]/);
});

test('T101: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
