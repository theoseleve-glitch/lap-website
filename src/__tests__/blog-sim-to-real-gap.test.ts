// T182 — contract test for "The Sim-to-Real Gap: A Honest
// Look" blog post draft. Second post in Block I Batch 2
// (T181-T190 founder/product stories). Reuses the Batch 2
// editorial pattern established at T181: founder voice +
// doctrine-anchored positioning.
//
// Topic-specific divergence from T181:
//   * Head terms: "sim" + "real" pair (vs T181's "MoTeC" +
//     "LAP")
//   * Doctrine anchor: "shapes transfer / magnitudes don't"
//     (Pillar 1 framework vocabulary)
//   * ADR-004 returns to STRICT: this post does not need to
//     name language-model in negation, so the asymmetric
//     allowance from T181 does not apply here. Bare LLM /
//     AI coach / generative / neural / realistic all banned.
//   * Cross-pillar: /blog/sim-to-real-transfer mandatory
//     (the post IS the founder voice on Pillar 1's claim);
//     ≥1 other sibling pillar.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POST_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'sim-to-real-gap-honest-look.md',
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

describe('T182: The Sim-to-Real Gap — blog post draft', () => {
  test('post file exists at docs/blog-posts/sim-to-real-gap-honest-look.md', () => {
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

  test('post names "sim" cumulatively (≥6 occurrences)', () => {
    // The post is fundamentally about sim-vs-real. A draft
    // that drops "sim" repeatedly in favour of synonyms
    // ("simulator" / "virtual" / "computer racing") loses the
    // doctrine anchor.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bsim\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥6 "sim" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(6);
  });

  test('post names "real" cumulatively (≥6 occurrences)', () => {
    // Pair anchor with "sim". The post's argument turns on
    // the sim-vs-real distinction; both terms must appear at
    // similar frequency.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\breal/g) ?? [];
    expect(
      matches.length,
      `Expected ≥6 "real" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(6);
  });

  test('post names "transfer" cumulatively (≥3 occurrences)', () => {
    // Pillar 1 framework vocabulary. The post's doctrine
    // anchor is "shapes transfer, magnitudes don't" — without
    // naming "transfer" repeatedly the post drifts to generic
    // sim-vs-real comparison rather than the framework claim.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\btransfer/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "transfer" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post anchors on Pillar 1 doctrine ("shape(s)" + "magnitudes")', () => {
    // The Pillar 1 framework claim is "shapes transfer,
    // magnitudes don't". Lock both vocabulary words —
    // without them the post is sim-vs-real opinion rather
    // than doctrine-anchored argument.
    const post = loadPost().toLowerCase();
    expect(post, 'post must reference "shape(s)"').toMatch(/\bshape/);
    expect(post, 'post must reference "magnitudes"').toMatch(/\bmagnitudes?\b/);
  });

  test('post links to /blog/sim-to-real-transfer (Pillar 1 mandatory)', () => {
    // The post IS the founder voice on Pillar 1's claim.
    // Linking the cluster article is non-negotiable.
    const post = loadPost();
    expect(post).toMatch(/\]\(\/blog\/sim\-to\-real\-transfer\)/);
  });

  test('post links to ≥1 OTHER sibling pillar (cluster reach beyond Pillar 1)', () => {
    const post = loadPost();
    const otherPillars = [
      '/blog/what-is-trail-braking',
      '/blog/best-sim-racing-telemetry-app',
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

  test('post respects ADR-004 STRICT (no LLM-coaching argument here, asymmetry not allowed)', () => {
    // Where T181 needed asymmetric ADR-004 to make the
    // language-model negation argument, T182 has no such
    // need. ADR-004 returns to strict mode: every term banned
    // including the spelled-out "language model" form. The
    // post is about sim-to-real, not about coaching.
    const post = loadPost().toLowerCase();
    expect(post).not.toMatch(/\bai\s+coach\b/);
    expect(post).not.toMatch(/\bllm\b/);
    expect(post).not.toMatch(/\blanguage[-\s]model/);
    expect(post).not.toMatch(/\bgenerative\b/);
    expect(post).not.toMatch(/\bneural\b/);
    expect(post).not.toMatch(/\brealistic\b/);
  });

  test('post respects Pillar 2/3/4 forbidden-vocab carry-over', () => {
    const post = loadPost().toLowerCase();
    // Pillar 2 carry-over
    expect(post).not.toMatch(/\bmagic\b/);
    expect(post).not.toMatch(/\bsecret\b/);
    expect(post).not.toMatch(/\btrick\b/);
    // Pillar 3 carry-over
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

  test('post avoids sim-overclaim AND real-overclaim framing', () => {
    // T182-specific guardrail: the post must hold an honest
    // middle ground. A draft that overclaims sim ("just like
    // the real thing", "indistinguishable from real") OR
    // dismisses sim ("video game", "not real driving")
    // breaks the doctrine anchor that shapes transfer and
    // magnitudes don't.
    const post = loadPost().toLowerCase();
    expect(
      post,
      'sim-overclaim: "just like the real thing"',
    ).not.toMatch(/\bjust\s+like\s+the\s+real/);
    expect(
      post,
      'sim-overclaim: "indistinguishable from real"',
    ).not.toMatch(/\bindistinguishable\s+from\s+real/);
    expect(
      post,
      'sim-dismissal: "video game"',
    ).not.toMatch(/\bvideo\s+game\b/);
    expect(
      post,
      'sim-dismissal: "not real driving"',
    ).not.toMatch(/\bnot\s+real\s+driving\b/);
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
