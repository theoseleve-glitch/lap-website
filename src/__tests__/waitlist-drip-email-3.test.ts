// T099 — locked-facts contract tests for waitlist drip email 3
// (the closer). Sent ~14 days after confirmation; the job is to
// reset expectations for what arrives when public beta opens —
// the recipient gets a separate sign-in invite later, the founder
// rate auto-applies at billing, no promo code to remember.
//
// Email 3 locks the most facts of the three because it is the
// last regular touch before the actual invite. €12 + 12 months +
// launch date + €15 standard rate must all be present so a future
// edit cannot drop any of the four anchor numbers from the
// recipient's record-of-promise.

import { describe, expect, test } from 'vitest';
import { SUBJECT, bodies } from '../../functions/_lib/waitlist-drip/email-3';

const UNSUB_URL = 'https://lap-coach.racing/unsubscribe?token=test_token_value';

describe('T099: drip email 3 — module shape', () => {
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

describe('T099: drip email 3 — locked facts', () => {
  test('subject names LAP', () => {
    expect(SUBJECT).toMatch(/LAP/);
  });

  test('subject is plain ASCII (no marketing emoji or exclamation)', () => {
    expect(SUBJECT).toMatch(/^[\x20-\x7e]+$/);
    expect(SUBJECT).not.toMatch(/!/);
  });

  test('both bodies name the public beta launch date', () => {
    const { html, text } = bodies(UNSUB_URL);
    const hasReadable = (s: string) => /23 July 2026/i.test(s);
    const hasIso = (s: string) => /2026-07-23/.test(s);
    expect(hasReadable(text) || hasIso(text)).toBe(true);
    expect(hasReadable(html) || hasIso(html)).toBe(true);
  });

  test('both bodies name the €14.90 founding rate', () => {
    // The closer email is the recipient's last regular touchpoint
    // before the beta invite. Locking €14.90 keeps the rate aligned
    // across the chain (form → confirmation → welcome → drip 1 → drip 3).
    const { html, text } = bodies(UNSUB_URL);
    expect(text).toMatch(/€14\.90/);
    expect(html).toMatch(/€14\.90/);
  });

  test('both bodies frame the founding-spot offer', () => {
    // The founding rate is a "head start to claim one of the 50
    // founding spots, locked while the membership stays active" —
    // the framing carries the value, so it gets its own lock.
    const { html, text } = bodies(UNSUB_URL);
    expect(text.toLowerCase()).toMatch(/founding/);
    expect(html.toLowerCase()).toMatch(/founding/);
  });

  test('both bodies name the €19.90 standard rate (comparison anchor)', () => {
    // June-8 canon: standard rate at launch is €19.90/month. Naming
    // it makes the founding discount concrete (€5 off) instead of an
    // abstract "founding rate" the recipient has to take on faith.
    const { html, text } = bodies(UNSUB_URL);
    expect(text).toMatch(/€19\.90/);
    expect(html).toMatch(/€19\.90/);
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

describe('T099: drip email 3 — doctrine guardrails', () => {
  test('copy stays doctrine-aligned — no AI-coach / LLM / generative', () => {
    const { html, text } = bodies(UNSUB_URL);
    const FORBIDDEN = /\bai coach\b|\bllm\b|\bgenerative\b/i;
    expect(html).not.toMatch(FORBIDDEN);
    expect(text).not.toMatch(FORBIDDEN);
    expect(SUBJECT).not.toMatch(FORBIDDEN);
  });
});
