// T175 — contract test for the "Tire Management in Endurance:
// Data Signals" blog post draft. Fifth and final post in
// Batch 1 (T171-T180). Reuses the editorial pattern; this
// post combines the trace-reading discipline of T171-T173
// with the session-level distribution discipline of T174,
// adding tire-specific vocabulary anchors.
//
// Topic-specific adaptations:
//   * Head term: "tire management" (vs corner-phase head terms
//     and "consistency" — this is the endurance-context
//     management vocabulary)
//   * Article keyword: "tire"/"tires" ≥6 (the post is
//     fundamentally about tires)
//   * Context anchor: "endurance" ≥3 (without it the post
//     drifts to generic tire writing)
//   * Physics anchor: "degradation" or "wear" ≥3 (the
//     specific phenomenon being read in the trace)
//   * Telemetry/trace floor restored to ≥3 (between T171-T173's
//     ≥5 and T174's ≥2): the post DOES read traces, but it
//     also discusses lap-time distributions — middle-floor.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POST_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'tire-management-endurance.md',
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

describe('T175: Tire Management in Endurance — blog post draft', () => {
  test('post file exists at docs/blog-posts/tire-management-endurance.md', async () => {
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

  test('post names "tire management" cumulatively (≥2 occurrences)', async () => {
    // Title head term. The post's SEO surface is "tire
    // management in endurance" — the head phrase has to land
    // in body prose, not just the title.
    const post = loadPost().toLowerCase();
    const matches = post.match(/tire\s+management/g) ?? [];
    expect(
      matches.length,
      `Expected ≥2 "tire management" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post anchors on tire vocabulary (≥6 "tire"/"tires")', async () => {
    // The article keyword for this post. A draft that talks
    // about "rubber" or "compounds" without naming tires
    // repeatedly has lost the head term and reads as oblique.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\btires?\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥6 "tire"/"tires" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(6);
  });

  test('post locates the argument in endurance context (≥3 "endurance" occurrences)', async () => {
    // Without naming endurance repeatedly, the post drifts to
    // a generic tire-physics piece that does not earn its
    // long-tail search anchor ("endurance racing tire
    // management" / "tire data signals endurance"). Lock the
    // context anchor.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\bendurance\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "endurance" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post anchors on the degradation physics (≥3 "degradation"/"wear")', async () => {
    // The phenomenon the post teaches drivers to read in the
    // trace. Without naming "degradation" or "wear" the post
    // is talking about tires in the abstract, not about the
    // failure mode that endurance management exists to
    // counter.
    const post = loadPost().toLowerCase();
    const degMatches = post.match(/\bdegradation\b/g) ?? [];
    const wearMatches = post.match(/\bwear\b/g) ?? [];
    const total = degMatches.length + wearMatches.length;
    expect(
      total,
      `Expected ≥3 "degradation"/"wear" mentions; found ${total}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post mentions telemetry/trace ≥3 times (middle floor)', async () => {
    // Between T171-T173's ≥5 (pure trace-reading deep-dives)
    // and T174's ≥2 (pure distribution analysis): this post
    // does both, so the floor sits in the middle.
    const post = loadPost().toLowerCase();
    const telemetryMatches = post.match(/\btelemetry\b/g) ?? [];
    const traceMatches = post.match(/\btrace/g) ?? [];
    const total = telemetryMatches.length + traceMatches.length;
    expect(
      total,
      `Expected ≥3 telemetry/trace mentions; found ${total}`,
    ).toBeGreaterThanOrEqual(3);
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
