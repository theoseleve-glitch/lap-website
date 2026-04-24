import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HowItWorksBrain from '../components/HowItWorksBrain.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(HowItWorksBrain));

test('T046: renders the H2 "The brain lives on the server"', async () => {
  // 01-STRATEGIC-DOCTRINE.md §4 principle 1: "Server owns the brain.
  // Clients are thin." The H2 paraphrases the principle verbatim so
  // the page-level commitment is visible on the /how-it-works page;
  // drift to "the brain uses AI" or similar would invert the
  // positioning that locks out LLM-generated coaching.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*The brain lives on the server[\s\S]*<\/h2>/);
});

test('T046: wraps the section in a <section> with aria-labelledby landmark', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T046: renders three h3 sub-beats — Weaknesses, Prescriptions, bridge', async () => {
  // Three beats map 1:1 to the three ADR-005 brain objects:
  // §5.2 WeaknessEpisode, §5.3 ActionPrescription, §5.5 TransferLink.
  // Lock all three H3s so accidentally collapsing a beat collapses
  // one of the backend surfaces this page promises.
  const html = await render();
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Weaknesses[\s\S]*<\/h3>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Prescriptions[\s\S]*<\/h3>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*bridge[\s\S]*<\/h3>/i);
  const h3Count = (html.match(/<h3[\s>]/g) ?? []).length;
  expect(h3Count).toBe(3);
});

test('T046: carries the "rule-based coaching library" moat signal (Bet #1)', async () => {
  // 01-STRATEGIC-DOCTRINE.md §7 Bet #1: "Coaching library is a moat.
  // 80-150 rules written by us, curated, tested against real sessions.
  // Basic ML augments. No generative AI." The "rule-based" framing
  // is what distinguishes LAP from anything downstream of an LLM —
  // lock it at the HTML surface.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/rule-based/);
});

test('T046: bridge beat names shape-vs-intensity comparison framework (ADR-005 §5.5)', async () => {
  // Doctrine-anchored vocabulary from ADR-005 §5.5 TransferLink
  // (shape_match_score, intensity_match_score). Lock both words so
  // the bridge claim stays concrete rather than drifting into
  // hand-wave territory ("AI compares your sim and real sessions").
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\bshape\b/);
  expect(html.toLowerCase()).toMatch(/\bintensity\b/);
});

test('T046: copy stays doctrine-aligned — no AI-coach / LLM / generative framing', async () => {
  // This is the single highest-risk section for LLM drift. The
  // word "brain" invites "AI" framing; the word "coaching" invites
  // "AI coach" drift. Lock all three negatives at the HTML surface.
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
