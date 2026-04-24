import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Hero from '../components/Hero.astro';

const SAMPLE_PROPS = {
  headline: 'Every lap, one step better.',
  subhead: 'The Driver OS for serious sim racers.',
  primaryCta: { text: 'Start 14-day trial', href: 'https://app.lap-coach.racing/signup' },
  secondaryCta: { text: 'See how it works', href: '/how-it-works' },
};

const render = (props: typeof SAMPLE_PROPS = SAMPLE_PROPS) =>
  AstroContainer.create().then((c) => c.renderToString(Hero, { props }));

test('renders the headline as the primary H1 landmark', async () => {
  const html = await render();
  expect(html).toMatch(/<h1[^>]*>[\s\S]*Every lap, one step better\.[\s\S]*<\/h1>/);
});

test('renders the subhead below the headline', async () => {
  const html = await render();
  const h1Index = html.search(/<h1/);
  const subheadIndex = html.indexOf('The Driver OS for serious sim racers.');
  expect(h1Index).toBeGreaterThan(-1);
  expect(subheadIndex).toBeGreaterThan(h1Index);
});

test('renders the primary CTA as a link with the given href and text', async () => {
  const html = await render();
  expect(html).toMatch(
    /<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]*>[\s\S]*Start 14-day trial[\s\S]*<\/a>/,
  );
});

test('renders the secondary CTA as a link with the given href and text', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/how-it-works"[^>]*>[\s\S]*See how it works[\s\S]*<\/a>/);
});

test('wraps its content in a <section> landmark', async () => {
  const html = await render();
  expect(html).toMatch(/<section[\s>]/);
});

test('uses the display font-family on the headline', async () => {
  const html = await render();
  // The design-token utility from T002 lets future visual refinement (T027)
  // find the headline without restructuring markup.
  expect(html).toMatch(/<h1[^>]*class="[^"]*font-display[^"]*"/);
});

test('CTA copy stays doctrine-aligned — no AI-coach / LLM claims', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
});

test('tags the headline, subhead, and CTA row with data-hero-animate for T027 motion', async () => {
  // The motion module (src/scripts/hero-motion.ts) animates any element
  // with data-hero-animate. Losing any of these attributes would silently
  // break the staggered entrance — lock them at the markup layer so a
  // class refactor can't drift away from the choreography.
  const html = await render();
  expect(html).toMatch(/<h1[^>]*\sdata-hero-animate(\s|>)/);
  expect(html).toMatch(/<p[^>]*\sdata-hero-animate(\s|>)/);
  expect(html).toMatch(/<div[^>]*\sdata-hero-animate(\s|>)/);
});

test('T028 exposes a named "visual" slot for the hero visual', async () => {
  // Slot composition lets the caller drop DriverProfilePreview (or a
  // future alternative visual) into the hero without rewriting Hero.
  const container = await AstroContainer.create();
  const html = await container.renderToString(Hero, {
    props: SAMPLE_PROPS,
    slots: { visual: '<aside data-test-visual>placeholder visual</aside>' },
  });
  expect(html).toContain('<aside data-test-visual>');
  expect(html).toContain('placeholder visual');
});

test('T028 visual slot is wrapped in a data-hero-animate container', async () => {
  // The wrapper carries the stagger attribute so whatever visual the
  // caller passes joins the T027 entrance animation; we also want the
  // wrapper to exist even when no slot content is passed so layout
  // doesn't shift if a page toggles the visual on/off.
  const html = await render();
  expect(html).toMatch(/<div[^>]*\sdata-hero-animate[^>]*>\s*(<slot|<)/);
});
