import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HowItWorks from '../pages/how-it-works.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(HowItWorks));

test('T042: /how-it-works renders a single <main> landmark', async () => {
  // Every Astro page is wrapped by BaseLayout; the shell's own job
  // is to provide the <main> landmark (screen-reader skip target and
  // axe root container). Failing to emit exactly one <main> would
  // surface as an a11y regression when T055's e2e axe runs.
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T043: /how-it-works renders the locked hero H1 verbatim', async () => {
  // T043 sprint task specifies this exact H1 string: "The whole
  // driver improvement loop, in one place." The H1 is the page-level
  // equivalent of the homepage's T023 headline — any copy drift
  // here fractures the category framing ("loop") that T045-T048
  // build on.
  const html = await render();
  expect(html).toMatch(
    /<h1[^>]*>[\s\S]*The whole driver improvement loop, in one place[\s\S]*<\/h1>/,
  );
});

test('T043: hero subhead names the four-step loop (capture, brain, plan, improve)', async () => {
  // The subhead previews the sprint-mapped sections T045 (Capture)
  // → T046 (Brain) → T047 (Plan) → T048 (Improve). Locking the
  // four step-words at the HTML surface means any future copy
  // edit that silently drops one of them fails CI — the four-step
  // loop IS the page's narrative scaffold.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/\bcapture\b/);
  expect(lower).toMatch(/\bbrain\b/);
  expect(lower).toMatch(/\bplan\b/);
  expect(lower).toMatch(/\bimprove\b/);
});

test('T042: /how-it-works copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T042: /how-it-works title includes "LAP" branding (BaseLayout integration)', async () => {
  // Ensures BaseLayout is the chosen wrapper — the page-title format
  // "<Page> — LAP" mirrors the homepage ("LAP — Every lap, one step
  // better.") so the site's SERP appearance stays consistent.
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T044: the annotated SVG diagram is mounted on the page', async () => {
  // Integration check: the HowItWorksDiagram component (SVG + text
  // alt) ships below the hero. T044 moves the four-step framing
  // from abstract words (hero subhead) to a visual representation —
  // this test catches accidental unmounting.
  const html = await render();
  expect(html).toMatch(/<figure[^>]+role="img"/);
  expect(html).toMatch(/<svg[^>]+viewBox=/);
});

test('T045: the "Capture" section is mounted after the diagram', async () => {
  // Integration check: the first of four loop-step sections
  // (T045-T048) renders below the diagram. Ordering locked so the
  // page flow stays hero → diagram → capture → ... matching the
  // reader's mental model established by the diagram's clockwise
  // arrows.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Capture every session, sim or real[\s\S]*<\/h2>/);
  const diagramIdx = html.indexOf('The four-step loop');
  const captureIdx = html.indexOf('Capture every session, sim or real');
  expect(diagramIdx).toBeGreaterThan(-1);
  expect(captureIdx).toBeGreaterThan(diagramIdx);
});

test('T046: the "Brain" section lands after Capture (step 02 follows 01)', async () => {
  // Integration check: the Brain section (step 02) follows Capture
  // (step 01), mirroring the clockwise arrow in the T044 diagram.
  // Ordering matters — the coaching loop only makes sense in
  // sequence.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*The brain lives on the server[\s\S]*<\/h2>/);
  const captureIdx = html.indexOf('Capture every session, sim or real');
  const brainIdx = html.indexOf('The brain lives on the server');
  expect(captureIdx).toBeGreaterThan(-1);
  expect(brainIdx).toBeGreaterThan(captureIdx);
});

test('T047: the "Plan" section lands after Brain (step 03 follows 02)', async () => {
  // Integration check: the next-session plan section follows the
  // Brain section. Reader arc: brain analyses → plan emits.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*A plan sized to the next session[\s\S]*<\/h2>/);
  const brainIdx = html.indexOf('The brain lives on the server');
  const planIdx = html.indexOf('A plan sized to the next session');
  expect(brainIdx).toBeGreaterThan(-1);
  expect(planIdx).toBeGreaterThan(brainIdx);
});

test('T048: the "Improve" section lands after Plan — four-step loop complete', async () => {
  // Integration check: Improve (step 04) is the last of the four
  // loop-step sections. With this in place the page walks the reader
  // through all four steps T043's hero subhead names, in the same
  // clockwise order as the T044 diagram.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Every target either hits or misses[\s\S]*<\/h2>/);
  const planIdx = html.indexOf('A plan sized to the next session');
  const improveIdx = html.indexOf('Every target either hits or misses');
  expect(planIdx).toBeGreaterThan(-1);
  expect(improveIdx).toBeGreaterThan(planIdx);
});

test('T049: the "honesty" section (today vs Year 2) lands after Improve', async () => {
  // Integration check: honesty disclosure lands after the four-step
  // loop, so a reader who has just consumed the full capability arc
  // (T045-T048) arrives at "here is what actually ships today vs
  // what is roadmap." Placing honesty before the loop sections
  // would read as apologetic; after them, it reads as grounded.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*What ships today, and what is still roadmap[\s\S]*<\/h2>/);
  const improveIdx = html.indexOf('Every target either hits or misses');
  const honestyIdx = html.indexOf('What ships today, and what is still roadmap');
  expect(improveIdx).toBeGreaterThan(-1);
  expect(honestyIdx).toBeGreaterThan(improveIdx);
});

test('T052: /how-it-works closes with the shared trial CTA (href + rel locked)', async () => {
  // Integration check: the page ends with the same T025/T034 trial
  // contract. Reusing the FinalCta component (rather than a new
  // /how-it-works-specific CTA) keeps the href + rel=noopener
  // wiring in exactly one component — any future CTA-contract edit
  // propagates site-wide instead of drifting between pages.
  const html = await render();
  expect(html).toMatch(
    /<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"[^>]*>[\s\S]*Start 14-day trial[\s\S]*<\/a>/,
  );
  // Ordering: CTA appears after the honesty section so the reader
  // closes with "here's what today gives you" → "start the trial".
  const honestyIdx = html.indexOf('What ships today, and what is still roadmap');
  const ctaIdx = html.indexOf('Start 14-day trial');
  expect(honestyIdx).toBeGreaterThan(-1);
  expect(ctaIdx).toBeGreaterThan(honestyIdx);
});
