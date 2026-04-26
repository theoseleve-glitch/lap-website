// T185 — contract test for "What We're NOT Building (and
// Why)" blog post draft. Fifth and final post in Block I
// Batch 2 (T181-T190 founder/product stories). Returns to
// the founder-voice + doctrine-anchored format of T181-T183
// (T184 was the genre-divergent monthly-update format).
//
// Topic-specific divergence:
//   * The post is FUNDAMENTALLY about negation: scope by
//     omission. Head term "not" must appear at high
//     frequency (≥8) — without it the post is just a
//     feature roadmap.
//   * Must enumerate ≥3 distinct "not building" propositions
//     as H2 sections — locks structural variety so the post
//     does not collapse into a single argument.
//   * ADR-004 ASYMMETRIC (same as T181): the post DOES
//     argue the language-model negation explicitly — it is
//     one of the headline scope choices. Spelled-out
//     "language-model" REQUIRED in negation context; bare
//     "llm" / "ai coach" / "generative" / "neural" still
//     banned.
//   * Doctrine anchors include "scope choice" / "deliberate"
//     and the doctrine §10 "commitments" vocabulary.
//   * Anti-disparagement guardrail (Pillar 3 carry-over,
//     especially load-bearing): the post must not slide
//     into "competitors are bad" framing. It is about
//     LAP's choices, not about what others fail at.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POST_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'what-were-not-building.md',
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

describe('T185: What We are NOT Building (and Why) — blog post draft', () => {
  test('post file exists at docs/blog-posts/what-were-not-building.md', () => {
    expect(() => loadPost()).not.toThrow();
  });

  test('post word count is in the 1200-1900 band', () => {
    const post = loadPost();
    const wc = wordCount(post);
    expect(wc).toBeGreaterThanOrEqual(1200);
    expect(wc).toBeLessThanOrEqual(1900);
  });

  test('post has an H1 title and ≥4 H2 sub-sections', () => {
    // Tighter H2 floor than T181-T184 because the post
    // structure REQUIRES enumerating multiple distinct
    // non-building propositions. ≥4 H2s prevents the post
    // collapsing into a single-argument form.
    const post = loadPost();
    const h1Matches = post.match(/^#\s+/gm) ?? [];
    expect(h1Matches.length).toBeGreaterThanOrEqual(1);
    const h2Matches = post.match(/^##\s+/gm) ?? [];
    expect(
      h2Matches.length,
      `post must have ≥4 H2 sub-sections; found ${h2Matches.length}`,
    ).toBeGreaterThanOrEqual(4);
  });

  test('post names "not" cumulatively (≥8 occurrences)', () => {
    // The post is fundamentally about negation. Lock the
    // head term — without it the post drifts to a
    // positive-feature description rather than the scope-by-
    // omission discipline.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bnot\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥8 "not" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(8);
  });

  test('post names "build" / "building" cumulatively (≥5 occurrences)', () => {
    // Pair anchor with "not". The post's title verb has to
    // appear in the body, not just the H1.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bbuild(?:ing|s)?\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥5 "build(ing)" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(5);
  });

  test('post enumerates ≥3 distinct "not building" propositions (H2 structural variety)', () => {
    // Structural lock: the post must have at least 3 H2s
    // that name distinct non-building propositions. Allows
    // various phrasings ("We are not building", "Not
    // building", "What we won't ship", etc.).
    const post = loadPost();
    const h2Lines = (post.match(/^##\s+.+$/gm) ?? []).map((s) => s.toLowerCase());
    const negativePatterns = [
      /\bnot\s+(?:building|shipping|prescribing|generating|running|adding)/,
      /\bwe\s+(?:are\s+not|will\s+not|won['']t|do\s+not|don['']t)/,
      /\bwhat\s+we['']?re\s+not/,
      /\bwhat\s+we\s+won['']t/,
      /\bwhat\s+we\s+do\s+not/,
      /\bno\s+\w+/,
    ];
    const negativeH2s = h2Lines.filter((line) =>
      negativePatterns.some((re) => re.test(line)),
    );
    expect(
      negativeH2s.length,
      `Expected ≥3 H2 sections naming distinct non-building propositions; matched ${negativeH2s.length}: ${negativeH2s.join(' | ')}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post anchors on doctrine vocabulary (≥2 of: scope, deliberate, persona, rule library, commitment(s), durability)', () => {
    // The post has to make its scope-discipline argument
    // through doctrine vocabulary, not through opinion-bait.
    // Lock at least 2 of the doctrine anchor phrases.
    const post = loadPost().toLowerCase();
    const anchors = [
      /\bscope\b/,
      /\bdeliberate\b/,
      /\bpersona/,
      /\brule\s+library\b/,
      /\bcommitment/,
      /\bdurability\b/,
    ];
    const labels = [
      'scope',
      'deliberate',
      'persona',
      'rule library',
      'commitment(s)',
      'durability',
    ];
    const matched = anchors
      .map((re, i) => (re.test(post) ? labels[i] : null))
      .filter((x): x is string => x !== null);
    expect(
      matched.length,
      `Expected ≥2 doctrine anchors; matched ${matched.length} (${matched.join(', ')})`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post makes ADR-004 negation explicit (T181-style asymmetric: "language-model" in spelled-out form)', () => {
    // The doctrine §10 commitment 4 — "no LLMs in user-
    // facing coaching text" — is THE headline scope choice
    // for this post. Locking the spelled-out language-model
    // negation form is non-negotiable. Same asymmetry as
    // T181: bare "llm" stays banned (per the strict
    // ADR-004 lock below); the spelled-out form is the
    // editorial form that lets the post make the negation
    // argument honestly.
    const post = loadPost().toLowerCase();
    expect(
      post,
      'post must spell out the language-model negation explicitly',
    ).toMatch(/\blanguage[-\s]model/);
  });

  test('post links to ≥1 sibling pillar (cluster reach discipline)', () => {
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

  test('post respects ADR-004 (asymmetric: bare "llm"/"ai coach"/"generative"/"neural" still banned; "language-model" allowed)', () => {
    // Same asymmetry as T181: the bare-token overclaim is
    // forbidden, but the negation-context spelled-out form
    // is editorially necessary.
    const post = loadPost().toLowerCase();
    expect(post).not.toMatch(/\bai\s+coach\b/);
    expect(post).not.toMatch(/\bllm\b/);
    expect(post).not.toMatch(/\bgenerative\b/);
    expect(post).not.toMatch(/\bneural\b/);
    expect(post).not.toMatch(/\brealistic\b/);
  });

  test('post respects Pillar 2/3/4 forbidden-vocab carry-over (no competitor disparagement)', () => {
    // The Pillar 3 carry-over is especially load-bearing
    // here — the post must NOT slide into "their tool is
    // outdated / bloated / overhyped". Scope-choice framing
    // is the only honest positioning move; competitor
    // disparagement is exactly what doctrine and
    // ADR-conventions reject.
    const post = loadPost().toLowerCase();
    // Pillar 2 carry-over
    expect(post).not.toMatch(/\bmagic\b/);
    expect(post).not.toMatch(/\bsecret\b/);
    expect(post).not.toMatch(/\btrick\b/);
    // Pillar 3 carry-over (anti-disparagement)
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
