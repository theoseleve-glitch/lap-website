import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Pipeline from '../../components/rooms/Pipeline.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(Pipeline);

describe('Pipeline · room 05 · acid-green', () => {
  test('section + sector wiring', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="pipeline"/);
    expect(html).toMatch(/data-accent="green"/);
  });

  test('eyebrow + dual headline', async () => {
    const html = await render();
    expect(html).toMatch(/05 \/ SECTOR 3/);
    expect(html).toMatch(/One system from raw session/);
    expect(html).toMatch(/to next-session action/);
  });

  test('renders 7 stations 01..07 (5 base + 2 premium absorbed)', async () => {
    const html = await render();
    for (const code of ['01', '02', '03', '04', '05', '06', '07']) {
      expect(html).toMatch(new RegExp(`data-station-code="${code}"`));
    }
  });

  test('horizontal scrub track marker present (M1)', async () => {
    const html = await render();
    expect(html).toMatch(/data-pin-horizontal-scrub/);
  });

  test('premium content from PremiumLayer absorbed at stations 06-07', async () => {
    const html = await render();
    // PROGRESSION INTELLIGENCE / UNLIMITED ANALYSIS were PremiumLayer
    expect(html).toMatch(/PROGRESSION/);
    expect(html).toMatch(/UNLIMITED/);
  });

  test('compressed body copy ≤ 130 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(130);
  });
});
