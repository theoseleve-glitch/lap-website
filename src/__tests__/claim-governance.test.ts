// Automated guard for spec §4a: marketing copy must never claim AI-coach / LLM
// behaviour or dormant features, and pricing language is monthly-only. Walks
// every string exported from the central copy module against a forbidden list.

import { describe, expect, test } from 'vitest';
import * as copy from '../data/marketing-copy';

const FORBIDDEN: Array<{ name: string; re: RegExp }> = [
  { name: 'AI coach', re: /\bAI[-\s]?coach/i },
  { name: 'LLM', re: /\bLLM\b/i },
  { name: 'chatbot (as a claim)', re: /our chatbot|ai chat/i },
  { name: 'licence/license grade', re: /licen[cs]e grade/i },
  { name: 'compare vs pros', re: /compare (?:against|vs\.?) pros/i },
  { name: 'cohort benchmarks', re: /\bcohort\b/i },
  { name: 'Android app', re: /\bandroid\b/i },
  { name: 'real-time coaching', re: /real[-\s]?time coaching/i },
  { name: 'transfer learning', re: /transfer learning/i },
  { name: 'annual price €150', re: /€\s?150/ },
  { name: 'per-year pricing', re: /\/\s?yr\b|per year|annual(?:ly)?\b/i },
];

function collectStrings(value: unknown, acc: string[] = []): string[] {
  if (typeof value === 'string') acc.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, acc));
  else if (value && typeof value === 'object')
    Object.values(value).forEach((v) => collectStrings(v, acc));
  return acc;
}

const strings = collectStrings(copy);

describe('claim governance (spec §4a)', () => {
  test('copy module exposes user-facing strings', () => {
    expect(strings.length).toBeGreaterThan(10);
  });

  for (const { name, re } of FORBIDDEN) {
    test(`no copy string claims: ${name}`, () => {
      const hits = strings.filter((s) => re.test(s));
      expect(hits).toEqual([]);
    });
  }
});
