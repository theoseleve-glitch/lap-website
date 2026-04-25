// T152 — contract test for Pillar 3 Section 2 ("what each does
// well"). Sprint task numbering calls this Section 1; outline
// numbering calls it Section 2 (after the unnumbered intro).
// Six paragraphs, one per app, naming 3-5 strengths each
// grounded in observable features. Per the outline's Pillar
// 3-specific risk profile, this section faces the highest tone-
// drift pressure (every claim is a positive about a competitor
// or about LAP); the test holds the discipline.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'telemetry-apps-comparison',
  'section-02-strengths.md',
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

describe('T152: Pillar 3 Section 2 — what each app does well', () => {
  test('word count is in the 480-720 band (±20% of 600 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(480);
    expect(wc).toBeLessThanOrEqual(720);
  });

  test('all six apps from the sprint task list are named', async () => {
    // The article's structural commitment — six apps in scope.
    // A draft that drops one collapses the comparison's
    // breadth; the persona-mapping section (T155) depends on
    // all six being characterised here first.
    const section = loadSection();
    const apps = ['LAP', 'Garage61', 'RaceLab', 'MoTeC', 'Track Attack', 'STINT'];
    for (const app of apps) {
      expect(section, `App "${app}" must be named in the section`).toContain(app);
    }
  });

  test('section uses the comparison-axis vocabulary from outline', async () => {
    // The outline locks six dimensions as shared vocabulary.
    // T152 must use ≥4 of them (not all six necessarily — some
    // axes are more relevant per-app than others). Catches a
    // draft that drifts to opinionated prose detached from the
    // axis structure.
    const section = loadSection().toLowerCase();
    const axisVocab = [
      /capture\s+surface|sim\s+platform|sim\s+title/, // axis 1
      /real.world|racebox|obd|phone\s+gps/, // axis 2
      /(weakness|coaching|driver\s+profile|trace|telemetry)/, // axis 3 (data depth)
      /cross.platform|both\s+surfaces|sim\s+(and|&)\s+real|one\s+progression/, // axis 4
      /(subscription|free\s+tier|paid|one.time|free\s+\+\s+paid)/, // axis 5 (pricing)
      /(persona|fit|competitive|track.day|casual|coach|pro)/, // axis 6
    ];
    const matched = axisVocab.filter((re) => re.test(section));
    expect(matched.length).toBeGreaterThanOrEqual(4);
  });

  test('LAP paragraph contains ≥1 /product/* internal link', async () => {
    // Outline §2 calls for /product/* link cluster in LAP's
    // own paragraph. Per-section floor here is ≥1 so a future
    // editorial pass tightening LAP's prose can drop one or
    // two links but cannot strip them all. T158 will lock the
    // total cumulative count; T152 just needs the floor.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\//);
  });

  test('section forbids subjective competitor disparagement (Pillar 3 extension)', async () => {
    // Pillar 3 outline forbidden-vocab extension: this section
    // cannot use "clearly worse" / "outdated" / "bloated" /
    // "overhyped" / "obviously inferior" or any variant. The
    // article's whole credibility comes from fact-based
    // comparison; a single subjective slip undermines every
    // other paragraph. Lock at section level.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bclearly\s+worse\b/);
    expect(section).not.toMatch(/\boutdated\b/);
    expect(section).not.toMatch(/\bbloated\b/);
    expect(section).not.toMatch(/\boverhyped\b/);
    expect(section).not.toMatch(/\bobviously\s+inferior\b/);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 carry-over', async () => {
    // ADR-004 standard ban + Pillar 2 outline carry-over.
    // Asymmetry note: "language-model" is permitted in
    // negation context (LAP's paragraph distances itself from
    // LLM coaching per ADR-004) — the test bans the bare
    // "llm" abbreviation but not "language model".
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

  test('LAP paragraph names ≥3 sim platforms (Doctrine §5 anchor)', async () => {
    // 01-STRATEGIC-DOCTRINE.md §5 lists the DOES-capture
    // roster. LAP's paragraph must cite from that roster — a
    // claim like "supports many sims" without naming them is
    // exactly the abstract drift the test catches.
    //
    // We grep for sim platform names anywhere in the section
    // (not strictly inside LAP's paragraph) since paragraph
    // boundaries are markdown-paragraph-fragile, but the
    // floor is the same: ≥3 named sim titles must appear.
    const section = loadSection();
    const platforms = [
      'iRacing',
      'Assetto Corsa Competizione',
      'ACC',
      'AMS2',
      'rFactor',
      'Le Mans Ultimate',
      'Rennsport',
      'F1 24',
    ];
    const matched = platforms.filter((p) => section.includes(p));
    expect(matched.length).toBeGreaterThanOrEqual(3);
  });

  test('section names ≥1 persona (the per-paragraph "best fit" framing)', async () => {
    // Outline §2 brief: "One sentence on the persona this app
    // most directly serves" per paragraph. Six "best fit"
    // sentences would mean six persona references — lock the
    // ≥1 floor as a basic structural check.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/(best\s+fit|persona|target|serves|fits)/);
  });
});
