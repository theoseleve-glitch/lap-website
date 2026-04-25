// T142 — contract test for Pillar 2 Section 2 ("physics of trail
// braking"). Sprint task numbering calls this Section 1; outline
// numbering calls it Section 2 because of the unnumbered intro
// (matches T132 / Pillar 1 Section 2 convention).
//
// The article's foundational section. Reader should leave
// understanding *why* trail braking works (weight transfer +
// friction circle), not just *what* it is. Without this physics
// floor, the rest of the article reads as procedural advice
// without rationale; with it, the mistake-list (T143) and
// detection (T144) inherit a principled vocabulary.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_PATH = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'trail-braking',
  'section-02-physics.md',
);

const loadSection = (): string => readFileSync(SECTION_PATH, 'utf8');

const wordCount = (text: string): number =>
  text
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;

describe('T142: Pillar 2 Section 2 — physics of trail braking', () => {
  test('word count is in the 360-540 band (±20% of 450 outline target)', async () => {
    const section = loadSection();
    const wc = wordCount(section);
    expect(wc).toBeGreaterThanOrEqual(360);
    expect(wc).toBeLessThanOrEqual(540);
  });

  test('names the foundational physics concept "weight transfer"', async () => {
    // The single most important physics anchor for the section.
    // Trail braking only works because of weight transfer to the
    // front axle; a draft that elides this concept has lost the
    // physics floor.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/weight\s+transfer/);
  });

  test('names the "contact patch" concept', async () => {
    // The mechanism by which weight transfer translates into
    // grip. A draft that names weight transfer but not contact
    // patch has dropped half the explanation — readers leave
    // knowing "load goes forward" without knowing why it makes
    // the corner work.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/contact\s+patch/);
  });

  test('names the "friction circle" — the trade-off mechanism', async () => {
    // The friction circle is the article's grip-budget framing.
    // Without it, the section can claim trail braking is "good"
    // but cannot explain why over-doing it (lock-up, lateral
    // grip exhaustion) breaks. Lock the concept at the
    // section-1-physics level so T143 can lean on it.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/friction\s+circle/);
  });

  test('uses the term "trail brak" repeatedly (article title verb)', async () => {
    // Article title verb. Pillar 1 had this same lock with
    // "transfer". A section that uses "this technique" instead
    // of "trail braking" loses the SEO anchor.
    const section = loadSection().toLowerCase();
    const matches = section.match(/trail\s*brak/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  test('makes the cross-platform claim — physics is the same on sim and real', async () => {
    // The article's bigger argument is that trail braking
    // transfers cleanly between sim and real. Section 2 lays
    // the physics floor for that — same physics on both
    // surfaces. Lock at least one of: "sim", "real" plus an
    // explicit cross-platform / both / either framing.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(/sim\b/);
    expect(section).toMatch(/real\b/);
  });

  test('is honest about when trail braking is NOT the right call', async () => {
    // Outline §2 brief: "trail braking is not always the right
    // technique. Big-stop hairpins (Sebring T17) and second-gear
    // chicanes are often better with more brake released
    // earlier." Lock the honest-framing — Pillar 1 carried this
    // discipline (paired honesty), Pillar 2 inherits it.
    //
    // Match: a phrase signalling counterexample or limit.
    const section = loadSection().toLowerCase();
    expect(section).toMatch(
      /(not always|isn't always|isn.t always|every corner|sometimes|exception|wrong technique)/,
    );
  });

  test('forbidden vocab — no AI-coach / LLM / generative / neural / "realistic"', async () => {
    // ADR-004 ban on coaching-AI overclaims. Pillar 2 outline
    // extends this with "magic", "secret", "trick" — all the
    // ways a physics-explainer section can slip into marketing
    // voice. Lock all of them at this section level so the
    // article-level test (analogous to T137) inherits a clean
    // base.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bai coach\b/);
    expect(section).not.toMatch(/\bllm\b/);
    expect(section).not.toMatch(/\bgenerative\b/);
    expect(section).not.toMatch(/\bneural\b/);
    expect(section).not.toMatch(/\brealistic\b/);
  });

  test('forbidden marketing vocab — no "magic" / "secret" / "trick"', async () => {
    // Pillar 2 outline forbidden-vocab extension. Trail braking
    // is a technique with explainable physics — calling it
    // magic/secret/trick is exactly the rhetorical drift the
    // article's whole pitch refutes. Lock against the slip.
    const section = loadSection().toLowerCase();
    expect(section).not.toMatch(/\bmagic\b/);
    expect(section).not.toMatch(/\bsecret\b/);
    // "trick" in "track-day driver" or similar word would not
    // match here because we use \b word boundaries.
    expect(section).not.toMatch(/\btrick\b/);
  });
});
