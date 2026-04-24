import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import SimAndReal from '../components/SimAndReal.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(SimAndReal));

test('renders the section heading "Sim and real, one driver profile" in an <h2>', async () => {
  // Decision: T030 locks this string as the bridge-narrative section
  // heading. The phrasing delivers the doctrine claim in one line —
  // one profile, two worlds — and mirrors 01-STRATEGIC-DOCTRINE.md
  // bet #2 (cross-platform ecosystem is a moat) in user-facing words.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Sim and real, one driver profile[\s\S]*<\/h2>/);
});

test('wraps the section in a <section> with aria-labelledby pointing to the heading id', async () => {
  // Landmark posture: same pattern as AfterEverySession — the section
  // is named by its visible <h2>, not a generic "region".
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('renders exactly two sub-beat articles, each with its own h3', async () => {
  // Two beats: "One session format" (the schema claim) and "Shape vs
  // intensity" (the comparison model). Any drift to one beat or three
  // would mean the narrative collapsed or grew an extra arm.
  const html = await render();
  const articleMatches = html.match(/<article[\s>]/g) ?? [];
  expect(articleMatches.length).toBe(2);
  const h3Matches = html.match(/<h3[\s>]/g) ?? [];
  expect(h3Matches.length).toBe(2);
});

test('sub-beat headings name "One session format" and "Shape vs intensity"', async () => {
  // ADR-005 §5.5 TransferLink carries shape_match_score and
  // intensity_match_score as first-class fields. Principle 2 of
  // 01-STRATEGIC-DOCTRINE.md §4 mandates one canonical session format
  // everywhere, day one. Locking these exact H3s at the surface keeps
  // the marketing narrative paraphrasing the data model — not the
  // other way around.
  const html = await render();
  expect(html).toMatch(/<h3[^>]*>[\s\S]*One session format[\s\S]*<\/h3>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Shape vs intensity[\s\S]*<\/h3>/);
});

test('copy names both sim and real-world capture (the bridge framing)', async () => {
  // The single most important claim in this section is "sim + real
  // = one profile". If either side of the bridge disappears from the
  // copy, the section silently collapses into a sim-only or real-only
  // pitch (which is exactly what Garage61 and RaceChrono already do).
  const html = await render();
  expect(html).toMatch(/\bsim\b/i);
  expect(html).toMatch(/real[- ]world/i);
});

test('copy names the shape-vs-intensity comparison framework verbatim', async () => {
  // Lock the ADR-005 §5.5 vocabulary — both axis names must appear in
  // the prose so a reader who only scans the body gets the
  // deterministic-comparison framing instead of a vague "AI tells you
  // what transfers" read.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\bshape\b/);
  expect(html.toLowerCase()).toMatch(/\bintensity\b/);
});

test('copy stays doctrine-aligned — no AI-coach / LLM / generative framing', async () => {
  // 01-STRATEGIC-DOCTRINE.md §10 bullet 4: "The moment we generate
  // coaching narrative with an LLM, we lose the trust differentiator."
  // The bridge section is a likely drift point ("AI compares your sim
  // and real sessions") — lock the negatives at the test surface.
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
