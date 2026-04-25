// T134 — contract test for Pillar 1 Section 4 ("track geometry
// analysis"). Sprint task numbering calls this Section 3; outline
// numbering calls it Section 4 because of the unnumbered intro.
// Converts the T133 shape-vs-intensity framework into actionable
// category knowledge — readers leave knowing which corner types
// transfer cleanly from sim and which need real-track
// recalibration.
//
// Reads the markdown file directly (planning artifact in
// lap-website/docs/, will compile to an Astro content collection
// entry when Block H closes — same pattern as T132 / T133).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'sim-to-real-transfer',
  'section-04-track-geometry.md',
);

const loadSection = (): string => readFileSync(SECTION_PATH, 'utf8');

const wordCount = (text: string): number =>
  text
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;

describe('T134: Pillar 1 Section 4 — track geometry analysis', () => {
  test('word count is in the 280-420 band (±20% of 350 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(280);
    expect(wc).toBeLessThanOrEqual(420);
  });

  test('uses the doctrine word "fidelity" (the gradient concept)', async () => {
    // Outline contract: this section maps the fidelity gradient.
    // The word "fidelity" is the doctrine anchor — replacing it
    // with vague synonyms ("realism", "accuracy") drifts the
    // section away from the principled vocabulary the article
    // has been building. ADR-005 §5.5 implicitly uses this
    // distinction; the article makes it explicit.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/fidelity/);
  });

  test('names at least four distinct corner types or categories', async () => {
    // The gradient's value is in the categorical breakdown.
    // Naming only one or two corner types collapses the section
    // into "some corners transfer better than others" — which is
    // the failure mode the structured ranking exists to prevent.
    const section = loadSection().toLowerCase();
    const cornerTypes = [
      'sweeper',
      'hairpin',
      'high-speed',
      'compression',
      'banked',
      'off-camber',
      'bumpy',
      'flat',
      'elevation',
      'curb',
    ];
    const matched = cornerTypes.filter((type) => section.includes(type));
    expect(matched.length).toBeGreaterThanOrEqual(4);
  });

  test('names at least four specific corners from real-world circuits (specificity bar)', async () => {
    // Generic corner-type names (sweeper, hairpin) without named
    // examples is theory without ground truth. Lock at least four
    // named corners (Copse, Pouhon, Eau Rouge, La Source, Druids,
    // 130R, Sebring's Turn 17, etc.) so the section reads from
    // actual circuits.
    const section = loadSection();
    const namedCorners = [
      'Copse',
      'Pouhon',
      'Eau Rouge',
      'La Source',
      'Druids',
      '130R',
      'Sebring',
      'Maggotts',
      'Becketts',
      'Corkscrew',
      'Laguna Seca',
      'Bus Stop',
      'Raidillon',
    ];
    const matched = namedCorners.filter((corner) => section.includes(corner));
    expect(matched.length).toBeGreaterThanOrEqual(4);
  });

  test('names at least two distinct circuits (broad specificity)', async () => {
    // Naming only Spa over and over reads as Spa-bias. The
    // gradient's credibility comes from showing the categorisation
    // works across multiple circuits — at least two distinct ones.
    const section = loadSection();
    const circuits = [
      'Spa',
      'Silverstone',
      'Suzuka',
      'Brands Hatch',
      'Sebring',
      'Laguna Seca',
      'Nürburgring',
      'Imola',
      'Monza',
      'Mount Panorama',
    ];
    const matched = circuits.filter((c) => section.includes(c));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });

  test('names at least one sim platform', async () => {
    const section = loadSection();
    expect(section).toMatch(/iRacing|ACC|AMS2|rFactor|Assetto Corsa/);
  });

  test('contains a practical-implication or recommendation paragraph', async () => {
    // The taxonomy alone reads as encyclopedia. Outline contract
    // requires a closing paragraph that says *what to do* with
    // the gradient — which categories to trust your sim work on,
    // which to recalibrate at the actual track. Lock a verb
    // suggesting reader action.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/(trust|confident|recalibrat|expect|caution|approach)/);
  });

  test('forbidden vocab — no AI-coach / LLM / generative / "realistic"', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\brealistic\b/);
  });
});
