// T133 — contract test for Pillar 1 Section 3 ("shape vs
// intensity framework"). Sprint task numbering calls this Section
// 2; outline numbering calls it Section 3 because of the
// unnumbered intro. The article's intellectual centerpiece — it
// explains *why* the T132 carries-vs-doesn't list looks the way
// it does. Without this section, T132 reads as a list of facts;
// with it, the rest of the article inherits a principled
// framework.
//
// Reads the markdown file directly (planning artifact in
// lap-website/docs/, will compile to an Astro content collection
// entry when Block H closes — same pattern as T132).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'sim-to-real-transfer',
  'section-03-shape-vs-intensity.md',
);

const loadSection = (): string => readFileSync(SECTION_PATH, 'utf8');

const wordCount = (text: string): number =>
  text
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;

describe('T133: Pillar 1 Section 3 — shape vs intensity framework', () => {
  test('word count is in the 320-480 band (±20% of 400 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(320);
    expect(wc).toBeLessThanOrEqual(480);
  });

  test('names BOTH dimensions of the framework — shape AND intensity', async () => {
    // The whole point of the section. Naming only one collapses
    // the framework — readers leave understanding "weaknesses
    // transfer" without understanding the *which-parts-don't*
    // half of the claim.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\bshape/);
    expect(section).toMatch(/\bintensity/);
  });

  test('names the platform-agnostic vs platform-specific claim', async () => {
    // The framework's core claim — shapes are platform-agnostic,
    // intensities are platform-specific. Lock this phrasing (or
    // a close synonym) so a future editorial pass cannot quietly
    // soften the claim into "shapes transfer better than
    // intensities."
    const section = loadSection().toLowerCase();
    expect(section).toMatch(
      /(platform.agnostic|platform agnostic|across platforms|both platforms)/,
    );
    expect(section).toMatch(
      /(platform.specific|platform specific|within (a |the )?platform|specific to)/,
    );
  });

  test('contains a concrete corner example with measurable values', async () => {
    // The credibility lever. Hand-wavy "shapes transfer" without
    // a concrete number is no more rigorous than "we just feel
    // it." Lock at least one km/h or percentage value in the
    // section so the example is falsifiable.
    const section = loadSection();
    // Match: a number followed by km/h, %, kmh, or "second(s)"
    expect(section).toMatch(/\d+\s*(km\/h|kmh|%|second|s\b)/);
  });

  test('names a specific circuit and corner (specificity bar)', async () => {
    // Trail-braking-at-La-Source is the canonical example the
    // outline specifies. Section can use a different circuit if
    // needed for variety (and the case-studies section will use
    // others), but a NAMED corner must appear.
    const section = loadSection();
    const namedAnchors = [
      'Spa',
      'La Source',
      'Eau Rouge',
      'Pouhon',
      'Silverstone',
      'Copse',
      'Brands Hatch',
      'Druids',
      'Suzuka',
      'Nordschleife',
      'Sebring',
      'Monza',
      'Imola',
    ];
    const matched = namedAnchors.filter((anchor) => section.includes(anchor));
    expect(matched.length).toBeGreaterThanOrEqual(1);
  });

  test('names at least one sim platform (sim-side specificity)', async () => {
    const section = loadSection();
    expect(section).toMatch(/iRacing|ACC|AMS2|rFactor|Assetto Corsa/);
  });

  test('contains an internal link to /product/bridge (the doctrine technical artifact)', async () => {
    // ADR-005 §5.5 TransferLink is the operational realisation of
    // the framework this section presents. The article connects
    // them via a /product/bridge link sitting naturally in the
    // example paragraph (per outline cross-link plan).
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/bridge\)/);
  });

  test('uses the doctrine word "transfer" (the verb behind the framework)', async () => {
    // ADR-005 §5.5 calls the algorithm TransferLink. The marketing
    // surface uses "transfer" as the noun + verb. Lock the word
    // so a future copy edit cannot drift to "carry-over" or
    // "carries" without preserving the doctrine anchor.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/transfer/);
  });

  test('forbidden vocab — no AI-coach / LLM / generative / "realistic"', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\brealistic\b/);
  });
});
