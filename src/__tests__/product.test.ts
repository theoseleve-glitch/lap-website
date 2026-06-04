// T107 — /product overview page (June-8 rebuild). The product-
// architecture surface of the marketing site: the homepage carries
// the position, /how-it-works carries the loop narrative, /product
// names the five things LAP does as one consolidated, anchored page.
//
// The old six /product/* pillar sub-pages were removed in the
// rebuild; this is now ONE static page with five in-page sections
// (#analysis #coaching #strategy #bridge #capture), each with a
// PlaceholderMedia and a trial CTA. There are no cross-links to
// /product/* sub-pages any more.
//
// Locks here are about doctrine alignment + structural shape:
// the five sections must all be present (otherwise the architecture
// reads as incomplete), the page must NOT regress to cross-linking
// removed /product/* sub-pages, and the cross-platform sim+real
// pitch must be visible (without it the page is just a feature
// catalog, not a position statement).

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

test('T107: page names all five things LAP does (analysis, coaching, strategy, bridge, capture)', async () => {
  // The consolidated /product page has five sections. If a future
  // edit drops one, the architecture reads as four-piece-not-five.
  // Lock both the section anchors (so the in-page jump nav keeps
  // resolving) and the human-facing section vocabulary.
  const html = await render();
  const lower = html.toLowerCase();
  // Section anchor ids — these back the in-page jump nav hrefs.
  expect(html).toMatch(/id="analysis"/);
  expect(html).toMatch(/id="coaching"/);
  expect(html).toMatch(/id="strategy"/);
  expect(html).toMatch(/id="bridge"/);
  expect(html).toMatch(/id="capture"/);
  // Human-facing vocabulary for each of the five.
  expect(lower).toMatch(/session analysis/);
  expect(lower).toMatch(/corner coaching/);
  expect(lower).toMatch(/race strategy/);
  expect(lower).toMatch(/bridge/);
  expect(lower).toMatch(/capture/);
});

test('T107: in-page jump nav links to all five section anchors', async () => {
  // The intro carries an in-page jump nav (the consolidated page's
  // replacement for the old per-pillar cross-links). Lock that each
  // nav entry points at its on-page section anchor so the jump nav
  // keeps working as sections are edited.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="#analysis"/);
  expect(html).toMatch(/<a[^>]+href="#coaching"/);
  expect(html).toMatch(/<a[^>]+href="#strategy"/);
  expect(html).toMatch(/<a[^>]+href="#bridge"/);
  expect(html).toMatch(/<a[^>]+href="#capture"/);
});

test('T107: page does NOT cross-link the removed /product/* sub-pages', async () => {
  // The six /product/* pillar sub-pages were removed in the June-8
  // rebuild and consolidated into this single anchored page. Guard
  // against a regression that re-introduces links to those dead
  // paths (they would 404).
  const html = await render();
  expect(html).not.toMatch(/href="\/product\/[^"#]/);
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

test('T107: copy stays doctrine-aligned — no AI-coach positioning, coaching framed as rule-based', async () => {
  // Doctrine: LAP must never be positioned AS an AI coach / LLM /
  // generative chat tool. The rebuilt page goes further — it
  // explicitly disclaims that framing ("not a chat box", "no
  // generative chat", "not an LLM chat box"). So we ban the
  // AFFIRMATIVE positioning phrases (which must not appear) and
  // positively assert the rule-based disclaimer is present, rather
  // than banning the words "generative"/"chat" outright (they now
  // legitimately appear inside the negations).
  const lower = (await render()).toLowerCase();
  // No affirmative AI-coach / generative-coaching claims.
  expect(lower).not.toMatch(/\bai coach\b/);
  expect(lower).not.toMatch(/\bai-powered\b/);
  expect(lower).not.toMatch(/\bgenerative ai\b/);
  // The "generative"/"chat" mentions that DO appear must be the
  // doctrine-aligned negations, not affirmations.
  expect(lower).toMatch(/no generative chat/);
  expect(lower).toMatch(/not a chat box/);
  // And coaching is positively framed as rule-based.
  expect(lower).toMatch(/rule-based/);
});
