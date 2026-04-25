// T157 (conclusion half) — contract test for Pillar 3
// Section 7 ("conclusion"). Outline §7 is conclusion-only:
// no individual T-task, drafted under the T157 editing
// umbrella alongside §1.
//
// Outline brief: ~150 words, three closing lines structure
// (no-single-best + walked-through-six + forward-pointers),
// declarative voice, /product + /blog/sim-to-real-transfer +
// /blog/what-is-trail-braking + /waitlist links anchor the
// four-pillar cluster + product surface + early-access path.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'telemetry-apps-comparison',
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

describe('T157 (conclusion): Pillar 3 Section 7 — conclusion', () => {
  test('word count is in the 120-180 band (±20% of 150 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(120);
    expect(wc).toBeLessThanOrEqual(180);
  });

  test('section reaffirms the no-single-best framing', async () => {
    // Outline §7 closing line 1: "There is no single best
    // telemetry app — the right answer depends on your
    // persona, your budget, and your platform mix."
    const section = loadSection().toLowerCase();
    expect(section).toMatch(
      /(no\s+single\s+best|right\s+answer\s+depends|fits\s+your\s+(persona|budget|platform)|depends\s+on\s+your)/,
    );
  });

  test('section contains forward-pointer links to /product, /blog cluster, /waitlist', async () => {
    // Outline §7 closing line 3: "Forward-pointer: /product
    // for the LAP five-pillar surface, /blog/sim-to-real-
    // transfer and /blog/what-is-trail-braking for the
    // technique articles in this cluster, and /waitlist for
    // the LAP early-access path."
    //
    // Lock all four link types: /product, both /blog cluster
    // articles, and /waitlist.
    const section = loadSection();
    expect(section, '/product link required').toMatch(/\]\(\/product(\/[a-z-]+)?\)/);
    expect(section, '/blog/sim-to-real-transfer link required').toMatch(
      /\]\(\/blog\/sim-to-real-transfer\)/,
    );
    expect(section, '/blog/what-is-trail-braking link required').toMatch(
      /\]\(\/blog\/what-is-trail-braking\)/,
    );
    expect(section, '/waitlist link required').toMatch(/\]\(\/waitlist\)/);
  });

  test('section avoids overselling — declarative voice not promotional', async () => {
    // Outline §7 voice: "don't oversell. The article's
    // credibility comes from Section 6 (honest limitations) —
    // keep the conclusion declarative."
    //
    // Forbid sales-pitch intensifiers that would undercut the
    // honest-limitations credibility from §6.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\brevolutionary\b/);
    expect(section).not.toMatch(/\bgame.?changer\b/);
    expect(section).not.toMatch(/\bunmatched\b/);
    expect(section).not.toMatch(/\bunrivaled\b/);
    expect(section).not.toMatch(/\babsolutely\s+(the\s+)?best\b/);
    expect(section).not.toMatch(/\bsign\s+up\s+(now|today)\b/);
    expect(section).not.toMatch(/\bdon't\s+miss\s+out\b/);
  });

  test('section forbids subjective competitor disparagement (Pillar 3 carry-over)', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bclearly\s+worse\b/);
    expect(section).not.toMatch(/\boutdated\b/);
    expect(section).not.toMatch(/\bbloated\b/);
    expect(section).not.toMatch(/\boverhyped\b/);
    expect(section).not.toMatch(/\bobviously\s+inferior\b/);
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
});
