// T051 — "for interested developers" footer on /how-it-works.
// Reframes the original BLOCKED annotation's path (a/b/c —
// LAP-owned docs that don't exist publicly) into path (d): deep-
// links to the standards LAP holds itself to + the public
// integration surface LAP reads from. Each href is a rock-stable
// public URL (W3C TR for WCAG, MDN for Web Crypto, eur-lex for
// GDPR, iracing.com for telemetry) — no placeholders, no scaffolds,
// no risk of 404'd deep-links.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import HowItWorksDevDocs from '../components/HowItWorksDevDocs.astro';
import HowItWorks from '../pages/how-it-works.astro';

const renderComponent = (): Promise<string> =>
  AstroContainer.create().then((c) => c.renderToString(HowItWorksDevDocs));
const renderPage = (): Promise<string> =>
  AstroContainer.create().then((c) => c.renderToString(HowItWorks));

describe('T051: HowItWorksDevDocs structural contract', () => {
  test('renders <section> with aria-labelledby pointing at an H2', async () => {
    const html = await renderComponent();
    const sectionMatch = html.match(/<section[^>]+aria-labelledby=["']([^"']+)["']/);
    expect(sectionMatch).toBeTruthy();
    const headingId = sectionMatch![1];
    expect(html).toMatch(new RegExp(`<h2[^>]+id=["']${headingId}["'][^>]*>`));
  });

  test('H2 names "developers" framing — interested-devs audience', async () => {
    const html = await renderComponent();
    const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    expect(h2Match).toBeTruthy();
    expect(h2Match![1].toLowerCase()).toMatch(/developer|technical/);
  });

  test('eyebrow caption names "interested developers" audience', async () => {
    const html = await renderComponent();
    expect(html.toLowerCase()).toMatch(/interested developers/);
  });
});

describe('T051: HowItWorksDevDocs canonical links — standards LAP follows', () => {
  test('links to WCAG 2.1 on w3.org TR (rock-stable W3C URL)', async () => {
    const html = await renderComponent();
    expect(html).toMatch(/href=["']https:\/\/www\.w3\.org\/TR\/WCAG21\/?["']/);
  });

  test('links to MDN Web Crypto API (rock-stable MDN URL)', async () => {
    const html = await renderComponent();
    expect(html).toMatch(
      /href=["']https:\/\/developer\.mozilla\.org\/en-US\/docs\/Web\/API\/Web_Crypto_API["']/,
    );
  });

  test('links to GDPR official text on eur-lex.europa.eu (rock-stable EU URL)', async () => {
    const html = await renderComponent();
    expect(html).toMatch(/href=["']https:\/\/eur-lex\.europa\.eu\/eli\/reg\/2016\/679\/oj["']/);
  });

  test('links to iRacing telemetry overview (sim integration)', async () => {
    const html = await renderComponent();
    expect(html).toMatch(/href=["']https:\/\/www\.iracing\.com\/iracing-telemetry\/?["']/);
  });
});

describe('T051: HowItWorksDevDocs external-link safety', () => {
  test('every external link carries rel with both noopener and noreferrer', async () => {
    // Cross-origin best practice: noopener prevents tab-nabbing,
    // noreferrer prevents the destination site from seeing the
    // referring page. Both required on any target="_blank" link.
    const html = await renderComponent();
    const externalLinkRegex =
      /<a\s+[^>]*href=["']https?:\/\/[^"']+["'][^>]*>/g;
    const links = [...html.matchAll(externalLinkRegex)];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link[0]).toMatch(/\brel=["'][^"']*\bnoopener\b[^"']*["']/);
      expect(link[0]).toMatch(/\brel=["'][^"']*\bnoreferrer\b[^"']*["']/);
    }
  });

  test('every external link opens in a new tab (target="_blank")', async () => {
    const html = await renderComponent();
    const externalLinkRegex =
      /<a\s+[^>]*href=["']https?:\/\/[^"']+["'][^>]*>/g;
    const links = [...html.matchAll(externalLinkRegex)];
    for (const link of links) {
      expect(link[0]).toMatch(/\btarget=["']_blank["']/);
    }
  });
});

describe('T051: HowItWorksDevDocs ADR-004 vocab discipline', () => {
  test('no bare "AI coach" / "LLM" / "generative" / "neural" / "realistic"', async () => {
    const html = await renderComponent();
    const lower = html.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });
});

describe('T051: HowItWorksDevDocs is mounted on /how-it-works', () => {
  test('/how-it-works renders the DevDocs H2', async () => {
    const html = await renderPage();
    expect(html.toLowerCase()).toMatch(
      /<h2[^>]*>[\s\S]*?(?:developer|technical)[\s\S]*?<\/h2>/i,
    );
  });

  test('/how-it-works includes WCAG 2.1 deep-link', async () => {
    const html = await renderPage();
    expect(html).toMatch(/href=["']https:\/\/www\.w3\.org\/TR\/WCAG21\/?["']/);
  });

  test('/how-it-works retains the existing Honesty section H2 (regression guard)', async () => {
    // T051 inserts a new section between Honesty and FinalCta; the
    // pre-existing Honesty H2 must keep rendering so T049's contract
    // doesn't silently break.
    const html = await renderPage();
    expect(html).toMatch(/What ships today, and what is still roadmap\./);
  });
});
