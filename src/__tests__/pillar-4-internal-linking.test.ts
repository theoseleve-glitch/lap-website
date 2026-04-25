// T168 — internal-linking audit for Pillar 4. Outline §
// "Internal cross-links" defines a per-section link mandate:
// each /product, /pricing, /blog, and /waitlist target lists
// the section(s) it must appear in. This test is the
// article-wide audit ensuring every mandated link lands in
// the right section. Mirrors the T158 (Pillar 3) audit
// pattern.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const SECTION_DIR = join(
  process.cwd(),
  'docs',
  'pillar-articles',
  'driver-development-plan',
);

const loadSection = (name: string): string =>
  readFileSync(join(SECTION_DIR, `${name}.md`), 'utf8');

const linkRe = (target: string): RegExp =>
  new RegExp(`\\]\\(${target.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\)`);

describe('T168: Pillar 4 internal-linking audit', () => {
  test('§2 (what a plan is) cites /product/coaching', async () => {
    // Outline: /product/coaching → §2 + §3 + §5. §2 names
    // the prescription concept and is the first place the
    // coaching library is referenced.
    const section = loadSection('section-02-what-is');
    expect(section).toMatch(linkRe('/product/coaching'));
  });

  test('§3 (framework) cites /product/coaching (prescribe step)', async () => {
    const section = loadSection('section-03-framework');
    expect(section).toMatch(linkRe('/product/coaching'));
  });

  test('§3 (framework) cites /product/driver-profile (measure step)', async () => {
    const section = loadSection('section-03-framework');
    expect(section).toMatch(linkRe('/product/driver-profile'));
  });

  test('§3 (framework) cites /product/bridge (diagnose covers both surfaces)', async () => {
    // Outline: /product/bridge → §3 (diagnose covers sim AND
    // real-world) + §4 (cross-platform cadence). The §3
    // mandate ensures the diagnose-step paragraph names the
    // bridge as the cross-platform unification surface — a
    // diagnose step that addresses sim-only or real-only is
    // not the LAP-distinguishing cross-platform diagnose.
    const section = loadSection('section-03-framework');
    expect(section).toMatch(linkRe('/product/bridge'));
  });

  test('§3 (framework) cites /blog/what-is-trail-braking (cross-pillar 2)', async () => {
    const section = loadSection('section-03-framework');
    expect(section).toMatch(linkRe('/blog/what-is-trail-braking'));
  });

  test('§4 (cadences) cites /product/desktop (per-session live coaching)', async () => {
    const section = loadSection('section-04-cadences');
    expect(section).toMatch(linkRe('/product/desktop'));
  });

  test('§4 (cadences) cites /product/mobile (track-day execute path)', async () => {
    const section = loadSection('section-04-cadences');
    expect(section).toMatch(linkRe('/product/mobile'));
  });

  test('§4 (cadences) cites /product/bridge (cross-platform cadence)', async () => {
    const section = loadSection('section-04-cadences');
    expect(section).toMatch(linkRe('/product/bridge'));
  });

  test('§4 (cadences) cites /product/driver-profile (weekly review)', async () => {
    const section = loadSection('section-04-cadences');
    expect(section).toMatch(linkRe('/product/driver-profile'));
  });

  test('§4 (cadences) cites /blog/sim-to-real-transfer (cross-pillar 1)', async () => {
    const section = loadSection('section-04-cadences');
    expect(section).toMatch(linkRe('/blog/sim-to-real-transfer'));
  });

  test('§5 (LAP automation) cites /product (overview)', async () => {
    const section = loadSection('section-05-automation');
    expect(section).toMatch(linkRe('/product'));
  });

  test('§5 (LAP automation) cites /product/coaching', async () => {
    const section = loadSection('section-05-automation');
    expect(section).toMatch(linkRe('/product/coaching'));
  });

  test('§5 (LAP automation) cites /product/driver-profile', async () => {
    const section = loadSection('section-05-automation');
    expect(section).toMatch(linkRe('/product/driver-profile'));
  });

  test('§5 (LAP automation) cites /pricing', async () => {
    const section = loadSection('section-05-automation');
    expect(section).toMatch(linkRe('/pricing'));
  });

  test('§6 (DIY template) cites /blog/best-sim-racing-telemetry-app (cross-pillar 3)', async () => {
    const section = loadSection('section-06-diy-template');
    expect(section).toMatch(linkRe('/blog/best-sim-racing-telemetry-app'));
  });

  test('§7 (conclusion) cites /product (LAP five-pillar surface)', async () => {
    const section = loadSection('section-07-conclusion');
    expect(section).toMatch(linkRe('/product'));
  });

  test('§7 (conclusion) cites /blog/sim-to-real-transfer (Pillar 1)', async () => {
    const section = loadSection('section-07-conclusion');
    expect(section).toMatch(linkRe('/blog/sim-to-real-transfer'));
  });

  test('§7 (conclusion) cites /blog/what-is-trail-braking (Pillar 2)', async () => {
    const section = loadSection('section-07-conclusion');
    expect(section).toMatch(linkRe('/blog/what-is-trail-braking'));
  });

  test('§7 (conclusion) cites /blog/best-sim-racing-telemetry-app (Pillar 3)', async () => {
    const section = loadSection('section-07-conclusion');
    expect(section).toMatch(linkRe('/blog/best-sim-racing-telemetry-app'));
  });

  test('§7 (conclusion) cites /waitlist (early-access CTA)', async () => {
    const section = loadSection('section-07-conclusion');
    expect(section).toMatch(linkRe('/waitlist'));
  });

  test('article-wide internal-link count meets outline minimum (≥10 distinct targets)', async () => {
    const sections = [
      'section-01-intro',
      'section-02-what-is',
      'section-03-framework',
      'section-04-cadences',
      'section-05-automation',
      'section-06-diy-template',
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
