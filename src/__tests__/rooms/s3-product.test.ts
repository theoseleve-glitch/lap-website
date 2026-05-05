import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import S3Product from '../../components/rooms/S3Product.astro';

const render = async () => (await AstroContainer.create()).renderToString(S3Product);

describe('S3Product room', () => {
  test('eyebrow + dual monument headline', async () => {
    const html = await render();
    expect(html).toMatch(/05 \/ SECTOR 3/);
    expect(html).toMatch(/One system from raw session/);
    expect(html).toMatch(/to next-session action/);
  });

  test('7 stages 01..07', async () => {
    const html = await render();
    for (const stage of [
      '01 / LOG',
      '02 / PROCESS',
      '03 / ANALYZE',
      '04 / SCORE',
      '05 / TRACK',
      '06 / STRATEGIZE',
      '07 / PREPARE',
    ]) {
      expect(html).toContain(stage);
    }
  });

  test('beam-card tiles for each stage', async () => {
    const html = await render();
    const beam = html.match(/beam-card/g) ?? [];
    expect(beam.length).toBeGreaterThanOrEqual(7);
  });
});
