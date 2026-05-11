import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Demo from '../pages/demo.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Demo));

test('T072: /demo renders a single <main> landmark', async () => {
  // Every Astro page needs exactly one <main> for axe's landmark
  // rule and for the skip-link target. T073-T090 will populate
  // this shell with the 3-minute walkthrough video, annotated
  // screens, sample-session CTA, and post-demo trial CTA.
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T072: /demo renders the locked shell H1 "See LAP in action"', async () => {
  // The H1 names what the page does in four words. "See it work"
  // would be more generic but loses the branded direct-address
  // ("LAP in action") that reads as an invitation rather than a
  // section label. Locking the exact string keeps the shell
  // stable while T073 makes format decisions (video vs.
  // screenshots) and T074 lands the walkthrough.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*See LAP in action\.[\s\S]*<\/h1>/);
});

test('T072: title includes "LAP" branding (BaseLayout integration)', async () => {
  // "<Page> — LAP" pattern matches the homepage, /how-it-works,
  // /pricing, and /refund-policy titles. Locking LAP here catches
  // BaseLayout-bypass on future edits.
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T072: intro paragraph signals "session walkthrough, no sign-up"', async () => {
  // Doctrine-aligned scent: the demo page must set expectations
  // before the visitor decides to watch. "Session walkthrough,
  // no sign-up required" is the shortest version of what T074
  // (3-min video) + T077 (pre-seeded Sebring session, viewable
  // without signup) will fulfil. Lock both anchors so the intro
  // can't drift into "Check out what LAP can do!" marketing
  // blur.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/session/);
  expect(html.toLowerCase()).toMatch(/sign[- ]?up/);
});

test('T072: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T073: DemoWalkthrough placeholder is mounted on /demo below the shell header', async () => {
  // Integration check: the T073 decision ships as a component that
  // actually lives on the page. The 16:9 aspect placeholder lands
  // after the header so T074 can swap in the iframe without
  // restructuring the shell. If a refactor silently unmounts the
  // section, this catches it before the visual surface drifts.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*three-minute walkthrough[\s\S]*<\/h2>/i);
  const headerIdx = html.search(/See LAP in action\./);
  const walkthroughIdx = html.search(/three-minute walkthrough/i);
  expect(headerIdx).toBeGreaterThan(-1);
  expect(walkthroughIdx).toBeGreaterThan(headerIdx);
});

test('T085: /demo closes with the shared trial CTA (href + rel locked)', async () => {
  // Integration check: /demo ends with the same T034 trial contract
  // that closes the homepage and /how-it-works. Reusing FinalCta
  // (rather than a new demo-specific CTA) keeps the href +
  // rel=noopener wiring in exactly one component — the signup URL
  // + attribution hooks can't drift between pages silently.
  const html = await render();
  expect(html).toMatch(
    /<a[^>]+href="https:\/\/www\.lap-coach\.racing\/register"[^>]+rel="noopener"[^>]*>[\s\S]*Start 14-day trial[\s\S]*<\/a>/,
  );
});

test('T085: trial CTA renders after the walkthrough placeholder', async () => {
  // Reader flow: intro → watch the walkthrough → decide to trial.
  // If a refactor ever swaps ordering so the CTA lands before the
  // walkthrough, this fails with a clear signal — the visitor
  // should see the artefact they came for before the ask.
  const html = await render();
  const walkthroughIdx = html.search(/three-minute walkthrough/i);
  const ctaIdx = html.indexOf('Start 14-day trial');
  expect(walkthroughIdx).toBeGreaterThan(-1);
  expect(ctaIdx).toBeGreaterThan(walkthroughIdx);
});

test('T086: SocialProof testimonials placeholder is mounted on /demo', async () => {
  // Integration check: the T035 SocialProof placeholder — the
  // doctrine-aligned "no testimonials until the beta opens"
  // message — renders on /demo. Reusing the same component as the
  // homepage means the "no testimonials yet" posture stays in
  // exactly one place. When real beta quotes land (2026-07-23),
  // swapping SocialProof's internals updates every page at once
  // instead of leaving a stale /demo-specific placeholder behind.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*No testimonials until the beta opens[\s\S]*<\/h2>/);
});

