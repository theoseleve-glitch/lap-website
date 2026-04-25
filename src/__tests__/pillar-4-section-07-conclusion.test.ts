// T167 (conclusion half) — contract test for Pillar 4
// Section 7 ("conclusion"). Outline §7 is conclusion-only:
// no individual T-task, drafted under the T167 editing
// umbrella alongside §1.
//
// Outline brief: ~150 words, three closing-line structure,
// declarative voice, /product + /blog/sim-to-real-transfer
// + /blog/what-is-trail-braking + /blog/best-sim-racing-
// telemetry-app + /waitlist links. Pillar 4's conclusion is
// the cluster's closer — all three sibling pillars
// referenced.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'driver-development-plan',
  'section-07-conclusion.md',
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

describe('T167 (conclusion): Pillar 4 Section 7 — conclusion', () => {
  test('word count is in the 120-180 band (±20% of 150 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(120);
    expect(wc).toBeLessThanOrEqual(180);
  });

  test('section reaffirms the loop framing', async () => {
    // Outline §7 closing line 1: "The development plan IS
    // the loop. Diagnose → prescribe → execute → measure →
    // adapt." The conclusion lifts the framework one last
    // time so a reader who skipped to the bottom still
    // leaves with the framework anchor.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(
      /(the\s+plan\s+is\s+the\s+loop|the\s+development\s+plan\s+is\s+the\s+loop|loop\s+closes|the\s+framework\s+is)/,
    );
  });

  test('section contains forward-pointer to all three sibling pillars + product + waitlist', async () => {
    // Outline §7 closing line 3: "Forward-pointer: /product
    // for the LAP five-pillar surface, /blog/sim-to-real-
    // transfer and /blog/what-is-trail-braking and
    // /blog/best-sim-racing-telemetry-app for the cluster
    // articles, and /waitlist for the LAP early-access
    // path." Pillar 4 closes the cluster — all three
    // sibling pillars must be referenced.
    const section = loadSection();
    expect(section, '/product link required').toMatch(
      /\]\(\/product(\/[a-z-]+)?\)/,
    );
    expect(section, '/blog/sim-to-real-transfer link required (Pillar 1)').toMatch(
      /\]\(\/blog\/sim-to-real-transfer\)/,
    );
    expect(section, '/blog/what-is-trail-braking link required (Pillar 2)').toMatch(
      /\]\(\/blog\/what-is-trail-braking\)/,
    );
    expect(
      section,
      '/blog/best-sim-racing-telemetry-app link required (Pillar 3)',
    ).toMatch(/\]\(\/blog\/best-sim-racing-telemetry-app\)/);
    expect(section, '/waitlist link required').toMatch(/\]\(\/waitlist\)/);
  });

  test('section avoids overselling — declarative voice not promotional', async () => {
    // Outline §7 voice: "declarative, not promotional. The
    // credibility comes from §6 DIY template — keep the
    // conclusion measured." Forbid sales-pitch
    // intensifiers that would undercut the §6 trust signal.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\brevolutionary\b/);
    expect(section).not.toMatch(/\bgame.?changer\b/);
    expect(section).not.toMatch(/\bunmatched\b/);
    expect(section).not.toMatch(/\bunrivaled\b/);
    expect(section).not.toMatch(/\babsolutely\s+(the\s+)?best\b/);
    expect(section).not.toMatch(/\bsign\s+up\s+(now|today)\b/);
    expect(section).not.toMatch(/\bdon't\s+miss\s+out\b/);
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
