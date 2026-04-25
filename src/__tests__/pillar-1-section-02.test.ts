// T132 — contract test for Pillar 1 Section 2 ("what transfers,
// what doesn't"). Sprint task numbering calls this Section 1;
// outline numbering calls it Section 2 because the outline adds
// an unnumbered intro ("The question"). Either way, this is the
// foundation section — every "what transfers" claim must be
// paired with a "what doesn't" claim, or the framework that
// follows in Section 3 (shape vs intensity) collapses.
//
// The test reads the section markdown directly. It does NOT
// render through Astro because the section is a planning artifact
// (lives in lap-website/docs/) that subsequent assembly will
// compile into an Astro content collection entry once Block H
// closes. Until then, the contract is the file shape itself.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'sim-to-real-transfer',
  'section-02-what-transfers.md',
);

const loadSection = (): string => readFileSync(SECTION_PATH, 'utf8');

const wordCount = (text: string): number =>
  text
    // Strip markdown headings, list bullets, bold/italic markers
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;

describe("T132: Pillar 1 Section 2 — what transfers, what doesn't", () => {
  test('word count is in the 320-480 band (±20% of 400 outline target)', async () => {
    // Outline contract: ~400 words. ±20% gives 320-480. Drafts
    // outside the band signal the section is mis-scoped — either
    // the framing is too thin or the prose is over-explaining.
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(320);
    expect(wc).toBeLessThanOrEqual(480);
  });

  test('contains both a "what transfers" and a "what doesn\'t" anchor', async () => {
    // Article credibility hinges on the paired honest framing.
    // A draft that lists transferables without paired limits is
    // marketing prose, not the article we're shipping.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/(what transfers|carries|carries over)/);
    expect(section).toMatch(/(what doesn|doesn't transfer|doesn't carry|doesn't)/);
  });

  test('names at least three specific circuits or corners (specificity bar)', async () => {
    // Outline quality bar: no generic "fast right-hander" language.
    // Section must name concrete circuits / corners. Locking three
    // distinct names ensures the section reads from real-world
    // examples, not abstract bullet points.
    const section = loadSection();
    const namedAnchors = [
      'Spa',
      'Pouhon',
      'La Source',
      'Bus Stop',
      'Eau Rouge',
      'Sebring',
      'Silverstone',
      'Nordschleife',
      'Suzuka',
      'Mount Panorama',
      'Brands Hatch',
      'Druids',
      'Copse',
    ];
    const matched = namedAnchors.filter((anchor) => section.includes(anchor));
    expect(matched.length).toBeGreaterThanOrEqual(3);
  });

  test('names at least one sim platform (specificity bar for sim side)', async () => {
    // Same specificity rule applied to the sim side. Generic "the
    // sim" runs through the section, but at least one platform
    // (iRacing, ACC, AMS2) must be named so readers can map the
    // claims to a product they recognise.
    const section = loadSection();
    expect(section).toMatch(/iRacing|ACC|AMS2|rFactor|Assetto Corsa/);
  });

  test('uses the doctrine "shape" vs "magnitude/intensity" framing', async () => {
    // Outline contract: this section seeds the framework Section 3
    // unpacks. The closing line should preview that framework.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\bshape/);
    expect(section).toMatch(/(magnitude|intensity)/);
  });

  test('forbidden vocab — no AI-coach / LLM / generative / "realistic"', async () => {
    // Per outline + ADR-004. "Realistic" is also flagged in the
    // outline as subjective overclaim — the article uses
    // "fidelity" / "transfer" / "carry-over" instead.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\brealistic\b/);
  });

  test('contains both a transferable-shape example and a non-transferable example (paired-honesty rule)', async () => {
    // The single most important contract on this section. A draft
    // that bullets only "what transfers" or only "what doesn't"
    // breaks the article's credibility framing. Lock both
    // explicitly via the canonical anchors:
    //   * Transferable: brake-zone, line, throttle, race-craft,
    //     trail-brake (any one suffices)
    //   * Non-transferable: lap time, G-force, tire grip, fear,
    //     pedal pressure, surface bumps (any one suffices)
    const section = loadSection().toLowerCase();
    const transferables = /(brake.zone|brake zone|line shape|throttle|race.craft|trail.brak)/;
    const nonTransferables =
      /(lap time|g.force|tire grip|fear|pedal pressure|surface bump|adrenaline)/;
    expect(section).toMatch(transferables);
    expect(section).toMatch(nonTransferables);
  });
});
