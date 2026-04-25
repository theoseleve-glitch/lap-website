// T107 — /product overview page. The product-architecture surface
// of the marketing site: the homepage carries the position, /how-
// it-works carries the loop narrative, /product names the five
// pillars (desktop / mobile / bridge / coaching / driver-profile)
// + cross-links to the per-pillar sub-pages that ship in T108-T122.
//
// Locks here are about doctrine alignment + structural shape:
// the five pillars must all be present (otherwise the architecture
// reads as incomplete), the cross-links must point at the canonical
// /product/X paths (otherwise T108-T122 land at the wrong URLs),
// and the cross-platform sim+real pitch must be visible (without
// it the page is just a feature catalog, not a position statement).

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Product from '../pages/product.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Product));

test('T107: /product renders a single <main> landmark', async () => {
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T107: /product renders an H1 naming the product overview', async () => {
  // The H1 anchors the page topic. "Product" alone reads as a
  // generic catalog header; pairing it with a phrase that names
  // the five-pillar shape (or LAP) keeps the position visible
  // even at a quick scan.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*<\/h1>/);
  // H1 should mention either "LAP" or a position word ("Driver OS",
  // "product"). Locking that the H1 is on-message rather than
  // accepting any string.
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  expect(h1Match).not.toBeNull();
  expect(h1Match![1]).toMatch(/LAP|Driver OS|product/i);
});

test('T107: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T107: page names all five product pillars (desktop, mobile, bridge, coaching, driver profile)', async () => {
  // The five pillars map 1:1 to T108+ sub-task pages. If a future
  // edit drops one pillar from the overview, the architecture
  // reads as four-piece-not-five, and the dropped sub-page becomes
  // unreachable from the marketing surface.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/desktop/);
  expect(lower).toMatch(/mobile/);
  expect(lower).toMatch(/bridge/);
  expect(lower).toMatch(/coaching/);
  expect(lower).toMatch(/driver profile/);
});

test('T107: page links to all five /product/* sub-pages (cross-link contract)', async () => {
  // The per-pillar sub-pages land in T108-T122 with these exact
  // paths. Locking the links here means when those pages ship,
  // the cross-links resolve automatically with no follow-up edit
  // to the overview. Until then, the links 404 — which reads as
  // honest "coming soon" rather than as a broken interaction
  // (the pillar names + descriptions render regardless).
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/product\/desktop"/);
  expect(html).toMatch(/<a[^>]+href="\/product\/mobile"/);
  expect(html).toMatch(/<a[^>]+href="\/product\/bridge"/);
  expect(html).toMatch(/<a[^>]+href="\/product\/coaching"/);
  expect(html).toMatch(/<a[^>]+href="\/product\/driver-profile"/);
});

test('T107: page names the cross-platform sim+real pitch', async () => {
  // 01-STRATEGIC-DOCTRINE.md §1: "cross-platform Driver OS that
  // turns every sim and real-world session into a personalised
  // development plan". The product overview without sim+real
  // reads as a sim-only or real-only tool — exactly the
  // generic-tooling positioning we are NOT.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/sim/);
  expect(html.toLowerCase()).toMatch(/real/);
});

test('T107: page mentions Coaching Memory primitives (weakness/prescription/outcome)', async () => {
  // ADR-005 §5.2-5.4 vocabulary. Same lock as the homepage T029
  // section — naming the primitives keeps the product overview
  // tied to the actual backend, not vague "insights and tips"
  // language a generic telemetry tool would use.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/weakness|prescription|outcome/);
});

test('T107: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
