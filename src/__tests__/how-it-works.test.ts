import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HowItWorks from '../pages/how-it-works.astro';
import { MEMBERSHIP } from '../data/membership';

const render = () => AstroContainer.create().then((c) => c.renderToString(HowItWorks));

test('/how-it-works renders a single <main> landmark', async () => {
  // Every Astro page is wrapped by BaseLayout; the shell's own job
  // is to provide the <main> landmark (screen-reader skip target and
  // axe root container). Failing to emit exactly one <main> would
  // surface as an a11y regression.
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('/how-it-works renders the hero H1 verbatim', async () => {
  // June-8 rebuild H1: "Capture, analyze, plan, improve — one loop."
  // The H1 is the page-level equivalent of the homepage headline —
  // any copy drift here fractures the category framing ("loop") that
  // the four step-sections build on.
  const html = await render();
  expect(html).toMatch(
    /<h1[^>]*>[\s\S]*Capture, analyze, plan, improve\s*—\s*one loop\.[\s\S]*<\/h1>/,
  );
});

test('hero copy names the four-step loop (capture, analyze, plan, improve)', async () => {
  // The hero + steps preview the four-step loop. Locking the four
  // step-words at the HTML surface means any future copy edit that
  // silently drops one of them fails CI — the four-step loop IS the
  // page's narrative scaffold.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/\bcapture\b/);
  expect(lower).toMatch(/\banalyze\b/);
  expect(lower).toMatch(/\bplan\b/);
  expect(lower).toMatch(/\bimprove\b/);
});

test('/how-it-works copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('/how-it-works title includes "LAP" branding (BaseLayout integration)', async () => {
  // Ensures BaseLayout is the chosen wrapper and the page title carries
  // the brand so the site's SERP appearance stays consistent.
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('<title> carries the "sim racing coaching" target keyword', async () => {
  // The page targets the long-tail "sim racing coaching loop / how it
  // works" query. Putting the core noun phrase in the <title> gives the
  // single strongest ranking signal. The phrasing stays natural — no
  // SEO keyword soup.
  const html = await render();
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  expect(titleMatch).not.toBeNull();
  expect(titleMatch![1].toLowerCase()).toContain('sim racing coaching');
});

test('meta description leads with the four-step framing and stays readable', async () => {
  // The description shows on SERP below the title. It paraphrases the
  // four-step loop the page lays out, telling the reader within the
  // first few words they are in the right place. No comma-delimited
  // keyword list — the description must read as a sentence.
  const html = await render();
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  expect(descMatch).not.toBeNull();
  const desc = descMatch![1].toLowerCase();
  expect(desc).toContain('how lap works');
  // Each of the four loop steps is named in the description sentence.
  expect(desc).toContain('capture');
  expect(desc).toContain('analyze');
  expect(desc).toContain('plan');
  expect(desc).toContain('improve');
});

test('the annotated SVG diagram is mounted on the page', async () => {
  // Integration check: the HowItWorksDiagram component (SVG + text alt)
  // ships on the page. The diagram moves the four-step framing from
  // abstract words to a visual representation — this test catches
  // accidental unmounting.
  const html = await render();
  expect(html).toMatch(/<figure[^>]+role="img"/);
  expect(html).toMatch(/<svg[^>]+viewBox=/);
  // The figcaption carries the text alternative for the loop.
  expect(html).toContain('The four-step loop');
});

test('the four loop steps render in order (capture → analyze → plan → improve)', async () => {
  // Integration check: the four loop-step sections render as an ordered
  // list with the step names in clockwise order, matching the reader's
  // mental model established by the diagram's arrows. Ordering locked so
  // the coaching loop only makes sense in sequence.
  const html = await render();
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Capture a session[\s\S]*<\/h3>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Analyze with the pipeline[\s\S]*<\/h3>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Get your plan[\s\S]*<\/h3>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Improve next time[\s\S]*<\/h3>/);

  const captureIdx = html.indexOf('Capture a session');
  const analyzeIdx = html.indexOf('Analyze with the pipeline');
  const planIdx = html.indexOf('Get your plan');
  const improveIdx = html.indexOf('Improve next time');

  expect(captureIdx).toBeGreaterThan(-1);
  expect(analyzeIdx).toBeGreaterThan(captureIdx);
  expect(planIdx).toBeGreaterThan(analyzeIdx);
  expect(improveIdx).toBeGreaterThan(planIdx);
});

test('the "honesty" section (launch vs roadmap) lands after the loop steps', async () => {
  // Integration check: the honesty disclosure lands after the four-step
  // loop, so a reader who has just consumed the full capability arc
  // arrives at "here is what ships at launch vs what is still roadmap."
  // Placing honesty before the loop sections would read as apologetic;
  // after them, it reads as grounded.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*What ships at launch[\s\S]*<\/h2>/);
  const improveIdx = html.indexOf('Improve next time');
  const honestyIdx = html.indexOf('What ships at launch');
  expect(improveIdx).toBeGreaterThan(-1);
  expect(honestyIdx).toBeGreaterThan(improveIdx);
});

test('the honesty section states the June-8 one-membership / full-access framing', async () => {
  // The honesty section must reflect the June-8 reality: ONE membership
  // with full access at launch — no free tier, no per-tier gating.
  const html = await render();
  const honestyIdx = html.indexOf('What ships at launch');
  const after = html.slice(honestyIdx);
  expect(after.toLowerCase()).toContain('one membership');
  expect(after.toLowerCase()).toContain('full access');
});

test('/how-it-works closes with the shared 30-day trial CTA (href + rel locked)', async () => {
  // Integration check: the page ends with the same trial contract used
  // site-wide. Reusing the CtaButton component keeps the href +
  // rel=noopener wiring in exactly one place — any future CTA-contract
  // edit propagates site-wide instead of drifting between pages.
  const html = await render();
  expect(MEMBERSHIP.ctaText).toBe('Start 30-day free trial');
  expect(MEMBERSHIP.ctaHref).toBe('/register');
  expect(html).toMatch(
    /<a[^>]+href="\/register"[^>]+rel="noopener"[^>]*>[\s\S]*Start 30-day free trial[\s\S]*<\/a>/,
  );
  // Ordering: CTA appears after the honesty section so the reader closes
  // with "here's what launch gives you" → "start the trial".
  const honestyIdx = html.indexOf('What ships at launch');
  // lastIndexOf, not indexOf: the global MobileNav + StickyCtaBar (chrome)
  // also carry the trial CTA, so the FIRST match is now in the top nav. The
  // page's closing trial CTA is the last occurrence — that's what must follow
  // the honesty section.
  const ctaIdx = html.lastIndexOf('Start 30-day free trial');
  expect(honestyIdx).toBeGreaterThan(-1);
  expect(ctaIdx).toBeGreaterThan(honestyIdx);
});

test('the closing CTA states the correct June-8 pricing figures', async () => {
  // Pricing figures must be present and correct: €19.90 standard,
  // €14.90 founding (first 50), 30-day trial — sourced from the
  // single-source-of-truth MEMBERSHIP record.
  const html = await render();
  expect(MEMBERSHIP.standardMonthly).toBe('€19.90');
  expect(MEMBERSHIP.foundingMonthly).toBe('€14.90');
  expect(html).toContain('€19.90');
  expect(html).toContain('€14.90');
  expect(html).toContain('30-day free');
  expect(html).toContain(String(MEMBERSHIP.foundingLimit));
});
