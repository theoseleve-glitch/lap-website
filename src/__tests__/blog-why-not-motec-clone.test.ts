// T181 — contract test for the "Why I'm Building LAP (and Not
// Another MoTeC Clone)" blog post draft. First post in Block I
// Batch 2 (T181-T190, founder/product stories). Establishes
// the Batch 2 editorial pattern that T182-T185 will reuse.
//
// Batch 2 diverges from Batch 1's coaching-rule template:
//   * Founder voice (first person — "I" for the founder, "we"
//     for the company)
//   * Positioning anchored on Doctrine §3 (personas) + §5
//     (DOES capture roster) + §10 (commitments) + ADR-004
//     (no LLM coaching framing)
//   * The post argues a positioning claim — "LAP is not a
//     MoTeC clone" — by naming what each product is FOR
//     rather than what either is BAD AT
//   * ADR-004 forbidden vocab is asymmetric here: bare "llm"
//     stays banned, but "language model" / "language-model"
//     in negation context is REQUIRED for the post to make
//     its positioning argument honestly. Same asymmetry as
//     Pillar 4 §5 (LAP-automation section).
//
// What this test locks:
//   * File at docs/blog-posts/why-im-building-lap-not-motec-clone.md
//   * Word count 1200-1900 band
//   * Structural discipline (H1 + ≥3 H2)
//   * Head terms: "MoTeC" ≥3, "LAP" ≥4 (the positioning pair)
//   * Doctrine anchors: ≥2 of {persona, rule library, hand-
//     curated, cross-platform, loop closes}
//   * ADR-004 negation in spelled-out form (the post must
//     say "language model" or "language-model" in negation —
//     it's the post's distinguishing claim)
//   * Cross-pillar reach: /blog/best-sim-racing-telemetry-app
//     mandatory (since the post argues the LAP/MoTeC
//     positioning, the comparison article is the natural
//     reference); plus ≥1 other sibling pillar
//   * Cross-platform discipline (sim AND real)
//   * Asymmetric forbidden vocab (bare "llm" / "ai coach" /
//     "generative" / "neural" still banned; "language-model"
//     in negation permitted)
//   * No anti-MoTeC disparagement (no "MoTeC is bad" /
//     "outdated" / "bloated" — same Pillar 3 carry-over)
//   * Blog-post-layer overclaim guardrail
//   * Filler-word ≤3

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POST_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'why-im-building-lap-not-motec-clone.md',
);

const loadPost = (): string => readFileSync(POST_PATH, 'utf8');

const wordCount = (text: string): number =>
  text
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;

