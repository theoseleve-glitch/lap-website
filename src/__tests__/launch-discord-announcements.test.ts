// T213 — three Discord announcement drafts for the
// public-beta launch on 2026-07-23. Different audiences,
// shared posture (founder voice, honest pre-launch state,
// /waitlist soft CTA, ADR-004 vocab discipline).
//
// Single-file artefact at docs/marketing/launch-discord-
// announcements.md with three H2 sections, mirroring the
// T208 press release + T212 reddit posts shape. Discord
// messages cap at 2000 chars per send; tests lock that.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const FILE_PATH = join(
  process.cwd(),
  'docs',
  'marketing',
  'launch-discord-announcements.md',
);

const loadFile = (): string => readFileSync(FILE_PATH, 'utf8');

interface DiscordAudience {
  readonly name: string;
  readonly headingPattern: RegExp;
  readonly contextWords: ReadonlyArray<RegExp>;
}

const AUDIENCES: ReadonlyArray<DiscordAudience> = [
  {
    name: 'General sim-racing community',
    headingPattern: /^##\s+General sim[- ]racing community\b/im,
    contextWords: [
      /\bsim[- ]racing|simracing\b/i,
      /\bcross[- ]platform/i,
    ],
  },
  {
    name: 'iRacing-focused server',
    headingPattern: /^##\s+iRacing[- ]focused server\b/im,
    contextWords: [/\biracing\b/i],
  },
  {
    name: 'Karting / track-day community',
    headingPattern: /^##\s+Karting\s*\/\s*track[- ]day community\b/im,
    contextWords: [/\bkart(?:ing|s|er)?\b/i, /\btrack day|on[- ]track|real[- ]track\b/i],
  },
];

