// T098 — locked-facts contract tests for waitlist drip email 2
// (behind-the-scenes dev update + upcoming features). Same module
// shape as T097: SUBJECT + bodies(unsubscribeUrl). Email 2 lands
// ~7 days after the visitor confirmed; its job is the credibility-
// build — show concrete work in flight instead of just promising.
//
// Locked facts here are deliberately fewer than email 1: the
// founder rate (€12) lives in emails 1 and 3 — repeating it in
// every drip touchpoint reads as sales-pitchy rather than
// relationship-build. What email 2 LOCKS is doctrine vocabulary
// (Driver Profile, Coaching Memory, weakness/prescription/outcome
// from ADR-005 §5.2-5.4) — those names anchor the position so a
// future copy edit cannot quietly genericise the message into
// "we're building features".

import { describe, expect, test } from 'vitest';
import { SUBJECT, bodies } from '../../functions/_lib/waitlist-drip/email-2';

const UNSUB_URL = 'https://lap-coach.racing/unsubscribe?token=test_token_value';

describe('T098: drip email 2 — module shape', () => {
  test('exports a non-empty SUBJECT string', () => {
    expect(typeof SUBJECT).toBe('string');
    expect(SUBJECT.length).toBeGreaterThan(0);
  });

  test('bodies(url) returns both html and text', () => {
    const result = bodies(UNSUB_URL);
    expect(typeof result.html).toBe('string');
    expect(typeof result.text).toBe('string');
    expect(result.html.length).toBeGreaterThan(0);
    expect(result.text.length).toBeGreaterThan(0);
  });
});

describe('T098: drip email 2 — locked facts', () => {
  test('subject names LAP', () => {
    expect(SUBJECT).toMatch(/LAP/);
  });

  test('subject is plain ASCII (no marketing emoji or excessive punctuation)', () => {
    expect(SUBJECT).toMatch(/^[\x20-\x7e]+$/);
    expect(SUBJECT).not.toMatch(/!/);
  });

  test('both bodies name at least one Coaching Memory primitive (weakness/prescription/outcome)', () => {
    // The Coaching Memory backend objects (ADR-005 §5.2-5.4) are
    // the doctrine vocabulary that distinguishes LAP from generic
    // telemetry tools. If a copy edit replaces "weakness +
    // prescription + outcome" with "insights and tips", the
    // message blurs. Lock at least one named primitive per body.
    const { html, text } = bodies(UNSUB_URL);
    const PRIMITIVES = /weakness|prescription|outcome/i;
    expect(text).toMatch(PRIMITIVES);
    expect(html).toMatch(PRIMITIVES);
  });

  test('both bodies hint at email 3 / beta access (drip continuity)', () => {
    // Each email previews the next so the recipient knows the drip
    // has a shape. Email 2 → "the next email is your beta-access
    // invitation" or similar. Without this signal, email 3 lands
    // out of context.
    const { html, text } = bodies(UNSUB_URL);
    const NEXT_HINT = /beta access|beta-access|invitation|next email|email 3/i;
    expect(text).toMatch(NEXT_HINT);
    expect(html).toMatch(NEXT_HINT);
  });

  test('text body embeds the unsubscribe URL passed in', () => {
    const { text } = bodies(UNSUB_URL);
    expect(text).toContain(UNSUB_URL);
  });

  test('html body embeds the unsubscribe URL passed in', () => {
    const { html } = bodies(UNSUB_URL);
    expect(html).toContain(UNSUB_URL);
  });

  test('text body is plain text (no HTML tags)', () => {
    const { text } = bodies(UNSUB_URL);
    expect(text).not.toMatch(/<\/?[a-z]+/i);
  });
});

describe('T098: drip email 2 — doctrine guardrails', () => {
  test('copy stays doctrine-aligned — no AI-coach / LLM / generative', () => {
    // ADR-004 lock. The dev-update email is the most likely place
    // for a future "we're using LLMs to coach you" claim to leak in
    // — lock here so the test catches a doctrine drift before
    // production.
    const { html, text } = bodies(UNSUB_URL);
    const FORBIDDEN = /\bai coach\b|\bllm\b|\bgenerative\b/i;
    expect(html).not.toMatch(FORBIDDEN);
    expect(text).not.toMatch(FORBIDDEN);
    expect(SUBJECT).not.toMatch(FORBIDDEN);
  });
});
