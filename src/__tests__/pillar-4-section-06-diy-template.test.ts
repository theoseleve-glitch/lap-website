// T166 — contract test for Pillar 4 Section 6 ("DIY
// template for non-LAP users"). Sprint task wording calls
// this Section 5; outline numbering calls it Section 6.
//
// The article's structural trust signal. Without §6, §5
// reads as a sales pitch and the cluster's credibility
// collapses; with §6, §5 reads as honest description of
// LAP's automation surface and §6 reads as a generous-but-
// structural counterweight.
//
// ~400w. Voice: generous, not defensive. Tool-agnostic.
// Forbidden constructions: "or use LAP for the easier path"
// / "without LAP you're missing out" / any framing that
// undercuts the section's own trust-signal premise.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'driver-development-plan',
  'section-06-diy-template.md',
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

const FRAMEWORK_VERBS = ['diagnose', 'prescribe', 'execute', 'measure', 'adapt'];

describe('T166: Pillar 4 Section 6 — DIY template for non-LAP users', () => {
  test('word count is in the 320-480 band (±20% of 400 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(320);
    expect(wc).toBeLessThanOrEqual(480);
  });

  test('section names all five framework verbs (template traverses all five)', async () => {
    // Outline §6 brief: the template covers all five
    // framework verbs (weekly diagnose worksheet,
    // prescription line, execute log, measure cell, adapt
    // decision). A draft that drops a verb breaks the
    // template's claim to be the framework in DIY form.
    const section = loadSection().toLowerCase();
    for (const verb of FRAMEWORK_VERBS) {
      expect(
        section,
        `Section must reference framework verb "${verb}"`,
      ).toMatch(new RegExp(`\\b${verb}`));
    }
  });

  test('section asserts tool-agnosticism explicitly', async () => {
    // Outline §6 brief: "the framework belongs to the reader
    // regardless of which tool they pay for." A reader
    // landing on §6 must read the explicit declaration that
    // the template is tool-agnostic — not derive it from
    // context.
    const section = loadSection().toLowerCase();
    const toolAgnosticPatterns = [
      /any\s+telemetry\s+(tool|app|software)/,
      /tool.agnostic/,
      /(works|runs)\s+with\s+(any|whatever|every)/,
      /(does\s+not\s+require|without)\s+(\w+\s+){0,3}lap/,
      /not\s+lap.exclusive/,
    ];
    const matched = toolAgnosticPatterns.filter((re) => re.test(section));
    expect(
      matched.length,
      'Section must explicitly assert tool-agnostic framing',
    ).toBeGreaterThanOrEqual(1);
  });

  test('section names ≥2 non-LAP telemetry tools (Pillar 3 universe reference)', async () => {
    // Outline §6 brief: "the template works with all six
    // apps in [the Pillar 3 comparison]." Naming ≥2 non-LAP
    // tools converts the abstract "any tool" claim into a
    // concrete list a reader can act on. Pillar 3's six-app
    // universe: LAP, Garage61, RaceLab, MoTeC, Track Attack,
    // STINT.
    const section = loadSection();
    const nonLapTools = ['Garage61', 'RaceLab', 'MoTeC', 'Track Attack', 'STINT'];
    const matched = nonLapTools.filter((tool) => section.includes(tool));
    expect(
      matched.length,
      `Expected ≥2 non-LAP tools named (Pillar 3 universe); matched ${matched.length}: ${matched.join(', ')}`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('section contains cross-pillar link to /blog/best-sim-racing-telemetry-app', async () => {
    // Outline §6 brief: "link to [the telemetry app
    // comparison](/blog/best-sim-racing-telemetry-app) for
    // readers who have not chosen a tool yet." Cluster-as-
    // hub anchor — Pillar 4 references Pillar 3 because the
    // DIY template needs a tool, and the comparison article
    // is the canonical shopping reference.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/blog\/best-sim-racing-telemetry-app\)/);
  });

  test('section avoids LAP-superiority undercut phrases', async () => {
    // Outline §6 forbidden vocab guardrail: "'or use LAP for
    // the easier path' / 'without LAP you are missing out' —
    // both are off-doctrine. The DIY template stands on its
    // own."
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/lap\s+(\w+\s+){0,2}(easier|simpler|faster)\s+(path|way|route)/);
    expect(section).not.toMatch(/without\s+lap\s+(\w+\s+){0,3}(missing|missing\s+out|miss\s+out)/);
    expect(section).not.toMatch(/lap\s+is\s+the\s+easier\s+choice/);
    expect(section).not.toMatch(/(easier|simpler|faster)\s+with\s+lap/);
    expect(section).not.toMatch(/lap\s+saves\s+you\s+time/);
  });

  test('section references the framework loop / cycle structure', async () => {
    // The DIY template implements the same loop as §3 + §5;
    // the loop concept must be referenced so the reader sees
    // the template as the framework in worksheet form, not
    // as a separate methodology.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/(loop|cycle|the\s+same\s+(framework|five\s+verbs|steps))/);
  });

  test('section forbids Pillar 4-specific overclaim vocabulary', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bguru\b/);
    expect(section).not.toMatch(/\bsecret\s+formula\b/);
    expect(section).not.toMatch(/\bshortcut\b/);
    expect(section).not.toMatch(/\bovernight\b/);
    expect(section).not.toMatch(/\bhack\b/);
    expect(section).not.toMatch(/\bsystem\s+that\s+guarantees\b/);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 + Pillar 3 carry-over', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai\s+coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\bneural\b/);
    expect(section).not.toMatch(/\brealistic\b/);
    expect(section).not.toMatch(/\bmagic\b/);
    expect(section).not.toMatch(/\bsecret\b/);
    expect(section).not.toMatch(/\btrick\b/);
    expect(section).not.toMatch(/\bclearly\s+worse\b/);
    expect(section).not.toMatch(/\boutdated\b/);
    expect(section).not.toMatch(/\bbloated\b/);
  });
});
