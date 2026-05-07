import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Garage from '../../components/rooms/Garage.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(Garage);

describe('Garage · room 06', () => {
  test('section + sector wiring · returns to gold', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="garage"/);
    expect(html).toMatch(/data-accent="orange"/);
  });

  test('eyebrow + headline + founder note', async () => {
    const html = await render();
    expect(html).toMatch(/06 \/ GARAGE/);
    expect(html).toMatch(/Built from real progression/);
    expect(html).toMatch(/I built LAP/);
  });

  test('three stats with data-tick-target', async () => {
    const html = await render();
    expect(html).toMatch(/data-tick-target="2000"/); // iRating
    expect(html).toMatch(/data-tick-target="12"/);   // Podium fights
    expect(html).toMatch(/data-tick-target="14"/);   // Pipeline stages
  });

  test('three reserved beta slots · no fabricated names', async () => {
    const html = await render();
    expect(html).toContain('CLEARER DEBRIEFS');
    expect(html).toContain('FASTER PROGRESS');
    expect(html).toContain('LESS GUESSWORK');
    expect(html).toMatch(/BETA SLOT/);
    expect(html).toMatch(/July 2026/);
    expect(html).not.toMatch(/— [A-Z][a-z]+ [A-Z][a-z]+/);
  });

  test('compressed body copy ≤ 140 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(140);
  });
});
