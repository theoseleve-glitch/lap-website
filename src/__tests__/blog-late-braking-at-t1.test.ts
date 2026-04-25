// T171 — contract test for the "Late Braking at T1: What Your
// Telemetry Is Saying" blog post draft. First post in Batch 1
// (T171-T180, coaching rule deep-dives). Establishes the
// blog-post editorial pattern that subsequent posts (T172-T175)
// will reuse.
//
// Blog posts diverge from pillar articles in two ways:
//   1. Single markdown file (no section split — blog posts are
//      1200-1800 words, manageable as one unit; pillars hit
//      2500+ which earned the section split for parallel TDD).
//   2. The draft itself doesn't ship FAQ + JSON-LD; those land
//      at batch level via T178/T179. Draft test asserts content
//      invariants only.
//
// What this test locks:
//   * File exists at docs/blog-posts/late-braking-at-t1.md
//   * Word count band 1200-1900 (deep-dive blog scope)
//   * Structural discipline (H1 + ≥3 H2 sub-sections; not a
//     wall of text)
//   * Head-term keyword density (T1/Turn 1 + telemetry/trace +
//     brake pressure)
//   * Framework anchor (the post is a worked example of the
//     diagnose step → ≥1 of the 5 framework verbs explicitly
//     named, plus the technique name in framework vocabulary)
//   * Cross-pillar reach (≥2 of 4 sibling pillar articles
//     referenced — establishes the blog post as a node in the
//     cluster mesh, not an isolated SEO page)
//   * Cross-platform discipline (sim AND real both addressed)
//   * Forbidden-vocab carry-over from ADR-004 + Pillar 2 / 3 / 4
//     PLUS blog-post-layer overclaim extension (no "the secret
//     to" / "the trick that" / "pros use" / "guaranteed" /
//     "instantly" — coaching rule deep-dives sit at peak risk
//     for technique-overclaim framing)

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POST_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'late-braking-at-t1.md',
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

