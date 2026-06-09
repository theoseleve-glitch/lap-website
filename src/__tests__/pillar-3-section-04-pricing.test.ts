// T154 — contract test for Pillar 3 Section 4 ("pricing
// comparison"). Sprint task wording calls this Section 3 ⇒
// table; outline numbering calls it Section 4. The artifact is
// a markdown table; surrounding prose contextualises. Pricing
// claims must be sourced from each app's current public
// pricing page; outline mandates "expensive" / "cheap" as
// subjective forbidden vocab here.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'telemetry-apps-comparison',
  'section-04-pricing.md',
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

describe('T154: Pillar 3 Section 4 — pricing comparison', () => {
  test('word count is in the 320-480 band (±20% of 400 outline target)', async () => {
    // Markdown tables inflate the wordCount tally because
    // pipe characters split as token boundaries. Band reflects
    // this — the prose content alone is ~200-300 words; the
    // table adds ~80-150 token-fragments.
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(320);
    expect(wc).toBeLessThanOrEqual(480);
  });

  test('section contains a markdown table (separator row present)', async () => {
    // A markdown table has a `|---|---|...|` separator row
    // distinguishing it from prose. Lock the structural form —
    // the outline mandates a TABLE not a bullet list.
    const section = loadSection();
    expect(section).toMatch(/\|\s*-+\s*\|/);
  });

  test('all six apps appear in the section', async () => {
    const section = loadSection();
    for (const app of APP_NAMES) {
      expect(section, `App "${app}" must appear in section`).toContain(app);
    }
  });

  test('table includes core column headers (App + pricing concepts)', async () => {
    // Outline §4 specifies: App name, Pricing model class,
    // Entry price, Free tier exists, Notes. Lock that ≥3 of
    // these column-concept words appear in headers (the
    // exact wording can flex but the concepts must be there).
    const section = loadSection().toLowerCase();
    const headerConcepts = [
      /\|\s*app\b/, // "App" column
      /pricing\s+model|pricing\s+class|model/, // pricing model column
      /entry\s+price|price\b|cost\b/, // price column
      /free\s+tier|free\s+\?|free\s+\|/, // free-tier column
      /notes\s*\|/, // notes column
    ];
    const matched = headerConcepts.filter((re) => re.test(section));
    expect(matched.length).toBeGreaterThanOrEqual(3);
  });

  test('section references LAP subscription pricing (€19.90 or €14.90 monthly)', async () => {
    // June-8 canon: standard rate €19.90/mo, founding-50 rate
    // €14.90/mo. LAP's row in the pricing table must cite at
    // least one of these specific values — "subscription" with
    // no fee is too vague. Catches a draft that lists LAP's
    // pricing class without the actual fee.
    const section = loadSection();
    expect(section).toMatch(/€\s*19\.90|€\s*14\.90/);
  });

  test('section contains internal link to /pricing', async () => {
    // Outline §4 closing prose: "link out to /pricing for LAP's
    // full pricing details (the article's pricing line is a
    // snapshot; the canonical source is /pricing)." Lock the
    // link.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/pricing\)/);
  });

  test('section forbids subjective pricing vocabulary (Pillar 3 §4 extension)', async () => {
    // Outline §4 quality bar: "Free / premium" doctrine-aligned;
    // "expensive" / "cheap" subjective forbidden vocabulary in
    // this section. Pricing comparison must compare on
    // model+amount, not on subjective worth.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bexpensive\b/);
    expect(section).not.toMatch(/\bcheap\b/);
    expect(section).not.toMatch(/\bpricey\b/);
    expect(section).not.toMatch(/\baffordable\b/);
  });

  test('forbidden vocab — ADR-004 + Pillar 2 + Pillar 3 carry-over', async () => {
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai coach\b/);
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

  test('section contains "verify" / "current" honesty hedge for evolving competitor pricing', async () => {
    // Pillar 3 risk profile mandates source-verification for
    // every competitor claim. Pricing changes most quickly of
    // all axes — section must explicitly note that competitor
    // prices should be verified against the canonical source
    // before claims become stale.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/(verify|current|snapshot|as\s+of\s+|may\s+have\s+changed)/);
  });
});
