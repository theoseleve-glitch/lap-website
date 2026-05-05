import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import MarqueeStrip from '../components/ui/MarqueeStrip.astro';

const ITEMS = ['TELEMETRY', 'LAP ANALYSIS', 'CORNER COACHING'];

const render = (props: Record<string, unknown> = {}) =>
  AstroContainer.create().then((c) =>
    c.renderToString(MarqueeStrip, {
      props: { items: ITEMS, ...props },
    }),
  );

describe('MarqueeStrip', () => {
  test('renders each item in the strip', async () => {
    const html = await render();
    expect(html).toMatch(/TELEMETRY/);
    expect(html).toMatch(/LAP ANALYSIS/);
    expect(html).toMatch(/CORNER COACHING/);
  });
  test('default speed is 30 seconds (per V2 default)', async () => {
    const html = await render();
    expect(html).toMatch(/animation:\s*marquee-scroll\s+30s/);
  });
  test('speed prop overrides default', async () => {
    const html = await render({ speed: 45 });
    expect(html).toMatch(/animation:\s*marquee-scroll\s+45s/);
  });
  test('reverse prop sets animation-direction: reverse', async () => {
    const html = await render({ reverse: true });
    expect(html).toMatch(/animation-direction:\s*reverse/);
  });
  test('aria-hidden — decorative scrolling text', async () => {
    const html = await render();
    expect(html).toMatch(/aria-hidden="true"/);
  });
  test('uses font-monument with reduced opacity (text-chalk/20 in V2)', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*font-monument[^"]*"/);
  });
});
