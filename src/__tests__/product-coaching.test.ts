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

// Helper for T121: extract the samples section by aria-labelledby.
// Section-scoped pattern matches the bridge/mobile precedent — a
// stray reference elsewhere in the page does NOT satisfy the
// structural contract for the samples section. T120 already names
// "weakness" / "prescription" / "rule" page-wide, so without this
// scope the new tests would pass on the T120 base alone.
function extractSamplesSection(html: string): string {
  const match = html.match(
    /<section[^>]+aria-labelledby="[^"]*samples[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
  );
  return match ? match[1] : '';
}

test('T121: page has a dedicated samples section', async () => {
  // T120 base shell ends at "Rule → prescription"; the samples
  // section is what makes the catalog claim concrete — a reader
  // who scans for "show me a rule" should land on a heading.
  const html = await render();
  expect(html).toMatch(/<section[^>]+aria-labelledby="[^"]*samples/i);
});

test('T121: samples section contains 3 distinct sample headings (catalog, not anecdote)', async () => {
  // One sample reads as a hand-picked anecdote; three or more
  // reads as a catalog with shape coverage. The library framing
  // requires multiple visible rules.
  const html = await render();
  const section = extractSamplesSection(html);
  expect(section).not.toBe('');
  const headings = section.match(/<h3[\s>][\s\S]*?<\/h3>/gi) ?? [];
  expect(headings.length).toBeGreaterThanOrEqual(3);
});

test('T121: samples section names a specific track corner / named circuit', async () => {
  // Generic "fast right-hander" loses sim racers. A named corner
  // (Spa La Source, Brands Hatch Druids, Silverstone Copse, etc.)
  // makes the example concrete. Lock at least one named circuit
  // or named corner so a future copy edit cannot quietly
  // genericise to "a slow corner."
  const html = await render();
  const section = extractSamplesSection(html);
  expect(section).toMatch(
    /Spa|La Source|Eau Rouge|Pouhon|Brands Hatch|Druids|Suzuka|130R|Silverstone|Copse|Maggotts|Becketts|Nordschleife|Imola|Monza|Mount Panorama/i,
  );
});

test('T121: samples section names a measurable success condition', async () => {
  // ADR-005 §5.3 SuccessCondition — every prescription must have
  // a measurable target. The marketing surface has to show the
  // numerical commitment (km/h, %, sessions, etc.) so readers
  // see that "rules-based" means "auditable", not "vibes." A
  // page without numbers in the samples is the exact failure
  // mode this lock prevents.
  const html = await render();
  const section = extractSamplesSection(html);
  expect(section).toMatch(/\d+\s*(km\/h|kmh|%|sessions?|days?|laps?)/i);
});

test('T121: samples section names a coaching library rule-id-like reference (ADR-013 pattern)', async () => {
  // ADR-013 rule format uses dotted lower-snake ids like
  // "br.late_braking.apex_speed_loss". Showing one rule id on
  // the marketing page anchors the "catalog of named, versioned
  // rules" claim — readers see a concrete identifier, not a
  // black box. Locked inside the samples section so a stray
  // dotted token elsewhere (filenames, etc.) does NOT satisfy.
  const html = await render();
  const section = extractSamplesSection(html);
  expect(section).toMatch(/[a-z]+\.[a-z_]+/);
});

test('T121: samples section names at least one drill / action verb', async () => {
  // The prescription is the "do this next session" output. A
  // sample that surfaces only the weakness without naming a drill
  // (or actionable verb — release, brake, throttle) collapses
  // to "here is your problem" without "here is what you do."
  // Lock the actionable side too.
  const html = await render();
  const section = extractSamplesSection(html);
  expect(section.toLowerCase()).toMatch(
    /\b(drill|trail.brake|throttle|release|brake later|brake earlier|input)\b/,
  );
});
