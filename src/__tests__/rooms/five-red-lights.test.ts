import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import FiveRedLights from '../../components/rooms/FiveRedLights.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(FiveRedLights);

describe('FiveRedLights press-and-hold gate', () => {
  test('renders the gate root, status slot, and HOLD button', async () => {
    const html = await render();
    expect(html).toMatch(/data-five-red-lights/);
    expect(html).toMatch(/data-start-lights/);
    expect(html).toMatch(/data-status[^>]+aria-live="polite"/);
    expect(html).toMatch(/<button[^>]*\sdata-hold(?:\s|>)/);
    expect(html).toMatch(/data-hold-label[^>]*>\s*HOLD\s*<\/span>/);
  });

  test('renders all five start lights, all unlit at idle', async () => {
    const html = await render();
    for (const n of [1, 2, 3, 4, 5]) {
      expect(html).toMatch(new RegExp(`data-light="${n}"[^>]+data-lit="false"`));
    }
  });

  test('idle prompt invites press-and-hold and explains the win condition', async () => {
    const html = await render();
    expect(html).toMatch(/PRESS\s*&(?:amp;|)\s*HOLD\s*TO\s*BEGIN/);
    expect(html).toMatch(/Release after all five lights to launch/);
  });

  test('HOLD button is gold pit-orange and labels its purpose', async () => {
    const html = await render();
    const ctaMatch = html.match(/<button[^>]*\sdata-hold[^>]*>[\s\S]*?<\/button>/);
    expect(ctaMatch).not.toBeNull();
    const cta = ctaMatch![0];
    expect(cta).toMatch(/bg-pit-orange/);
    expect(cta).toMatch(/aria-label="Press and hold to start the lights-out sequence"/);
  });
});
