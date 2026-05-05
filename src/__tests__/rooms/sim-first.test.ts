import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SimFirst from '../../components/rooms/SimFirst.astro';

const render = async () => (await AstroContainer.create()).renderToString(SimFirst);

describe('SimFirst room', () => {
  test('eyebrow + dual headline', async () => {
    const html = await render();
    expect(html).toMatch(/06 \/ SIM FIRST/);
    expect(html).toMatch(/Built for progression/);
    expect(html).toMatch(/Starting with sim racing/);
  });

  test('4 rationale cards', async () => {
    const html = await render();
    for (const t of [
      'FASTER ONBOARDING',
      'UNLIMITED REPETITION',
      'IDEAL FOR PROGRESSION',
      'SAME ANALYSIS ENGINE',
    ]) {
      expect(html).toContain(t);
    }
  });

  test('platforms split', async () => {
    const html = await render();
    expect(html).toContain('ACTIVE NOW');
    expect(html).toContain('EXPANDING NEXT');
    expect(html).toMatch(/iRacing/);
    expect(html).toMatch(/RaceBox/);
  });
});
