// T153 — contract test for Pillar 3 Section 3 ("what each
// lacks"). Sprint task numbering calls this Section 2; outline
// numbering calls it Section 3. Six paragraphs, one per app,
// naming 2-4 specific feature absences or scope limits.
//
// The article's trust-building pivot. Outline mandates that
// LAP's paragraph cannot be the shortest — every other app's
// "what it lacks" credibility depends on LAP's being equally
// honest about its own gaps. The test enforces that
// structural honesty.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'telemetry-apps-comparison',
  'section-03-limits.md',
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

// Parse out per-app paragraphs. Each paragraph starts with
// `**AppName.**` (bold app name + period). Returns map of
// app name → word count of its paragraph body.
const APP_NAMES = ['LAP', 'Garage61', 'RaceLab', 'MoTeC', 'Track Attack', 'STINT'];

const paragraphWordCounts = (): Record<string, number> => {
  const section = loadSection();
  // Split on the bold-app-name boundaries. Each match captures
  // the app name and the prose that follows until the next
  // **AppName.** boundary or end of file.
  const result: Record<string, number> = {};
  for (const app of APP_NAMES) {
    // Match `**App.**` followed by any text until the next `**App2.**`
    // header or end of file. App names are escaped for regex.
    const escaped = app.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const otherApps = APP_NAMES.filter((a) => a !== app)
      .map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .map((a) => `\\*\\*${a}\\.\\*\\*`)
      .join('|');
    const re = new RegExp(
      `\\*\\*${escaped}\\.\\*\\*([\\s\\S]*?)(?=${otherApps}|$)`,
    );
    const match = section.match(re);
    if (match) {
      result[app] = wordCount(match[1]);
    }
  }
  return result;
};

describe('T153: Pillar 3 Section 3 — what each app lacks', () => {
  test('word count is in the 400-600 band (±20% of 500 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(400);
    expect(wc).toBeLessThanOrEqual(600);
  });

  test('all six apps from the sprint task list are named', async () => {
    const section = loadSection();
    for (const app of APP_NAMES) {
      expect(section, `App "${app}" must be named`).toContain(app);
    }
  });

  test('LAP paragraph is NOT the shortest (outline honesty mandate)', async () => {
    // Outline §3 brief: "LAP's paragraph cannot be the
    // shortest. The credibility of every other app's 'what it
    // lacks' paragraph depends on LAP's being equally honest
    // about its own gaps." This test parses paragraphs by
    // bold-app-name markers, counts words per paragraph, and
    // asserts LAP's count ≥ every other app's count.
    const counts = paragraphWordCounts();
    const lapCount = counts['LAP'];
    expect(lapCount, 'LAP paragraph not found in section').toBeDefined();
    for (const [app, wc] of Object.entries(counts)) {
      if (app === 'LAP') continue;
      expect(
        lapCount,
        `LAP paragraph (${lapCount} words) must not be shorter than ${app} paragraph (${wc} words)`,
      ).toBeGreaterThanOrEqual(wc);
    }
  });

  test('LAP paragraph names ≥3 specific limitations (substance floor)', async () => {
    // Outline §3: "LAP's paragraph cannot be the shortest" is
    // a length floor; this test adds a substance floor — LAP
    // must name ≥3 specific limitations. Catches a draft that
    // pads LAP's paragraph with prose to satisfy the length
    // mandate without actually disclosing more limitations.
    //
    // Limitation indicators: explicit dates (e.g., "September
    // 2026"), platform absences ("not on the roadmap" /
    // "not available"), feature absences ("not every weakness
    // shape" / "no [X]" / "requires [hardware]").
    const section = loadSection();
    const escaped = 'LAP';
    const otherApps = APP_NAMES.filter((a) => a !== escaped)
      .map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .map((a) => `\\*\\*${a}\\.\\*\\*`)
      .join('|');
    const re = new RegExp(
      `\\*\\*${escaped}\\.\\*\\*([\\s\\S]*?)(?=${otherApps}|$)`,
    );
    const lapMatch = section.match(re);
    expect(lapMatch).not.toBeNull();
    const lapProse = lapMatch![1].toLowerCase();
    const limitationIndicators = [
      /\d{4}/, // year (e.g., "September 2026")
      /(not\s+on\s+the\s+roadmap|not\s+(yet\s+)?available|not\s+at\s+public\s+beta)/,
      /(not\s+every|requires\s+a?|hand.curated)/,
      /(closed\s+beta|invited\s+testers)/,
      /(only\s+\w+|only\s+the)/,
    ];
    const matched = limitationIndicators.filter((re) => re.test(lapProse));
    expect(matched.length).toBeGreaterThanOrEqual(3);
  });

  test('section uses factual-limit vocabulary (NOT subjective opinion)', async () => {
    // Outline §3 quality bar: "Lacks X" or "scope is sim-only"
    // required FACTUAL framings vs subjective ("feels dated").
    // Lock that section uses ≥2 factual-limit framings.
    const section = loadSection().toLowerCase();
    const factualPatterns = [
      /\blacks?\b/,
      /\bno\s+(real.world|coaching|cross.platform|rule.based)/,
      /(scope\s+is|is\s+sim.only|sim.side\s+only)/,
      /not\s+(the\s+)?primary/,
      /not\s+(yet\s+)?available/,
      /not\s+on\s+the\s+(current\s+)?roadmap/,
    ];
    const matched = factualPatterns.filter((re) => re.test(section));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });

  test('section forbids Pillar 3 subjective competitor disparagement', async () => {
    // Same lock as T152 plus added "feels" / "looks" /
    // "appears" subjective qualifiers — the section is
    // particularly vulnerable to these because it's about
    // limitations.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bclearly\s+worse\b/);
    expect(section).not.toMatch(/\boutdated\b/);
    expect(section).not.toMatch(/\bbloated\b/);
    expect(section).not.toMatch(/\boverhyped\b/);
    expect(section).not.toMatch(/\bobviously\s+inferior\b/);
    expect(section).not.toMatch(/\bfeels\s+(dated|old|clunky|amateur)/);
    expect(section).not.toMatch(/\blooks\s+(amateur|dated|old)\b/);
    expect(section).not.toMatch(/\bugly\b/);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 carry-over', async () => {
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
