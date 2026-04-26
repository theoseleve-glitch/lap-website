// T082 — mobile responsive layout for /demo's video walkthrough.
//
// Sibling task to T080 (keyboard a11y gate, lap-website@6a97585):
// where T080 locks how the video is announced, T082 locks how it
// scales. Both ship as forward-looking contract gates against
// /demo so when T074's iframe drops in, both contracts hold without
// extra test work.
//
// Two gates today, both meaningful:
//
//   1. Placeholder container shape is locked. DemoWalkthrough.astro
//      ships `w-full aspect-[16/9]` on the 16:9 placeholder div so
//      the responsive footprint is stable now and inheritable when
//      T074 swaps the iframe in. The gate asserts both classes co-
//      exist on the same element so a future edit can't accidentally
//      remove either.
//
//   2. No fixed-pixel width inside the walkthrough section. Mobile-
//      full-width requires a fluid container; classes like
//      `w-[800px]` or `width="800"` would break the contract. The
//      gate sweeps the rendered walkthrough section for any
//      fixed-pixel width signal and fails if one appears.
//
// Plus a forward-looking iframe/video gate that mirrors T080's
// pattern: any <video>/<iframe> on /demo must declare its own
// full-width signal (w-full / width="100%" / inline style) so the
// scaling guarantee survives even if the iframe accidentally lands
// outside the responsive container.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Demo from '../pages/demo.astro';

const render = (): Promise<string> =>
  AstroContainer.create().then((c) => c.renderToString(Demo));

function isFullWidth(tag: string): boolean {
  return (
    /\bw-full\b/.test(tag) ||
    /\swidth=["']100%["']/.test(tag) ||
    /\sstyle=["'][^"']*width\s*:\s*100%/.test(tag)
  );
}

describe('T082: /demo placeholder container shape (responsive today)', () => {
  test('walkthrough container has both w-full and aspect-[16/9] on the same element', async () => {
    // Lock the responsive footprint that the iframe will inherit
    // when T074 swaps it into DemoWalkthrough.astro. Both classes
    // must co-exist on the SAME div so the responsive guarantee
    // does not depend on parent-child class composition.
    const html = await render();
    const containerMatch = html.match(/<div[^>]*\baspect-\[16\/9\][^>]*>/);
    expect(
      containerMatch,
      'walkthrough container with aspect-[16/9] must exist on /demo',
    ).toBeTruthy();
    expect(
      containerMatch![0],
      `walkthrough container must also be w-full; got: ${containerMatch![0]}`,
    ).toMatch(/\bw-full\b/);
  });

  test('walkthrough section uses no fixed-pixel width inside it', async () => {
    const html = await render();
    const sectionMatch = html.match(
      /<section[^>]*aria-labelledby=["']demo-walkthrough-heading["'][\s\S]*?<\/section>/,
    );
    expect(
      sectionMatch,
      'walkthrough <section aria-labelledby="demo-walkthrough-heading"> must exist',
    ).toBeTruthy();
    if (sectionMatch) {
      // No Tailwind w-[NNNpx] arbitrary fixed-pixel widths
      expect(sectionMatch[0]).not.toMatch(/\bw-\[\d+px\]/);
      // No HTML width="NNN" attribute (numeric pixel width)
      expect(sectionMatch[0]).not.toMatch(/\swidth=["']\d+["']/);
      // No inline style width: NNNpx
      expect(sectionMatch[0]).not.toMatch(/\bwidth\s*:\s*\d+px/);
    }
  });
});

describe('T082: forward-looking gate for the actual video element', () => {
  test('every <video> or <iframe> on /demo declares full-width responsive', async () => {
    const html = await render();
    const tags = [...html.matchAll(/<(?:video|iframe)\b[^>]*>/gi)].map((m) => m[0]);
    for (const tag of tags) {
      expect(
        isFullWidth(tag),
        `video/iframe must declare full-width (w-full / width="100%" / style="width:100%"): ${tag}`,
      ).toBe(true);
    }
  });
});

describe('T082: detection logic self-test (synthetic markup)', () => {
  // Without these, the iframe gate above passes vacuously until
  // T074 lands an iframe. The synthetic-markup tests prove that
  // isFullWidth() actually fails on the violation patterns the
  // gate is meant to catch — so the silence today is "no violation
  // detected" rather than "no detection performed".

  test('isFullWidth detects w-full Tailwind class', () => {
    expect(isFullWidth('<iframe class="w-full" src="..."></iframe>')).toBe(true);
    expect(isFullWidth('<iframe class="aspect-video w-full" src="..."></iframe>')).toBe(true);
    expect(isFullWidth('<video class="w-full" controls></video>')).toBe(true);
  });

  test('isFullWidth detects HTML width="100%" attribute', () => {
    expect(isFullWidth('<iframe width="100%" src="..."></iframe>')).toBe(true);
    expect(isFullWidth('<video width="100%" controls></video>')).toBe(true);
  });

  test('isFullWidth detects inline style width:100%', () => {
    expect(
      isFullWidth('<iframe style="width: 100%; height: auto" src="..."></iframe>'),
    ).toBe(true);
    expect(isFullWidth('<iframe style="width:100%" src="..."></iframe>')).toBe(true);
  });

  test('isFullWidth flags fixed-pixel widths', () => {
    expect(isFullWidth('<iframe width="800" src="..."></iframe>')).toBe(false);
    expect(isFullWidth('<iframe class="w-[800px]" src="..."></iframe>')).toBe(false);
    expect(isFullWidth('<iframe style="width: 800px" src="..."></iframe>')).toBe(false);
  });

  test('isFullWidth flags class-less / unstyled iframe', () => {
    expect(isFullWidth('<iframe src="..."></iframe>')).toBe(false);
    expect(isFullWidth('<video controls></video>')).toBe(false);
  });

  test('isFullWidth flags w-[NNNpx] arbitrary class but accepts w-full', () => {
    expect(isFullWidth('<iframe class="aspect-video w-[600px]" src="..."></iframe>')).toBe(false);
    expect(isFullWidth('<iframe class="aspect-video w-full" src="..."></iframe>')).toBe(true);
  });
});
