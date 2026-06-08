import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Demo from '../pages/demo.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Demo));

// /demo is now a lean, fully-static page (BaseLayout + SiteHeader/SiteFooter):
// hero ("See it before you sign up."), a reserved 16:9 walkthrough placeholder,
// three product stills, a "What you'll see" list, and a shared trial CTA. No
// SocialProof / testimonials, no "three-minute walkthrough", no /product cross-
// linking pillars. These tests assert what the rebuilt page actually contains.

test('/demo renders a single <main> landmark', async () => {
  // Every page needs exactly one <main> for axe's landmark rule and for the
  // skip-link target. SiteHeader/SiteFooter contribute <header>/<footer>, not
  // <main>, so the page body must own the sole <main>.
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('/demo renders the hero H1 "See it before you sign up."', async () => {
  // The H1 names what the page does in one direct-address line. Locking the
  // exact string keeps the hero stable across edits.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*See it before you sign up\.[\s\S]*<\/h1>/);
});

test('title includes "LAP" branding (BaseLayout integration)', async () => {
  // Title flows through BaseLayout. Locking LAP here catches BaseLayout-bypass
  // on future edits.
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('intro signals "session" preview with "no live demo / sign up" framing', async () => {
  // Doctrine-aligned scent: the page sets honest pre-launch expectations
  // before the visitor decides to look. It promises a per-session preview and
  // is up-front that there is no live demo to click through before sign-up.
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/session/);
  expect(lower).toMatch(/sign[- ]?up/);
});

test('copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).not.toMatch(/\bai coach\b/);
  expect(lower).not.toMatch(/\bllm\b/);
  expect(lower).not.toMatch(/\bgenerative\b/);
});

test('walkthrough placeholder is mounted on /demo below the hero', async () => {
  // Integration check: the reserved 16:9 walkthrough slot ships as a real
  // section on the page. The PlaceholderMedia stand-in (labelled "lands at
  // public beta") lands after the hero so a real <video>/iframe can swap in
  // with zero layout shift. If a refactor silently unmounts it, this catches
  // the surface drift.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*The walkthrough[\s\S]*<\/h2>/i);
  const heroIdx = html.search(/See it before you sign up\./);
  const walkthroughIdx = html.search(/The walkthrough/i);
  expect(heroIdx).toBeGreaterThan(-1);
  expect(walkthroughIdx).toBeGreaterThan(heroIdx);
});

test('walkthrough slot uses the PlaceholderMedia "public beta" stand-in', async () => {
  // Honest pre-launch posture: the walkthrough is reserved, not yet shot. The
  // placeholder label/caption must say so rather than implying a live demo.
  const html = await render();
  expect(html).toMatch(/Full product walkthrough — lands at public beta/);
  expect(html).toMatch(/Walkthrough video — coming at public beta/);
});

test('/demo closes with the shared trial CTA (href + rel locked)', async () => {
  // /demo ends with the same trial contract that closes the homepage and
  // /how-it-works, rendered via CtaButton: href="/register", rel="noopener",
  // and the canonical "Start 30-day free trial" label. Locking href + rel in
  // one component keeps the signup URL + attribution wiring from drifting.
  const html = await render();
  expect(html).toMatch(
    /<a[^>]+href="\/register"[^>]+rel="noopener"[^>]*>[\s\S]*Start 30-day free trial[\s\S]*<\/a>/,
  );
});

test('trial CTA renders after the walkthrough placeholder', async () => {
  // Reader flow: intro → see the walkthrough/stills → decide to trial. If a
  // refactor swaps ordering so the CTA lands before the walkthrough, this
  // fails — the visitor should see the artefact they came for before the ask.
  const html = await render();
  const walkthroughIdx = html.search(/The walkthrough/i);
  // lastIndexOf, not indexOf: the global MobileNav + StickyCtaBar chrome also
  // carry the trial CTA (first match is the top nav now). The page's own
  // closing CTA is the last occurrence — that's what must follow the walkthrough.
  const ctaIdx = html.lastIndexOf('Start 30-day free trial');
  expect(walkthroughIdx).toBeGreaterThan(-1);
  expect(ctaIdx).toBeGreaterThan(walkthroughIdx);
});

test('final CTA section carries the June-8 pricing figures', async () => {
  // The closing CTA copy states the canon: €19.90/mo standard, €14.90/mo for
  // the first 50 founding members, 30-day free trial. These figures must be
  // present and correct (no €15/€150/14-day legacy numbers).
  const html = await render();
  expect(html).toMatch(/€19\.90/);
  expect(html).toMatch(/€14\.90/);
  expect(html).toMatch(/30-day free trial/);
  expect(html).toMatch(/first\s+50\s+founding members/i);
  // Legacy figures must not resurface.
  expect(html).not.toMatch(/€150/);
  expect(html).not.toMatch(/14-day/);
});

test('<title> is present, descriptive, and scoped to the demo page', async () => {
  // SEO: a real, page-specific <title>. The rebuilt /demo title is
  // "See LAP before you sign up — demo" — branded, names the page intent, and
  // ends with the "demo" noun so the SERP title reads naturally.
  const html = await render();
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  expect(titleMatch).not.toBeNull();
  const title = titleMatch![1].toLowerCase();
  expect(title).toContain('demo');
  expect(title).toContain('lap');
});

test('meta description is present and carries the demo scent', async () => {
  // Description is the SERP snippet. It must exist and carry the concrete
  // preview scent: the per-session report and the 30-day free trial, so the
  // reader knows in the first words they landed on the right page.
  const html = await render();
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  expect(descMatch).not.toBeNull();
  const desc = descMatch![1].toLowerCase();
  expect(desc).toContain('preview');
  expect(desc).toContain('30-day free trial');
});

test('/demo renders a link to /how-it-works', async () => {
  // A reader who looked at the previews but isn't ready to trial has somewhere
  // else to go. The /how-it-works link (via the shared SiteFooter) is the
  // signal that the related-pages path exists.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/how-it-works"/);
});

test('shared footer contains both /how-it-works and /pricing', async () => {
  // Both links live inside the SiteFooter <footer> so the "see also" path is
  // structurally identifiable. Counting both inside the footer locks the
  // related-pages intent rather than relying on ad-hoc inline references.
  const html = await render();
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/);
  expect(footerMatch).not.toBeNull();
  const footerHtml = footerMatch![0];
  expect(footerHtml).toMatch(/href="\/how-it-works"/);
  expect(footerHtml).toMatch(/href="\/pricing"/);
});

test('related-links footer lands after the trial CTA in document order', async () => {
  // Reader flow: previews → trial CTA → related links. Putting related links
  // before the CTA would invite the reader to wander off before the primary
  // ask; after the CTA they serve as a fallback path. SiteFooter renders after
  // the page <slot>, so the footer's /how-it-works link lands after the CTA.
  const html = await render();
  const ctaIdx = html.indexOf('Start 30-day free trial');
  // lastIndexOf: SiteHeader's SectorTabs also links /how-it-works; we want the
  // SiteFooter occurrence, which lands after the CTA.
  const hiwLinkIdx = html.lastIndexOf('href="/how-it-works"');
  expect(ctaIdx).toBeGreaterThan(-1);
  expect(hiwLinkIdx).toBeGreaterThan(ctaIdx);
});
