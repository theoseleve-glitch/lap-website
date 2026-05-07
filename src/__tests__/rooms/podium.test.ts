import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Podium from '../../components/rooms/Podium.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(Podium);

describe('Podium · room 07 · close + price', () => {
  test('section + sector wiring', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="podium"/);
    expect(html).toMatch(/data-accent="orange"/);
  });

  test('room + texture-grain final pin', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*\broom\b/);
    expect(html).toMatch(/class="[^"]*\btexture-grain\b/);
  });

  test('shimmer monument headline', async () => {
    const html = await render();
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/<h2[^>]*class="[^"]*text-shimmer[^"]*"/);
    expect(html).toContain('Your driving deserves');
  });

  test('absorbs PitStop pricing as a one-line teaser', async () => {
    const html = await render();
    expect(html).toMatch(/€15 \/ mo/);
    expect(html).toMatch(/€150 \/ yr/);
    expect(html).toMatch(/14-day/i);
  });

  test('single primary CTA · pit-orange-deep + asphalt · signup link · rel noopener', async () => {
    const html = await render();
    const ctaMatch = html.match(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]*>/);
    expect(ctaMatch).not.toBeNull();
    const cta = ctaMatch![0];
    expect(cta).toMatch(/rel="noopener"/);
    expect(cta).toMatch(/bg-pit-orange-deep/);
    expect(cta).toMatch(/text-asphalt/);
  });

  test('see full pricing link to /pricing', async () => {
    const html = await render();
    expect(html).toMatch(/<a[^>]+href="\/pricing"/);
  });

  test('compressed body copy ≤ 80 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(80);
  });
});
