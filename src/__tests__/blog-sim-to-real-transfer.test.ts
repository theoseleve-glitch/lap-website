// T140 — contract test for the published Pillar 1 article page
// (/blog/sim-to-real-transfer). The article is the SEO acquisition
// surface for sim-and-real-life racers; this test locks the
// rendered structure so the published artifact stays in sync with
// the editorial source (docs/pillar-articles/...) and the FAQ data
// module (src/data/pillar-1-faq.ts).
//
// Page is INDEXABLE (no noindex). Indexing-submission step at
// Google Search Console is a manual post-deploy action — the
// page itself is build-ready and will be picked up by Google's
// crawler once the production deployment is live.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Page from '../pages/blog/sim-to-real-transfer.astro';
import { PILLAR_1_FAQS } from '../data/pillar-1-faq';

const render = () => AstroContainer.create().then((c) => c.renderToString(Page));

describe('T140: published Pillar 1 article page', () => {
  test('emits a <title> containing the article topic', async () => {
    // SEO head term + brand. A draft that loses "transfer" or
    // "sim" from the title is no longer the page Google should
    // serve for the article's primary search intent.
    const html = await render();
    expect(html).toMatch(/<title>[^<]*(transfer|Transfer)[^<]*<\/title>/);
    expect(html).toMatch(/<title>[^<]*(sim|Sim)[^<]*<\/title>/);
  });

  test('emits a meta description (≥80 chars; SEO snippet floor)', async () => {
    // Google truncates around 160 chars but rewards descriptions
    // ≥80 chars with proper snippet rendering. Lock the floor so
    // a draft cannot ship a one-liner that gets auto-replaced.
    const html = await render();
    const match = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1].length).toBeGreaterThanOrEqual(80);
  });

  test('is indexable (no <meta name="robots" content="noindex">)', async () => {
    // The whole point of T140. A published-but-noindex page is
    // worse than not publishing — wastes the crawl budget signal.
    const html = await render();
    expect(html).not.toMatch(/<meta\s+name="robots"\s+content="[^"]*noindex/);
  });

  test('renders an <h1> for the article title', async () => {
    const html = await render();
    expect(html).toMatch(/<h1[^>]*>[^<]*<\/h1>/);
  });

  test('renders all 5 body sections (each <h2> from imported markdown)', async () => {
    // Each markdown section starts with a level-2 heading. Astro's
    // markdown rendering converts to <h2 id="...">. Lock that ALL
    // five canonical headings render.
    const html = await render();
    // Section 02: "What transfers, and what doesn't"
    expect(html).toMatch(/<h2[^>]*>[^<]*[Ww]hat transfers/);
    // Section 03: "Shape vs intensity"
    expect(html).toMatch(/<h2[^>]*>[^<]*[Ss]hape vs intensity/);
    // Section 04: "Track geometry — not all corners transfer equally"
    expect(html).toMatch(/<h2[^>]*>[^<]*[Tt]rack geometry/);
    // Section 05: "Three case studies"
    expect(html).toMatch(/<h2[^>]*>[^<]*case studies/);
    // Section 06: "How to measure your own transfer"
    expect(html).toMatch(/<h2[^>]*>[^<]*[Mm]easure your own transfer/);
  });

  test('renders FAQ accordion with one <details> per FAQ entry', async () => {
    // Same pattern as PricingFaq.astro (T061): native
    // <details>/<summary> for keyboard-accessible zero-JS
    // accordion. Count must match PILLAR_1_FAQS.length so adding
    // / removing FAQs is reflected on the page.
    const html = await render();
    const detailsCount = (html.match(/<details[\s>]/g) ?? []).length;
    expect(detailsCount).toBe(PILLAR_1_FAQS.length);
  });

  test('renders every FAQ question as a <summary>', async () => {
    // Each summary is the click-target text. Lock that every
    // question from the data module appears verbatim on the page.
    const html = await render();
    for (const faq of PILLAR_1_FAQS) {
      // Astro may smart-quote apostrophes in markdown rendering
      // but plain HTML attributes preserve straight quotes.
      // Match a substring of the question that lacks an apostrophe.
      const safeFragment = faq.question.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 30);
      expect(
        html,
        `FAQ summary for "${faq.question}" missing from rendered HTML`,
      ).toContain(safeFragment);
    }
  });

  test('emits Article JSON-LD with @type=Article and headline', async () => {
    // schema.org/Article eligibility — opens the door to article-
    // level rich results. Lock @type and headline; without these
    // Google's rich-results test fails.
    const html = await render();
    const ldMatch = html.match(
      /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g,
    );
    expect(ldMatch).not.toBeNull();
    const articleScript = ldMatch!.find((s) => s.includes('"@type":"Article"'));
    expect(articleScript, 'No Article JSON-LD found on page').toBeDefined();
    expect(articleScript!).toMatch(/"headline":\s*"[^"]+"/);
  });

  test('emits FAQPage JSON-LD with mainEntity matching PILLAR_1_FAQS length', async () => {
    // Cross-validation between the published page and the T139
    // data module. A future Q&A addition must surface in the
    // page's JSON-LD; this test catches regression.
    const html = await render();
    const ldMatches = html.match(
      /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g,
    );
    expect(ldMatches).not.toBeNull();
    const faqScript = ldMatches!.find((s) => s.includes('"@type":"FAQPage"'));
    expect(faqScript, 'No FAQPage JSON-LD found on page').toBeDefined();
    // Parse the JSON content out of the script tag.
    const jsonContent = faqScript!.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
    const parsed = JSON.parse(jsonContent);
    expect(parsed.mainEntity.length).toBe(PILLAR_1_FAQS.length);
  });

  test('preserves /product/* cross-links from imported markdown sections', async () => {
    // T138 added cross-links inside the markdown source. The
    // published page MUST render them as <a href="/product/...">
    // — that's the whole point of importing the markdown rather
    // than re-authoring inline (single source of truth).
    const html = await render();
    expect(html).toMatch(/href="\/product\/bridge"/);
    expect(html).toMatch(/href="\/product\/coaching"/);
    expect(html).toMatch(/href="\/product\/driver-profile"/);
  });

  test('forbidden vocab — no AI-coach / LLM / generative on rendered page', async () => {
    // ADR-004 lock at the published-surface level. Per-section
    // tests already lock this in source; this is defense-in-depth
    // at the rendered HTML level. Catches a future page-level
    // edit (e.g., lede paragraph) that introduces forbidden vocab.
    const html = await render().then((s) => s.toLowerCase());
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
    expect(html).not.toMatch(/\bgenerative\b/);
  });
});
