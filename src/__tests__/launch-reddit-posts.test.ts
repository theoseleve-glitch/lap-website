// T212 — five Reddit launch posts targeting r/iRacing,
// r/simracing, r/CarRacing, r/TrackRacing, r/karting.
//
// Each post is drafted in founder voice rather than
// marketing copy — Reddit communities reject pitch
// language. The drafts share the same posture (honest
// pre-launch state, doctrine-aligned vocab, /waitlist
// soft CTA) but differ in what they emphasise based on
// the audience the subreddit's name signals.
//
// Single-file artefact at docs/marketing/launch-reddit-posts.md
// with five H2 sections, one per subreddit. Mirrors the
// T208 press-release-template single-file shape.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const FILE_PATH = join(
  process.cwd(),
  'docs',
  'marketing',
  'launch-reddit-posts.md',
);

const loadFile = (): string => readFileSync(FILE_PATH, 'utf8');

interface Subreddit {
  readonly name: string;
  readonly heading: RegExp;
  readonly contextWords: ReadonlyArray<RegExp>;
}

const SUBREDDITS: ReadonlyArray<Subreddit> = [
  {
    name: 'r/iRacing',
    heading: /^##\s+r\/iRacing\b/m,
    contextWords: [/\biracing\b/i],
  },
  {
    name: 'r/simracing',
    heading: /^##\s+r\/simracing\b/m,
    contextWords: [/\bsim\b/i, /\bracing\b/i],
  },
  {
    name: 'r/CarRacing',
    heading: /^##\s+r\/CarRacing\b/m,
    contextWords: [/\breal[- ]world|real[- ]track|on[- ]track|track day/i],
  },
  {
    name: 'r/TrackRacing',
    heading: /^##\s+r\/TrackRacing\b/m,
    contextWords: [/\btrack day|gps capture|racebox/i],
  },
  {
    name: 'r/karting',
    heading: /^##\s+r\/karting\b/m,
    contextWords: [/\bkart(?:ing|s|er)?\b/i],
  },
];

function sectionBody(file: string, subName: string): string {
  // Split the file at H2 boundaries; find the section
  // whose heading matches the subreddit name.
  const sections = file.split(/^##\s+/m);
  const target = sections.find((s) => s.trimStart().startsWith(subName));
  return target ?? '';
}

describe('T212: file artefact on disk', () => {
  test('docs/marketing/launch-reddit-posts.md exists', () => {
    expect(existsSync(FILE_PATH)).toBe(true);
  });

  test('file has a single H1 (overview heading)', () => {
    const md = loadFile();
    const h1Lines = md.match(/^#\s+/gm) ?? [];
    expect(h1Lines.length).toBe(1);
  });

  test('file has exactly 5 H2 sections (one per subreddit)', () => {
    const md = loadFile();
    const h2Lines = md.match(/^##\s+/gm) ?? [];
    expect(h2Lines.length).toBe(5);
  });
});

describe('T212: per-subreddit section presence', () => {
  test.each(SUBREDDITS)(
    'section for $name is present',
    (sub) => {
      const md = loadFile();
      expect(md, `H2 heading "## ${sub.name}" must exist`).toMatch(sub.heading);
    },
  );
});

describe('T212: per-subreddit Title field', () => {
  test.each(SUBREDDITS)(
    'section for $name has a "Title:" field',
    (sub) => {
      const body = sectionBody(loadFile(), sub.name);
      expect(
        body,
        `section for ${sub.name} must include a "Title:" field`,
      ).toMatch(/(?:^|\n)\s*\*\*Title:\*\*|(?:^|\n)\s*Title:/);
    },
  );
});

describe('T212: per-subreddit context words (audience-fit)', () => {
  test.each(SUBREDDITS)(
    'section for $name names audience-relevant context',
    (sub) => {
      const body = sectionBody(loadFile(), sub.name);
      for (const re of sub.contextWords) {
        expect(
          body,
          `section for ${sub.name} must contain context word matching ${re}`,
        ).toMatch(re);
      }
    },
  );
});

describe('T212: per-subreddit body length', () => {
  test.each(SUBREDDITS)(
    'section for $name body is in the 100–500 word band',
    (sub) => {
      const body = sectionBody(loadFile(), sub.name);
      const stripped = body
        .replace(/^[^\n]*\n/, '') // strip section heading line
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/[*_`#>[\]()|—–-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const words = stripped.split(/\s+/).filter((w) => w.length > 0);
      expect(words.length).toBeGreaterThanOrEqual(100);
      expect(words.length).toBeLessThanOrEqual(500);
    },
  );
});

describe('T212: per-subreddit /waitlist or launch-date CTA', () => {
  test.each(SUBREDDITS)(
    'section for $name surfaces /waitlist link OR launch date',
    (sub) => {
      // Either form of CTA is acceptable: a literal link to
      // lap-coach.racing/waitlist OR a mention of the public-
      // beta launch date 2026-07-23 + bare URL. Reddit posts
      // routinely use bare URLs because md-style links can
      // look spammy.
      const body = sectionBody(loadFile(), sub.name);
      const ctaPatterns = [
        /lap-coach\.racing\/waitlist/i,
        /\/waitlist\b/i,
        /2026-07-23/,
        /July 23,?\s*2026/i,
      ];
      const matched = ctaPatterns.some((re) => re.test(body));
      expect(
        matched,
        `section for ${sub.name} must surface a /waitlist link or the 2026-07-23 launch date`,
      ).toBe(true);
    },
  );
});

describe('T212: ADR-004 vocab discipline (file-wide)', () => {
  test('no bare "AI coach" / "LLM" / "generative" / "neural" / "realistic"', () => {
    const md = loadFile();
    const lower = md.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });
});

describe('T212: anti-corporate-cringe + anti-fabrication', () => {
  test('no "Hey r/<sub>!" salutation in any section (founder voice, not marketing)', () => {
    // Reddit communities reject "Hey r/sub!" / "Hey r/whatever!"
    // openings — they read as out-of-the-box marketing. Lock
    // that the drafts open in founder voice, not corporate.
    const md = loadFile();
    expect(md.toLowerCase()).not.toMatch(/\bhey\s+r\//);
    expect(md.toLowerCase()).not.toMatch(/\bgreetings\s+r\//);
  });

  test('no fabricated user counts ("X drivers", "X teams trust us")', () => {
    // T184 baseline: no paying customers, no public beta yet.
    // Any "trusted by N drivers" claim would be untrue.
    const md = loadFile();
    const lower = md.toLowerCase();
    expect(lower).not.toMatch(/\btrusted by\s+\d+/);
    expect(lower).not.toMatch(/\bjoin\s+\d+\s+(drivers|racers|teams|users)/);
    expect(lower).not.toMatch(/\b\d{3,}\s+(?:drivers|racers|teams)\s+already\b/);
  });
});

describe('T212: doctrine framing (cross-platform + sim/real)', () => {
  test('file mentions cross-platform framing at least once', () => {
    const md = loadFile();
    expect(md.toLowerCase()).toMatch(/cross[- ]platform/);
  });

  test('file mentions both sim and real-world racing somewhere', () => {
    const md = loadFile();
    const lower = md.toLowerCase();
    expect(lower).toMatch(/\bsim\b|\bsimulator\b/);
    expect(lower).toMatch(
      /\breal[- ]world|real[- ]track|on[- ]track|track day\b/,
    );
  });
});
