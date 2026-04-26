// T214 — YouTube short 2-min demo script for the
// public-beta launch on 2026-07-23. Scene-by-scene
// shot list with **Visual:** and **Narration:** fields
// per scene; total runtime ~2:00. Single-file artefact
// at docs/marketing/launch-youtube-demo-script.md,
// mirroring T208 + T212 + T213 launch-content shape.
//
// Tense strategy mirrors T209 + T210 launch landings:
// date-anchored copy ("LAP enters public beta on
// 2026-07-23") that reads accurately whether the demo
// is recorded ahead of launch (preview) or after
// (catalogue piece).

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const FILE_PATH = join(
  process.cwd(),
  'docs',
  'marketing',
  'launch-youtube-demo-script.md',
);

const loadFile = (): string => readFileSync(FILE_PATH, 'utf8');

describe('T214: file artefact on disk', () => {
  test('docs/marketing/launch-youtube-demo-script.md exists', () => {
    expect(existsSync(FILE_PATH)).toBe(true);
  });

  test('file has a single H1 (overview heading)', () => {
    const md = loadFile();
    const h1Lines = md.match(/^#\s+/gm) ?? [];
    expect(h1Lines.length).toBe(1);
  });

  test('file has at least 4 H2 sections (scenes)', () => {
    const md = loadFile();
    const h2Lines = md.match(/^##\s+/gm) ?? [];
    expect(
      h2Lines.length,
      `2-min demo should have ≥4 scenes; got ${h2Lines.length}`,
    ).toBeGreaterThanOrEqual(4);
  });
});

describe('T214: scene structure (timecodes + Visual + Narration)', () => {
  test('file contains at least 4 timecode markers (M:SS format)', () => {
    const md = loadFile();
    const timecodes = md.match(/\b\d:\d{2}\b/g) ?? [];
    expect(
      timecodes.length,
      `script needs ≥4 M:SS timecodes; got ${timecodes.length}`,
    ).toBeGreaterThanOrEqual(4);
  });

  test('script reaches roughly 2:00 (last timecode 1:45–2:15)', () => {
    // Lock that the script targets ~2-min runtime — last
    // timecode mentioned must be in the 1:45–2:15 window.
    // Tighter bound would brittle out on small revisions.
    const md = loadFile();
    const allTimecodes = [...md.matchAll(/\b(\d):(\d{2})\b/g)].map(
      (m) => Number(m[1]) * 60 + Number(m[2]),
    );
    const maxSec = Math.max(...allTimecodes, 0);
    expect(
      maxSec,
      `last timecode must be ≥1:45 (105s); got ${maxSec}s`,
    ).toBeGreaterThanOrEqual(105);
    expect(
      maxSec,
      `last timecode must be ≤2:15 (135s); got ${maxSec}s`,
    ).toBeLessThanOrEqual(135);
  });

  test('file has at least 4 **Visual:** field markers (one per scene)', () => {
    const md = loadFile();
    const visuals = md.match(/\*\*Visual:\*\*/g) ?? [];
    expect(
      visuals.length,
      `each scene needs **Visual:** field; got ${visuals.length}`,
    ).toBeGreaterThanOrEqual(4);
  });

  test('file has at least 4 **Narration:** field markers (one per scene)', () => {
    const md = loadFile();
    const narrs = md.match(/\*\*Narration:\*\*/g) ?? [];
    expect(
      narrs.length,
      `each scene needs **Narration:** field; got ${narrs.length}`,
    ).toBeGreaterThanOrEqual(4);
  });
});

describe('T214: narration word count (spoken-2min band)', () => {
  test('total narration words across all scenes is in 180-420 band', () => {
    // 2 minutes spoken at typical demo-narration pace
    // (150-180 wpm) = 300-360 words. Band 180-420 allows
    // for slower/deliberate delivery and slack for
    // editing-room cuts.
    const md = loadFile();
    const lines = [...md.matchAll(/\*\*Narration:\*\*\s*"([^"]+)"/g)];
    const total = lines
      .map((m) => m[1])
      .join(' ')
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    expect(
      total,
      `narration must be 180-420 words (≈2-min spoken); got ${total}`,
    ).toBeGreaterThanOrEqual(180);
    expect(total).toBeLessThanOrEqual(420);
  });
});

describe('T214: critical facts (locked from doctrine)', () => {
  test('mentions public-beta date 2026-07-23', () => {
    const md = loadFile();
    expect(md).toMatch(/2026-07-23|July 23,?\s*2026|23 July 2026/);
  });

  test('mentions €15 consumer pricing', () => {
    const md = loadFile();
    expect(md).toMatch(/€15/);
  });

  test('mentions €12 grandfathered founder rate (waitlist context)', () => {
    const md = loadFile();
    expect(md).toMatch(/€12/);
  });

  test('mentions 14-day free trial', () => {
    const md = loadFile();
    expect(md.toLowerCase()).toMatch(/14[- ]day/);
  });
});

describe('T214: doctrine framing', () => {
  test('uses cross-platform mission framing', () => {
    const md = loadFile();
    expect(md.toLowerCase()).toMatch(/cross[- ]platform/);
  });

  test('mentions both sim and real-world racing', () => {
    const md = loadFile();
    const lower = md.toLowerCase();
    expect(lower).toMatch(/\bsim\b|\bsimulator\b/);
    expect(lower).toMatch(
      /\breal[- ]world|real[- ]track|on[- ]track|track day\b/,
    );
  });

  test('names ≥2 sim platforms (concrete capture roster)', () => {
    const md = loadFile();
    const lower = md.toLowerCase();
    const platforms = [
      /\biracing\b/,
      /\bams\s*2\b|\bautomobilista\b/,
      /\bacc\b|\bassetto corsa competizione/,
      /\brfactor/,
      /\blmu\b|\ble mans ultimate/,
    ];
    const matched = platforms.filter((re) => re.test(lower));
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });
});

describe('T214: CTA (waitlist link or launch date)', () => {
  test('surfaces /waitlist link OR launch date 2026-07-23', () => {
    const md = loadFile();
    const ctaPatterns = [
      /lap-coach\.racing\/waitlist/i,
      /\/waitlist\b/i,
      /2026-07-23/,
      /July 23,?\s*2026/i,
    ];
    const matched = ctaPatterns.some((re) => re.test(md));
    expect(matched).toBe(true);
  });
});

describe('T214: ADR-004 vocab discipline', () => {
  test('no bare "AI coach" / "LLM" / "generative" / "neural" / "realistic"', () => {
    const md = loadFile();
    const lower = md.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });

  test('uses "hand-curated" or "written rule" framing (positive doctrine)', () => {
    const md = loadFile();
    const lower = md.toLowerCase();
    expect(lower).toMatch(
      /\bhand[- ]curated\b|\bwritten rule\b|\brule[- ]traceable\b/,
    );
  });
});

describe('T214: anti-fabrication', () => {
  test('no fabricated user counts ("X drivers / X users / X teams already")', () => {
    const md = loadFile();
    const lower = md.toLowerCase();
    expect(lower).not.toMatch(/\btrusted by\s+\d+/);
    expect(lower).not.toMatch(/\bjoin\s+\d+\s+(drivers|racers|teams|users)/);
    expect(lower).not.toMatch(/\b\d{3,}\s+(?:drivers|racers|teams)\s+already\b/);
  });

  test('no fabricated person testimonials (— Firstname Lastname, OrgName pattern)', () => {
    // Fake testimonial pattern: "— Mike Smith, ProTeam Racing"
    // This regex requires em/en-dash + Capitalized Firstname + space
    // + Capitalized Lastname + comma + space + Capitalized Org letter.
    const md = loadFile();
    expect(md).not.toMatch(/[—–]\s+[A-Z][a-z]+\s+[A-Z][a-z]+,\s+[A-Z]/);
  });
});
