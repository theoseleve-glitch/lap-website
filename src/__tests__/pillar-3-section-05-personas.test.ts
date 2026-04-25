// T155 — contract test for Pillar 3 Section 5 ("choosing by
// persona"). Sprint task wording calls this Section 4; outline
// numbering calls it Section 5. The outline calls this "the
// section that earns the article" — five personas mapped to
// shortlist, with a mandatory honest "LAP gives up X versus Y"
// sentence per persona. The trust-building load-bearer.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'telemetry-apps-comparison',
  'section-05-personas.md',
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

const APP_NAMES = ['LAP', 'Garage61', 'RaceLab', 'MoTeC', 'Track Attack', 'STINT'];

// The five personas from outline §5 (which map onto Doctrine
// §3 plus the article-level shopping personas — casual sim
// racer is doctrine anti-persona but article-level shopping
// persona, included because the article's audience is broader
// than the product's persona).
const PERSONAS = [
  /casual\s+sim\s+racer/i,
  /competitive\s+sim\s+racer/i,
  /track.day\s+driver/i,
  /team\s+coach/i,
  /(pro|semi.pro)\b/i,
];

describe('T155: Pillar 3 Section 5 — choosing by persona', () => {
  test('word count is in the 480-720 band (±20% of 600 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(480);
    expect(wc).toBeLessThanOrEqual(720);
  });

  test('section names all five personas from outline §5', async () => {
    const section = loadSection();
    for (const re of PERSONAS) {
      expect(section, `Persona regex ${re} must match`).toMatch(re);
    }
  });

  test('section names all six apps in scope', async () => {
    // Per-persona shortlist must reference apps; the universe
    // of six apps must all appear somewhere in the section
    // (each persona shortlists 1-3 of them, so cumulatively
    // every app should be named at least once across all five
    // personas).
    const section = loadSection();
    for (const app of APP_NAMES) {
      expect(section, `App "${app}" must appear in section`).toContain(app);
    }
  });

  test('section contains ≥4 internal links to /product/* or /blog/*', async () => {
    // Outline §5 internal-links list: /product/coaching,
    // /product/mobile, /product/bridge, /product/driver-profile,
    // /blog/sim-to-real-transfer, /blog/what-is-trail-braking.
    // Lock that ≥4 of these appear — one per persona at
    // minimum, with the cross-pillar /blog/* links anchoring
    // the four-pillar cluster.
    const section = loadSection();
    const productLinks = section.match(/\]\(\/product\/[a-z-]+\)/g) ?? [];
    const blogLinks = section.match(/\]\(\/blog\/[a-z-]+\)/g) ?? [];
    expect(productLinks.length + blogLinks.length).toBeGreaterThanOrEqual(4);
  });

  test('section contains an "honestly NOT the best fit" admission for at least one persona', async () => {
    // Outline §5 mandate: "if LAP is NOT the strongest fit
    // (e.g., pro driver may be better served by MoTeC for
    // now), say that". Without this, the section becomes a
    // sales pitch dressed as comparison. The trust-building
    // cost of saying "LAP is not yet the right answer for the
    // pro persona" is what makes the casual/competitive/track-
    // day persona claims credible.
    //
    // Match a wide range of honest-not-the-fit framings:
    // "MoTeC fits this persona better", "LAP is not the right
    // tool", "we would point this persona to X", "LAP is not
    // yet the answer", "X is the better fit", "this is not
    // LAP's persona".
    const section = loadSection().toLowerCase();
    const notFitPatterns = [
      /lap\s+is\s+not\s+(yet\s+)?the\s+(right|best|strongest)/,
      /not\s+lap'?s\s+persona/,
      /(motec|garage61|racelab|track\s+attack|stint)\s+(fits|is)\s+(this\s+persona\s+)?better/,
      /(motec|garage61|racelab|track\s+attack|stint)\s+is\s+the\s+(right|better|stronger)\s+(answer|fit|tool)/,
      /(point|recommend|send)\s+(this|that)\s+(persona|driver|reader)\s+to\s+(motec|garage61|racelab|track\s+attack|stint)/,
      /honestly\s+a\s+(motec|garage61|racelab|track\s+attack|stint)/,
    ];
    const matched = notFitPatterns.filter((re) => re.test(section));
    expect(
      matched.length,
      'Section must contain ≥1 honest "LAP not the best fit" admission for at least one persona',
    ).toBeGreaterThanOrEqual(1);
  });

  test('section contains ≥3 "LAP gives up X versus Y" honest-framing constructions', async () => {
    // Outline §5 quality bar: "every persona must have an
    // honest 'LAP gives up X versus Y' sentence". Five
    // personas, ≥3 of them must contain a comparative
    // honesty construction (some persona paragraphs may
    // legitimately conclude LAP is the wrong fit — those count
    // toward the not-fit test above instead, so we lock 3 not
    // 5 here).
    //
    // Honest-framing markers: "compared to", "versus", "gives
    // up", "trades", "in exchange for", "would gain X by
    // choosing Y", "less [X] than [Y]".
    const section = loadSection().toLowerCase();
    const honestFramingPatterns = [
      /(versus|vs\.?)\s+(motec|garage61|racelab|track\s+attack|stint|the\s+(garage61|racelab|motec|track\s+attack|stint))/,
      /(compared\s+to|against)\s+(motec|garage61|racelab|track\s+attack|stint)/,
      /gives?\s+up/,
      /trades?\s+(off|away)?\s*(\w+\s+){0,3}(for|against)/,
      /in\s+exchange\s+for/,
      /less\s+\w+\s+than\s+(motec|garage61|racelab|track\s+attack|stint)/,
      /lacks?\s+(the\s+)?(motec|garage61|racelab|track\s+attack|stint)/,
    ];
    const matched = honestFramingPatterns.filter((re) => re.test(section));
    expect(
      matched.length,
      'Section must contain ≥3 honest-framing constructions across personas',
    ).toBeGreaterThanOrEqual(3);
  });

  test('section forbids "best app overall" winner-declaration framing', async () => {
    // Outline §1 forbidden: "best app" as winner-declaration.
    // Article TITLE uses "best" because that is what people
    // search for; the BODY never declares one winner.
    // Section 5 is the highest-risk section for this slip
    // because it's mapping personas to apps — the natural
    // shape of "for persona X, the best app is Y" must be
    // resisted in favour of "for persona X, the apps that fit
    // are Y and Z because [reason]".
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bbest\s+(telemetry\s+)?app\s+overall\b/);
    expect(section).not.toMatch(/\bthe\s+best\s+(telemetry\s+)?app\s+(is|for\s+everyone)\b/);
    expect(section).not.toMatch(/\boverall\s+winner\b/);
    expect(section).not.toMatch(/\bclearly\s+the\s+best\b/);
  });

  test('section forbids subjective competitor disparagement (Pillar 3 carry-over)', async () => {
    // Same forbidden vocab as section-02 + section-03 +
    // section-04. Persona-mapping section is particularly
    // vulnerable because honest "LAP gives up X versus Y"
    // sentences invite the inverse temptation: "X is bloated"
    // / "Y is overhyped". Forbidden across the board.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bclearly\s+worse\b/);
    expect(section).not.toMatch(/\bobjectively\s+worse\b/);
    expect(section).not.toMatch(/\bobviously\s+inferior\b/);
    expect(section).not.toMatch(/\boutdated\b/);
    expect(section).not.toMatch(/\bbloated\b/);
    expect(section).not.toMatch(/\boverhyped\b/);
    expect(section).not.toMatch(/\bugly\b/);
    expect(section).not.toMatch(/\bfeels\s+(dated|old|clunky|amateur)/);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 carry-over', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai\s+coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\bneural\b/);
    expect(section).not.toMatch(/\brealistic\b/);
    expect(section).not.toMatch(/\bmagic\b/);
    expect(section).not.toMatch(/\bsecret\b/);
    expect(section).not.toMatch(/\btrick\b/);
  });

  test('section references at least one cross-pillar /blog/* link (four-pillar cluster anchor)', async () => {
    // Outline §5 internal-links list mandates BOTH
    // /blog/sim-to-real-transfer (track-day persona) and
    // /blog/what-is-trail-braking (competitive sim racer
    // persona) as the cross-pillar cluster anchors. Lock that
    // ≥1 of these appears — Pillar 3 must reference its
    // sibling pillars.
    const section = loadSection();
    expect(section).toMatch(
      /\]\(\/blog\/(sim-to-real-transfer|what-is-trail-braking)\)/,
    );
  });
});
