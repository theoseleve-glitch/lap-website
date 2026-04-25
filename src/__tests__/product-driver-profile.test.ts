// T122 — /product/driver-profile page contract. Fifth and final
// per-pillar product page after desktop / mobile / bridge / coaching.
// The driver profile is the unification surface — sim AND real
// sessions fold into one progression-over-time record, with
// weakness episodes (ADR-005 §5.2) and skill dimensions (§5.1
// DriverProgressSnapshot) as the underlying objects.
//
// Doctrine voice: cross-platform Driver OS, ADR-005 vocabulary
// (skill dimensions, score, confidence, weakness, prescription),
// no AI-coach / LLM / generative claims (ADR-004). The /product
// overview pillar descriptor commits this page to: strengths,
// weaknesses, drills attempted, drills closed, by track and by
// car class — "shape of your driving over time instead of a
// folder of telemetry files you never look at again."

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import DriverProfile from '../pages/product/driver-profile.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(DriverProfile));

test('T122: /product/driver-profile renders a single <main> landmark', async () => {
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T122: H1 names the driver profile or the progression concept', async () => {
  const html = await render();
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  expect(h1Match).not.toBeNull();
  const h1 = h1Match![1].toLowerCase();
  expect(h1).toMatch(/(driver|profile|progression)/);
});

test('T122: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T122: page names "progression" — the deliverable verb', async () => {
  // Sprint task title is "progression narrative" and the /product
  // overview pillar descriptor leads with "Your progression, six
  // months in." Without the keyword on the dedicated page the
  // promise from the overview silently collapses.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/progression/);
});

test('T122: page names skill dimensions — the ADR-005 §5.1 framework', async () => {
  // DriverProgressSnapshot scores 10 named skill dimensions
  // (braking, throttle_pickup, minimum_speed, line_consistency,
  // tire_management, racecraft, fatigue_consistency, etc.). The
  // page must reach the framework word so a reader can model
  // "this is a multi-axis profile" instead of "one number."
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/skill|dimension/);
});

test('T122: page names "weakness" — ADR-005 §5.2 lifecycle anchor', async () => {
  // WeaknessEpisode is the longitudinal record of a recurring
  // issue — open / improving / resolved / dormant. The driver
  // profile is where that lifecycle becomes visible to the user.
  // Naming "weakness" is the link back to the coaching pillar.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/weakness/);
});

test('T122: page names BOTH sim AND real (the cross-platform unification)', async () => {
  // The driver profile is THE unification point — one progression
  // record across sim and real-life sessions. If the page only
  // names sim or only names real, the cross-platform claim
  // collapses to a single-platform feature. The whole point of
  // a profile (vs a desktop dashboard or mobile dashboard) is
  // that it is platform-blind.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/\bsim/);
  expect(lower).toMatch(/\breal/);
});

test('T122: page names a temporal anchor (month / weeks / over time)', async () => {
  // Progression IS the time axis. Without naming a temporal
  // anchor the page reads as a static rating, which is the
  // exact failure mode (LLM coach scoring you in a moment) the
  // doctrine rules out. Lock at least one time-window keyword.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/(month|week|over time|six month|three month)/);
});

test('T122: page names "track" — one of the indexing axes', async () => {
  // /product overview pillar descriptor: "by track and by car
  // class." Track is one of the two indexing axes; the dedicated
  // page must reaffirm so a reader who lands here directly sees
  // the segmentation story.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/track/);
});

test('T122: page names "car" — the second indexing axis', async () => {
  // Same source — /product overview pillar descriptor names
  // "car class" as the second axis. Locking it explicitly so a
  // future copy edit cannot silently drop the per-car-class
  // segmentation that GT3 vs LMP vs Formula drivers will look
  // for on the page.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/car/);
});

test('T122: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T122: page has a back-link to the /product overview', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/product"/);
});
