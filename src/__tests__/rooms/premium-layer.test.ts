import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import PremiumLayer from '../../components/rooms/PremiumLayer.astro';

const render = async () => (await AstroContainer.create()).renderToString(PremiumLayer);

describe('PremiumLayer room', () => {
  test('eyebrow + headline', async () => {
    const html = await render();
    expect(html).toMatch(/07 \/ PREMIUM LAYER/);
    expect(html).toMatch(/Premium unlocks the performance layer/);
  });

  test('6 features in 6 beam-cards', async () => {
    const html = await render();
    for (const f of [
      'DEEP CORNER ANALYSIS',
      'ADVANCED DRIVER PROFILING',
      'DYNAMIC RACE STRATEGY',
      'SETUP UNDERSTANDING',
      'PROGRESSION INTELLIGENCE',
      'UNLIMITED ANALYSIS',
    ]) {
      expect(html).toContain(f);
    }
    const beam = html.match(/beam-card/g) ?? [];
    expect(beam.length).toBe(6);
  });
});
