// T184 — contract test for "Pre-launch Month in Numbers"
// blog post draft. Fourth post in Block I Batch 2 (T181-T190
// founder/product stories). Diverges from T181-T183 in genre:
// this is a monthly-update / build-in-public format, not a
// doctrine-anchored argument.
//
// What this post is FOR:
//   * Establishing the monthly-update cadence (the post is the
//     first of a recurring format)
//   * Honesty discipline: report what was published, what was
//     decided, what was NOT done — the "not done" section is
//     the load-bearing one
//   * Anti-SaaS-bragging guardrail: no "MRR" / "ARR" / "10x
//     growth" / "users skyrocketed" / etc. There is no
//     paying user base yet; pretending there is would break
//     trust on day one.
//
// Topic-specific divergence from T181-T183:
//   * Head terms: "month" ≥3 + "numbers" ≥2 (the post genre
//     vocabulary)
//   * Numerals: ≥5 distinct numerals (the post is "in
//     numbers" — concrete counts have to appear)
//   * Honesty markers: must contain "pre-launch" (the genre
//     anchor) AND ≥2 of {"not", "no ", "did not", "have not"}
//     used in the negative-claim sense
//   * Anti-SaaS-bragging vocab guardrail (new for T184)
//   * ADR-004 STRICT (no language-model negation argument
//     here — the post reports state, doesn't argue
//     positioning)

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POST_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'pre-launch-month-in-numbers.md',
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

describe('T184: Pre-launch Month in Numbers — blog post draft', () => {
  test('post file exists at docs/blog-posts/pre-launch-month-in-numbers.md', () => {
    expect(() => loadPost()).not.toThrow();
  });

  test('post word count is in the 1100-1900 band', () => {
    // Slightly wider band than T181-T183 because a monthly-
    // update format is reporting state, not arguing — can
    // run shorter without losing substance. Floor still 1100
    // to prevent the post collapsing into a brag list.
    const post = loadPost();
    const wc = wordCount(post);
    expect(wc).toBeGreaterThanOrEqual(1100);
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

  test('post names "month" cumulatively (≥3 occurrences)', () => {
    // Genre anchor: this is a monthly update, "month" must
    // appear repeatedly or the post is just a numbers report
    // without the cadence framing.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bmonth/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "month" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post names "numbers" cumulatively (≥2 occurrences)', () => {
    // Genre anchor pair: "in numbers" is the format. Lock the
    // term — without it the post drifts to a generic monthly
    // update without the concreteness commitment.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bnumbers?\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥2 "number(s)" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post contains ≥5 concrete numerals (the post IS "in numbers")', () => {
    // The promise of the format is concrete counts. A post
    // that says "we shipped a lot" without numerals breaks
    // the format contract.
    const post = loadPost();
    const numerals = post.match(/\b\d+\b/g) ?? [];
    expect(
      numerals.length,
      `Expected ≥5 concrete numerals; found ${numerals.length}`,
    ).toBeGreaterThanOrEqual(5);
  });

  test('post anchors on pre-launch reality (mandatory "pre-launch" mention)', () => {
    // The genre is pre-launch transparency. Locking the term
    // explicitly prevents the post from drifting to "we have
    // a product" framing it cannot back up.
    const post = loadPost().toLowerCase();
    expect(post).toMatch(/\bpre[-\s]launch\b/);
  });

  test('post lists what was NOT done (≥2 negative-claim markers)', () => {
    // The honesty discipline that distinguishes this post
    // from a brag list. The "not yet" / "did not" / "no X"
    // section is load-bearing — without it the post is a
    // marketing brochure.
    const post = loadPost().toLowerCase();
    const markers = [
      /\bno\s+(?:paying|public|product|revenue|users?)\b/,
      /\bnot\s+(?:yet|claiming|shipped|live)\b/,
      /\bhave\s+not\s+\w+/,
      /\bdid\s+not\s+\w+/,
    ];
    const matched = markers.filter((re) => re.test(post)).length;
    expect(
      matched,
      `Expected ≥2 negative-claim markers; matched ${matched}`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post links to ≥1 sibling pillar (cluster reach discipline)', () => {
    // Even a monthly update format needs cluster mesh — the
    // post should reach for at least one pillar article so
    // the link graph stays connected.
    const post = loadPost();
    const pillars = [
      '/blog/sim-to-real-transfer',
      '/blog/what-is-trail-braking',
      '/blog/best-sim-racing-telemetry-app',
      '/blog/driver-development-plan',
    ];
    const matched = pillars.filter((p) =>
      new RegExp(`\\]\\(${p.replace(/-/g, '\\-')}\\)`).test(post),
    );
    expect(
      matched.length,
      `Expected ≥1 pillar reference; matched ${matched.length} (${matched.join(', ')})`,
    ).toBeGreaterThanOrEqual(1);
  });

  test('post respects ADR-004 STRICT (no LLM-coaching argument here)', () => {
    // T184 is a state report, not a positioning argument.
    // ADR-004 strict mode: every term banned, including
    // spelled-out "language-model" form.
    const post = loadPost().toLowerCase();
    expect(post).not.toMatch(/\bai\s+coach\b/);
    expect(post).not.toMatch(/\bllm\b/);
    expect(post).not.toMatch(/\blanguage[-\s]model/);
    expect(post).not.toMatch(/\bgenerative\b/);
    expect(post).not.toMatch(/\bneural\b/);
    expect(post).not.toMatch(/\brealistic\b/);
  });

  test('post avoids SaaS-bragging metrics (T184-specific guardrail)', () => {
    // The post is pre-launch and pre-revenue. Pretending
    // otherwise via SaaS-style metrics is exactly what
    // breaks trust at the start of the build-in-public
    // cadence. Lock the absence of fabricable bragging
    // metrics.
    const post = loadPost().toLowerCase();
    expect(post, 'no MRR claim').not.toMatch(/\bmrr\b/);
    expect(post, 'no ARR claim').not.toMatch(/\barr\b/);
    expect(post, 'no "viral growth"').not.toMatch(/\bviral\s+growth\b/);
    expect(post, 'no "10x growth"').not.toMatch(/\b\d+x\s+growth\b/);
    expect(post, 'no "skyrocket"').not.toMatch(/\bskyrocket/);
    expect(post, 'no "explosive growth"').not.toMatch(/\bexplosive\s+growth\b/);
    expect(post, 'no "going viral"').not.toMatch(/\bgoing\s+viral\b/);
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
