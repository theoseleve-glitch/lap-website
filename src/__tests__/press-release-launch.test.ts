// T208 — contract tests for the launch press release
// template. The artefact is markdown at
// docs/marketing/press-release-launch.md, drafted now for
// the public-beta launch on 2026-07-23. The template stays
// internal (not rendered as a public page); it is the
// asset a journalist receives by email at launch time.
//
// Tests lock the structural skeleton + critical facts +
// doctrine vocab so the template cannot drift away from
// 01-STRATEGIC-DOCTRINE.md between now and launch:
//   * Standard PR sections present (headline, sub-headline,
//     dateline, body, boilerplate, contact)
//   * Word count in the 400–700 band — concise PR length,
//     editor-friendly
//   * Critical facts: 2026-07-23 public beta, €15 consumer
//     anchor, €10/seat B2B anchor, V1 date 2026-09-23
//   * Cross-platform mission framing carried verbatim
//   * ADR-004 asymmetric vocab discipline — "language
//     model" permitted in negation context (the PR argues
//     against LLM coaching), bare "AI coach" / "LLM" /
//     "generative" / "neural" / "realistic" still banned
//   * Press contact route (sales@lap-coach.racing with
//     press subject)
//   * Sim platforms named (Doctrine §5 capture roster)
//   * No fabricated quotes attributed to real people

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const TEMPLATE_PATH = join(
  process.cwd(),
  'docs',
  'marketing',
  'press-release-launch.md',
);

const loadTemplate = (): string => readFileSync(TEMPLATE_PATH, 'utf8');

describe('T208: press release template exists on disk', () => {
  test('docs/marketing/press-release-launch.md exists', () => {
    expect(
      existsSync(TEMPLATE_PATH),
      `${TEMPLATE_PATH} must exist`,
    ).toBe(true);
  });
});

