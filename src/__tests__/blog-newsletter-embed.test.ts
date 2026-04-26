// T197 — contract test for BlogNewsletterEmbed.astro. The
// in-article newsletter signup that captures emails from
// blog readers. Reuses the existing /api/waitlist endpoint
// (T091/T092) — a single email-capture pipeline rather than
// a separate "newsletter" list. Same GDPR-compliant consent
// and Cloudflare Turnstile spam protection as the
// dedicated waitlist page.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const COMPONENT_PATH = join(
  process.cwd(),
  'src',
  'components',
  'BlogNewsletterEmbed.astro',
);

const loadComponent = (): string => readFileSync(COMPONENT_PATH, 'utf8');

describe('T197: BlogNewsletterEmbed component', () => {
  test('component file exists at src/components/BlogNewsletterEmbed.astro', () => {
    expect(() => loadComponent()).not.toThrow();
  });

  test('form posts to /api/waitlist (single email-capture endpoint)', () => {
    // Reuse the existing waitlist endpoint rather than
    // creating a parallel "newsletter" pipeline. One source
    // of truth for emails, one Resend audience, one
    // unsubscribe surface.
    const src = loadComponent();
    expect(src).toMatch(/action=["']\/api\/waitlist["']/);
    expect(src).toMatch(/method=["']post["']/);
  });

  test('form has a required email input with type="email"', () => {
    const src = loadComponent();
    expect(src).toMatch(/<input[^>]+type=["']email["']/);
    expect(src).toMatch(/<input[^>]+name=["']email["']/);
    expect(src).toMatch(/<input[^>]+required/);
  });

  test('form has a required GDPR-compliant consent checkbox', () => {
    // Same Article 7 posture as WaitlistForm — affirmative
    // action with disclosed purpose and unsubscribe path.
    const src = loadComponent();
    expect(src).toMatch(/<input[^>]+type=["']checkbox["']/);
    expect(src).toMatch(/<input[^>]+name=["']consent["']/);
  });

  test('form discloses purpose and links to /privacy', () => {
    // The "informed" prong of GDPR Article 7 — the consent
    // copy must point readers at the full privacy notice.
    const src = loadComponent();
    expect(src).toMatch(/href=["']\/privacy["']/);
  });

  test('form mentions the unsubscribe path (transparency)', () => {
    const src = loadComponent();
    expect(src.toLowerCase()).toMatch(/unsubscribe/);
  });

  test('form includes Cloudflare Turnstile widget', () => {
    // Same spam-protection posture as WaitlistForm. The
    // Turnstile widget injects a token field into the form
    // that the /api/waitlist endpoint verifies.
    const src = loadComponent();
    expect(src).toMatch(/cf-turnstile/);
  });

  test('form has aria-labelledby for accessibility', () => {
    const src = loadComponent();
    expect(src).toMatch(/aria-labelledby/);
  });

  test('component declares Props with optional postSlug for analytics context', () => {
    // Optional postSlug prop lets the embedded form know
    // which article drove the signup. The form posts that
    // as a hidden field so the email-capture pipeline can
    // attribute conversions per article.
    const src = loadComponent();
    expect(src).toMatch(/interface\s+Props/);
    expect(src).toMatch(/postSlug/);
  });

  test('form respects ADR-004 + Pillar 2/3/4 forbidden vocabulary', () => {
    const src = loadComponent().toLowerCase();
    // ADR-004 — the in-article surface must not slide into
    // "AI coach" framing despite the casual format
    expect(src).not.toMatch(/\bai\s+coach\b/);
    expect(src).not.toMatch(/\bllm\b/);
    expect(src).not.toMatch(/\bgenerative\b/);
    expect(src).not.toMatch(/\bneural\b/);
    // Anti-overclaim
    expect(src).not.toMatch(/\bguaranteed?\s+(faster|improvement|results?)\b/);
    expect(src).not.toMatch(/\bsecret\b/);
    expect(src).not.toMatch(/\bguru\b/);
    expect(src).not.toMatch(/\bshortcut\b/);
    expect(src).not.toMatch(/\bovernight\b/);
  });

  test('form button has a clear, action-oriented label', () => {
    // The CTA button's submit copy is the moment-of-decision
    // text. Lock that it has visible text and isn't an empty
    // <button type="submit"></button>.
    const src = loadComponent();
    const buttonMatch = src.match(/<button[^>]*>([\s\S]*?)<\/button>/);
    expect(buttonMatch, 'form must have a submit button').not.toBeNull();
    const buttonText = buttonMatch![1].replace(/\s+/g, ' ').trim();
    expect(buttonText.length).toBeGreaterThan(0);
  });
});
