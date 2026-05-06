import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import HeroManifest from '../../components/rooms/HeroManifest.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(HeroManifest);

describe('HeroManifest (post-entrance manifest)', () => {
  test('section is the [data-after-hero] scroll target', async () => {
    const html = await render();
    expect(html).toMatch(/<section[^>]*\sdata-after-hero(?:\s|>)/);
    expect(html).toMatch(/aria-label="What LAP is"/);
  });

  test('renders the SIM-RACING early-access badge', async () => {
    const html = await render();
    expect(html).toContain('SIM-RACING EARLY ACCESS NOW OPEN');
    expect(html).toMatch(/border-pit-orange\/30/);
  });

  test('renders the doctrine-locked T024 subhead verbatim', async () => {
    const html = await render();
    expect(html).toContain(
      'The cross-platform Driver OS that turns every sim and real-world session into measurable progress.',
    );
  });

  test('renders both T025 and T026 CTAs with correct hrefs and rel rules', async () => {
    const html = await render();
    expect(html).toMatch(
      /<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"[^>]*>[\s\S]*Start 14-day trial[\s\S]*<\/a>/,
    );
    expect(html).toMatch(
      /<a[^>]+href="\/how-it-works"[^>]*>[\s\S]*See how it works[\s\S]*<\/a>/,
    );
    expect(html).not.toMatch(/<a[^>]+href="\/how-it-works"[^>]+rel="noopener"/);
  });

  test('primary CTA is gold pit-orange', async () => {
    const html = await render();
    expect(html).toMatch(/bg-pit-orange/);
  });
});
