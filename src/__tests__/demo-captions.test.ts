// T087 — captions + subtitles for /demo's video walkthrough.
//
// Sibling gate to T080 (keyboard a11y at lap-website@6a97585) and
// T082 (mobile responsive at lap-website@953b64e). Captions satisfy
// WCAG 2.1 SC 1.2.2 (Captions, Prerecorded) — required for hearing-
// impaired viewers to access the demo content. Two paths covered:
//
//   1. HTML5 <video> path  — captions ride as <track kind="captions">
//                            or <track kind="subtitles"> child
//                            elements with a valid src attribute
//                            pointing to a WebVTT file.
//
//   2. YouTube iframe path — the actual caption text is uploaded to
//                            YouTube alongside the video (T074's
//                            territory; the "uploaded" deliverable
//                            lives on the platform). The site-side
//                            iframe URL must include
//                            cc_load_policy=1 so captions auto-
//                            display rather than requiring the
//                            visitor to click the CC button.
//
// Today both gates pass vacuously (no <video> or <iframe> on /demo
// — DemoWalkthrough is a 16:9 placeholder labelled "Reserved" until
// T074 lands the actual walkthrough alongside public-beta launch).
// The self-test block uses synthetic markup to prove the detection
// logic catches violations — so when T074 lands, the gate enforces
// the contract instead of silently passing.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Demo from '../pages/demo.astro';

const render = (): Promise<string> =>
  AstroContainer.create().then((c) => c.renderToString(Demo));

interface CheckResult {
  readonly ok: boolean;
  readonly reason?: string;
}

