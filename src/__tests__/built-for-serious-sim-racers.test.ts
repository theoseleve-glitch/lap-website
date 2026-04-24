import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import BuiltForSeriousSimRacers from '../components/BuiltForSeriousSimRacers.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(BuiltForSeriousSimRacers));

test('renders the section heading "Built for serious sim racers" in an <h2>', async () => {
  // T031 locks this exact heading. The "serious sim racer" framing is
  // lifted verbatim from 01-STRATEGIC-DOCTRINE.md §3 ("Primary: The
  // Serious Sim Racer") and is what this whole section has to earn —
  // any drift to a weaker ("sim fans", "racing drivers") framing would
  // silently widen the persona and dilute the pitch.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Built for serious sim racers[\s\S]*<\/h2>/);
});

test('wraps the section in a <section> with aria-labelledby pointing to the heading id', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('renders a <ul> with exactly five <li> persona-fit bullets', async () => {
  // Five bullets map to the five persona attributes in doctrine §3:
  // session frequency, competitive tier, multi-sim identity, prior
  // tool fatigue, practice-plan mindset. Anything less and a facet
  // disappears; anything more and the list stops scanning.
  const html = await render();
  expect(html).toMatch(/<ul[\s>]/);
  const liMatches = html.match(/<li[\s>]/g) ?? [];
  expect(liMatches.length).toBe(5);
});

test('copy names iRacing and ACC (the cross-sim identity signal)', async () => {
  // Doctrine §3 names iRacing / ACC / ACE / rF2 / AMS2 / LMU /
  // Rennsport / F1. Locking at least the two most-played titles
  // (iRacing + ACC) keeps the cross-sim claim intact — if the section
  // silently narrows to a single title, this fails.
  const html = await render();
  expect(html).toMatch(/iRacing/);
  expect(html).toMatch(/\bACC\b/);
});

test('copy carries the "what should I practice" framing (not "what does my lap look like")', async () => {
  // Doctrine §3 bullet: "Wants to know what to practice this week, not
  // what a turn-by-turn lap report looks like." This is THE persona
  // differentiator vs a MoTeC-style analyzer. Lock the verb.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\bpractice\b/);
});

test('copy stays doctrine-aligned — no AI-coach / LLM / generative framing', async () => {
  // 01-STRATEGIC-DOCTRINE.md §10 bullet 4 forbids LLM coaching text.
  // Persona-fit sections are especially prone to "AI that coaches you"
  // drift — lock the negatives at the HTML surface.
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
