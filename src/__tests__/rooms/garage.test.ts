import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Garage from '../../components/rooms/Garage.astro';

const render = async () => (await AstroContainer.create()).renderToString(Garage);

describe('Garage room', () => {
  test('eyebrow + headline + founder panel', async () => {
    const html = await render();
    expect(html).toMatch(/08 \/ GARAGE/);
    expect(html).toMatch(/Built from real progression/);
    expect(html).toMatch(/I built LAP because/);
  });

  test('three stats labels', async () => {
    const html = await render();
    expect(html).toContain('IRATING GAINED');
    expect(html).toContain('PODIUM FIGHTS');
    expect(html).toContain('STAGE PIPELINE');
  });

  test('three testimonial slots reserved for July beta', async () => {
    const html = await render();
    expect(html).toContain('CLEARER DEBRIEFS');
    expect(html).toContain('FASTER PROGRESS');
    expect(html).toContain('LESS GUESSWORK');
    expect(html).toMatch(/BETA SLOT/);
    expect(html).toMatch(/July 2026/);
  });

  test('no fabricated testimonials with real names', async () => {
    const html = await render();
    expect(html).not.toMatch(/— [A-Z][a-z]+ [A-Z][a-z]+/);
  });

  test('no AI/LLM language', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
  });
});
