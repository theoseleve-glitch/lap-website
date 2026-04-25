// T120 — /product/coaching page contract. Fourth per-pillar product
// page after desktop/mobile/bridge. The coaching library is the
// moat (ADR-013) and the engine that turns a WeaknessEpisode
// (ADR-005 §5.2) into an ActionPrescription (§5.3) and closes the
// loop via ActionOutcome (§5.4). Sub-task T121 (sample weaknesses +
// prescriptions) layers onto this base.
//
// Doctrine lock: ADR-004 forbids LLM-driven coaching in the
// 6-month plan; the page must explicitly frame the library as
// rules-based, not generative. Same defensive negation pattern
// /product/desktop uses for its "live coaching" section.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Coaching from '../pages/product/coaching.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Coaching));

test('T120: /product/coaching renders a single <main> landmark', async () => {
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T120: H1 names coaching or the coaching library', async () => {
  const html = await render();
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  expect(h1Match).not.toBeNull();
  const h1 = h1Match![1].toLowerCase();
  expect(h1).toMatch(/(coaching|library)/);
});

test('T120: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T120: page names "library" — the moat anchor (ADR-013)', async () => {
  // The library is the moat per ADR-013. Dropping the keyword
  // collapses the page to generic "we have a coach" copy that
  // could be said about any LLM-wrapper product.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\blibrary\b/);
});

test('T120: page names "rule" or "rules" — the library mechanism', async () => {
  // Rules are the unit of the library (ADR-013 — 80-150 YAML
  // rules by Month 4). Without naming "rule" on the page the
  // library reads as a black box; with it, a reader can model
  // "this is a catalog of detectors with prescriptions attached."
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\brules?\b/);
});

test('T120: page names the ADR-005 weakness-prescription-outcome chain', async () => {
  // The coaching library's job is to turn WeaknessEpisode (§5.2)
  // detections into ActionPrescription (§5.3) objects with
  // ActionOutcome (§5.4) closing the loop. All three appear on
  // the /product overview pillar descriptor; the dedicated page
  // must reaffirm them so a reader who lands here directly still
  // sees the full conceptual loop.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/weakness/);
  expect(lower).toMatch(/prescription/);
  expect(lower).toMatch(/outcome/);
});

test('T120: page names the rule-indexing axes (track, car)', async () => {
  // The /product overview pillar descriptor names the indexing
  // triple — "track section, car class, weakness shape." It is
  // what makes the library a library and not a one-size-fits-all
  // tip sheet. Locking track + car keeps the indexing story
  // visible on the dedicated page; "weakness shape" is already
  // locked by the weakness/prescription/outcome test above.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/track/);
  expect(lower).toMatch(/car/);
});

test('T120: page explicitly frames the library as rule-based (ADR-004 anti-LLM lock)', async () => {
  // ADR-004 forbids LLMs in the 6-month plan. /product/desktop's
  // "live coaching" section uses the same defensive negation —
  // "rule-based reference signals, not generated commentary" —
  // to prevent a reader silently inferring "AI coach". The
  // coaching pillar is the single highest-risk surface for that
  // misread, so the explicit framing has to be present.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/rule-based|rules-based/);
});

test('T120: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T120: page has a back-link to the /product overview', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/product"/);
});
