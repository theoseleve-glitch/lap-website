// T150 — contract test for the published Pillar 2 article page
// (/blog/what-is-trail-braking). Closes Pillar 2 sprint
// (T141-T150). Mirrors T140's blog-sim-to-real-transfer.test.ts:
// page imports canonical markdown from
// docs/pillar-articles/trail-braking/ via Astro's `import { Content }`
// syntax, renders sections + FAQ accordion + JSON-LD.
//
// Page is INDEXABLE; auto-included in @astrojs/sitemap output.
// GSC URL Inspection submission deferred to post-deploy (depends
// on T008/T009/T010 BLOCKED deploy infrastructure).

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Page from '../pages/blog/what-is-trail-braking.astro';
import { PILLAR_2_FAQS } from '../data/pillar-2-faq';

const render = () => AstroContainer.create().then((c) => c.renderToString(Page));

describe('T150: published Pillar 2 article page', () => {
  test('emits a <title> containing "trail" and "brak"', async () => {
    // SEO head terms. A draft that loses these from the title
    // is no longer the page Google should serve for the
    // article's primary search intent.
    const html = await render();
    expect(html).toMatch(/<title>[^<]*trail[^<]*<\/title>/i);
    expect(html).toMatch(/<title>[^<]*brak[^<]*<\/title>/i);
  });

  test('emits a meta description (≥80 chars; SEO snippet floor)', async () => {
    const html = await render();
    const match = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1].length).toBeGreaterThanOrEqual(80);
  });

  test('is indexable (no <meta name="robots" content="noindex">)', async () => {
    const html = await render();
    expect(html).not.toMatch(/<meta\s+name="robots"\s+content="[^"]*noindex/);
  });

  test('renders an <h1> for the article title', async () => {
    const html = await render();
    expect(html).toMatch(/<h1[^>]*>[^<]*<\/h1>/);
  });

  test('renders all 5 body sections (each <h2> from imported markdown)', async () => {
    // Section heading detection — imported markdown converts to
    // <h2 id="..."> via Astro's pipeline. Lock that ALL five
    // canonical headings render.
    const html = await render();
    // s02: "The physics of trail braking"
    expect(html).toMatch(/<h2[^>]*>[^<]*[Pp]hysics of trail braking/);
    // s03: "What goes wrong, and what it looks like in the data"
    expect(html).toMatch(/<h2[^>]*>[^<]*[Ww]hat goes wrong/);
    // s04: "How LAP detects it"
    expect(html).toMatch(/<h2[^>]*>[^<]*[Hh]ow LAP detects/);
    // s05: "How to practise it"
    expect(html).toMatch(/<h2[^>]*>[^<]*[Hh]ow to practise/);
    // s06: "Three examples from real telemetry"
    expect(html).toMatch(/<h2[^>]*>[^<]*[Tt]hree examples/);
  });

  test('renders FAQ accordion with one <details> per FAQ entry', async () => {
    const html = await render();
    const detailsCount = (html.match(/<details[\s>]/g) ?? []).length;
    expect(detailsCount).toBe(PILLAR_2_FAQS.length);
  });

  test('renders every FAQ question as a <summary>', async () => {
    // Every question from the data module appears verbatim on
    // the page. Match a non-punctuation substring to dodge
    // smart-quote rendering differences (markdown content
    // gets curly quotes; FAQ-template strings preserve straight
    // quotes in HTML attributes but we still match safe
    // substrings for robustness).
    const html = await render();
    for (const faq of PILLAR_2_FAQS) {
      const safeFragment = faq.question.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 30);
      expect(
        html,
        `FAQ summary for "${faq.question}" missing from rendered HTML`,
      ).toContain(safeFragment);
    }
  });

  test('emits Article JSON-LD with @type=Article and headline', async () => {
    const html = await render();
    const ldMatch = html.match(
      /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g,
    );
    expect(ldMatch).not.toBeNull();
    const articleScript = ldMatch!.find((s) => s.includes('"@type":"Article"'));
    expect(articleScript, 'No Article JSON-LD found on page').toBeDefined();
    expect(articleScript!).toMatch(/"headline":\s*"[^"]+"/);
  });

  test('emits FAQPage JSON-LD with mainEntity matching PILLAR_2_FAQS length', async () => {
    // Cross-validation between the published page and the T149
    // data module. A future Q&A addition must surface in the
    // page's JSON-LD; this test catches regression.
    const html = await render();
    const ldMatches = html.match(
      /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g,
    );
    expect(ldMatches).not.toBeNull();
    const faqScript = ldMatches!.find((s) => s.includes('"@type":"FAQPage"'));
    expect(faqScript, 'No FAQPage JSON-LD found on page').toBeDefined();
    const jsonContent = faqScript!.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
    const parsed = JSON.parse(jsonContent);
    expect(parsed.mainEntity.length).toBe(PILLAR_2_FAQS.length);
  });

  test('preserves /product/* cross-links from imported markdown', async () => {
    // T148 added cross-links inside the markdown source. The
    // published page MUST render them as <a href="/product/...">
    // — that's the whole point of importing the markdown rather
    // than re-authoring inline.
    const html = await render();
    expect(html).toMatch(/href="\/product\/bridge"/);
    expect(html).toMatch(/href="\/product\/coaching"/);
    expect(html).toMatch(/href="\/product\/driver-profile"/);
    expect(html).toMatch(/href="\/product\/desktop"/);
    expect(html).toMatch(/href="\/product\/mobile"/);
  });

  test('preserves cross-pillar link to /blog/sim-to-real-transfer', async () => {
    // The four-pillar cluster acts as a hub. Pillar 2 links
    // back to Pillar 1 (T143 + T146 cross-links survive into
    // the rendered page).
    const html = await render();
    expect(html).toMatch(/href="\/blog\/sim-to-real-transfer"/);
  });

  test('forbidden vocab — no AI-coach claim / magic / secret / trick on rendered page', async () => {
    // ADR-004 + Pillar 2 outline forbidden CLAIMS at the
    // rendered-HTML level. Note: "language model" / "neural" /
    // "generative" are PERMITTED (in negation context from
    // section 04); the wholesale ban is only on marketing
    // overclaim words that have no legitimate negation use.
    const html = await render().then((s) => s.toLowerCase());
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bmagic\b/);
    expect(html).not.toMatch(/\bsecret\b/);
    expect(html).not.toMatch(/\btrick\b/);
    expect(html).not.toMatch(/\brealistic\b/);
  });
});
