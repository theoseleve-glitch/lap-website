import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Versus from '../../components/rooms/Versus.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(Versus);

describe('Versus · room 04 · purple', () => {
  test('section + sector wiring', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="versus"/);
    expect(html).toMatch(/data-accent="purple"/);
  });

  test('dual headline · "We coach drivers." in racing-purple', async () => {
    const html = await render();
    expect(html).toMatch(/They time laps/);
    expect(html).toMatch(/We coach drivers/);
    expect(html).toMatch(/text-racing-purple[^"]*"[^>]*>\s*We coach drivers/);
  });

  test('two comparison panes · TIMING · COACHING', async () => {
    const html = await render();
    expect(html).toContain('TIMING');
    expect(html).toContain('COACHING');
    expect(html).toMatch(/data-pin-card-swap/);
  });

  test('absorbs SimFirst sim ↔ real bridge as a lateral panel', async () => {
    const html = await render();
    expect(html).toContain('SIM ↔ REAL');
    expect(html).toMatch(/data-bridge/);
  });

  test('compressed body copy ≤ 110 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(110);
  });
});
