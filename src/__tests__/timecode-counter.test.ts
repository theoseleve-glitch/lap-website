import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import TimecodeCounter from '../components/chrome/TimecodeCounter.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(TimecodeCounter);

describe('TimecodeCounter · 3-field', () => {
  test('renders <aside aria-hidden="true">', async () => {
    const html = await render();
    expect(html).toMatch(/<aside[^>]*\saria-hidden="true"/);
  });

  test('renders all three time fields', async () => {
    const html = await render();
    expect(html).toMatch(/data-tc-sector/);
    expect(html).toMatch(/data-tc-utc/);
    expect(html).toMatch(/data-tc-elapsed/);
    expect(html).toMatch(/data-tc-delta/);
  });

  test('renders data-timecode-counter root element', async () => {
    const html = await render();
    expect(html).toMatch(/data-timecode-counter/);
  });

  test('renders sector field with opening marker', async () => {
    const html = await render();
    expect(html).toMatch(/▸ SECTOR/);
  });

  test('renders UTC and page-elapsed time fields', async () => {
    const html = await render();
    expect(html).toMatch(/UTC/);
    expect(html).toMatch(/PAGE/);
  });
});
