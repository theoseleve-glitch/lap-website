import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SectorRibbon from '../../components/chrome/SectorRibbon.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(SectorRibbon);

describe('SectorRibbon', () => {
  test('renders <nav aria-hidden="true"> as root', async () => {
    const html = await render();
    expect(html).toMatch(/<nav[^>]*\saria-hidden="true"/);
  });

  test('renders 7 segments with codes 01..07', async () => {
    const html = await render();
    for (const code of ['01', '02', '03', '04', '05', '06', '07']) {
      expect(html).toMatch(new RegExp(`data-segment-code="${code}"`));
    }
  });

  test('each segment carries data-accent matching SECTORS', async () => {
    const html = await render();
    for (const accent of ['orange', 'red', 'steel', 'purple', 'green']) {
      expect(html).toMatch(new RegExp(`data-accent="${accent}"`));
    }
  });

  test('segments display name in font-telemetry caps', async () => {
    const html = await render();
    expect(html).toContain('START GRID');
    expect(html).toContain('VERSUS');
    expect(html).toContain('PODIUM');
    expect(html).toMatch(/class="[^"]*font-telemetry/);
  });

  test('inline script attaches sector-progress listener', async () => {
    const html = await render();
    expect(html).toContain("addEventListener('sector-change'");
  });
});
