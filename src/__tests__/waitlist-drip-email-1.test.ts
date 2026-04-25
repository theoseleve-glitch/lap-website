// T097 — locked-facts contract tests for waitlist drip email 1
// ("what LAP is + when launch"). The actual prose is human-quality
// professional copy crafted by reading 01-STRATEGIC-DOCTRINE.md;
// these tests lock the SHAPE of the module + the facts the email
// MUST mention so a future "tighten the copy" edit can't quietly
// drop the launch date or the founder rate. The tone, sentences,
// and ordering are not asserted — those are the writer's craft.

import { describe, expect, test } from 'vitest';
import { SUBJECT, bodies } from '../../functions/_lib/waitlist-drip/email-1';

const UNSUB_URL = 'https://lap-coach.racing/unsubscribe?token=test_token_value';

describe('T097: drip email 1 — module shape', () => {
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

describe('T097: drip email 1 — locked facts', () => {
  test('subject names LAP (the brand has to be in the subject line — gmail preview)', () => {
    // Email previews show ~50 chars of subject. Without "LAP" the
    // recipient sees a stranger's note. The waitlist confirmation
    // is fresh in their inbox 1 day prior, so reusing the brand
    // ties this email to the one they already opened.
    expect(SUBJECT).toMatch(/LAP/);
  });

  test('subject is plain text (no marketing emoji or excessive punctuation)', () => {
    // Doctrine voice — no rocket emoji, no "🎉 Welcome!". Plain
    // declarative subjects survive both promotions-tab triage and
    // doctrine review. Contract: no characters above the basic
    // ASCII range, no exclamation marks.
    expect(SUBJECT).toMatch(/^[\x20-\x7e]+$/);
    expect(SUBJECT).not.toMatch(/!/);
  });

  test('text body names the launch date (23 July 2026 / public beta)', () => {
    // The whole point of email 1: when launch lands. If the date
    // is missing, the email becomes generic "stay tuned" filler.
    // Lock both the human-readable rendering and the ISO date so
    // either copy choice survives.
    const { text } = bodies(UNSUB_URL);
    const hasReadableDate = /23 July 2026/i.test(text);
    const hasIsoDate = /2026-07-23/.test(text);
    expect(hasReadableDate || hasIsoDate).toBe(true);
  });

  test('html body names the launch date', () => {
    const { html } = bodies(UNSUB_URL);
    const hasReadableDate = /23 July 2026/i.test(html);
    const hasIsoDate = /2026-07-23/.test(html);
    expect(hasReadableDate || hasIsoDate).toBe(true);
  });

  test('text body names the €12 founder rate (cross-doc lock with T060/T091/T095)', () => {
    // Founder rate is the durable promise — every touchpoint that
    // mentions pricing must name €12 so the cross-doc reader sees
    // the same number from waitlist signup → confirmation email →
    // welcome page → drip emails. One number, every surface.
    const { text } = bodies(UNSUB_URL);
    expect(text).toMatch(/€12/);
  });

  test('html body names the €12 founder rate', () => {
    const { html } = bodies(UNSUB_URL);
    expect(html).toMatch(/€12/);
  });

  test('text body embeds the unsubscribe URL passed in', () => {
    // T100 will mint per-contact signed unsubscribe URLs and call
    // bodies(url). The drip emails MUST include the URL or T100
    // is contract-broken from below.
    const { text } = bodies(UNSUB_URL);
    expect(text).toContain(UNSUB_URL);
  });

  test('html body embeds the unsubscribe URL passed in', () => {
    const { html } = bodies(UNSUB_URL);
    expect(html).toContain(UNSUB_URL);
  });

  test('text body is plain text (no HTML tags)', () => {
    // The text version is the email-client fallback. If it leaks
    // HTML tags, plain-text readers see "<p>" literally. The
    // negative regex is sufficient — tag-shaped substrings are
    // exactly what we forbid.
    const { text } = bodies(UNSUB_URL);
    expect(text).not.toMatch(/<\/?[a-z]+/i);
  });

  test('both bodies name the cross-platform sim pillar (iRacing / ACC / AMS2)', () => {
    // Doctrine §1: cross-platform is the unlock. Email 1 is a
    // re-introduction — if it doesn't name the sims, the recipient
    // can't tell whether LAP supports the sim they actually drive.
    // Locking at least one named sim per body keeps the message
    // concrete; all three is even better but one is the floor.
    const { html, text } = bodies(UNSUB_URL);
    const SIM_NAMES = /iRacing|ACC|AMS2|Assetto Corsa Competizione|Automobilista/i;
    expect(text).toMatch(SIM_NAMES);
    expect(html).toMatch(SIM_NAMES);
  });
});

describe('T097: drip email 1 — doctrine guardrails', () => {
  test('copy stays doctrine-aligned — no AI-coach / LLM / generative', () => {
    // ADR-004 forbids LLM-driven coaching claims in the 6-month
    // plan. The drip emails are the most likely place for a
    // future "your AI coach update" claim to sneak in — lock
    // here so a future edit fails the test before it ships.
    const { html, text } = bodies(UNSUB_URL);
    const FORBIDDEN = /\bai coach\b|\bllm\b|\bgenerative\b/i;
    expect(html).not.toMatch(FORBIDDEN);
    expect(text).not.toMatch(FORBIDDEN);
    expect(SUBJECT).not.toMatch(FORBIDDEN);
  });
});
