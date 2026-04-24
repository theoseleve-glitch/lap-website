import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import NotForYouIf from '../components/NotForYouIf.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(NotForYouIf));

test('renders the section heading "Not for you if" in an <h2>', async () => {
  // Sprint T033 names the section "Not for you if". The heading is the
  // trust-building contract: four specific cases where LAP is the wrong
  // purchase. The ellipsis in the rendered copy invites the bullets to
  // complete the sentence; the test matches the stem so either "Not for
  // you if." or "Not for you if…" is acceptable.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Not for you if[\s\S]*<\/h2>/);
});

test('wraps the section in a <section> with aria-labelledby pointing to the heading id', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('renders exactly four anti-persona bullets in a <ul>', async () => {
  // Four bullets map one-to-one to the four anti-personas in
  // 01-STRATEGIC-DOCTRINE.md §3: racing team engineers, drivers with a
  // dedicated human coach, sponsored semi-pro programmes, and one-
  // session-a-month casuals. Collapsing any of them silently widens
  // the target audience and breaks the "honest disclosure" contract.
  const html = await render();
  expect(html).toMatch(/<ul[\s>]/);
  const liMatches = html.match(/<li[\s>]/g) ?? [];
  expect(liMatches.length).toBe(4);
});

test('names the racing-engineer anti-persona and defers to MoTeC', async () => {
  // Doctrine §3: "Professional racing team engineers → MoTeC exists."
  // The "keep MoTeC" phrase is the same non-displacement clause used
  // in T032 — locking it here ensures both sections agree on the
  // trust line regardless of future copy edits.
  const html = await render();
  expect(html).toMatch(/keep MoTeC/);
});

test('names the dedicated-human-coach anti-persona', async () => {
  // Doctrine §3: "Pro drivers with dedicated coaches → we are not
  // trying to replace Driver61." The public copy generalises to "a
  // dedicated coach" (no naming a competitor) but the anti-persona
  // must still land — /\bcoach\b/ is the anchor.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/\bcoach\b/);
});

test('names the one-session-a-month low-retention anti-persona', async () => {
  // Doctrine §3: "Casual 'one session a month' phone users → wrong
  // retention profile." The pattern LAP needs a dozen sessions to
  // learn from; disclosing this on the homepage is honest and
  // pre-filters the wrong buyer. Locked verbatim at the HTML surface.
  const html = await render();
  expect(html.toLowerCase()).toMatch(/one session a month/);
});

test('copy stays doctrine-aligned — no AI-coach / LLM / generative framing', async () => {
  // Note: the word "coach" appears as a legitimate noun in the
  // human-coach bullet ("dedicated human coach" / "keep the coach").
  // The forbidden token is the phrase "AI coach" with its own word
  // boundaries — \bai coach\b will not trigger on "human coach".
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
