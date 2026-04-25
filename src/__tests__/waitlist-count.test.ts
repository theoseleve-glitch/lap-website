// T102 — waitlist count component. Renders the social-proof anchor
// "N sim racers on the waitlist" only when N ≥ 100. Below that
// threshold a public number HURTS conversion (12 sounds desperate,
// 247 sounds like momentum), so the component renders nothing
// rather than rendering an honest-but-self-defeating low number.
//
// Count source: a prop, fed by the calling page from
// `import.meta.env.PUBLIC_WAITLIST_COUNT`. Updating the count is
// a manual env-edit + redeploy — lo-fi but doctrine-aligned (no
// live API call from a static page, no JS for analytics-grade
// social proof).

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import WaitlistCount from '../components/WaitlistCount.astro';

const renderWith = (count: number) =>
  AstroContainer.create().then((c) => c.renderToString(WaitlistCount, { props: { count } }));

describe('T102: WaitlistCount — below the 100 threshold', () => {
  test('count = 0 renders nothing', async () => {
    const html = await renderWith(0);
    expect(html.trim()).toBe('');
  });

  test('count = 50 renders nothing', async () => {
    const html = await renderWith(50);
    expect(html.trim()).toBe('');
  });

  test('count = 99 renders nothing (just-under-threshold)', async () => {
    const html = await renderWith(99);
    expect(html.trim()).toBe('');
  });

  test('negative count renders nothing (defensive)', async () => {
    const html = await renderWith(-1);
    expect(html.trim()).toBe('');
  });
});

describe('T102: WaitlistCount — at and above the 100 threshold', () => {
  test('count = 100 renders the number', async () => {
    // Threshold is INCLUSIVE — 100 is the first count that shows.
    const html = await renderWith(100);
    expect(html).toMatch(/100/);
  });

  test('count = 247 renders the number', async () => {
    // The example from the sprint task.
    const html = await renderWith(247);
    expect(html).toMatch(/247/);
  });

  test('count = 247 names "sim racers" (doctrine vocabulary)', async () => {
    // The audience descriptor matters — "sim racers" matches the
    // primary persona language in 01-STRATEGIC-DOCTRINE.md §3.
    // Generic "people" or "subscribers" would weaken the signal
    // (every newsletter has subscribers; the LAP waitlist has
    // sim racers specifically).
    const html = await renderWith(247);
    expect(html.toLowerCase()).toMatch(/sim racers/);
  });

  test('rendered output includes a "waitlist" or "waiting" anchor', async () => {
    // The number alone is ambiguous — "247 sim racers" could be
    // anything. The waitlist context anchors what the count is
    // counting.
    const html = await renderWith(247);
    expect(html.toLowerCase()).toMatch(/(waitlist|waiting)/);
  });
});

describe('T102: WaitlistCount — doctrine guardrail', () => {
  test('copy stays doctrine-aligned — no AI-coach / LLM / generative', async () => {
    const html = await renderWith(247);
    expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
    expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
    expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
  });
});
