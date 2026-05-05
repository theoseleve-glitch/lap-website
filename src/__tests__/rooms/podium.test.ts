import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Podium from '../../components/rooms/Podium.astro';

const render = async () => (await AstroContainer.create()).renderToString(Podium);

describe('Podium room', () => {
  test('room + texture-grain + chequered eyebrow', async () => {
    const html = await render();
    expect(html).toMatch(/aria-label="Final CTA — checkered flag"/);
    expect(html).toMatch(/class="[^"]*\broom\b/);
    expect(html).toMatch(/class="[^"]*\btexture-grain\b/);
    expect(html).toMatch(/10 \/ PODIUM/);
  });

  test('shimmer monument headline', async () => {
    const html = await render();
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/<h2[^>]*class="[^"]*text-shimmer[^"]*"/);
    expect(html).toContain('Your driving deserves');
    expect(html).toContain('better than guesswork.');
  });

  test('gold CTA + price footer', async () => {
    const html = await render();
    expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"/);
    expect(html).toMatch(/Start free — try the demo dashboard/);
    expect(html).toMatch(/bg-pit-orange/);
    expect(html).toMatch(/€15 a month/);
    expect(html).toMatch(/€150 a year/);
  });
});
