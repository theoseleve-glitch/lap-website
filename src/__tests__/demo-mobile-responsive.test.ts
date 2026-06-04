// T082 — mobile responsive layout for /demo's walkthrough media slot.
//
// Sibling task to T080 (keyboard a11y gate): where T080 locks how the
// walkthrough media is announced, T082 locks how it scales. Both ship
// as forward-looking contract gates against /demo so when the real
// walkthrough video drops into the reserved 16:9 slot, both contracts
// hold without extra test work.
//
// The June-8 rebuild replaced the bespoke DemoWalkthrough.astro with a
// shared PlaceholderMedia.astro component. PlaceholderMedia renders a
// <figure> whose aspect ratio is locked via an inline
// `style="aspect-ratio:<ratio>"` (not a Tailwind `aspect-[16/9]`
// class) and whose width is the block-level default (full width of its
// parent — no `w-full` class, no fixed pixel width). The 16:9 instance
// on /demo is the reserved walkthrough slot the real video inherits.
//
// Two gates today, both meaningful:
//
//   1. Placeholder container shape is locked. The reserved walkthrough
//      slot is a <figure style="aspect-ratio:16/9"> so its responsive
//      footprint is stable now and inheritable when the real media
//      swaps in with zero layout shift. The gate asserts the 16:9
//      aspect-ratio is declared on the element AND that the element
//      carries no fixed-pixel width override, so a future edit can't
//      silently break the fluid full-width footprint.
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
// scaling guarantee survives even if the real media accidentally
// lands outside the responsive container.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Demo from '../pages/demo.astro';

const render = (): Promise<string> => AstroContainer.create().then((c) => c.renderToString(Demo));

function isFullWidth(tag: string): boolean {
  return (
    /\bw-full\b/.test(tag) ||
    /\swidth=["']100%["']/.test(tag) ||
    /\sstyle=["'][^"']*width\s*:\s*100%/.test(tag)
  );
}

describe('T082: /demo placeholder container shape (responsive today)', () => {
  test('reserved 16:9 walkthrough slot declares aspect-ratio and is fluid full-width', async () => {
    // Lock the responsive footprint that the real walkthrough video
    // will inherit when it swaps into the reserved slot. The slot is a
    // PlaceholderMedia <figure> whose 16:9 ratio is declared inline via
    // `style="aspect-ratio:16/9"`. A block-level <figure> with no
    // fixed-pixel width is full-width by default, so the responsive
    // guarantee does not depend on parent-child class composition and
    // survives the media swap with zero layout shift.
    const html = await render();
    const containerMatch = html.match(
      /<figure[^>]*style=["'][^"']*aspect-ratio:\s*16\/9[^"']*["'][^>]*>/,
    );
    expect(
      containerMatch,
      'reserved walkthrough container <figure style="aspect-ratio:16/9"> must exist on /demo',
    ).toBeTruthy();
    // Fluid full-width contract: the slot must not pin itself to a
    // fixed pixel width via a Tailwind arbitrary class, an HTML width
    // attribute, or an inline width:NNNpx — any of these would break
    // mobile full-width scaling.
    const tag = containerMatch![0];
    expect(tag, `walkthrough container must not use w-[NNNpx]; got: ${tag}`).not.toMatch(
      /\bw-\[\d+px\]/,
    );
    expect(tag, `walkthrough container must not set width="NNN"; got: ${tag}`).not.toMatch(
      /\swidth=["']\d+["']/,
    );
    expect(tag, `walkthrough container must not set width:NNNpx; got: ${tag}`).not.toMatch(
      /\bwidth\s*:\s*\d+px/,
    );
  });

  test('walkthrough section uses no fixed-pixel width inside it', async () => {
    const html = await render();
    // The walkthrough <section> no longer carries aria-labelledby; the
    // June-8 rebuild identifies it by its "The walkthrough" <h2>.
    // Anchor on that heading and capture the enclosing <section>.
    // <section> tags don't nest, so the next </section> closes it.
    const sectionMatch = html.match(
      /<section[^>]*>(?:(?!<\/section>)[\s\S])*?<h2[^>]*>\s*The walkthrough\s*<\/h2>[\s\S]*?<\/section>/,
    );
    expect(
      sectionMatch,
      'walkthrough <section> (containing the "The walkthrough" heading) must exist',
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
    expect(isFullWidth('<iframe style="width: 100%; height: auto" src="..."></iframe>')).toBe(true);
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
