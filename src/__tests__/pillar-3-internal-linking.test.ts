// T158 — internal-linking audit for Pillar 3. Outline §
// "Internal cross-links" defines a per-section link mandate
// for the article: each /product, /pricing, /blog, and
// /waitlist target lists the section(s) it must appear in.
//
// This test is the article-wide audit ensuring every mandated
// link lands in the right section. Without it, an editor
// removing a link in one section silently breaks the four-
// pillar cluster discipline; without per-section assertions,
// the link could appear ANYWHERE in the article and pass.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_DIR = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'telemetry-apps-comparison',
);

const loadSection = (name: string): string =>
  readFileSync(join(SECTION_DIR, `${name}.md`), 'utf8');

const linkRe = (target: string): RegExp =>
  new RegExp(`\\]\\(${target.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\)`);

describe('T158: Pillar 3 internal-linking audit', () => {
  test('§2 strengths cites /product (overview)', async () => {
    // Outline: /product overview → "the LAP five-pillar
    // surface" — §2 AND §6. §2 names what LAP does and is
    // the natural home for the five-pillar overview link.
    const section = loadSection('section-02-strengths');
    expect(section).toMatch(linkRe('/product'));
  });

  test('§2 strengths cites /product/desktop', async () => {
    // Outline: /product/desktop → "the desktop client" —
    // §2 (capture surface description naturally references
    // desktop client).
    const section = loadSection('section-02-strengths');
    expect(section).toMatch(linkRe('/product/desktop'));
  });

  test('§2 strengths cites /product/mobile', async () => {
    // Outline: /product/mobile → "the mobile app" — §2 AND
    // §5. §2 names LAP's capture surface; mobile is part of
    // the real-world capture stack (RaceBox + iPhone).
    const section = loadSection('section-02-strengths');
    expect(section).toMatch(linkRe('/product/mobile'));
  });

  test('§2 strengths cites /product/bridge', async () => {
    // Outline: /product/bridge → "the bridge" / "our cross-
    // platform unification" — §2 (LAP is the only entry that
    // does this) AND §5 (team coach persona). §2 must name
    // bridge because it is LAP's distinguishing capability.
    const section = loadSection('section-02-strengths');
    expect(section).toMatch(linkRe('/product/bridge'));
  });

  test('§2 strengths cites /product/coaching', async () => {
    const section = loadSection('section-02-strengths');
    expect(section).toMatch(linkRe('/product/coaching'));
  });

  test('§2 strengths cites /product/driver-profile', async () => {
    const section = loadSection('section-02-strengths');
    expect(section).toMatch(linkRe('/product/driver-profile'));
  });

  test('§4 pricing cites /pricing', async () => {
    const section = loadSection('section-04-pricing');
    expect(section).toMatch(linkRe('/pricing'));
  });

  test('§4 pricing cites /product/desktop (subscription scope)', async () => {
    // Outline: /product/desktop → §2 AND §4. The pricing row
    // for LAP must clarify that the subscription includes
    // the desktop client — desktop is what reader sees first
    // when buying.
    const section = loadSection('section-04-pricing');
    expect(section).toMatch(linkRe('/product/desktop'));
  });

  test('§5 personas cites /product/mobile', async () => {
    // Outline: /product/mobile → §2 AND §5 (track-day
    // driver). The track-day persona shopping argument
    // naturally references the mobile capture path.
    const section = loadSection('section-05-personas');
    expect(section).toMatch(linkRe('/product/mobile'));
  });

  test('§5 personas cites /product/bridge', async () => {
    const section = loadSection('section-05-personas');
    expect(section).toMatch(linkRe('/product/bridge'));
  });

  test('§5 personas cites /product/coaching', async () => {
    const section = loadSection('section-05-personas');
    expect(section).toMatch(linkRe('/product/coaching'));
  });

  test('§5 personas cites /product/driver-profile', async () => {
    const section = loadSection('section-05-personas');
    expect(section).toMatch(linkRe('/product/driver-profile'));
  });

  test('§5 personas cites /blog/sim-to-real-transfer (cross-pillar 1)', async () => {
    // Cross-pillar discipline: §5 references BOTH Pillar 1
    // (sim-to-real) AND Pillar 2 (trail braking), making the
    // four-pillar cluster a hub rather than four parallel
    // pages. Lock both.
    const section = loadSection('section-05-personas');
    expect(section).toMatch(linkRe('/blog/sim-to-real-transfer'));
  });

  test('§5 personas cites /blog/what-is-trail-braking (cross-pillar 2)', async () => {
    const section = loadSection('section-05-personas');
    expect(section).toMatch(linkRe('/blog/what-is-trail-braking'));
  });

  test('§6 limitations cites /product (verification path)', async () => {
    const section = loadSection('section-06-limitations');
    expect(section).toMatch(linkRe('/product'));
  });

  test('§7 conclusion cites /product (LAP five-pillar surface)', async () => {
    const section = loadSection('section-07-conclusion');
    expect(section).toMatch(linkRe('/product'));
  });

  test('§7 conclusion cites /blog/sim-to-real-transfer', async () => {
    const section = loadSection('section-07-conclusion');
    expect(section).toMatch(linkRe('/blog/sim-to-real-transfer'));
  });

  test('§7 conclusion cites /blog/what-is-trail-braking', async () => {
    const section = loadSection('section-07-conclusion');
    expect(section).toMatch(linkRe('/blog/what-is-trail-braking'));
  });

  test('§7 conclusion cites /waitlist (early-access CTA)', async () => {
    const section = loadSection('section-07-conclusion');
    expect(section).toMatch(linkRe('/waitlist'));
  });

  test('article-wide internal-link count meets outline minimum (≥10 distinct targets)', async () => {
    // Article-wide invariant: the outline mandates 10
    // distinct internal-link targets across the seven
    // sections. Lock the count so a future edit cannot
    // regress the cluster discipline by dropping all
    // references to one target.
    const sections = [
      'section-01-intro',
      'section-02-strengths',
      'section-03-limits',
      'section-04-pricing',
      'section-05-personas',
      'section-06-limitations',
      'section-07-conclusion',
    ];
    const allText = sections.map(loadSection).join('\n\n');
    const linkMatches = allText.match(/\]\((\/[a-z/-]+)\)/g) ?? [];
    const distinctTargets = new Set(
      linkMatches.map((m) => m.replace(/^\]\(/, '').replace(/\)$/, '')),
    );
    expect(
      distinctTargets.size,
      `Expected ≥10 distinct internal-link targets; found ${distinctTargets.size}: ${[...distinctTargets].join(', ')}`,
    ).toBeGreaterThanOrEqual(10);
  });
});
