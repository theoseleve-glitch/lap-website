import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HowItWorksCapture from '../components/HowItWorksCapture.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(HowItWorksCapture));

test('T045: renders the section H2 "Capture every session, sim or real"', async () => {
  // The H2 is the first of four section headings (T045-T048) that
  // each correspond to one step in the T043 hero's four-step loop.
  // "sim or real" in the H2 mirrors the doctrine's §3 primary
  // persona framing ("every sim and real-world session").
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Capture every session, sim or real[\s\S]*<\/h2>/);
});

test('T045: wraps the section in a <section> with aria-labelledby landmark', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T045: renders two sub-beats with h3s labelled "Desktop" and "Mobile"', async () => {
  // The two capture surfaces per 01-STRATEGIC-DOCTRINE.md §5:
  // desktop captures sim sessions, mobile captures real-world
  // sessions. Locking both H3s prevents either surface from being
  // silently removed in a later refactor (which would collapse the
  // cross-platform claim the whole product rests on).
  const html = await render();
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Desktop[\s\S]*<\/h3>/);
  expect(html).toMatch(/<h3[^>]*>[\s\S]*Mobile[\s\S]*<\/h3>/);
  const h3Count = (html.match(/<h3[\s>]/g) ?? []).length;
  expect(h3Count).toBe(2);
});

test('T045: names at least two sim titles on desktop (iRacing + ACC)', async () => {
  // Doctrine §3 persona lists iRacing / ACC / ACE / rF2 / AMS2 /
  // LMU / Rennsport / F1. The two highest-recognition titles for
  // the primary persona are iRacing and ACC; these must stay in
  // the desktop beat so a reader confirms "my sim is supported"
  // in one scan.
  const html = await render();
  expect(html).toMatch(/iRacing/);
  expect(html).toMatch(/\bACC\b/);
});

test('T045: names RaceBox for real-world capture', async () => {
  // Doctrine §3 secondary persona: "RaceBox owner or phone-capture
  // capable." RaceBox is the primary real-world capture partner;
  // naming it in the Mobile beat is what signals "this is a serious
  // logger, not a phone-gyro toy" to the track-day audience.
  const html = await render();
  expect(html).toMatch(/RaceBox/);
});

test('T045: carries the offline-first framing (principle 5)', async () => {
  // 01-STRATEGIC-DOCTRINE.md §4 principle 5: "Offline-first on
  // capture. Cloud-first on intelligence." Capture must keep working
  // with zero network — critical for track days where LTE is
  // unreliable. Lock "offline" vocabulary so this commitment
  // doesn't silently drift.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\boffline\b/);
});

test('T045: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
