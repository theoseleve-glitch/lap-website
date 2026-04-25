// T117 — /product/bridge page contract. Third per-pillar product
// page after desktop and mobile. The bridge is the sim↔real
// transfer algorithm: ADR-005 §5.5 TransferLink in marketing
// vocabulary. Sub-tasks T118 (transfer-report screenshot, BLOCKED
// on real assets) and T119 (algorithm teaser) layer onto this base.
//
// Locks here are about the doctrine framework: "shape vs intensity"
// is the conceptual unlock from homepage T030 that the pillar page
// must reaffirm. Without that anchor the page reads as generic
// algorithm marketing instead of the LAP-specific position.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Bridge from '../pages/product/bridge.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Bridge));

test('T117: /product/bridge renders a single <main> landmark', async () => {
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T117: H1 names the bridge or the sim-real transfer concept', async () => {
  const html = await render();
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  expect(h1Match).not.toBeNull();
  const h1 = h1Match![1].toLowerCase();
  // H1 must name the bridge or "sim and real" — anything generic
  // ("how transfer works") fails the position test.
  expect(h1).toMatch(/(bridge|sim.{0,5}real|sim and real)/);
});

test('T117: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T117: page names both "sim" and "real" (the cross-platform anchor)', async () => {
  // The bridge is the cross-platform doctrine made concrete. If
  // the page only mentions sim or only mentions real, the
  // bidirectional transfer story collapses to a one-way feature.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/sim/);
  expect(lower).toMatch(/real/);
});

test('T117: page names the "shape vs intensity" framework (T030 cross-doc lock)', async () => {
  // Doctrine §1 + homepage T030 §5.5 both anchor "shape vs
  // intensity" as the why-this-works concept. Lap times do not
  // transfer (different reference, different setup, different
  // fidelity); WEAKNESS SHAPES do. Lock both keywords —
  // dropping either weakens the conceptual story.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/\bshape\b/);
  expect(lower).toMatch(/\bintensity\b/);
});

test('T117: page names the "transfer" concept (the verb behind the bridge)', async () => {
  // ADR-005 §5.5 calls the algorithm TransferLink. The marketing
  // vocabulary uses "transfer" as the noun — what crosses
  // between platforms. Locking the keyword keeps the technical
  // and marketing surfaces aligned.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/transfer/);
});

test('T117: page includes a concrete track-name example', async () => {
  // Abstract algorithm talk loses sim racers; a specific example
  // (Spa, Nordschleife, Silverstone, Mount Panorama, etc.) makes
  // the transfer concrete. Lock at least one named circuit.
  const html = await render();
  expect(html).toMatch(
    /Spa|Nordschleife|Silverstone|Brands Hatch|Mount Panorama|Suzuka|Le Mans|Imola|Monza|Le Castellet/i,
  );
});

test('T117: page has a back-link to the /product overview', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/product"/);
});

test('T117: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