describe('T181: Why I am Building LAP (Not Another MoTeC Clone) — blog post draft', () => {
  test('post file exists at docs/blog-posts/why-im-building-lap-not-motec-clone.md', () => {
    expect(() => loadPost()).not.toThrow();
  });

  test('post word count is in the 1200-1900 band', () => {
    const post = loadPost();
    const wc = wordCount(post);
    expect(wc).toBeGreaterThanOrEqual(1200);
    expect(wc).toBeLessThanOrEqual(1900);
  });

  test('post has an H1 title and ≥3 H2 sub-sections', () => {
    const post = loadPost();
    const h1Matches = post.match(/^#\s+/gm) ?? [];
    expect(h1Matches.length).toBeGreaterThanOrEqual(1);
    const h2Matches = post.match(/^##\s+/gm) ?? [];
    expect(
      h2Matches.length,
      `post must have ≥3 H2 sub-sections; found ${h2Matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post names "MoTeC" cumulatively (≥3 occurrences)', () => {
    // The post's positioning argument turns on a respectful
    // contrast with MoTeC. A draft that mentions MoTeC only
    // in the title and never in body has not earned the
    // contrast.
    const post = loadPost();
    const matches = post.match(/MoTeC/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "MoTeC" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post names "LAP" cumulatively (≥4 occurrences)', () => {
    // The post's other positioning anchor. Lock ≥4 (one more
    // than MoTeC) because this is fundamentally a LAP-side
    // positioning post, not a MoTeC review.
    const post = loadPost();
    const matches = post.match(/\bLAP\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥4 "LAP" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(4);
  });

  test('post anchors on doctrine vocabulary (≥2 of: persona, rule library, hand-curated, cross-platform, loop closes)', () => {
    // The post has to make its positioning claim through
    // doctrine vocabulary, not through opinion-bait. Lock at
    // least 2 of the doctrine anchor phrases — without them
    // the post drifts to "we're better than MoTeC" framing
    // which is exactly what the persona-mismatch argument
    // rejects.
    const post = loadPost().toLowerCase();
    const anchors = [
      /\bpersona/,
      /\brule\s+library/,
      /\bhand[-\s]curated/,
      /\bcross[-\s]platform/,
      /\bloop\s+closes\b|\bcloses?\s+the\s+loop/,
    ];
    const labels = ['persona', 'rule library', 'hand-curated', 'cross-platform', 'loop closes'];
    const matched = anchors
      .map((re, i) => (re.test(post) ? labels[i] : null))
      .filter((x): x is string => x !== null);
    expect(
      matched.length,
      `Expected ≥2 doctrine anchors; matched ${matched.length} (${matched.join(', ')})`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post makes ADR-004 negation explicit ("language model" / "language-model" in spelled-out form)', () => {
    // The post's distinguishing claim REQUIRES naming what
    // LAP is NOT. Bare "llm" remains banned (per the strict
    // ADR-004 lock below); the spelled-out "language model"
    // is the editorial form that lets the post make the
    // negation argument while staying clean of the bare-LLM
    // overclaim. Same asymmetry as Pillar 4 §5 (LAP-automation
    // section).
    const post = loadPost().toLowerCase();
    expect(
      post,
      'post must spell out the language-model negation explicitly',
    ).toMatch(/\blanguage[-\s]model/);
  });

  test('post links to /blog/best-sim-racing-telemetry-app (Pillar 3 mandatory)', () => {
    // The post argues a LAP-vs-MoTeC positioning; the
    // comparison article is where the comparison universe
    // lives. Lock the link.
    const post = loadPost();
    expect(post).toMatch(/\]\(\/blog\/best\-sim\-racing\-telemetry\-app\)/);
  });

  test('post links to ≥1 OTHER sibling pillar (cluster reach beyond Pillar 3)', () => {
    // Cluster mesh: Pillar 3 is mandatory; the post should
    // also reach for at least one other pillar (Pillar 1
    // cross-platform, Pillar 2 trail-braking, or Pillar 4
    // development plan). Without ≥1 additional, the post
    // links into a single pillar and reads as a comparison
    // appendage rather than a doctrine-anchored positioning
    // piece.
    const post = loadPost();
    const otherPillars = [
      '/blog/sim-to-real-transfer',
      '/blog/what-is-trail-braking',
      '/blog/driver-development-plan',
    ];
    const matched = otherPillars.filter((p) =>
      new RegExp(`\\]\\(${p.replace(/-/g, '\\-')}\\)`).test(post),
    );
    expect(
      matched.length,
      `Expected ≥1 OTHER sibling pillar reference; matched ${matched.length} (${matched.join(', ')})`,
    ).toBeGreaterThanOrEqual(1);
  });

  test('post addresses both sim AND real-world (cross-platform discipline)', () => {
    const post = loadPost().toLowerCase();
    expect(post).toMatch(/\bsim\b/);
    expect(post).toMatch(/\breal/);
  });

  test('post respects ADR-004 (asymmetric: bare "llm"/"ai coach"/"generative"/"neural" still banned; "language-model" allowed)', () => {
    // Strict ADR-004 minus the spelled-out language-model
    // exception that this post requires. Mirrors the Pillar 4
    // §5 asymmetry: the bare-token overclaim is forbidden,
    // but the negation-context spelled-out form is editorially
    // necessary.
    const post = loadPost().toLowerCase();
    expect(post).not.toMatch(/\bai\s+coach\b/);
    expect(post).not.toMatch(/\bllm\b/);
    expect(post).not.toMatch(/\bgenerative\b/);
    expect(post).not.toMatch(/\bneural\b/);
    expect(post).not.toMatch(/\brealistic\b/);
  });

  test('post respects Pillar 2/3/4 forbidden-vocab carry-over (no MoTeC disparagement)', () => {
    // The Pillar 3 carry-over is especially load-bearing here
    // — the post must NOT slide into "MoTeC is outdated /
    // bloated / overhyped". Persona-mismatch framing is the
    // only honest positioning move; subjective competitor
    // disparagement is exactly what ADR-conventions and
    // Doctrine §3 explicitly reject.
    const post = loadPost().toLowerCase();
    // Pillar 2 carry-over
    expect(post).not.toMatch(/\bmagic\b/);
    expect(post).not.toMatch(/\bsecret\b/);
    expect(post).not.toMatch(/\btrick\b/);
    // Pillar 3 carry-over (MoTeC-disparagement guardrail)
    expect(post).not.toMatch(/\bclearly\s+worse\b/);
    expect(post).not.toMatch(/\boutdated\b/);
    expect(post).not.toMatch(/\bbloated\b/);
    expect(post).not.toMatch(/\boverhyped\b/);
    expect(post).not.toMatch(/\bobviously\s+inferior\b/);
    expect(post).not.toMatch(/\bexpensive\b/);
    expect(post).not.toMatch(/\bcheap\b/);
    expect(post).not.toMatch(/\bpricey\b/);
    expect(post).not.toMatch(/\baffordable\b/);
    // Pillar 4 carry-over
    expect(post).not.toMatch(/\bguru\b/);
    expect(post).not.toMatch(/\bsecret\s+formula\b/);
    expect(post).not.toMatch(/\bshortcut\b/);
    expect(post).not.toMatch(/\bovernight\b/);
    expect(post).not.toMatch(/\bhack\b/);
    expect(post).not.toMatch(/\bsystem\s+that\s+guarantees\b/);
  });

  test('post avoids blog-post-layer technique-overclaim framing', () => {
    const post = loadPost().toLowerCase();
    expect(post).not.toMatch(/\bguaranteed?\s+(faster|improvement|results?|pace)\b/);
    expect(post).not.toMatch(/\binstantly\s+(faster|improve|fix)\b/);
    expect(post).not.toMatch(/\bwhat\s+pros\s+(do|use|know)\b/);
    expect(post).not.toMatch(/\bone\s+weird\s+/);
    expect(post).not.toMatch(/\bunlock\s+your\s+(true\s+)?potential\b/);
  });

  test('post filler-word count is bounded (anti-fluff guardrail)', () => {
    const post = loadPost().toLowerCase();
    const fillers = ['actually', 'really', 'very', 'basically', 'essentially'];
    let fillerCount = 0;
    for (const filler of fillers) {
      const matches = post.match(new RegExp(`\\b${filler}\\b`, 'g')) ?? [];
      fillerCount += matches.length;
    }
    expect(fillerCount).toBeLessThanOrEqual(3);
  });
});