describe('T171: Late Braking at T1 — blog post draft', () => {
  test('post file exists at docs/blog-posts/late-braking-at-t1.md', async () => {
    expect(() => loadPost()).not.toThrow();
  });

  test('post word count is in the 1200-1900 band', async () => {
    // Coaching rule deep-dive scope. Below 1200 the post does
    // not deliver enough physics + drill detail to earn the
    // SEO surface; above 1900 it loses the deep-dive form and
    // starts behaving like a pillar article without pillar-
    // article structure (no 7-section split, no FAQ).
    const post = loadPost();
    const wc = wordCount(post);
    expect(wc).toBeGreaterThanOrEqual(1200);
    expect(wc).toBeLessThanOrEqual(1900);
  });

  test('post has an H1 title and ≥3 H2 sub-sections', async () => {
    // Structural discipline. A blog post that ships as a wall
    // of text is unscannable. ≥3 H2s also force the author to
    // organise the argument into discrete moves (trace
    // signature, physics, drill, etc.) rather than meandering.
    const post = loadPost();
    const h1Matches = post.match(/^#\s+/gm) ?? [];
    expect(h1Matches.length, 'post must have exactly one H1').toBeGreaterThanOrEqual(1);
    const h2Matches = post.match(/^##\s+/gm) ?? [];
    expect(
      h2Matches.length,
      `post must have ≥3 H2 sub-sections; found ${h2Matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post names "T1" or "Turn 1" cumulatively (≥3 occurrences)', async () => {
    // Title head term. The post's SEO surface is "late braking
    // at T1" — a draft that drops the head term in body prose
    // is leaving the long-tail search anchor unspoken.
    const post = loadPost();
    const matches = post.match(/\b(T1|Turn\s+1)\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "T1" or "Turn 1" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post uses telemetry vocabulary (telemetry / trace) cumulatively (≥5)', async () => {
    // The post's article-keyword cluster is "what your
    // telemetry is saying" — the trace IS the article. A draft
    // that drifts to "data" or "numbers" generic prose has lost
    // the doctrine anchor.
    const post = loadPost().toLowerCase();
    const telemetryMatches = post.match(/\btelemetry\b/g) ?? [];
    const traceMatches = post.match(/\btrace/g) ?? [];
    const total = telemetryMatches.length + traceMatches.length;
    expect(
      total,
      `Expected ≥5 telemetry/trace mentions cumulatively; found ${total}`,
    ).toBeGreaterThanOrEqual(5);
  });

  test('post anchors on brake-pressure physics (≥3 occurrences)', async () => {
    // The post's substance comes from naming what the trace
    // actually shows. Generic "you should brake earlier" advice
    // is the article's anti-position; brake-pressure-trace
    // shape is the framework. Lock the physics anchor.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bbrake[\s-]*pressure\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "brake pressure" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post references the framework (≥1 of the 5 verbs explicitly)', async () => {
    // Coaching rule deep-dives are worked examples of the
    // diagnose step. The post must explicitly name at least
    // one of the framework verbs to anchor itself in the
    // five-verb structure — without that, the post is
    // technique advice floating free of the editorial cluster.
    const post = loadPost().toLowerCase();
    const verbs = [/\bdiagnos/, /\bprescrib/, /\bexecut/, /\bmeasur/, /\badapt/];
    const matched = verbs.filter((v) => v.test(post)).length;
    expect(
      matched,
      `Expected ≥1 framework verb explicitly named; matched ${matched}`,
    ).toBeGreaterThanOrEqual(1);
  });

  test('post links to ≥2 sibling pillar articles (cluster reach)', async () => {
    // The four-pillar cluster acts as a hub only if downstream
    // blog posts link back. Lock the cluster reach: every blog
    // post in this batch references at least 2 sibling pillars.
    // Late Braking at T1 naturally connects to /blog/what-is-
    // trail-braking (release-shape) and /blog/driver-
    // development-plan (framework-verbs); /blog/sim-to-real-
    // transfer is a likely third.
    const post = loadPost();
    const pillars = [
      '/blog/sim-to-real-transfer',
      '/blog/what-is-trail-braking',
      '/blog/best-sim-racing-telemetry-app',
      '/blog/driver-development-plan',
    ];
    const referenced = pillars.filter((p) =>
      new RegExp(`\\]\\(${p.replace(/-/g, '\\-')}\\)`).test(post),
    );
    expect(
      referenced.length,
      `Expected ≥2 sibling pillar references; found ${referenced.length} (${referenced.join(', ')})`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post addresses both sim AND real-world (cross-platform discipline)', async () => {
    // Same lock as Pillar 4 article-level test. The post's
    // technique applies on both surfaces; a draft that frames
    // the trace as sim-only or real-only loses the LAP-
    // distinguishing cross-platform claim that runs through the
    // editorial cluster.
    const post = loadPost().toLowerCase();
    expect(post).toMatch(/\bsim\b/);
    expect(post).toMatch(/\breal/);
  });

  test('post respects ADR-004 + Pillar 2/3/4 forbidden vocabulary', async () => {
    // Carry-over from the pillar article guardrail. The blog-
    // post layer inherits ADR-004 (no AI-coach-now/LLM/
    // generative/neural/realistic), Pillar 2 (no magic/secret/
    // trick), Pillar 3 (no clearly worse/outdated/bloated/
    // overhyped/obviously inferior; no expensive/cheap/pricey/
    // affordable), Pillar 4 (no guru/secret formula/shortcut/
    // overnight/hack/system that guarantees).
    const post = loadPost().toLowerCase();
    // ADR-004
    expect(post).not.toMatch(/\bai\s+coach\b/);
    expect(post).not.toMatch(/\bllm\b/);
    expect(post).not.toMatch(/\bgenerative\b/);
    expect(post).not.toMatch(/\bneural\b/);
    expect(post).not.toMatch(/\brealistic\b/);
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

  test('post avoids blog-post-layer technique-overclaim framing', async () => {
    // Coaching rule deep-dives sit at peak risk for technique-
    // overclaim ("the secret to fast T1", "what pros use",
    // "guaranteed faster", "instantly improve"). Lock the
    // forbidden framings explicitly. This guardrail is layered
    // on top of the existing /\bsecret\b/ + /\btrick\b/ catches
    // and adds patterns specific to the blog-post format.
    const post = loadPost().toLowerCase();
    expect(post).not.toMatch(/\bguaranteed?\s+(faster|improvement|results?|pace)\b/);
    expect(post).not.toMatch(/\binstantly\s+(faster|improve|fix)\b/);
    expect(post).not.toMatch(/\bwhat\s+pros\s+(do|use|know)\b/);
    expect(post).not.toMatch(/\bone\s+weird\s+/);
    expect(post).not.toMatch(/\bunlock\s+your\s+(true\s+)?potential\b/);
  });

  test('post filler-word count is bounded (anti-fluff guardrail)', async () => {
    // Same lock as the pillar article-level tests. "actually",
    // "really", "very", "basically", "essentially" all signal
    // weak prose when overused. Cap the budget so a future
    // editorial pass that re-introduces filler is caught.
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