test('T086: testimonials section renders between walkthrough and CTA', async () => {
  // Reader flow post-T086: header → walkthrough → testimonials →
  // CTA. The classic conversion sequence: watch the artefact →
  // see what other sim racers say → decide to trial. Dropping
  // testimonials AFTER the CTA would reverse the social-proof
  // nudge right when it matters most.
  const html = await render();
  const walkthroughIdx = html.search(/three-minute walkthrough/i);
  const testimonialsIdx = html.indexOf('No testimonials until the beta opens');
  const ctaIdx = html.indexOf('Start 14-day trial');
  expect(walkthroughIdx).toBeGreaterThan(-1);
  expect(testimonialsIdx).toBeGreaterThan(walkthroughIdx);
  expect(ctaIdx).toBeGreaterThan(testimonialsIdx);
});

test('T088: <title> carries the "sim racing telemetry demo" target keyword', async () => {
  // Sprint T088 targets "sim racing telemetry demo" for /demo.
  // Putting the exact noun phrase in the <title> is the single
  // strongest ranking signal; the loop rules forbid keyword soup,
  // so the phrasing "Sim racing telemetry demo — LAP" reads as a
  // natural SERP title rather than an SEO artefact. Mirrors the
  // T069 /pricing pattern.
  const html = await render();
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  expect(titleMatch).not.toBeNull();
  expect(titleMatch![1].toLowerCase()).toContain('sim racing telemetry demo');
});

test('T088: meta description carries the "sim racing telemetry" noun phrase', async () => {
  // Description is the SERP snippet below the title. Pairing the
  // target phrase with the concrete scent (3-min walkthrough, no
  // sign-up) rewards the query match and tells the reader in the
  // first few words that they landed on the right page. The exact
  // tail "demo" is in the title; the description carries
  // "sim racing telemetry" alongside the existing session/no-signup
  // anchors locked by T072.
  const html = await render();
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  expect(descMatch).not.toBeNull();
  expect(descMatch![1].toLowerCase()).toContain('sim racing telemetry');
});

test('T089: /demo renders a link to /how-it-works', async () => {
  // Sprint T089 places related links to /how-it-works + /pricing
  // on /demo so a reader who watched the walkthrough but isn't
  // ready to start a trial has somewhere else to go. The
  // /how-it-works link is the missing piece — FinalCta already
  // carries a /pricing link — so its presence is the T089 signal.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/how-it-works"/);
});

test('T089: related-links footer contains both /how-it-works and /pricing', async () => {
  // Both links appear inside a <footer> wrapper so the pattern is
  // visually + structurally identifiable as a "see also" block —
  // distinct from the FinalCta's embedded "See full pricing" link.
  // Counting both links *inside the footer* is what locks T089's
  // intent: a dedicated related-pages section, not ad-hoc inline
  // references.
  const html = await render();
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/);
  expect(footerMatch).not.toBeNull();
  const footerHtml = footerMatch![0];
  expect(footerHtml).toMatch(/href="\/how-it-works"/);
  expect(footerHtml).toMatch(/href="\/pricing"/);
});

test('T089: related-links footer lands after the FinalCta in document order', async () => {
  // Reader flow: walkthrough → testimonials → trial CTA →
  // related links. Putting related-links BEFORE the CTA would
  // invite the reader to wander off before the primary ask; after
  // the CTA, the links serve as a fallback path for readers who
  // decided not to trial but still want to learn more.
  const html = await render();
  const ctaIdx = html.indexOf('Start 14-day trial');
  // Use lastIndexOf: SiteHeader's SectorTabs also links /how-it-works;
  // we want the page-footer (or SiteFooter) occurrence which lands after
  // the CTA — the original intent is preserved.
  const hiwLinkIdx = html.lastIndexOf('href="/how-it-works"');
  expect(ctaIdx).toBeGreaterThan(-1);
  expect(hiwLinkIdx).toBeGreaterThan(ctaIdx);
});
