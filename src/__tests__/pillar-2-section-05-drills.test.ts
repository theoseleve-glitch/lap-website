// T145 — contract test for Pillar 2 Section 5 ("drill
// progression to improve"). Sprint task numbering calls this
// Section 4; outline numbering calls it Section 5. Three-tier
// drill progression mapping onto ADR-005 §5.3 ActionPrescription
// (drill_template_id + success_condition fields are what
// operationalise the drills described here).
//
// The article's call-to-action section. Reader leaves with
// concrete drills they can run in their next session — not
// generic advice. Cross-links land on the product surface that
// supplies the drills (/product/coaching), the capture surface
// (/product/desktop, /product/mobile), and the progression
// framing (/product/driver-profile).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'trail-braking',
  'section-05-drills.md',
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

describe('T145: Pillar 2 Section 5 — drill progression', () => {
  test('word count is in the 320-480 band (±20% of 400 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(320);
    expect(wc).toBeLessThanOrEqual(480);
  });

  test('names all three skill tiers (beginner / intermediate / advanced)', async () => {
    // The whole section is a three-tier progression. A draft
    // that drops one tier collapses the progression structure
    // — readers can't place themselves in the right tier and
    // pick the right drill.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\bbeginner\b/);
    expect(section).toMatch(/\bintermediate\b/);
    expect(section).toMatch(/\badvanced\b/);
  });

  test('each tier names a concrete success criterion or goal', async () => {
    // Outline §5 brief: every drill includes a success
    // criterion (brake-steering overlap ≥0.2s; single-derivative
    // brake trace; within-driver shape variance below
    // threshold). Without measurable success criteria, drills
    // become "try harder" advice rather than coaching.
    //
    // Lock that the section uses success-criterion vocabulary
    // somewhere (≥2 of these patterns).
    const section = loadSection().toLowerCase();
    const successPatterns = [
      /success\s+criterion/,
      /goal[:.]/,
      /target[:.]/,
      /overlap/,
      /\bvariance\b/,
      /(single.derivative|smooth taper|no inflection|single taper)/,
    ];
    const matched = successPatterns.filter((re) => re.test(section));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });

  test('contains internal link to /product/coaching (drill source)', async () => {
    // Outline cross-link assignment. The coaching library is
    // where these drills live as ActionPrescription rows
    // (ADR-005 §5.3); the link is what makes the article-to-
    // product connection legible.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/coaching\)/);
  });

  test('contains internal link to /product/desktop or /product/mobile (capture)', async () => {
    // Outline §5 calls for the capture-surface link. The drills
    // are useless without the capture pipeline — desktop for
    // sim, mobile for real-world. Lock that ≥1 of the two
    // capture-surface links appears.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/(desktop|mobile)\)/);
  });

  test('contains internal link to /product/driver-profile (quarterly framing)', async () => {
    // Outline §5 calls for the quarterly-progression framing
    // anchored on the driver profile. Single-session focus on
    // trail-braking is too noisy to be diagnostic — quarter-
    // scale progression is what the profile makes legible.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/driver-profile\)/);
  });

  test('makes the cross-platform claim (sim AND real)', async () => {
    // Pillar 2 cross-platform discipline carries through every
    // section. Section 5 must say drills run identically on
    // both surfaces.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/sim\b/);
    expect(section).toMatch(/real\b/);
  });

  test('names ≥1 specific circuit or corner (specificity bar)', async () => {
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
      'Hairpin',
      'Spoon',
      'Nordschleife',
      'Sebring',
      'Monza',
      'Imola',
    ];
    const matched = namedAnchors.filter((anchor) => section.includes(anchor));
    expect(matched.length).toBeGreaterThanOrEqual(1);
  });

  test('uses "trail brak" repeatedly — article title verb', async () => {
    const section = loadSection().toLowerCase();
    const matches = section.match(/trail\s*brak/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 outline extensions', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\bneural\b/);
    expect(section).not.toMatch(/\brealistic\b/);
    expect(section).not.toMatch(/\bmagic\b/);
    expect(section).not.toMatch(/\bsecret\b/);
    expect(section).not.toMatch(/\btrick\b/);
  });
});