function sectionBody(file: string, headingPattern: RegExp): string {
  const headingMatch = file.match(headingPattern);
  if (!headingMatch || headingMatch.index === undefined) return '';
  const start = headingMatch.index;
  const after = file.slice(start);
  // Find the next H2 boundary or end of file.
  const nextH2 = after.search(/\n##\s+/);
  return nextH2 === -1 ? after : after.slice(0, nextH2);
}

describe('T213: file artefact on disk', () => {
  test('docs/marketing/launch-discord-announcements.md exists', () => {
    expect(existsSync(FILE_PATH)).toBe(true);
  });

  test('file has a single H1 (overview heading)', () => {
    const md = loadFile();
    const h1Lines = md.match(/^#\s+/gm) ?? [];
    expect(h1Lines.length).toBe(1);
  });

  test('file has exactly 3 H2 sections (one per audience)', () => {
    const md = loadFile();
    const h2Lines = md.match(/^##\s+/gm) ?? [];
    expect(h2Lines.length).toBe(3);
  });
});

describe('T213: per-audience section presence', () => {
  test.each(AUDIENCES)(
    'section for $name is present',
    (audience) => {
      const md = loadFile();
      expect(
        md,
        `H2 heading for "${audience.name}" must exist`,
      ).toMatch(audience.headingPattern);
    },
  );
});

describe('T213: per-audience message-body field', () => {
  test.each(AUDIENCES)(
    'section for $name has a "Channel:" or "Post in:" hint',
    (audience) => {
      // Each draft tells the founder where to post (e.g.,
      // "Channel: #announcements" / "Post in: #general").
      // The hint sits inside the section body.
      const body = sectionBody(loadFile(), audience.headingPattern);
      expect(
        body,
        `section for ${audience.name} must include "Channel:" or "Post in:" hint`,
      ).toMatch(/(?:^|\n)\s*(?:\*\*)?(?:Channel|Post in|Suggested channel):/im);
    },
  );
});

describe('T213: per-audience context words (audience-fit)', () => {
  test.each(AUDIENCES)(
    'section for $name names audience-relevant context',
    (audience) => {
      const body = sectionBody(loadFile(), audience.headingPattern);
      for (const re of audience.contextWords) {
        expect(
          body,
          `section for ${audience.name} must contain context matching ${re}`,
        ).toMatch(re);
      }
    },
  );
});

describe('T213: per-audience Discord message-body length', () => {
  test.each(AUDIENCES)(
    'section for $name has a message body ≤2000 chars (Discord per-message cap)',
    (audience) => {
      // Discord caps a single send at 2000 chars. The drafts
      // are intended as ONE-MESSAGE posts (not multi-message
      // threads); lock that the message body fits.
      // Section body includes the heading line + Channel hint
      // line; the message-text proper is what follows the
      // hint. Approximate by counting non-heading/non-frontmatter
      // characters in the section.
      const body = sectionBody(loadFile(), audience.headingPattern);
      // Strip the heading and any "Channel:" / "Post in:" /
      // "Suggested channel:" lines to get the actual message
      // a founder pastes. Approximate by stripping the first
      // 1-2 metadata lines.
      const stripped = body
        .replace(/^##\s+[^\n]*\n/m, '')
        .replace(/^\s*(?:\*\*)?(?:Channel|Post in|Suggested channel):[^\n]*\n/im, '')
        .trim();
      expect(
        stripped.length,
        `Discord message for ${audience.name} must fit in ≤2000 chars; got ${stripped.length}`,
      ).toBeLessThanOrEqual(2000);
    },
  );

  test.each(AUDIENCES)(
    'section for $name has body in 60–400 word band',
    (audience) => {
      const body = sectionBody(loadFile(), audience.headingPattern);
      const stripped = body
        .replace(/^##\s+[^\n]*\n/m, '')
        .replace(/^\s*(?:\*\*)?(?:Channel|Post in|Suggested channel):[^\n]*\n/im, '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/[*_`#>[\]()|—–-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const words = stripped.split(/\s+/).filter((w) => w.length > 0);
      expect(words.length).toBeGreaterThanOrEqual(60);
      expect(words.length).toBeLessThanOrEqual(400);
    },
  );
});

describe('T213: per-audience CTA — /waitlist or launch date', () => {
  test.each(AUDIENCES)(
    'section for $name surfaces /waitlist link OR launch date',
    (audience) => {
      const body = sectionBody(loadFile(), audience.headingPattern);
      const ctaPatterns = [
        /lap-coach\.racing\/waitlist/i,
        /\/waitlist\b/i,
        /2026-07-23/,
        /July 23,?\s*2026/i,
      ];
      const matched = ctaPatterns.some((re) => re.test(body));
      expect(
        matched,
        `section for ${audience.name} must surface /waitlist or launch date`,
      ).toBe(true);
    },
  );
});

describe('T213: ADR-004 vocab discipline (file-wide)', () => {
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

describe('T213: anti-mass-mention + anti-fabrication', () => {
  test('no @everyone / @here / @channel mass-pings in any section', () => {
    // Discord etiquette: mass-pings are reserved for true
    // emergencies / server-owner-only events. A launch
    // announcement should NOT request a mass-ping; the
    // server owner can choose to ping if they want, but the
    // draft cannot pre-format that request.
    const md = loadFile();
    expect(md).not.toMatch(/@everyone\b/i);
    expect(md).not.toMatch(/@here\b/i);
    expect(md).not.toMatch(/@channel\b/i);
  });

  test('no fabricated user counts ("X drivers / X users / X teams already")', () => {
    const md = loadFile();
    const lower = md.toLowerCase();
    expect(lower).not.toMatch(/\btrusted by\s+\d+/);
    expect(lower).not.toMatch(/\bjoin\s+\d+\s+(drivers|racers|teams|users)/);
    expect(lower).not.toMatch(/\b\d{3,}\s+(?:drivers|racers|teams)\s+already\b/);
  });
});

describe('T213: doctrine framing (file-wide)', () => {
  test('mentions cross-platform framing somewhere', () => {
    const md = loadFile();
    expect(md.toLowerCase()).toMatch(/cross[- ]platform/);
  });

  test('mentions both sim and real-world racing somewhere', () => {
    const md = loadFile();
    const lower = md.toLowerCase();
    expect(lower).toMatch(/\bsim\b|\bsimulator\b/);
    expect(lower).toMatch(
      /\breal[- ]world|real[- ]track|on[- ]track|track day\b/,
    );
  });
});
