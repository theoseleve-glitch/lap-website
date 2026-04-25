// T113 — /product/mobile page contract. The second per-pillar
// product page after /product/desktop. Sub-tasks T114-T116 layer
// the Google Play badge, RaceBox detail, and Wear OS section onto
// this base; T113's job is the doctrine-aligned narrative shell
// for the two named areas (real-life capture + Android).
//
// Doctrine note: Android-launch-only is real per §9 (Android in
// M2, iOS in M5/V1). The page must explicitly disclose iOS-not-
// yet so an iOS-only racer does not waste a trial signup —
// mirrors the macOS anti-persona disclosure on /product/desktop.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Mobile from '../pages/product/mobile.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Mobile));

test('T113: /product/mobile renders a single <main> landmark', async () => {
  const html = await render();
  const mainMatches = html.match(/<main[\s>]/g) ?? [];
  expect(mainMatches.length).toBe(1);
});

test('T113: H1 names the mobile product surface', async () => {
  const html = await render();
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  expect(h1Match).not.toBeNull();
  expect(h1Match![1].toLowerCase()).toMatch(/mobile/);
});

test('T113: title carries "LAP" (BaseLayout integration)', async () => {
  const html = await render();
  expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
});

test('T113: page names the real-world track-day use case (the mobile purpose)', async () => {
  // The cross-platform claim splits desktop = sim, mobile =
  // real-world. If the mobile page does not name the real-world
  // track-day use case, the cross-platform pitch silently
  // collapses. Lock at least one anchor word so a future copy
  // edit cannot quietly genericise to "captures sessions".
  const html = await render();
  const lower = html.toLowerCase();
  expect(lower).toMatch(/(real-world|real world|track day|track-day)/);
});

test('T113: page names Android as the launch platform', async () => {
  // Doctrine §9: Android in M2 (closed beta), iOS in M5 (V1).
  // Pre-launch the only mobile platform shipping is Android, so
  // a mobile page that says "iOS and Android" or just "mobile"
  // overclaims. Lock the Android anchor explicitly.
  const html = await render();
  expect(html).toMatch(/Android/);
});

test('T113: page discloses iOS posture (not yet shipped, anti-persona)', async () => {
  // Same anti-persona pattern as the macOS disclosure on
  // /product/desktop. An iOS-only racer reading the mobile page
  // should know within a scan that their hardware is not
  // supported today.
  const html = await render();
  expect(html).toMatch(/iOS|iPhone|Apple/);
});

test('T113: page names phone GPS as the entry capture path', async () => {
  // Phone GPS is the "free, you already have it" on-ramp. Naming
  // it explicitly tells track-day visitors that the app works
  // out of the box without buying additional hardware.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/(phone gps|phone's gps|phone gnss|gps)/);
});

test('T113: page has a back-link to the /product overview', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/product"/);
});

test('T113: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

// Helper for T115: extract the RaceBox section by aria-labelledby.
// Locking section-scoped content (not page-wide) means a future
// edit that strips the dedicated section but leaves the keyword
// somewhere in prose still fails the structural contract.
function extractRaceBoxSection(html: string): string {
  const match = html.match(
    /<section[^>]+aria-labelledby="[^"]*racebox[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
  );
  return match ? match[1] : '';
}

test('T115: page has a dedicated RaceBox integration section', async () => {
  // T113 brief-mentioned RaceBox in the capture section; T115
  // expands it to its own aria-labelled section so the
  // hardware-tier ladder (phone GPS → RaceBox → ...) is visible
  // at a scan instead of buried in prose. Same anchored-section
  // pattern as supported-sims and system-requirements on /product/
  // desktop.
  const html = await render();
  expect(html).toMatch(/<section[^>]+aria-labelledby="[^"]*racebox/i);
});

test('T115: RaceBox section heading names "RaceBox"', async () => {
  // Locked at the section level (not page-wide) — a brief inline
  // mention in another section satisfies "page has RaceBox" but
  // not "the section's heading is about RaceBox".
  const html = await render();
  const section = extractRaceBoxSection(html);
  expect(section).not.toBe('');
  expect(section).toMatch(/RaceBox/);
});

test('T115: RaceBox section names the sample-rate advantage (25Hz / Hz / GNSS)', async () => {
  // Naming the actual technical spec inside the RaceBox section
  // lets track-day drivers evaluate "real data" vs "phone-grade".
  // Vagueness ("better accuracy") fails the comparison test —
  // drivers are sceptical of marketing-grade promises about GPS.
  const html = await render();
  const section = extractRaceBoxSection(html);
  expect(section.toLowerCase()).toMatch(/(25\s*hz|10\s*hz|gnss|sample rate)/);
});

test('T115: RaceBox section names bluetooth as the connection method', async () => {
  // The setup question every visitor asks: "how does it pair?".
  // Bluetooth is the answer; locked inside the RaceBox section
  // so a future edit that drops the connection method (and leaves
  // the visitor wondering whether they need a USB cable) fails.
  const html = await render();
  const section = extractRaceBoxSection(html);
  expect(section.toLowerCase()).toMatch(/bluetooth/);
});
