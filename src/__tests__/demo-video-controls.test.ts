// T080 — keyboard-accessible video controls gate for /demo.
//
// T073 locked the format decision (embedded video over inline
// screenshots; T073 commit 002d38f); T074 will land the actual
// 3-minute walkthrough iframe alongside the public-beta launch
// (DemoWalkthrough.astro is currently a 16:9 placeholder labelled
// "Reserved"). T080's deliverable is "⇒ tested", which this file
// satisfies as a forward-looking contract gate:
//
//   * Any HTML5 <video> rendered on /demo must carry the
//     `controls` attribute so the browser-native player provides
//     keyboard accessibility (Space=play/pause, arrows=seek,
//     M=mute) without bespoke handling.
//
//   * Any video iframe must use youtube-nocookie.com or
//     player.vimeo.com (privacy + GDPR; CLAUDE.md mandate),
//     AND carry a `title` attribute so screen readers announce
//     the embed as something other than "iframe".
//
// The /demo render gates pass vacuously today (DemoWalkthrough's
// placeholder has no video element). The self-test block uses
// synthetic markup to prove the detection logic actually catches
// violations — so when T074's iframe lands, the gates start
// enforcing the contract instead of trivially passing.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Demo from '../pages/demo.astro';

const render = (): Promise<string> =>
  AstroContainer.create().then((c) => c.renderToString(Demo));

interface CheckResult {
  readonly ok: boolean;
  readonly reason?: string;
}

function checkHtml5VideoTag(tag: string): CheckResult {
  if (!/<video\b/i.test(tag)) return { ok: true };
  // Browser-native <video> player is keyboard-accessible only when
  // the controls attribute is present (otherwise the player UI is
  // hidden and there's no keyboard target).
  if (!/\scontrols(\s|>|=)/.test(tag)) {
    return { ok: false, reason: '<video> missing "controls" attribute' };
  }
  return { ok: true };
}

function checkVideoIframeTag(tag: string): CheckResult {
  if (!/<iframe\b/i.test(tag)) return { ok: true };
  const srcMatch = tag.match(/\ssrc=["']([^"']+)["']/);
  if (!srcMatch) return { ok: true };
  const src = srcMatch[1];
  // Only enforce on iframes that look like video embeds; non-video
  // iframes (maps, twitter widgets, etc.) are out of T080's scope.
  const isVideoEmbed = /\b(youtube|vimeo|player\.vimeo)\b/.test(src);
  if (!isVideoEmbed) return { ok: true };
  // Privacy + GDPR: youtube-nocookie.com avoids tracking cookies
  // on the LAP origin; player.vimeo.com is the equivalent on Vimeo.
  if (!/\b(youtube-nocookie\.com|player\.vimeo\.com)\b/.test(src)) {
    return {
      ok: false,
      reason: 'video iframe must use youtube-nocookie.com or player.vimeo.com',
    };
  }
  // Screen readers announce iframes as "iframe" with no further
  // context unless a title attribute is present.
  if (!/\stitle=["'][^"']+["']/.test(tag)) {
    return { ok: false, reason: 'video iframe missing title attribute' };
  }
  return { ok: true };
}

describe('T080: /demo video-controls a11y gate (forward-looking)', () => {
  test('every HTML5 <video> element on /demo passes the controls gate', async () => {
    const html = await render();
    const videoTags = [...html.matchAll(/<video\b[^>]*>/gi)].map((m) => m[0]);
    for (const tag of videoTags) {
      const check = checkHtml5VideoTag(tag);
      expect(check.ok, `${check.reason}: ${tag}`).toBe(true);
    }
  });

  test('every video iframe on /demo passes the privacy + title gate', async () => {
    const html = await render();
    const iframeTags = [...html.matchAll(/<iframe\b[^>]*>/gi)].map((m) => m[0]);
    for (const tag of iframeTags) {
      const check = checkVideoIframeTag(tag);
      expect(check.ok, `${check.reason}: ${tag}`).toBe(true);
    }
  });
});

describe('T080: detection logic self-test (synthetic markup)', () => {
  // Without these self-tests the gates above pass vacuously until
  // T074 lands a video element. These tests verify the detection
  // logic actually fails on the violation patterns the gate is
  // meant to catch — so the gate's silence today is "no violation
  // detected" rather than "no detection performed".

  test('checkHtml5VideoTag flags <video> without controls', () => {
    expect(checkHtml5VideoTag('<video src="walkthrough.mp4">').ok).toBe(false);
    expect(checkHtml5VideoTag('<video src="walkthrough.mp4" controls>').ok).toBe(true);
    expect(checkHtml5VideoTag('<video src="walkthrough.mp4" controls="true">').ok).toBe(true);
    expect(checkHtml5VideoTag('<video src="walkthrough.mp4" controls />').ok).toBe(true);
  });

  test('checkHtml5VideoTag passes non-video tags', () => {
    expect(checkHtml5VideoTag('<div>not a video</div>').ok).toBe(true);
    expect(checkHtml5VideoTag('<iframe src="..."></iframe>').ok).toBe(true);
  });

  test('checkVideoIframeTag flags tracking YouTube origin (not nocookie)', () => {
    expect(
      checkVideoIframeTag(
        '<iframe src="https://www.youtube.com/embed/abc" title="Demo"></iframe>',
      ).ok,
    ).toBe(false);
    expect(
      checkVideoIframeTag(
        '<iframe src="https://www.youtube-nocookie.com/embed/abc" title="Demo"></iframe>',
      ).ok,
    ).toBe(true);
  });

  test('checkVideoIframeTag flags video iframe missing title attribute', () => {
    expect(
      checkVideoIframeTag(
        '<iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe>',
      ).ok,
    ).toBe(false);
    expect(
      checkVideoIframeTag(
        '<iframe src="https://player.vimeo.com/video/123"></iframe>',
      ).ok,
    ).toBe(false);
    expect(
      checkVideoIframeTag(
        '<iframe src="https://player.vimeo.com/video/123" title="Walkthrough"></iframe>',
      ).ok,
    ).toBe(true);
  });

  test('checkVideoIframeTag passes non-video iframes (maps, social embeds)', () => {
    expect(
      checkVideoIframeTag(
        '<iframe src="https://maps.google.com/embed?q=foo"></iframe>',
      ).ok,
    ).toBe(true);
    expect(
      checkVideoIframeTag(
        '<iframe src="https://platform.twitter.com/widgets.js"></iframe>',
      ).ok,
    ).toBe(true);
  });

  test('checkVideoIframeTag passes iframes without src attribute', () => {
    expect(checkVideoIframeTag('<iframe></iframe>').ok).toBe(true);
  });
});
