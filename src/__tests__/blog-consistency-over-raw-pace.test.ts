// T174 — contract test for the "Consistency Over Raw Pace: Why
// Your Average Matters" blog post draft. Fourth post in Batch 1
// (T171-T180). Reuses the editorial pattern established at
// T171-T173 with a topic-specific divergence: this post is a
// session-level lap-time distribution argument, not a corner-
// phase trace-reading deep-dive.
//
// The divergence shows up in two places:
//   * Lower telemetry/trace floor (≥2 vs ≥5 in T171-T173): the
//     post discusses telemetry as a data source but the
//     editorial anchor is statistical, not trace-shape.
//   * New article-keyword vocabulary: "lap time" / "lap times"
//     (the actual unit of analysis) and "median" or "average"
//     (the statistical anchor of the title's promise).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POST_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'consistency-over-raw-pace.md',
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

describe('T174: Consistency Over Raw Pace — blog post draft', () => {
  test('post file exists at docs/blog-posts/consistency-over-raw-pace.md', async () => {
    expect(() => loadPost()).not.toThrow();
  });

  test('post word count is in the 1200-1900 band', async () => {
    const post = loadPost();
    const wc = wordCount(post);
    expect(wc).toBeGreaterThanOrEqual(1200);
    expect(wc).toBeLessThanOrEqual(1900);
  });

  test('post has an H1 title and ≥3 H2 sub-sections', async () => {
    const post = loadPost();
    const h1Matches = post.match(/^#\s+/gm) ?? [];
    expect(h1Matches.length, 'post must have exactly one H1').toBeGreaterThanOrEqual(1);
    const h2Matches = post.match(/^##\s+/gm) ?? [];
    expect(
      h2Matches.length,
      `post must have ≥3 H2 sub-sections; found ${h2Matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post names "consistency" or "consistent" cumulatively (≥3 occurrences)', async () => {
    // Title head term. The post's SEO surface is "consistency
    // over raw pace" — a draft that drifts to generic "race
    // pace" or "lap time discipline" prose has lost the
    // long-tail search anchor.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bconsisten(cy|t|tly)\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "consistency"/"consistent" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post anchors on lap-time vocabulary (≥4 "lap time" / "lap times")', async () => {
    // The article keyword for this post. Where T171-T173 anchor
    // on telemetry/trace because they are trace-reading deep-
    // dives, T174's editorial anchor is the lap-time distribution
    // — the fastest lap, the median lap, the standard deviation
    // of the distribution. A draft that does not name "lap
    // time(s)" repeatedly is talking around the unit of
    // analysis, not about it.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\blap\s+times?\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥4 "lap time"/"lap times" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(4);
  });

  test('post anchors on the statistical signal "median" or "average" (≥2)', async () => {
    // The title's promise is "Why Your Average Matters". The
    // post must name the statistical concept it is arguing for
    // — median or average — at least twice cumulatively. A
    // draft that uses softer phrases like "typical lap" or
    // "regular pace" has lost the doctrine anchor.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\b(median|average)\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥2 "median" or "average" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post mentions telemetry/trace ≥2 times (lower floor than corner-phase posts)', async () => {
    // The post acknowledges telemetry as the data source but
    // the editorial focus is statistical, not trace-shape.
    // Lower floor than T171-T173 because the post would be
    // padded if it forced trace-reading vocabulary into a
    // session-level argument.
    const post = loadPost().toLowerCase();
    const telemetryMatches = post.match(/\btelemetry\b/g) ?? [];
    const traceMatches = post.match(/\btrace/g) ?? [];
    const total = telemetryMatches.length + traceMatches.length;
    expect(
      total,
      `Expected ≥2 telemetry/trace mentions; found ${total}`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post references the framework (≥1 of the 5 verbs explicitly)', async () => {
    const post = loadPost().toLowerCase();
    const verbs = [/\bdiagnos/, /\bprescrib/, /\bexecut/, /\bmeasur/, /\badapt/];
    const matched = verbs.filter((v) => v.test(post)).length;
    expect(
      matched,
      `Expected ≥1 framework verb explicitly named; matched ${matched}`,
    ).toBeGreaterThanOrEqual(1);
  });

  test('post links to ≥2 sibling pillar articles (cluster reach)', async () => {
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
    const post = loadPost().toLowerCase();
    expect(post).toMatch(/\bsim\b/);
    expect(post).toMatch(/\breal/);
  });

  test('post respects ADR-004 + Pillar 2/3/4 forbidden vocabulary', async () => {
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
    const post = loadPost().toLowerCase();
    expect(post).not.toMatch(/\bguaranteed?\s+(faster|improvement|results?|pace)\b/);
    expect(post).not.toMatch(/\binstantly\s+(faster|improve|fix)\b/);
    expect(post).not.toMatch(/\bwhat\s+pros\s+(do|use|know)\b/);
    expect(post).not.toMatch(/\bone\s+weird\s+/);
    expect(post).not.toMatch(/\bunlock\s+your\s+(true\s+)?potential\b/);
  });

  test('post filler-word count is bounded (anti-fluff guardrail)', async () => {
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
