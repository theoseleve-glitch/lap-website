// T215 — eight-tweet launch thread for the public-beta
// launch on 2026-07-23. Single-file artefact at
// docs/marketing/launch-twitter-thread.md mirroring
// T208 / T212 / T213 / T214 single-file launch-content
// shape: H1 + intro paragraph + 8 H2 sections, one per
// tweet. Voice founder-direct, not pitch language.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const FILE_PATH = join(
  process.cwd(),
  'docs',
  'marketing',
  'launch-twitter-thread.md',
);

const loadFile = (): string => readFileSync(FILE_PATH, 'utf8');

interface Tweet {
  readonly index: number;
  readonly body: string;
}

function extractTweets(md: string): ReadonlyArray<Tweet> {
  // Split the file at H2 boundaries. First section is
  // preamble (H1 + intro before any H2). Remaining
  // sections each start with the heading text content
  // (the `## ` marker is consumed by the split).
  const sections = md.split(/^##\s+/m);
  return sections.slice(1).map((s, i) => {
    // Strip the first line (heading remainder) to get
    // the tweet body.
    const body = s.replace(/^[^\n]*\n/, '').trim();
    return { index: i + 1, body };
  });
}

describe('T215: file artefact on disk', () => {
  test('docs/marketing/launch-twitter-thread.md exists', () => {
    expect(existsSync(FILE_PATH)).toBe(true);
  });

  test('file has a single H1 (overview)', () => {
    const md = loadFile();
    const h1Lines = md.match(/^#\s+/gm) ?? [];
    expect(h1Lines.length).toBe(1);
  });

  test('file has exactly 8 H2 sections (one per tweet)', () => {
    const md = loadFile();
    const h2Lines = md.match(/^##\s+/gm) ?? [];
    expect(h2Lines.length).toBe(8);
  });
});

describe('T215: per-tweet H2 heading presence (Tweet 1 through Tweet 8)', () => {
  test.each([1, 2, 3, 4, 5, 6, 7, 8])(
    'H2 heading "## Tweet %d ..." is present',
    (n) => {
      const md = loadFile();
      expect(
        md,
        `H2 heading for Tweet ${n} must exist`,
      ).toMatch(new RegExp(`^##\\s+Tweet\\s+${n}\\b`, 'm'));
    },
  );
});

describe('T215: per-tweet length cap (280 chars, Twitter per-tweet cap)', () => {
  test.each([1, 2, 3, 4, 5, 6, 7, 8])(
    'Tweet %d body is ≤280 chars',
    (n) => {
      const tweets = extractTweets(loadFile());
      const tweet = tweets[n - 1];
      // Strip markdown emphasis chars (*, _, `) — they're
      // formatting in the artefact, not part of the posted
      // text. URLs are NOT normalised here because t.co
      // shortening only HELPS (Twitter shortens to ~23
      // chars regardless of original length); a raw count
      // ≤280 is conservative-safe at posting time.
      const plain = tweet.body.replace(/[*_`]/g, '').trim();
      expect(
        plain.length,
        `Tweet ${n} must be ≤280 chars; got ${plain.length}\n---\n${tweet.body}\n---`,
      ).toBeLessThanOrEqual(280);
    },
  );
});

describe('T215: thread CTA + critical facts', () => {
  test('thread surfaces /waitlist link OR launch date', () => {
    const md = loadFile();
    const ctaPatterns = [
      /lap-coach\.racing\/waitlist/i,
      /\/waitlist\b/i,
      /2026-07-23/,
      /July 23,?\s*2026/i,
    ];
    expect(ctaPatterns.some((re) => re.test(md))).toBe(true);
  });

  test('thread mentions €19.90 consumer pricing', () => {
    expect(loadFile()).toMatch(/€19\.90/);
  });

  test('thread mentions €14.90 founding rate', () => {
    expect(loadFile()).toMatch(/€14\.90/);
  });

  test('thread mentions 30-day free trial', () => {
    expect(loadFile().toLowerCase()).toMatch(/30[- ]day/);
  });

  test('thread mentions launch date 2026-07-23', () => {
    expect(loadFile()).toMatch(/2026-07-23|July 23,?\s*2026|23 July 2026/);
  });
});

describe('T215: doctrine framing', () => {
  test('thread uses cross-platform framing', () => {
    expect(loadFile().toLowerCase()).toMatch(/cross[- ]platform/);
  });

  test('thread mentions both sim and real-world racing', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).toMatch(/\bsim\b|\bsimulator\b/);
    expect(lower).toMatch(
      /\breal[- ]world|real[- ]track|on[- ]track|track day\b/,
    );
  });

  test('thread names ≥2 sim platforms (concrete capture roster)', () => {
    const lower = loadFile().toLowerCase();
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

describe('T215: ADR-004 vocab discipline', () => {
  test('no bare "AI coach" / "LLM" / "generative" / "neural" / "realistic"', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });

  test('uses "hand-curated" or "written rule" framing (positive doctrine)', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).toMatch(
      /\bhand[- ]curated\b|\bwritten rule\b|\brule[- ]traceable\b/,
    );
  });
});

describe('T215: anti-pitch + anti-fabrication', () => {
  test('no pitch-language openers ("Check this out!", "Hey Twitter!", etc.)', () => {
    // Twitter audiences reject corporate-pitch openers.
    // Lock four specific phrases that consistently read as
    // marketing-spam rather than founder-voice.
    const lower = loadFile().toLowerCase();
    expect(lower).not.toMatch(/\bcheck this out\b/);
    expect(lower).not.toMatch(/\bhey twitter\b/);
    expect(lower).not.toMatch(/\bsuper excited\b/);
    expect(lower).not.toMatch(/\bstoked to announce\b/);
  });

  test('no fabricated user counts ("trusted by N", "join N drivers")', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).not.toMatch(/\btrusted by\s+\d+/);
    expect(lower).not.toMatch(/\bjoin\s+\d+\s+(drivers|racers|teams|users)/);
    expect(lower).not.toMatch(/\b\d{3,}\s+(?:drivers|racers|teams)\s+already\b/);
  });

  test('no fabricated person testimonials (— Firstname Lastname, Org)', () => {
    expect(loadFile()).not.toMatch(/[—–]\s+[A-Z][a-z]+\s+[A-Z][a-z]+,\s+[A-Z]/);
  });
});
