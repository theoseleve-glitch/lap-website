// T172 — contract test for the "Throttle Pickup: Smooth vs
// Aggressive" blog post draft. Second post in Batch 1 (T171-
// T180). Reuses the editorial pattern established at T171:
// single markdown file at docs/blog-posts/<slug>.md, draft
// excludes FAQ + JSON-LD (those land at batch level via T178/
// T179), 12-test contract enforcing word band + structural
// discipline + head-term keyword density + framework anchor +
// cross-pillar reach + cross-platform discipline + ADR-004 /
// Pillar 2/3/4 forbidden-vocab carry-over + blog-post-layer
// overclaim guardrail + filler-word budget.
//
// Topic-specific adaptations vs T171:
//   * Head term: "throttle pickup" (vs "T1/Turn 1")
//   * Physics anchor: traction (vs brake pressure) — the post
//     turns on the rear-axle traction circle, not the front-
//     axle weight-transfer story that T171 unpacks
//   * Cross-pillar reach: /blog/driver-development-plan + at
//     least one of the other three pillars

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const POST_PATH = join(
  process.cwd(),
  'docs',
  'blog-posts',
  'throttle-pickup-smooth-vs-aggressive.md',
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

describe('T172: Throttle Pickup — blog post draft', () => {
  test('post file exists at docs/blog-posts/throttle-pickup-smooth-vs-aggressive.md', async () => {
    expect(() => loadPost()).not.toThrow();
  });

  test('post word count is in the 1200-1900 band', async () => {
    // Coaching rule deep-dive scope, same band as T171.
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

  test('post names "throttle pickup" cumulatively (≥3 occurrences)', async () => {
    // Title head term. The post's SEO surface is "throttle
    // pickup smooth vs aggressive" — a draft that drifts to
    // generic "throttle application" or "exit phase" prose
    // is leaving the long-tail search anchor unspoken.
    const post = loadPost().toLowerCase();
    const matches = post.match(/throttle\s+pickup/g) ?? [];
    expect(
      matches.length,
      `Expected ≥3 "throttle pickup" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('post uses telemetry vocabulary (telemetry / trace) cumulatively (≥5)', async () => {
    // Same article-keyword anchor as T171. The post is a
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

  test('post anchors on the traction-circle physics (≥2 "traction" occurrences)', async () => {
    // Where T171 anchored on brake pressure (entry-phase weight
    // transfer to the front), T172 anchors on the rear-axle
    // traction circle (exit-phase weight transfer to the rear).
    // A post about throttle that does not name "traction" has
    // drifted to subjective advice about feel, not data.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\btraction\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥2 "traction" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post locates the physics on the rear axle (≥2 "rear" occurrences)', async () => {
    // Throttle pickup is fundamentally about the rear contact
    // patch / rear-tire grip. A post that does not say "rear"
    // is talking about throttle in the abstract, not about the
    // axle that carries the load on exit.
    const post = loadPost().toLowerCase();
    const matches = post.match(/\brear\b/g) ?? [];
    expect(
      matches.length,
      `Expected ≥2 "rear" mentions; found ${matches.length}`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('post references the framework (≥1 of the 5 verbs explicitly)', async () => {
    // Coaching rule deep-dives are worked examples of the
    // diagnose step. Same lock as T171.
    const post = loadPost().toLowerCase();
    const verbs = [/\bdiagnos/, /\bprescrib/, /\bexecut/, /\bmeasur/, /\badapt/];
    const matched = verbs.filter((v) => v.test(post)).length;
    expect(
      matched,
      `Expected ≥1 framework verb explicitly named; matched ${matched}`,
    ).toBeGreaterThanOrEqual(1);
  });

  test('post links to ≥2 sibling pillar articles (cluster reach)', async () => {
    // Same cluster-mesh discipline as T171. Throttle-pickup
    // naturally connects to /blog/driver-development-plan
    // (framework verbs) and /blog/sim-to-real-transfer (cross-
    // platform note). /blog/what-is-trail-braking is the entry-
    // phase cousin and is a likely third reference.
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
    // Same carry-over guardrail as T171.
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
    // Same layer guardrail as T171. The "smooth vs aggressive"
    // framing of T172 sits at extra risk for "the secret pros
    // use" overclaim because both shapes are valid in
    // different contexts — the temptation to imply one is the
    // "right" answer is exactly what the post argues against.
    const post = loadPost().toLowerCase();
    expect(post).not.toMatch(/\bguaranteed?\s+(faster|improvement|results?|pace)\b/);
    expect(post).not.toMatch(/\binstantly\s+(faster|improve|fix)\b/);
    expect(post).not.toMatch(/\bwhat\s+pros\s+(do|use|know)\b/);
    expect(post).not.toMatch(/\bone\s+weird\s+/);
    expect(post).not.toMatch(/\bunlock\s+your\s+(true\s+)?potential\b/);
  });

  test('post filler-word count is bounded (anti-fluff guardrail)', async () => {
    // Same lock as T171 + the pillar article-level tests.
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
