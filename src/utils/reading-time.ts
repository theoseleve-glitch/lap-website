// T192 — reading-time utility. Computes a "N min read"
// label from text content using a 220 words-per-minute
// baseline. Floored at 1 minute so empty or near-empty
// content still surfaces a positive label rather than
// "0 min read".

const WORDS_PER_MINUTE = 220;

export interface ReadingTimeResult {
  /** Rounded minutes, floored at 1. */
  readonly minutes: number;
  /** Human-readable label, e.g. "5 min read". */
  readonly label: string;
}

/**
 * Strips markdown decoration (headings, bullet markers,
 * emphasis) so the word count reflects content rather than
 * glyph count.
 */
const stripMarkdown = (text: string): string =>
  text
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');

export const computeReadingTime = (text: string): ReadingTimeResult => {
  const words = stripMarkdown(text).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return { minutes, label: `${minutes} min read` };
};
