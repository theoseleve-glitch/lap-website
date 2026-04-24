import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import SocialProof from '../components/SocialProof.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(SocialProof));

test('renders the honest-placeholder H2 "No testimonials until the beta opens"', async () => {
  // T035 ships as a SCAFFOLD per the sprint brief — public beta is
  // 2026-07-23 (01-STRATEGIC-DOCTRINE.md §9), so no real beta-user
  // quotes exist yet. Doctrine §10 bullet 4 makes trust the
  // differentiator, which rules out inventing placeholder testimonials.
  // The honest H2 is the commitment: the section stays empty in a
  // visible, explained way until real quotes land.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*No testimonials until the beta opens[\s\S]*<\/h2>/);
});

test('wraps the section in a <section> with aria-labelledby pointing to the heading id', async () => {
  const html = await render();
  const sectionMatch = html.match(/<section[^>]+aria-labelledby="([^"]+)"/);
  expect(sectionMatch).not.toBeNull();
  const headingId = sectionMatch![1];
  expect(html).toMatch(new RegExp(`<h2[^>]+id="${headingId}"[^>]*>`));
});

test('renders exactly three reserved-slot <li> placeholders under a <ul>', async () => {
  // Three slots scaffold the future layout (sized for a classic
  // 3-up testimonial grid) so swapping placeholders for real quotes
  // is a drop-in change when the beta opens. Any other count means
  // the scaffold does not match the target visual.
  const html = await render();
  expect(html).toMatch(/<ul[\s>]/);
  const liMatches = html.match(/<li[\s>]/g) ?? [];
  expect(liMatches.length).toBe(3);
});

test('each placeholder slot is explicitly labelled "Reserved"', async () => {
  // The "Reserved" label is the trust signal — it tells a reader the
  // slot is INTENTIONALLY empty, not broken markup. Count must be 3
  // (one per slot) so a future edit that sneaks in three fake quotes
  // without dropping the label fails here.
  const html = await render();
  const reservedMatches = html.match(/Reserved/g) ?? [];
  expect(reservedMatches.length).toBe(3);
});

test('lead paragraph names the July 2026 public-beta date', async () => {
  // 01-STRATEGIC-DOCTRINE.md §9 launch calendar: public beta is
  // 2026-07-23. Naming the date concretizes the "until when" of the
  // placeholder posture — an open-ended "coming soon" would read as
  // vaporware. Locked at the HTML surface.
  const html = await render();
  expect(html).toMatch(/July 2026/);
});

test('copy stays doctrine-aligned — no AI-coach / LLM / generative framing', async () => {
  // Belt-and-braces: a section that apologises for not inventing
  // quotes must not drift into "we'll have AI-generated testimonials
  // soon" either. ADR-004 §4 principle 4 / doctrine §10 bullet 4.
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});
