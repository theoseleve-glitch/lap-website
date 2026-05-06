import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import StartGrid from '../../components/rooms/StartGrid.astro';

const render = async () => {
  const container = await AstroContainer.create();
  return container.renderToString(StartGrid);
};

describe('StartGrid entrance room', () => {
  test('full-viewport section landmark with V2 March identity', async () => {
    const html = await render();
    expect(html).toMatch(/<section[^>]*aria-label="Start grid — what is LAP"/);
    expect(html).toMatch(/class="[^"]*\broom\b[^"]*"/);
    expect(html).toMatch(/class="[^"]*\btexture-grain\b[^"]*"/);
    expect(html).toMatch(/class="[^"]*\bmin-h-screen\b/);
  });

  test('telemetry eyebrow + monument shimmer headline (doctrine copy)', async () => {
    const html = await render();
    expect(html).toMatch(/01 \/ START GRID/);
    expect(html).toMatch(/<h1[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/<h1[^>]*class="[^"]*text-shimmer[^"]*"/);
    expect(html).toMatch(/<h1[^>]*class="[^"]*font-display[^"]*"/);
    expect(html).toContain('Every lap, one step better.');
  });

  test('embeds FiveRedLights press-and-hold gate', async () => {
    const html = await render();
    expect(html).toMatch(/data-five-red-lights/);
    expect(html).toMatch(/data-hold/);
    for (const n of [1, 2, 3, 4, 5]) {
      expect(html).toMatch(new RegExp(`data-light="${n}"`));
    }
  });

  test('hero-motion stagger attributes preserved', async () => {
    const html = await render();
    expect(html).toMatch(/data-hero-animate/);
  });

  test('no AI/LLM language', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
    expect(html).not.toMatch(/\bgenerative\b/);
  });

  test('no doctrine subhead — that copy lives in HeroManifest now', async () => {
    const html = await render();
    expect(html).not.toContain('cross-platform Driver OS');
  });

  test('no CTAs in the entrance — they live in HeroManifest', async () => {
    const html = await render();
    expect(html).not.toMatch(/href="https:\/\/app\.lap-coach\.racing\/signup"/);
    expect(html).not.toMatch(/href="\/how-it-works"/);
  });
});
