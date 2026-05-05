import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SessionProof from '../../components/rooms/SessionProof.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(SessionProof);

describe('SessionProof room', () => {
  test('eyebrow + headline + 3 beam-cards', async () => {
    const html = await render();
    expect(html).toMatch(/02 \/ SESSION CARDS/);
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/Every session ends with a clear next step/);
    const beam = html.match(/beam-card/g) ?? [];
    expect(beam.length).toBeGreaterThanOrEqual(3);
  });

  test('three card labels in font-telemetry text-pit-orange', async () => {
    const html = await render();
    expect(html).toContain('YOUR SCORE');
    expect(html).toContain('YOUR DEBRIEF');
    expect(html).toContain('YOUR PROGRESSION');
  });

  test('debrief card uses semantic colour mapping', async () => {
    const html = await render();
    expect(html).toMatch(/text-safety-red/);
    expect(html).toMatch(/text-acid-green/);
  });

  test('no AI/LLM language', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
  });
});
