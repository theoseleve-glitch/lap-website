// T216 — single LinkedIn launch post for the public-
// beta launch on 2026-07-23. Single-file artefact at
// docs/marketing/launch-linkedin-post.md mirroring
// T208 / T212 / T213 / T214 / T215 launch-content shape.
// Audience leans B2B-ish vs. Twitter/Reddit, so the
// post anchors the karting-academy / racing-programme
// multi-seat angle alongside the consumer waitlist CTA.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const FILE_PATH = join(
  process.cwd(),
  'docs',
  'marketing',
  'launch-linkedin-post.md',
);

const loadFile = (): string => readFileSync(FILE_PATH, 'utf8');

function postBody(md: string): string {
  // Split the file at H2 boundaries; first H2 section is
  // the post draft itself. The H1 + intro paragraphs sit
  // before the first H2 and are excluded from body length
  // / word-count checks.
  const sections = md.split(/^##\s+/m);
  if (sections.length < 2) return '';
  const firstSection = sections[1];
  // Strip the first line (heading remainder) to get body.
  return firstSection.replace(/^[^\n]*\n/, '').trim();
}

describe('T216: file artefact on disk', () => {
  test('docs/marketing/launch-linkedin-post.md exists', () => {
    expect(existsSync(FILE_PATH)).toBe(true);
  });

  test('file has a single H1 (overview heading)', () => {
    const md = loadFile();
    const h1Lines = md.match(/^#\s+/gm) ?? [];
    expect(h1Lines.length).toBe(1);
  });

  test('file has at least 1 H2 section (post body)', () => {
    const md = loadFile();
    const h2Lines = md.match(/^##\s+/gm) ?? [];
    expect(h2Lines.length).toBeGreaterThanOrEqual(1);
  });
});

describe('T216: post body length (LinkedIn cutoff)', () => {
  test('post body is in 800-3000 char band', () => {
    // LinkedIn truncates at ~3000 chars with a "see more"
    // link; engagement drops past the cut. Floor at 800
    // chars to lock that the post has substantive content
    // (not a one-liner that under-uses the format).
    const body = postBody(loadFile());
    const plain = body.replace(/[*_`]/g, '').trim();
    expect(
      plain.length,
      `LinkedIn body must be ≤3000 chars; got ${plain.length}`,
    ).toBeLessThanOrEqual(3000);
    expect(
      plain.length,
      `LinkedIn body must be ≥800 chars; got ${plain.length}`,
    ).toBeGreaterThanOrEqual(800);
  });

  test('post body word count is in 150-500 band', () => {
    const body = postBody(loadFile());
    const stripped = body
      .replace(/[*_`#>[\]()|—–-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = stripped.split(/\s+/).filter((w) => w.length > 0);
    expect(words.length).toBeGreaterThanOrEqual(150);
    expect(words.length).toBeLessThanOrEqual(500);
  });
});

describe('T216: critical facts (locked from doctrine)', () => {
  test('mentions public-beta date 2026-07-23', () => {
    expect(loadFile()).toMatch(/2026-07-23|July 23,?\s*2026|23 July 2026/);
  });

  test('mentions €19.90 consumer pricing', () => {
    expect(loadFile()).toMatch(/€19\.90/);
  });

  test('mentions €14.90 founding rate', () => {
    expect(loadFile()).toMatch(/€14\.90/);
  });

  test('mentions 30-day free trial', () => {
    expect(loadFile().toLowerCase()).toMatch(/30[- ]day/);
  });

  test('mentions €10/seat B2B pricing (academy/programme angle)', () => {
    // LinkedIn's audience leans toward decision-makers at
    // academies, programmes, and racing teams — the multi-
    // seat tier is the natural fit and must be named here.
    expect(loadFile()).toMatch(/€10/);
  });
});

describe('T216: B2B cross-link (academy / programme angle)', () => {
  test('post links to /for-schools', () => {
    expect(loadFile()).toMatch(
      /lap-coach\.racing\/for-schools|\/for-schools\b/i,
    );
  });

  test('post mentions academy / programme / multi-seat / roster', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).toMatch(
      /\bacadem(?:y|ies)|\bprogramme|\bmulti[- ]seat|\broster\b/,
    );
  });
});

describe('T216: doctrine framing', () => {
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

describe('T216: CTA (waitlist link)', () => {
  test('post surfaces /waitlist link', () => {
    expect(loadFile()).toMatch(/lap-coach\.racing\/waitlist|\/waitlist\b/i);
  });
});

describe('T216: ADR-004 vocab discipline', () => {
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

describe('T216: anti-LinkedIn-cringe + anti-fabrication', () => {
  test('no LinkedIn-cringe openers', () => {
    // LinkedIn audiences see countless "I'm thrilled to
    // announce" / "Excited to share" / "Big news!" posts.
    // Block the most egregious openers; founder voice
    // should read as substantive, not corporate.
    const lower = loadFile().toLowerCase();
    expect(lower).not.toMatch(/\bthrilled to announce\b/);
    expect(lower).not.toMatch(/\bexcited to (?:share|announce)\b/);
    expect(lower).not.toMatch(/\bbig news\b/);
    expect(lower).not.toMatch(/\bhot take\b/);
    expect(lower).not.toMatch(/\bsuper excited\b/);
    expect(lower).not.toMatch(/\bstoked to (?:announce|share)\b/);
  });

  test('no fabricated user counts ("trusted by N", "join N drivers")', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).not.toMatch(/\btrusted by\s+\d+/);
    expect(lower).not.toMatch(/\bjoin\s+\d+\s+(drivers|racers|teams|users)/);
    expect(lower).not.toMatch(/\b\d{3,}\s+(?:drivers|racers|teams)\s+already\b/);
  });

  test('no fabricated person testimonials', () => {
    expect(loadFile()).not.toMatch(/[—–]\s+[A-Z][a-z]+\s+[A-Z][a-z]+,\s+[A-Z]/);
  });
});
