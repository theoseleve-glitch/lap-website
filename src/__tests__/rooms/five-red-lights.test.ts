import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import FiveRedLights from '../../components/rooms/FiveRedLights.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(FiveRedLights);

describe('FiveRedLights reaction game', () => {
  test('renders the figure root with the reaction-game aria label', async () => {
    const html = await render();
    expect(html).toMatch(/data-five-red-lights/);
    expect(html).toMatch(/aria-label="Reaction-time game/);
    expect(html).toMatch(/REACTION TEST · F1 START/);
  });

  test('renders all five start lights with [data-lit="false"] in idle state', async () => {
    const html = await render();
    for (const n of [1, 2, 3, 4, 5]) {
      expect(html).toMatch(new RegExp(`data-light="${n}"[^>]+data-lit="false"`));
    }
  });

  test('renders the gold tap button + status + result/best slots', async () => {
    const html = await render();
    expect(html).toMatch(/data-tap[^>]*>[\s\S]*?data-tap-label/);
    expect(html).toMatch(/data-status[^>]+aria-live="polite"/);
    expect(html).toMatch(/data-result[^>]*>/);
    expect(html).toMatch(/data-best[^>]*>/);
    expect(html).toMatch(/bg-pit-orange/);
  });

  test('exposes the F1 driver / average benchmark line', async () => {
    const html = await render();
    expect(html).toMatch(/F1 driver:.*200 ms/);
    expect(html).toMatch(/Average:.*250 ms/);
  });
});