function checkHtml5VideoHasTrack(videoBlock: string): CheckResult {
  // Input is the entire <video>...</video> block. Look for a
  // <track kind="captions"> or <track kind="subtitles"> child
  // with a valid src attribute.
  const trackMatch = videoBlock.match(
    /<track\b[^>]*\bkind=["'](captions|subtitles)["'][^>]*>/i,
  );
  if (!trackMatch) {
    return {
      ok: false,
      reason: '<video> missing <track kind="captions"|"subtitles"> child',
    };
  }
  if (!/\ssrc=["'][^"']+["']/.test(trackMatch[0])) {
    return { ok: false, reason: '<track> missing src attribute' };
  }
  return { ok: true };
}

function checkYouTubeIframeCaptions(tag: string): CheckResult {
  if (!/<iframe\b/i.test(tag)) return { ok: true };
  const srcMatch = tag.match(/\ssrc=["']([^"']+)["']/);
  if (!srcMatch) return { ok: true };
  const src = srcMatch[1];
  // Only enforce on YouTube embeds; Vimeo and other platforms
  // have their own caption-control mechanisms (e.g., Vimeo's
  // texttrack URL parameter or the Player JS API).
  const isYouTube = /\b(youtube\.com|youtube-nocookie\.com)\b/.test(src);
  if (!isYouTube) return { ok: true };
  // \b after =1 is a word boundary — distinguishes =1 (followed by
  // & or end) from =10 (digit-to-digit, no boundary).
  if (!/[?&]cc_load_policy=1\b/.test(src)) {
    return {
      ok: false,
      reason: 'YouTube iframe missing cc_load_policy=1 (auto-show captions)',
    };
  }
  return { ok: true };
}

describe('T087: forward-looking gate for /demo video captions', () => {
  test('every HTML5 <video> block on /demo has a <track kind="captions"|"subtitles"> child', async () => {
    const html = await render();
    const videoBlocks = [...html.matchAll(/<video\b[^>]*>([\s\S]*?)<\/video>/gi)].map(
      (m) => m[0],
    );
    for (const block of videoBlocks) {
      const check = checkHtml5VideoHasTrack(block);
      expect(check.ok, `${check.reason}: ${block.substring(0, 200)}...`).toBe(true);
    }
  });

  test('every YouTube iframe on /demo includes cc_load_policy=1 in its src URL', async () => {
    const html = await render();
    const iframes = [...html.matchAll(/<iframe\b[^>]*>/gi)].map((m) => m[0]);
    for (const tag of iframes) {
      const check = checkYouTubeIframeCaptions(tag);
      expect(check.ok, `${check.reason}: ${tag}`).toBe(true);
    }
  });
});

describe('T087: detection logic self-test (synthetic markup)', () => {
  // Without these self-tests the gates above pass vacuously today
  // (no video element on /demo yet). The synthetic-markup tests
  // verify the helpers actually fail on the violation patterns the
  // gates are meant to catch — so the silence today is "no
  // violation detected" rather than "no detection performed".

  test('checkHtml5VideoHasTrack flags <video> without any <track> child', () => {
    expect(
      checkHtml5VideoHasTrack(
        '<video controls><source src="walkthrough.mp4"></video>',
      ).ok,
    ).toBe(false);
  });

  test('checkHtml5VideoHasTrack passes <video> with kind="captions" track', () => {
    expect(
      checkHtml5VideoHasTrack(
        '<video controls><source src="walkthrough.mp4"><track kind="captions" src="walkthrough.vtt" srclang="en"></video>',
      ).ok,
    ).toBe(true);
  });

  test('checkHtml5VideoHasTrack passes <video> with kind="subtitles" track', () => {
    expect(
      checkHtml5VideoHasTrack(
        '<video controls><track kind="subtitles" src="walkthrough.vtt"></video>',
      ).ok,
    ).toBe(true);
  });

  test('checkHtml5VideoHasTrack flags <track> without src attribute', () => {
    expect(
      checkHtml5VideoHasTrack(
        '<video controls><track kind="captions" srclang="en"></video>',
      ).ok,
    ).toBe(false);
  });

  test('checkHtml5VideoHasTrack flags <track> with non-captions kind (e.g., metadata)', () => {
    expect(
      checkHtml5VideoHasTrack(
        '<video controls><track kind="metadata" src="x.vtt"></video>',
      ).ok,
    ).toBe(false);
  });

  test('checkYouTubeIframeCaptions flags YouTube iframe missing cc_load_policy', () => {
    expect(
      checkYouTubeIframeCaptions(
        '<iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe>',
      ).ok,
    ).toBe(false);
    expect(
      checkYouTubeIframeCaptions(
        '<iframe src="https://www.youtube-nocookie.com/embed/abc?rel=0"></iframe>',
      ).ok,
    ).toBe(false);
  });

  test('checkYouTubeIframeCaptions passes YouTube iframe with cc_load_policy=1', () => {
    expect(
      checkYouTubeIframeCaptions(
        '<iframe src="https://www.youtube-nocookie.com/embed/abc?cc_load_policy=1"></iframe>',
      ).ok,
    ).toBe(true);
    expect(
      checkYouTubeIframeCaptions(
        '<iframe src="https://www.youtube-nocookie.com/embed/abc?rel=0&cc_load_policy=1"></iframe>',
      ).ok,
    ).toBe(true);
    expect(
      checkYouTubeIframeCaptions(
        '<iframe src="https://www.youtube.com/embed/abc?cc_load_policy=1&rel=0"></iframe>',
      ).ok,
    ).toBe(true);
  });

  test('checkYouTubeIframeCaptions correctly distinguishes =1 from =10 via word boundary', () => {
    // \b after =1 fails on =10 because digit-to-digit is not a
    // word boundary. Locks the regex tightness against a future
    // "fix" that loosens to /=1/ and would silently accept =10.
    expect(
      checkYouTubeIframeCaptions(
        '<iframe src="https://www.youtube-nocookie.com/embed/abc?cc_load_policy=10"></iframe>',
      ).ok,
    ).toBe(false);
  });

  test('checkYouTubeIframeCaptions passes non-YouTube iframes (Vimeo, maps)', () => {
    expect(
      checkYouTubeIframeCaptions(
        '<iframe src="https://player.vimeo.com/video/123"></iframe>',
      ).ok,
    ).toBe(true);
    expect(
      checkYouTubeIframeCaptions(
        '<iframe src="https://maps.google.com/embed?q=foo"></iframe>',
      ).ok,
    ).toBe(true);
  });

  test('checkYouTubeIframeCaptions passes srcless iframes', () => {
    expect(checkYouTubeIframeCaptions('<iframe></iframe>').ok).toBe(true);
  });
});
