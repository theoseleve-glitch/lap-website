import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import PricingIncluded from '../components/PricingIncluded.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(PricingIncluded));

test('T059: renders the H2 "What\'s included"', async () => {
  // Sprint T059 names this section "What's included". Locking the
  // H2 verbatim keeps the heading from drifting to "Features" or
  // "The full product" — doctrine §8 is explicit that the tier IS
  // the full product; the H2 is an inventory, not a marketing
  // flourish.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*What(?:'|&#39;|&apos;|&rsquo;)s included[\s\S]*<\/h2>/);
});

test('T059: wraps the section in a <section> with aria-labelledby landmark', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('T059: renders exactly 12 checklist items', async () => {
  // The sprint brief says "12 bullets" and 01-STRATEGIC-DOCTRINE.md
  // §5 DOES list has exactly 12 shippable capabilities — the
  // checklist maps 1:1 so every bullet traces to a real doctrine
  // commitment rather than marketing filler. 11 or 13 means a
  // feature got dropped or invented.
  const html = await render();
  const liCount = (html.match(/<li[\s>]/g) ?? []).length;
  expect(liCount).toBe(12);
});

test('T059: names the full sim capture roster (iRacing + ACC)', async () => {
  // Doctrine §3 persona lists iRacing / ACC / ACE / rF2 / AMS2 /
  // LMU / Rennsport / F1. Locking the two most-recognised titles
  // (iRacing + ACC) in the checklist keeps the sim-breadth claim
  // honest — if the sim line silently collapses to "sim capture"
  // without naming titles, a prospective buyer can't self-qualify.
  const html = await render();
  expect(html).toMatch(/iRacing/);
  expect(html).toMatch(/\bACC\b/);
});

test('T059: names RaceBox for real-world capture', async () => {
  // Doctrine §3 secondary persona ("RaceBox owner or phone-capture
  // capable"); RaceBox is the real-world hardware partner. Must
  // appear in the checklist so track-day prospects confirm
  // compatibility in one scan.
  const html = await render();
  expect(html).toMatch(/RaceBox/);
});

test('T059: carries the sim↔real bridge claim', async () => {
  // ADR-005 §5.5 TransferLink lives in the DOES list. The bridge
  // is doctrine Bet #2 (cross-platform ecosystem moat) and must
  // appear in the paid-product inventory.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/sim[\s\S]?.?\s?real|bridge/);
});

test('T059: carries the rule-based coaching library (Bet #1 moat)', async () => {
  // 01-STRATEGIC-DOCTRINE.md §7 Bet #1: "Coaching library is a
  // moat. 80-150 rules written by us, curated, tested against
  // real sessions. Basic ML augments. No generative AI." Lock
  // "rule-based" vocabulary so the distinguishing feature stays
  // visible in the paid inventory.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/rule-based/);
});

test('T059: copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
