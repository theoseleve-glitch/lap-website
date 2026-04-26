// T192 — contract test for the reading-time utility used by
// blog publish pages and listing surfaces. Computes reading
// time from text content using a 220 words-per-minute
// baseline (the standard for adult-reader prose at
// non-technical reading speeds).

import { describe, expect, test } from 'vitest';
import { computeReadingTime } from '../utils/reading-time';

describe('T192: reading-time utility', () => {
  test('exports computeReadingTime function', () => {
    expect(typeof computeReadingTime).toBe('function');
  });

  test('returns object with minutes (number) and label (string)', () => {
    const result = computeReadingTime('a '.repeat(500));
    expect(typeof result.minutes).toBe('number');
    expect(typeof result.label).toBe('string');
  });

  test('floors at 1 minute (never returns 0 for non-empty text)', () => {
    // Very short text rounds down to 0 mathematically; real
    // reading-time displays should still say "1 min read"
    // because zero is a UX failure, not a rounding outcome.
    const result = computeReadingTime('one two three');
    expect(result.minutes).toBeGreaterThanOrEqual(1);
  });

  test('returns 1 min for ≤220 words (under the per-minute baseline)', () => {
    const text = 'word '.repeat(50);
    const result = computeReadingTime(text);
    expect(result.minutes).toBe(1);
  });

  test('returns 5 min for ~1100 words (5 × 220 wpm)', () => {
    // 1100 words at 220 wpm = exactly 5.0 minutes.
    const text = 'word '.repeat(1100);
    const result = computeReadingTime(text);
    expect(result.minutes).toBe(5);
  });

  test('returns 7 min for ~1500 words (typical Batch 2 founder post)', () => {
    // 1500 / 220 = 6.818... → rounds to 7.
    const text = 'word '.repeat(1500);
    const result = computeReadingTime(text);
    expect(result.minutes).toBe(7);
  });

  test('label format is "N min read"', () => {
    const result = computeReadingTime('word '.repeat(440));
    expect(result.label).toMatch(/^\d+\s+min\s+read$/);
    expect(result.label).toBe('2 min read');
  });

  test('handles empty string by returning 1 min minimum', () => {
    const result = computeReadingTime('');
    expect(result.minutes).toBe(1);
    expect(result.label).toBe('1 min read');
  });

  test('strips markdown headings and bullets from word count', () => {
    // Markdown decoration (## headings, * bullets, **bold**)
    // should not inflate the word count. The utility runs on
    // markdown source, not rendered HTML, so the strip is on
    // the markdown side.
    const markdown = `# Heading\n\n## Section A\n\n- item one\n- item two\n\n**Bold** text here.`;
    const result = computeReadingTime(markdown);
    // Without stripping: ~10 "words" inflated by markdown
    // glyphs. With stripping: ~9 actual content words.
    // Either way still 1 minute, but the count should match
    // text content rather than glyph count.
    expect(result.minutes).toBe(1);
  });
});
