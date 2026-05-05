import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import S2Versus from '../../components/rooms/S2Versus.astro';

const render = async () => (await AstroContainer.create()).renderToString(S2Versus);

describe('S2Versus room', () => {
  test('dual monument headline with gold second line', async () => {
    const html = await render();
    expect(html).toMatch(/They time laps/);
    expect(html).toMatch(/We coach drivers/);
    expect(html).toMatch(/text-pit-orange[^"]*"[^>]*>We coach drivers/);
  });

  test('two comparison cards: TIMING-FIRST + COACHING-FIRST', async () => {
    const html = await render();
    expect(html).toContain('TIMING-FIRST');
    expect(html).toContain('COACHING-FIRST');
  });

  test('three pillars below the comparison', async () => {
    const html = await render();
    expect(html).toContain('Know where you lose time');
    expect(html).toContain('Fix your braking and throttle');
    expect(html).toContain('Track your progression');
    const beam = html.match(/beam-card/g) ?? [];
    expect(beam.length).toBeGreaterThanOrEqual(4);
  });
});
