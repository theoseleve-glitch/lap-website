// T183 — contract test for "Designing Coaching That Drivers
// Actually Follow" blog post draft. Third post in Block I
// Batch 2 (T181-T190 founder/product stories). Reuses the
// editorial pattern from T181/T182: founder voice +
// doctrine-anchored positioning.
//
// Topic-specific divergence:
//   * Head terms: "coach(ing)" + "follow" + "drill" +
//     "prescription" (Pillar 4 framework vocabulary)
//   * Doctrine anchor: the four-component prescription
//     anatomy (drill name + success criterion + review
//     cadence + weakness shape) — this is the post's claim
//     about what makes coaching followable
//   * ADR-004 STRICT (same as T182): the post argues the
//     "vague vs concrete" distinction without needing to
//     name the language-model alternative; bare LLM / AI
//     coach / generative / neural / realistic all banned,
//     spelled-out "language-model" also banned (no
//     asymmetric exception here)
//   * Cross-pillar: /blog/driver-development-plan mandatory
//     (the post IS the founder voice on Pillar 4's
//     framework); ≥1 other sibling pillar.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POST_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'designing-coaching-drivers-follow.md',
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

describe('T183: Designing Coaching That Drivers Actually Follow — blog post draft', () => {
  test('post file exists at docs/blog-posts/designing-coaching-drivers-follow.md', () => {
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

  test('post names "coach(ing)" cumulatively (≥6 occurrences)', () => {
    // Pillar 4 framework anchor. The post's argument is about
    // coaching design; without "coach"/"coaching" repeated
    // the post drifts to generic advice-quality territory.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bcoach(?:ing)?\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥6 "coach(ing)" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(6);
  });

  test('post names "follow" cumulatively (≥3 occurrences)', () => {
    // The post's distinguishing claim is about FOLLOWABILITY
    // — coaching that drivers actually act on. Lock the head
    // term; without it the post is generic coaching theory
    // rather than the followability argument.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bfollow/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "follow" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post names "drill" cumulatively (≥3 occurrences)', () => {
    // Pillar 4 prescription anatomy: drill name is one of the
    // four components that makes a prescription followable.
    // Lock the term.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bdrill/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "drill" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post names "prescription" cumulatively (≥3 occurrences)', () => {
    // The post's argumentative anchor: a prescription has
    // anatomy. Lock the head term.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bprescription/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "prescription" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post anchors on prescription anatomy (≥2 of: success criterion/condition, cadence, weakness shape, hand-curated, rule library, loop closes)', () => {
    // The post must make its design-philosophy claim through
    // the Pillar 4 doctrine vocabulary, not through generic
    // coaching opinion. Lock at least 2 of the anatomy
    // anchors — without them the post drifts to "good
    // coaching is specific" platitude rather than the
    // doctrine claim.
    const post = loadPost().toLowerCase();
    const anchors = [
      /\bsuccess\s+(?:criterion|condition)\b/,
      /\b(?:review\s+)?cadence\b/,
      /\bweakness\s+shape\b/,
      /\bhand[-\s]curated\b/,
      /\brule\s+library\b/,
      /\bloop\s+closes\b|\bcloses?\s+the\s+loop/,
    ];
    const labels = [
      'success criterion/condition',
      'cadence',
      'weakness shape',
      'hand-curated',
      'rule library',
      'loop closes',
    ];
    const matched = anchors
      .map((re, i) => (re.test(post) ? labels[i] : null))
      .filter((x): x is string => x !== null);
    expect(
      matched.length,
      `Expected ≥2 doctrine anchors; matched ${matched.length} (${matched.join(', ')})`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post links to /blog/driver-development-plan (Pillar 4 mandatory)', () => {
    // The post IS the founder voice on Pillar 4's framework.
    // Linking the cluster article is non-negotiable.
    const post = loadPost();
    expect(post).toMatch(/\]\(\/blog\/driver\-development\-plan\)/);
  });

  test('post links to ≥1 OTHER sibling pillar (cluster reach beyond Pillar 4)', () => {
    const post = loadPost();
    const otherPillars = [
      '/blog/sim-to-real-transfer',
      '/blog/what-is-trail-braking',
      '/blog/best-sim-racing-telemetry-app',
    ];
    const matched = otherPillars.filter((p) =>
      new RegExp(`\\]\\(${p.replace(/-/g, '\\-')}\\)`).test(post),
    );
    expect(
      matched.length,
      `Expected ≥1 OTHER sibling pillar reference; matched ${matched.length} (${matched.join(', ')})`,
    ).toBeGreaterThanOrEqual(1);
  });

  test('post respects ADR-004 STRICT (no language-model negation argument here)', () => {
    // T183 has no need to name the language-model
    // alternative. ADR-004 strict mode: every term banned,
    // including the spelled-out "language-model" form. The
    // post is about followability anatomy, not about coaching
    // technology choices.
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

  test('post avoids dictatorial-coaching framing (followability ≠ obedience)', () => {
    // T183-specific guardrail. The post argues followability
    // through prescription anatomy — NOT through "drivers
    // must obey the coach". Coaching that's followed because
    // it's specific is the claim; coaching that's followed
    // because the driver has no choice is anti-doctrine
    // (Pillar 4 is about the driver-as-decision-maker, not
    // the driver-as-recipient).
    const post = loadPost().toLowerCase();
    expect(post, 'no "must obey"').not.toMatch(/\bmust\s+obey\b/);
    expect(post, 'no "blindly follow"').not.toMatch(/\bblindly\s+follow/);
    expect(post, 'no "do as told"').not.toMatch(/\bdo\s+as\s+(?:told|instructed)\b/);
    expect(post, 'no "without question"').not.toMatch(/\bwithout\s+question(?:ing)?\b/);
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