describe('T208: standard press-release structural sections', () => {
  test('has a single H1 (the headline)', () => {
    const md = loadTemplate();
    const h1Lines = md.match(/^#\s+/gm) ?? [];
    expect(
      h1Lines.length,
      `expected exactly 1 H1 (the press-release headline); got ${h1Lines.length}`,
    ).toBe(1);
  });

  test('has a sub-headline section (H2 or italicised lead-in)', () => {
    // Press release sub-heads are conventionally italics or
    // an H2 that summarises the headline in one sentence.
    const md = loadTemplate();
    const hasH2 = /^##\s+/m.test(md);
    const hasItalicSubhead = /^_[^_]+_$/m.test(md);
    expect(
      hasH2 || hasItalicSubhead,
      'sub-headline must be an H2 or italic standalone line',
    ).toBe(true);
  });

  test('has dateline with [CITY] placeholder + 2026-07-23 date', () => {
    // Dateline pattern: [CITY] — DATE — opening sentence.
    // [CITY] stays a template placeholder so the founder can
    // fill it in at send time.
    const md = loadTemplate();
    expect(md).toMatch(/\[CITY\]/);
    expect(md).toMatch(/2026-07-23|July 23,?\s*2026|23 July 2026/);
  });

  test('has an "About LAP" boilerplate section', () => {
    const md = loadTemplate();
    expect(md).toMatch(/##\s+About LAP|^About LAP$/im);
  });

  test('has a press contact section', () => {
    const md = loadTemplate();
    expect(md.toLowerCase()).toMatch(/press contact|media contact/);
  });

  test('press contact references sales@lap-coach.racing', () => {
    const md = loadTemplate();
    expect(md).toMatch(/sales@lap-coach\.racing/);
  });
});

describe('T208: word count band (concise PR)', () => {
  test('total word count is in the 400–700 band', () => {
    const md = loadTemplate();
    // Strip markdown decoration before counting; punctuation
    // tokens shouldn't inflate.
    const stripped = md
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^#+\s+/gm, '')
      .replace(/[*_`#>[\]()|—–-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = stripped.split(/\s+/).filter((w) => w.length > 0);
    expect(
      words.length,
      `press release must be 400–700 words; got ${words.length}`,
    ).toBeGreaterThanOrEqual(400);
    expect(words.length).toBeLessThanOrEqual(700);
  });
});

describe('T208: critical facts (locked from doctrine + T207 facts)', () => {
  test('mentions €15 consumer tier (doctrine §8)', () => {
    const md = loadTemplate();
    expect(md).toMatch(/€15/);
  });

  test('mentions €10 per seat B2B anchor (T205)', () => {
    const md = loadTemplate();
    expect(md.toLowerCase()).toMatch(/€10\s+per\s+seat|€10\s*\/\s*seat/);
  });

  test('mentions V1 release date 2026-09-23 (doctrine §9)', () => {
    const md = loadTemplate();
    expect(md).toMatch(
      /2026-09-23|September 23,?\s*2026|23 September 2026/,
    );
  });

  test('mentions 14-day free trial (doctrine §8)', () => {
    const md = loadTemplate();
    expect(md.toLowerCase()).toMatch(/14[- ]day/);
  });

  test('mentions €12 grandfathered founder rate (doctrine §8)', () => {
    const md = loadTemplate();
    expect(md).toMatch(/€12/);
  });
});

describe('T208: doctrine framing (cross-platform + sim/real)', () => {
  test('uses the "cross-platform" mission framing', () => {
    const md = loadTemplate();
    expect(md.toLowerCase()).toMatch(/cross[- ]platform/);
  });

  test('mentions both sim and real-world racing', () => {
    const md = loadTemplate();
    const lower = md.toLowerCase();
    expect(lower).toMatch(/\bsim\b|\bsimulator\b|\bsimulation\b/);
    expect(lower).toMatch(
      /\breal[- ]world|real[- ]track|on[- ]track|on track\b/,
    );
  });

  test('names ≥2 sim platforms (doctrine §5 capture roster)', () => {
    // Doctrine §5: iRacing, AMS2, ACC, rFactor 2, LMU,
    // Rennsport, F1 24. Press release positions LAP as
    // cross-platform; lock that the platform names appear
    // so the claim is concrete, not generic.
    const md = loadTemplate();
    const lower = md.toLowerCase();
    const platforms = [
      /\biracing\b/,
      /\bams\s*2\b|\bautomobilista\b/,
      /\bacc\b|\bassetto corsa competizione/,
      /\brfactor/,
      /\blmu\b|\ble mans ultimate/,
    ];
    const matched = platforms.filter((re) => re.test(lower));
    expect(
      matched.length,
      `must name ≥2 sim platforms; got ${matched.length}`,
    ).toBeGreaterThanOrEqual(2);
  });
});

describe('T208: ADR-004 vocab discipline (asymmetric)', () => {
  test('explicitly negates LLM coaching (spelled-out "language model" required)', () => {
    // Asymmetric vocab rule: this PR argues the no-LLM
    // commitment as a differentiator, so it must spell
    // "language model" out somewhere in negation context.
    // Same pattern T144 / T181 / T185 use.
    const md = loadTemplate();
    expect(md.toLowerCase()).toMatch(
      /\bnot\b[\s\S]{0,40}\blanguage[- ]model|\blanguage[- ]model[\s\S]{0,40}\bnot\b|\bno\b[\s\S]{0,40}\blanguage[- ]model|without[\s\S]{0,30}\blanguage[- ]model/,
    );
  });

  test('does not use bare "AI coach" / "LLM" / "generative" / "neural" / "realistic"', () => {
    const md = loadTemplate();
    const lower = md.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });

  test('uses "hand-curated" or "written rule" framing (positive doctrine)', () => {
    const md = loadTemplate();
    const lower = md.toLowerCase();
    expect(lower).toMatch(/\bhand[- ]curated\b|\bwritten rule\b|\brule[- ]traceable\b/);
  });
});

describe('T208: anti-fabrication discipline', () => {
  test('any quote attribution is to a generic role, not a fabricated name', () => {
    // Quotes in press releases conventionally have
    // "— Name, Title" attribution. T184 baseline: no
    // public-named founder yet. So the template either
    // (a) has no blockquote-with-named-attribution, OR
    // (b) uses generic role attribution like "— LAP
    // founding team" / "— [Founder name]" placeholder.
    // Lock that no specific Personal Name appears in dash
    // attribution.
    const md = loadTemplate();
    // Find dash-attribution patterns: "— Capitalised Name"
    // at the start of a line (conventional PR attribution
    // shape, e.g. "> — Person, Title"). Mid-line em-dashes
    // are dateline separators, not quote attributions —
    // those are excluded by the start-of-line anchor.
    const attributions = [
      ...md.matchAll(/^>?\s*[—–]\s+([A-Z][^\n,]+?)(?:,|$)/gm),
    ];
    for (const m of attributions) {
      const attr = m[1].trim();
      const isPlaceholder =
        attr.includes('[') ||
        /^LAP\b/.test(attr) ||
        /\bteam$/i.test(attr) ||
        /\bfounder$/i.test(attr) ||
        /\bfounding team$/i.test(attr);
      expect(
        isPlaceholder,
        `dash-attribution "${attr}" looks like a fabricated quote source — use a placeholder or generic role`,
      ).toBe(true);
    }
  });
});
