import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import S1Pain from '../../components/rooms/S1Pain.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(S1Pain);

describe('S1Pain room', () => {
  test('eyebrow + headline + 2-card layout', async () => {
    const html = await render();
    expect(html).toMatch(/03 \/ SECTOR 1/);
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/Stop stacking tools/);
    expect(html).toContain('THE TYPICAL DRIVER STACK');
    expect(html).toContain('THE LAP ECOSYSTEM');
  });

  test('lap card uses beam-card, INCLUDED tags', async () => {
    const html = await render();
    expect(html).toMatch(/beam-card/);
    expect(html).toMatch(/INCLUDED/);
    expect(html).toMatch(/text-acid-green/);
  });

  test('typical-stack footer + lap-stack footer', async () => {
    const html = await render();
    expect(html).toContain('6 tools, 6 logins, no connection');
    expect(html).toContain('One ecosystem. Everything connected.');
  });
});
