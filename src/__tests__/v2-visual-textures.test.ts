import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const TEXTURES_PATH = resolve(process.cwd(), 'src/styles/textures.css');

describe('V2 March textures — file exists at expected path', () => {
  test('src/styles/textures.css is present', () => {
    expect(existsSync(TEXTURES_PATH)).toBe(true);
  });
});

describe('V2 March textures — .texture-grain (lighter variant, decision 2b)', () => {
  if (!existsSync(TEXTURES_PATH)) {
    test.skip('skipped — textures.css missing', () => {});
    return;
  }
  const css = readFileSync(TEXTURES_PATH, 'utf8');

  test('declares .texture-grain', () => {
    expect(css).toMatch(/\.texture-grain\s*\{/);
  });
  test('uses var(--bg-radial-1), var(--bg-grid) for layered background', () => {
    expect(css).toMatch(
      /background-image\s*:\s*var\(--bg-radial-1\),\s*var\(--bg-grid\)/,
    );
  });
  test('background-size includes 56px 56px for the grid layer', () => {
    expect(css).toMatch(/background-size\s*:[^;]*56px\s+56px/);
  });
  test('LIGHTER variant — does NOT set background-attachment: fixed', () => {
    // The whole point of decision 2b. If anyone re-adds `fixed`, mobile
    // Safari paint regresses — this test is the canary.
    expect(css).not.toMatch(/background-attachment\s*:\s*fixed/);
  });
  test('LIGHTER variant — does NOT include SVG feTurbulence noise data URI', () => {
    // The other half of decision 2b. The verbatim V2 :after pseudo embeds
    // an SVG with `feTurbulence` for grain — we're skipping it.
    expect(css).not.toMatch(/feTurbulence/);
    expect(css).not.toMatch(/data:image\/svg\+xml.*fractalNoise/);
  });
  test('keeps the 3px repeating-linear-gradient scanlines via ::before', () => {
    expect(css).toMatch(/\.texture-grain::before/);
    expect(css).toMatch(/repeating-linear-gradient\(/);
    expect(css).toMatch(/transparent\s+3px/);
  });
});

describe('V2 March textures — .texture-dither + .texture-scanlines', () => {
  if (!existsSync(TEXTURES_PATH)) {
    test.skip('skipped — textures.css missing', () => {});
    return;
  }
  const css = readFileSync(TEXTURES_PATH, 'utf8');

  test('.texture-dither uses radial-gradient dot grid via ::after', () => {
    expect(css).toMatch(/\.texture-dither::after/);
    expect(css).toMatch(/radial-gradient\(circle/);
  });
  test('.texture-scanlines uses repeating-linear-gradient via ::after', () => {
    expect(css).toMatch(/\.texture-scanlines::after/);
    expect(css).toMatch(/repeating-linear-gradient\(/);
  });
});

describe('V2 March textures — wired into global.css', () => {
  test('global.css imports textures.css', () => {
    const globalCss = readFileSync(
      resolve(process.cwd(), 'src/styles/global.css'),
      'utf8',
    );
    expect(globalCss).toMatch(/@import\s+['"]\.\/textures\.css['"]/);
  });
});
