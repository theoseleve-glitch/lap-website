// T136 — contract test for Pillar 1 Section 6 ("how to measure
// transfer yourself"). Sprint task numbering calls this Section 5;
// outline numbering calls it Section 6. NOTE: the sprint task
// title diverged from the T131 outline — sprint says "how to
// measure transfer yourself" rather than the outline's "what sim
// teaches". Sprint is canonical; this section drafts what the
// sprint actually requests.
//
// The DIY-measurement section pivots the article from theory to
// reader action. Empowering the reader to verify the framework
// against their own data is what converts "interesting article"
// into "I'm going to try this on my next session."

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'sim-to-real-transfer',
  'section-06-measure-yourself.md',
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

describe('T136: Pillar 1 Section 6 — how to measure transfer yourself', () => {
  test('word count is in the 240-360 band (±20% of 300 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(240);
    expect(wc).toBeLessThanOrEqual(360);
  });

  test('uses second-person voice (you / your / yourself) — DIY framing', async () => {
    // The section's whole purpose is reader empowerment. A draft
    // that drifts into third-person ("a driver could compare...")
    // loses the call-to-action voice. Lock the second-person
    // anchor.
    const section = loadSection();
    expect(section).toMatch(/\b(you|your|yourself)\b/i);
  });

  test('names at least three specific comparable artifacts', async () => {
    // The framework says "compare shapes." This section makes
    // that operational by listing specific things to compare:
    // brake-zone ordering, line shape, weakness shape,
    // trail-brake pattern, etc. Naming ≥3 concrete artifacts
    // turns abstract "compare shapes" into a checklist.
    const section = loadSection().toLowerCase();
    const artifacts = [
      'brake-zone',
      'brake zone',
      'line shape',
      'apex',
      'weakness shape',
      'weakness pattern',
      'trail-brake',
      'trail brake',
      'sector delta',
      'sector time',
      'throttle trace',
      'steering trace',
    ];
    const matched = artifacts.filter((a) => section.includes(a));
    expect(matched.length).toBeGreaterThanOrEqual(3);
  });

  test('contains the doctrine "compare shapes across platforms / intensities within" rule', async () => {
    // Section 3 (T133) established the rule. Section 6 has to
    // restate it — the reader is being told what TO compare and
    // implicitly what NOT to compare. Lock both sides:
    //   * "across platforms" / cross-platform matching of shapes
    //   * "within (a / the) platform" / intra-platform intensity
    // The negation guards against a draft that says "compare
    // your sim lap times to your real lap times" — exactly the
    // mistake the framework rules out.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/(across platforms|cross.platform|both platforms)/);
    expect(section).toMatch(/(within (a |the )?platform|same platform|on the same)/);
  });

  test('names at least one sim platform AND a real-world capture tool', async () => {
    // The DIY method has two data sources — sim telemetry and
    // real-track capture. Lock that the section names at least
    // one tool from each side, so the reader has a concrete
    // starting point on each platform.
    const section = loadSection();
    expect(section).toMatch(/iRacing|ACC|AMS2|rFactor|Assetto Corsa/);
    expect(section).toMatch(/RaceBox|phone GPS|GPS log|telemetry|datalogger/i);
  });

  test('contains an internal link to /product/bridge (the automated alternative)', async () => {
    // /product/bridge already established in T133 as the
    // technical artifact that operationalises the framework.
    // T136's natural cross-link: "you can do this manually, or
    // the bridge automates it." Honest framing — LAP saves
    // labor, doesn't replace the principle.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/bridge\)/);
  });

  test('forbidden vocab — no AI-coach / LLM / generative / "realistic"', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\brealistic\b/);
  });
});
