import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import StartGrid from '../../components/rooms/StartGrid.astro';

const render = async () => {
  const container = await AstroContainer.create();
  return container.renderToString(StartGrid);
};

describe('StartGrid room', () => {
  test('full-room section landmark with V2 March identity', async () => {
    const html = await render();
    expect(html).toMatch(/<section[^>]*aria-label="Start grid — what is LAP"/);
    expect(html).toMatch(/class="[^"]*\broom\b[^"]*"/);
    expect(html).toMatch(/class="[^"]*\btexture-grain\b[^"]*"/);
  });

  test('telemetry eyebrow + monument headline + shimmer + doctrine copy', async () => {
    const html = await render();
    expect(html).toMatch(/font-telemetry[^"]*"[^>]*>\s*01 \/ START GRID/);
    expect(html).toMatch(/<h1[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/<h1[^>]*class="[^"]*text-shimmer[^"]*"/);
    expect(html).toContain('Every lap, one step better.');
    expect(html).toContain(
      'The cross-platform Driver OS that turns every sim and real-world session into measurable progress.',
    );
  });

  test('SIM-RACING badge', async () => {
    const html = await render();
    expect(html).toContain('SIM-RACING EARLY ACCESS NOW OPEN');
    expect(html).toMatch(/border-pit-orange\/30/);
  });

  test('hero-twin CTAs with gold primary and same-origin secondary', async () => {
    const html = await render();
    expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"/);
    expect(html).toMatch(/Start 14-day trial/);
    expect(html).toMatch(/<a[^>]+href="\/how-it-works"/);
    expect(html).toMatch(/See how it works/);
    expect(html).toMatch(/bg-pit-orange/);
    expect(html).not.toMatch(/<a[^>]+href="\/how-it-works"[^>]+rel="noopener"/);
  });

  test('embeds FiveRedLights reaction-time game in the right rail', async () => {
    const html = await render();
    expect(html).toMatch(/data-five-red-lights/);
    expect(html).toMatch(/REACTION TEST · F1 START/);
    expect(html).toMatch(/aria-label="Reaction-time game/);
    // Five lights are present
    for (const n of [1, 2, 3, 4, 5]) {
      expect(html).toMatch(new RegExp(`data-light="${n}"`));
    }
    // CTA button is the gold tap surface
    expect(html).toMatch(/data-tap[^>]*>/);
    expect(html).toMatch(/bg-pit-orange/);
  });

  test('no AI/LLM language', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
    expect(html).not.toMatch(/\bgenerative\b/);
  });

  test('hero-motion stagger attributes preserved', async () => {
    const html = await render();
    expect(html).toMatch(/data-hero-animate/);
  });
});
