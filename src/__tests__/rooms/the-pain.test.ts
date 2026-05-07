import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import ThePain from '../../components/rooms/ThePain.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(ThePain);

describe('ThePain · room 03', () => {
  test('section + sector wiring', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="the-pain"/);
    expect(html).toMatch(/data-accent="steel"/);
  });

  test('eyebrow uses steel and codes 03', async () => {
    const html = await render();
    expect(html).toMatch(/03 \/ SECTOR 1/);
    expect(html).toMatch(/text-steel/);
  });

  test('monument headline still reads "Stop stacking tools."', async () => {
    const html = await render();
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/Stop stacking tools/);
  });

  test('no marshal-yellow accent class survives anywhere in the room', async () => {
    const html = await render();
    expect(html).not.toMatch(/marshal-yellow/);
  });

  test('cross-fade pin marker present (M1)', async () => {
    const html = await render();
    expect(html).toMatch(/data-pin-cross-fade/);
  });

  test('compressed body copy ≤ 80 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(80);
  });
});
