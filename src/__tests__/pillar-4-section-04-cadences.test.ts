// T164 — contract test for Pillar 4 Section 4 ("cadences:
// per-session, weekly, event-cycle"). Sprint task wording
// calls this Section 3; outline numbering calls it Section 4.
//
// ~500 words across three cadence paragraphs. Without
// cadences, the framework is theoretically sound but
// practically abandoned — each cadence has a different time
// horizon and a different decision granularity. The event-
// cycle paragraph is the longest because it carries the
// cross-platform load (sim sessions used as practice for
// real-world events) and triggers the cross-pillar link to
// /blog/sim-to-real-transfer.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'driver-development-plan',
  'section-04-cadences.md',
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

describe('T164: Pillar 4 Section 4 — cadences', () => {
  test('word count is in the 400-600 band (±20% of 500 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(400);
    expect(wc).toBeLessThanOrEqual(600);
  });

  test('section names all three cadences with bold leaders', async () => {
    // Outline §4 brief: three cadences (per-session loop /
    // weekly review / event-cycle). Bold-leader format
    // matches §3's verb-leader pattern so the article reads
    // consistently. The exact phrase variants are flexible
    // ("per-session" vs "the per-session loop"); the leader
    // marker is what matters for scannability.
    const section = loadSection();
    expect(section, 'per-session cadence leader').toMatch(
      /\*\*[^*]*per.session[^*]*\*\*/i,
    );
    expect(section, 'weekly cadence leader').toMatch(
      /\*\*[^*]*weekly[^*]*\*\*/i,
    );
    expect(section, 'event-cycle cadence leader').toMatch(
      /\*\*[^*]*(event.cycle|event\s+cycle|race.cycle|race\s+cycle)[^*]*\*\*/i,
    );
  });

  test('section addresses cross-platform discipline (sim AND real)', async () => {
    // Outline quality bar: "every cadence applies to BOTH
    // sim and real-world, not just sim." Locking sim+real
    // both in this section catches a draft that treats
    // real-world as an afterthought.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/\bsim\b/);
    expect(section).toMatch(/\breal/);
  });

  test('section contains cross-pillar link to /blog/sim-to-real-transfer', async () => {
    // Outline §4 brief: "the event-cycle cadence is the
    // longest paragraph because it carries the cross-
    // platform load. Section drafter MUST reference the
    // transfer article cross-link." The cluster-as-hub
    // discipline depends on this link landing in §4.
    const section = loadSection();
    expect(section).toMatch(/\]\(\/blog\/sim-to-real-transfer\)/);
  });

  test('section contains internal link to /product/desktop (per-session)', async () => {
    // Outline §4: /product/desktop link in the per-session
    // paragraph (live coaching prompts during the session).
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/desktop\)/);
  });

  test('section contains internal link to /product/driver-profile (weekly review)', async () => {
    // Outline §4: /product/driver-profile link in the
    // weekly review paragraph (the progression view that
    // aggregates the week's sessions).
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/driver-profile\)/);
  });

  test('section contains internal link to /product/mobile (track-day cadence)', async () => {
    // Outline §4: /product/mobile link in the track-day
    // execute path (event-cycle cadence's real-world arm).
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/mobile\)/);
  });

  test('section contains internal link to /product/bridge (cross-platform cadence)', async () => {
    // Outline §4: /product/bridge link in the cross-platform
    // cadence (sim-and-real-world unified progression).
    const section = loadSection();
    expect(section).toMatch(/\]\(\/product\/bridge\)/);
  });

  test('section uses cadence-anchored time vocabulary', async () => {
    // Three cadences = three time horizons. Lock that
    // each is named explicitly: per-session is real-time;
    // weekly is week-N + week-N-plus-one; event-cycle is
    // four-to-six-weeks build-up to a target event. A draft
    // that drops the time-horizon vocabulary loses the
    // cadence-as-calendar argument.
    const section = loadSection().toLowerCase();
    const timeVocab = [
      /(per.session|during\s+the\s+session|live|real.time|mid.session)/,
      /(weekly|week.over.week|each\s+week|every\s+week)/,
      /(event.cycle|race.cycle|four.to.six\s+week|four\s+weeks|six\s+weeks|target\s+event)/,
    ];
    const matched = timeVocab.filter((re) => re.test(section));
    expect(
      matched.length,
      `Expected all 3 time-horizon vocabularies present; matched ${matched.length}`,
    ).toBeGreaterThanOrEqual(3);
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
