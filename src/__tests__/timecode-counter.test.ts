import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import TimecodeCounter from '../components/chrome/TimecodeCounter.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(TimecodeCounter, {}));

describe('TimecodeCounter', () => {
  test('renders a <time> element (semantic HTML for clock)', async () => {
    const html = await render();
    expect(html).toMatch(/<time/);
  });
  test('uses font-telemetry class (mono + uppercase + wide tracking from Phase 1)', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*font-telemetry[^"]*"/);
  });
  test('positions fixed at the bottom (uses bottom-0 or fixed positioning)', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*fixed[^"]*"/);
  });
  test('aria-hidden — decorative; the live-clock is not a screen-reader landmark', async () => {
    const html = await render();
    expect(html).toMatch(/aria-hidden="true"/);
  });
  test('inline script tag is present to drive the live update (client-side only)', async () => {
    const html = await render();
    expect(html).toMatch(/<script/);
  });
});
