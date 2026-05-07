import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import StartGrid from '../../components/rooms/StartGrid.astro';

const render = async () => {
  const container = await AstroContainer.create();
  return container.renderToString(StartGrid);
};

describe('StartGrid · entrance with absorbed manifest', () => {
  test('section landmark + sector id + magnetic zone', async () => {
    const html = await render();
    expect(html).toMatch(/<section[^>]*aria-label="Start grid — what is LAP"/);
    expect(html).toMatch(/data-sector-id="start-grid"/);
    expect(html).toMatch(/data-accent="orange"/);
    expect(html).toMatch(/data-magnetic-zone/);
  });

  test('telemetry eyebrow + monument shimmer headline (T023)', async () => {
    const html = await render();
    expect(html).toMatch(/01 \/ START GRID/);
    expect(html).toMatch(/<h1[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/<h1[^>]*class="[^"]*text-shimmer[^"]*"/);
    expect(html).toContain('Every lap, one step better.');
  });

  test('embeds FiveRedLights press-and-hold gate', async () => {
    const html = await render();
    expect(html).toMatch(/data-five-red-lights/);
    for (const n of [1, 2, 3, 4, 5]) {
      expect(html).toMatch(new RegExp(`data-light="${n}"`));
    }
  });

  test('absorbs SIM-RACING badge from HeroManifest', async () => {
    const html = await render();
    expect(html).toContain('SIM-RACING EARLY ACCESS NOW OPEN');
  });

  test('absorbs T024 subhead from HeroManifest', async () => {
    const html = await render();
    expect(html).toContain(
      'The cross-platform Driver OS that turns every sim and real-world session into measurable progress.',
    );
  });

  test('absorbs T025 + T026 CTAs', async () => {
    const html = await render();
    expect(html).toMatch(
      /<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"[^>]*>[\s\S]*Start 14-day trial/,
    );
    expect(html).toMatch(/<a[^>]+href="\/how-it-works"[^>]*>[\s\S]*See how it works/);
    expect(html).not.toMatch(/<a[^>]+href="\/how-it-works"[^>]+rel="noopener"/);
  });

  test('primary CTA uses the AA-compliant pit-orange-deep + asphalt pairing', async () => {
    const html = await render();
    // The primary CTA links to signup. We narrow to that anchor and assert both
    // tokens are present together — bg alone is insufficient (text-chalk on gold
    // would pass `bg-pit-orange-deep` but FAIL WCAG AA at 2.5:1).
    const primaryMatch = html.match(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]*>/);
    expect(primaryMatch).not.toBeNull();
    const primary = primaryMatch![0];
    expect(primary).toMatch(/bg-pit-orange-deep/);
    expect(primary).toMatch(/text-asphalt/);
  });

  test('cinematic stagger preserved via data-hero-animate', async () => {
    const html = await render();
    expect(html).toMatch(/data-hero-animate/);
  });

  test('compressed body copy ≤ 80 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(80);
  });

  test('no AI/LLM language', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
    expect(html).not.toMatch(/\bgenerative\b/);
  });
});
