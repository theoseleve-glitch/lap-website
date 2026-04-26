// T217 — Product Hunt launch artefact for the public-
// beta launch on 2026-07-23. Single-file artefact at
// docs/marketing/launch-product-hunt.md structured as
// the discrete fields a founder copies into the PH
// submission form on launch day: Tagline, Description,
// Topics, Gallery captions, First maker comment. Mirrors
// the founder-direct posture of the T212 / T214 / T215
// / T216 launch artefacts.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const FILE_PATH = join(
  process.cwd(),
  'docs',
  'marketing',
  'launch-product-hunt.md',
);

const loadFile = (): string => readFileSync(FILE_PATH, 'utf8');

interface RequiredSection {
  readonly name: string;
  readonly heading: RegExp;
}

const REQUIRED_SECTIONS: ReadonlyArray<RequiredSection> = [
  { name: 'Tagline', heading: /^##\s+Tagline\b/im },
  { name: 'Description', heading: /^##\s+Description\b/im },
  { name: 'Topics', heading: /^##\s+Topics\b/im },
  { name: 'Gallery captions', heading: /^##\s+Gallery captions?\b/im },
  { name: 'First maker comment', heading: /^##\s+First maker comment\b/im },
];

function sectionBody(md: string, headingPattern: RegExp): string {
  const headingMatch = md.match(headingPattern);
  if (!headingMatch || headingMatch.index === undefined) return '';
  const start = headingMatch.index;
  const after = md.slice(start);
  const nextH2 = after.search(/\n##\s+/);
  const sectionWithHeading = nextH2 === -1 ? after : after.slice(0, nextH2);
  return sectionWithHeading.replace(/^##\s+[^\n]*\n/, '').trim();
}

describe('T217: file artefact on disk', () => {
  test('docs/marketing/launch-product-hunt.md exists', () => {
    expect(existsSync(FILE_PATH)).toBe(true);
  });

  test('file has a single H1 (overview)', () => {
    const md = loadFile();
    const h1Lines = md.match(/^#\s+/gm) ?? [];
    expect(h1Lines.length).toBe(1);
  });

  test('file has at least 5 H2 sections', () => {
    const md = loadFile();
    const h2Lines = md.match(/^##\s+/gm) ?? [];
    expect(h2Lines.length).toBeGreaterThanOrEqual(5);
  });
});

describe('T217: required PH submission-form sections present', () => {
  test.each(REQUIRED_SECTIONS)(
    'section "$name" is present',
    (s) => {
      const md = loadFile();
      expect(
        md,
        `H2 heading "## ${s.name}" must exist`,
      ).toMatch(s.heading);
    },
  );
});

describe('T217: tagline (PH 60-char field cap)', () => {
  test('tagline is non-empty and ≤60 chars', () => {
    // PH's tagline field caps at ~60 chars. Founder copies
    // the first line of the Tagline section as the literal
    // tagline; lock it stays within the cap.
    const body = sectionBody(loadFile(), /^##\s+Tagline\b/im);
    const firstLine = body.split('\n').find((l) => l.trim().length > 0) ?? '';
    const plain = firstLine.replace(/[*_`]/g, '').trim();
    expect(plain.length).toBeGreaterThan(0);
    expect(
      plain.length,
      `Tagline must be ≤60 chars (PH cap); got ${plain.length}: "${plain}"`,
    ).toBeLessThanOrEqual(60);
  });
});

describe('T217: description (PH 260-char field cap)', () => {
  test('description body is in 80-260 char band', () => {
    // PH description field caps at ~260 chars. Floor at 80
    // chars so the description has substantive content
    // (not a one-liner that under-uses the field).
    const body = sectionBody(loadFile(), /^##\s+Description\b/im);
    const plain = body.replace(/[*_`]/g, '').trim();
    expect(plain.length).toBeGreaterThanOrEqual(80);
    expect(
      plain.length,
      `Description must be ≤260 chars (PH cap); got ${plain.length}`,
    ).toBeLessThanOrEqual(260);
  });
});

describe('T217: topics (PH topic taxonomy, ≥3 entries)', () => {
  test('topics section names ≥3 topics', () => {
    // PH allows up to ~3 topics on submission. Lock that
    // the founder has at least 3 topic candidates to pick
    // from. Topics may be listed as bullets OR comma-
    // separated; count the larger of the two.
    const body = sectionBody(loadFile(), /^##\s+Topics\b/im);
    const bulletItems = body.match(/^\s*[-*]\s+\S+/gm) ?? [];
    const commaItems = body
      .split(/[,\n]/)
      .map((s) => s.replace(/^[\s\-*]+/, '').trim())
      .filter((s) => s.length > 0);
    const count = Math.max(bulletItems.length, commaItems.length);
    expect(
      count,
      `topics section needs ≥3 entries; got ${count}`,
    ).toBeGreaterThanOrEqual(3);
  });
});

describe('T217: gallery captions (≥3 entries)', () => {
  test('gallery section has ≥3 caption entries', () => {
    const body = sectionBody(loadFile(), /^##\s+Gallery captions?\b/im);
    const items = body.match(/^\s*[-*0-9.]+\s+\S+/gm) ?? [];
    expect(
      items.length,
      `gallery section needs ≥3 captions; got ${items.length}`,
    ).toBeGreaterThanOrEqual(3);
  });
});

describe('T217: first maker comment (long-form founder voice)', () => {
  test('first maker comment body is in 300-2000 char band', () => {
    // PH convention: maker drops a long-form first comment
    // when launching. Range 300-2000 keeps it substantive
    // without being a wall of text PH readers skip.
    const body = sectionBody(loadFile(), /^##\s+First maker comment\b/im);
    const plain = body.replace(/[*_`]/g, '').trim();
    expect(plain.length).toBeGreaterThanOrEqual(300);
    expect(plain.length).toBeLessThanOrEqual(2000);
  });
});

describe('T217: critical facts (locked from doctrine)', () => {
  test('mentions public-beta date 2026-07-23', () => {
    expect(loadFile()).toMatch(/2026-07-23|July 23,?\s*2026|23 July 2026/);
  });

  test('mentions €15 consumer pricing', () => {
    expect(loadFile()).toMatch(/€15/);
  });

  test('mentions €12 grandfathered founder rate', () => {
    expect(loadFile()).toMatch(/€12/);
  });

  test('mentions 14-day free trial', () => {
    expect(loadFile().toLowerCase()).toMatch(/14[- ]day/);
  });
});

describe('T217: doctrine framing', () => {
  test('uses cross-platform framing', () => {
    expect(loadFile().toLowerCase()).toMatch(/cross[- ]platform/);
  });

  test('mentions both sim and real-world racing', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).toMatch(/\bsim\b|\bsimulator\b/);
    expect(lower).toMatch(
      /\breal[- ]world|real[- ]track|on[- ]track|track day\b/,
    );
  });

  test('names ≥2 sim platforms (concrete capture roster)', () => {
    const lower = loadFile().toLowerCase();
    const platforms = [
      /\biracing\b/,
      /\bams\s*2\b|\bautomobilista\b/,
      /\bacc\b|\bassetto corsa competizione/,
      /\brfactor/,
      /\blmu\b|\ble mans ultimate/,
    ];
    expect(platforms.filter((re) => re.test(lower)).length).toBeGreaterThanOrEqual(2);
  });
});

describe('T217: CTA (waitlist link)', () => {
  test('surfaces /waitlist link', () => {
    expect(loadFile()).toMatch(/lap-coach\.racing\/waitlist|\/waitlist\b/i);
  });
});

describe('T217: ADR-004 vocab discipline', () => {
  test('no bare "AI coach" / "LLM" / "generative" / "neural" / "realistic"', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });

  test('uses "hand-curated" or "written rule" framing', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).toMatch(
      /\bhand[- ]curated\b|\bwritten rule\b|\brule[- ]traceable\b/,
    );
  });
});

describe('T217: anti-PH-cringe + anti-upvote-begging', () => {
  test('no upvote begging (PH community norm + guideline)', () => {
    // PH explicitly discourages upvote-begging; community
    // downvotes posts that ask for it. Block the most
    // common begging patterns.
    const lower = loadFile().toLowerCase();
    expect(lower).not.toMatch(/\b(?:please\s+)?upvote\s+(?:please|us|me|if)/);
    expect(lower).not.toMatch(/\bup ?vote\s+(?:please|us|me)\b/);
    expect(lower).not.toMatch(/\bgive us a vote\b/);
    expect(lower).not.toMatch(/\bsupport us\s+(?:by|with)\b/);
    expect(lower).not.toMatch(/\bvote for us\b/);
  });

  test('no PH-cringe openers', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).not.toMatch(/\bhi product hunt\b/);
    expect(lower).not.toMatch(/\bhello product hunt\b/);
    expect(lower).not.toMatch(/\bhunters?,?\s+welcome\b/);
    expect(lower).not.toMatch(/\bsuper excited\b/);
    expect(lower).not.toMatch(/\bthrilled to announce\b/);
    expect(lower).not.toMatch(/\bstoked to (?:announce|share)\b/);
  });

  test('no fabricated user counts', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).not.toMatch(/\btrusted by\s+\d+/);
    expect(lower).not.toMatch(/\bjoin\s+\d+\s+(drivers|racers|teams|users)/);
    expect(lower).not.toMatch(/\b\d{3,}\s+(?:drivers|racers|teams)\s+already\b/);
  });

  test('no fabricated person testimonials', () => {
    expect(loadFile()).not.toMatch(/[—–]\s+[A-Z][a-z]+\s+[A-Z][a-z]+,\s+[A-Z]/);
  });
});
