// T173 — contract test for the "Apex Speed: The Real Measure of
// Corner Commitment" blog post draft. Third post in Batch 1
// (T171-T180). Reuses the editorial pattern established at T171
// and twice-validated at T172.
//
// Topic-specific adaptations vs T171/T172:
//   * Head term: "apex speed" (vs T171's "T1/Turn 1", T172's
//     "throttle pickup")
//   * Physics anchor: lateral grip + the data signal of
//     minimum speed (vs T171's brake-pressure, T172's traction
//     circle / rear-axle) — the post's argument is that
//     minimum apex speed IS the trace's record of how close
//     the driver got to the lateral-grip limit
//   * The post's distinguishing claim: apex speed is a
//     leading indicator of commitment quality, not a lagging
//     one like lap time. Chase the leading indicator and the
//     lap time follows.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POST_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'apex-speed-corner-commitment.md',
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

describe('T173: Apex Speed — blog post draft', () => {
  test('post file exists at docs/blog-posts/apex-speed-corner-commitment.md', async () => {
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

  test('post names "apex speed" cumulatively (≥3 occurrences)', async () => {
    // Title head term. The post's SEO surface is "apex speed
    // corner commitment" — a draft that drifts to generic
    // "minimum speed" or "cornering pace" prose has lost the
    // long-tail search anchor.
    const post = loadPost().toLowerCase();
    const matches = post.match(/apex\s+speed/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "apex speed" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post uses telemetry vocabulary (telemetry / trace) cumulatively (≥5)', async () => {
    // Same article-keyword anchor as T171/T172. The post is a
    // trace-reading deep-dive; telemetry/trace is the doctrine
    // anchor for the entire batch.
    const post = loadPost().toLowerCase();
    const telemetryMatches = post.match(/\btelemetry\b/g) ?? [];
    const traceMatches = post.match(/\btrace/g) ?? [];
    const total = telemetryMatches.length + traceMatches.length;
    expect(
      total,
      `Expected ≥5 telemetry/trace mentions cumulatively; found ${total}`,
    ).toBeGreaterThanOrEqual(5);
  });

  test('post anchors on the data signal of minimum speed (≥2 "minimum speed" or "min speed")', async () => {
    // The post's claim is that apex speed = minimum speed
    // through the corner = the trace's record of how close
    // the driver got to the lateral-grip limit. A draft that
    // does not name "minimum speed" (or "min speed") is
    // talking about apex speed in the abstract, not about
    // the specific data point on the trace.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\b(min|minimum)\s+speed\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥2 "minimum speed" or "min speed" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post anchors on the lateral-grip physics (≥2 "lateral" occurrences)', async () => {
    // Where T171 anchored on entry-phase weight transfer and
    // T172 on rear-axle traction-circle exit-phase physics,
    // T173 anchors on the lateral-grip limit through the
    // rotation phase. Without naming "lateral", the post
    // drifts to subjective advice about commitment, not data.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\blateral\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥2 "lateral" mentions; found ${matches.length}`,
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
    // Same layer guardrail as T171/T172. Apex-speed posts sit
    // at extra risk for "the secret to fast cornering" framing
    // because the title implies a one-weird-trick promise.
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
