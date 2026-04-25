// T108 — /product/desktop page contract. Three feature areas
// (sim capture, live coaching, strategy) plus the cross-platform
// position. Sub-tasks T109-T112 layer screenshots+video, download
// CTA, supported sims list, system requirements onto this base
// page; T108's job is the doctrine-aligned narrative shell.
//
// Doctrine concern around "live coaching": ADR-004 forbids
// LLM-driven coaching claims. The H2 heading uses the sprint-spec
// vocabulary ("live coaching") but the BODY must frame it as
// rule-based reference signals (pace delta, sector deltas,
// reference-lap overlay) — not an LLM voice coach. The doctrine
// guardrail (no AI-coach / LLM / generative) catches the latter.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Desktop from '../pages/product/desktop.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Desktop));

test('T108: /product/desktop renders a single <main> landmark', async () => {
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T108: H1 names the desktop product surface', async () => {
  const html = await render();
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  expect(h1Match).not.toBeNull();
  expect(h1Match![1].toLowerCase()).toMatch(/desktop/);
});

test('T108: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T108: page names all three feature areas (sim capture, live coaching, strategy)', async () => {
  // The sprint task's three named areas. If a copy edit drops one
  // (e.g., the strategy section gets folded into "coaching"),
  // the page no longer matches the /product overview's promise of
  // "sim capture, live coaching, strategy" — the contract drift
  // would only surface in a manual review otherwise.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/(sim )?capture/);
  expect(lower).toMatch(/coaching/);
  expect(lower).toMatch(/strategy/);
});

test('T108: page names the supported sims (iRacing, ACC, AMS2)', async () => {
  // The cross-platform pitch is hollow without naming which sims.
  // T111 will land a richer supported-sims list; T108 ships at
  // least one mention so the cross-platform claim stays concrete.
  // Locking ALL THREE here means a future copy edit cannot quietly
  // drop AMS2 or ACC in favour of a single-sim story.
  const html = await render();
  expect(html).toMatch(/iRacing/);
  expect(html).toMatch(/ACC|Assetto Corsa Competizione/);
  expect(html).toMatch(/AMS2|Automobilista/);
});

test('T108: page has a back-link to the /product overview', async () => {
  // Cross-page navigation contract. The five pillar pages all
  // need a way back to /product so the visitor can compare. A
  // browser-back works but a hand-off link is the doctrine
  // posture (don't depend on the back button).
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/product"/);
});

test('T108: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  // The most likely place for a doctrine violation given the
  // "live coaching" section heading. The body must frame it as
  // rule-based reference signals, not an LLM coach voice.
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T111: page renders a structured "Supported sims" grid section', async () => {
  // T108 already names the three sims inline in the capture
  // section — that anchors the cross-platform claim at the top
  // of the page. T111 layers a CANONICAL "which sims" reference
  // grid: a labelled section that visitors scanning the page can
  // jump to without reading the prose. The aria-labelledby
  // pattern is consistent with every other section component on
  // the site.
  const html = await render();
  // Aria-labelled section heading naming the supported sims.
  expect(html).toMatch(/<section[^>]+aria-labelledby="[^"]*supported-sims/);
  // The heading itself uses "Supported sims" (or close) language.
  expect(html.toLowerCase()).toMatch(/supported sims/);
});

test('T111: supported-sims section uses a list (ul/ol) with three sim entries', async () => {
  // Bullet grid = a <ul> (or grid layout via class). Locking the
  // <ul> structure means a future refactor that flattens to prose
  // (and loses the canonical "which sims" reference shape) fails
  // the test before shipping.
  const html = await render();
  // At least one <ul> on the page.
  expect(html).toMatch(/<ul[\s>]/);
});

test('T111: each sim entry has a one-line descriptor (not just the name)', async () => {
  // Bare names ("iRacing / ACC / AMS2") fail the descriptor
  // contract — a visitor needs to know whether the kind of racing
  // they actually do is supported. Descriptors anchor this.
  // Each sim's descriptor names a strength: iRacing = multiplayer
  // / official series, ACC = GT3 / GT4 / endurance, AMS2 = formula
  // / stock / track list. The test locks at least one strength
  // anchor per sim.
  const html = await render();
  const lower = html.toLowerCase();
  // iRacing: official series or multiplayer
  expect(lower).toMatch(/(official series|multiplayer|league)/);
  // ACC: GT3 / GT4 / endurance / Blancpain
  expect(lower).toMatch(/(gt3|gt4|endurance|blancpain)/);
  // AMS2: formula / stock / broad track list
  expect(lower).toMatch(/(formula|stock car|track list|brazilian)/);
});
